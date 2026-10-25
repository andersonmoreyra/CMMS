import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query, tx, audit } from '../db.js';
import { signToken, requireAuth, requireRole } from '../auth.js';

const r = Router();

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, companyId: u.company_id });

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

// Hash falso para igualar o tempo de resposta quando o e-mail nao existe (evita enumeracao de usuarios)
const DUMMY_HASH = bcrypt.hashSync('dummy-password', 10);

r.post('/login', async (req, res) => {
  const p = loginSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'E-mail ou senha inválidos' });
  const { rows } = await query('SELECT * FROM users WHERE lower(email)=lower($1) AND active', [p.data.email]);
  const user = rows[0];
  const ok = await bcrypt.compare(p.data.password, user ? user.password_hash : DUMMY_HASH);
  if (!user || !ok) return res.status(401).json({ error: 'E-mail ou senha incorretos' });
  res.json({ token: signToken(user), user: publicUser(user) });
});

const registerSchema = z.object({
  companyName: z.string().min(2).max(120),
  taxId: z.string().max(30).optional(),
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8, 'A senha precisa ter ao menos 8 caracteres'),
});

// Cadastro de uma nova empresa cliente + seu administrador
r.post('/register', async (req, res) => {
  const p = registerSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.issues[0].message });
  const d = p.data;
  const exists = await query('SELECT 1 FROM users WHERE lower(email)=lower($1)', [d.email]);
  if (exists.rowCount) return res.status(409).json({ error: 'E-mail já cadastrado' });
  const hash = await bcrypt.hash(d.password, 10);
  const user = await tx(async (c) => {
    const co = await c.query('INSERT INTO companies (name, tax_id) VALUES ($1,$2) RETURNING id', [d.companyName, d.taxId || null]);
    const u = await c.query(
      "INSERT INTO users (company_id,name,email,password_hash,role) VALUES ($1,$2,$3,$4,'ADMIN') RETURNING *",
      [co.rows[0].id, d.name, d.email, hash]
    );
    return u.rows[0];
  });
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

r.get('/me', requireAuth, async (req, res) => {
  const { rows } = await query('SELECT u.*, c.name AS company_name FROM users u JOIN companies c ON c.id=u.company_id WHERE u.id=$1', [req.user.sub]);
  if (!rows[0]) return res.status(401).json({ error: 'Usuário não encontrado' });
  res.json({ ...publicUser(rows[0]), companyName: rows[0].company_name });
});

// ---- Gestao de usuarios (somente ADMIN) ----
r.get('/users', requireAuth, requireRole('ADMIN', 'MANAGER'), async (req, res) => {
  const { rows } = await query('SELECT id,name,email,role,active,created_at FROM users WHERE company_id=$1 ORDER BY name', [req.user.cid]);
  res.json(rows);
});

const userSchema = z.object({
  name: z.string().min(2), email: z.string().email(), password: z.string().min(8),
  role: z.enum(['ADMIN', 'MANAGER', 'PLANNER', 'TECHNICIAN', 'REQUESTER', 'VIEWER']),
});

r.post('/users', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const p = userSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.issues[0].message });
  const d = p.data;
  const exists = await query('SELECT 1 FROM users WHERE lower(email)=lower($1)', [d.email]);
  if (exists.rowCount) return res.status(409).json({ error: 'E-mail já cadastrado' });
  const hash = await bcrypt.hash(d.password, 10);
  const { rows } = await query(
    'INSERT INTO users (company_id,name,email,password_hash,role) VALUES ($1,$2,$3,$4,$5) RETURNING id,name,email,role,active',
    [req.user.cid, d.name, d.email, hash, d.role]
  );
  await audit(null, req, 'CREATE', 'user', rows[0].id, { role: d.role });
  res.status(201).json(rows[0]);
});

r.patch('/users/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const p = z.object({ role: userSchema.shape.role.optional(), active: z.boolean().optional() }).safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Dados inválidos' });
  if (req.params.id === req.user.sub) return res.status(400).json({ error: 'Você não pode alterar o próprio perfil/ativação' });
  const { rows } = await query(
    'UPDATE users SET role=COALESCE($1,role), active=COALESCE($2,active) WHERE id=$3 AND company_id=$4 RETURNING id,name,email,role,active',
    [p.data.role ?? null, p.data.active ?? null, req.params.id, req.user.cid]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Usuário não encontrado' });
  await audit(null, req, 'UPDATE', 'user', rows[0].id, p.data);
  res.json(rows[0]);
});

export default r;
