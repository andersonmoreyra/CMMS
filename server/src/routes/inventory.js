import { Router } from 'express';
import { z } from 'zod';
import { query, tx, audit } from '../db.js';
import { requireAuth, requireRole, WRITERS } from '../auth.js';

const r = Router();
r.use(requireAuth);

const SELECT = `id, code, name, category, bin_location AS "binLocation",
  current_stock::float AS "currentStock", reserved_stock::float AS "reservedStock",
  (current_stock - reserved_stock)::float AS "availableStock",
  min_stock::float AS "minStock", max_stock::float AS "maxStock", reorder_point::float AS "reorderPoint",
  unit_price::float AS "unitPrice", unit, supplier,
  CASE WHEN current_stock - reserved_stock <= 0 THEN 'OUT_OF_STOCK'
       WHEN current_stock - reserved_stock <= reorder_point THEN 'LOW_STOCK'
       ELSE 'IN_STOCK' END AS status`;

const itemSchema = z.object({
  code: z.string().min(1).max(60),
  name: z.string().min(1).max(160),
  category: z.string().max(80).default(''),
  binLocation: z.string().max(80).default(''),
  currentStock: z.number().min(0).default(0),
  minStock: z.number().min(0).default(0),
  maxStock: z.number().min(0).default(0),
  reorderPoint: z.number().min(0).default(0),
  unitPrice: z.number().min(0).default(0),
  unit: z.string().max(10).default('UN'),
  supplier: z.string().max(120).default(''),
});

r.get('/', async (req, res) => {
  const { rows } = await query(`SELECT ${SELECT} FROM inventory_items WHERE company_id=$1 ORDER BY code`, [req.user.cid]);
  res.json(rows);
});

r.post('/', requireRole(...WRITERS), async (req, res) => {
  const p = itemSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.issues[0].path.join('.') + ': ' + p.error.issues[0].message });
  const d = p.data;
  try {
    const row = await tx(async (c) => {
      const { rows } = await c.query(
        `INSERT INTO inventory_items (company_id,code,name,category,bin_location,current_stock,min_stock,max_stock,reorder_point,unit_price,unit,supplier)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
        [req.user.cid, d.code, d.name, d.category, d.binLocation, d.currentStock, d.minStock, d.maxStock, d.reorderPoint, d.unitPrice, d.unit, d.supplier]);
      if (d.currentStock > 0) {
        await c.query(`INSERT INTO stock_movements (company_id,item_id,kind,quantity,user_id,note) VALUES ($1,$2,'IN',$3,$4,'Saldo inicial')`,
          [req.user.cid, rows[0].id, d.currentStock, req.user.sub]);
      }
      await audit(c, req, 'CREATE', 'inventory_item', rows[0].id, { code: d.code });
      return rows[0];
    });
    res.status(201).json({ id: row.id });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: `Código "${d.code}" já existe` });
    throw e;
  }
});

r.put('/:id', requireRole(...WRITERS), async (req, res) => {
  // Saldo so muda via movimentacao; aqui apenas dados cadastrais
  const p = itemSchema.omit({ currentStock: true }).safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.issues[0].path.join('.') + ': ' + p.error.issues[0].message });
  const d = p.data;
  try {
    const { rowCount } = await query(
      `UPDATE inventory_items SET code=$3,name=$4,category=$5,bin_location=$6,min_stock=$7,max_stock=$8,reorder_point=$9,unit_price=$10,unit=$11,supplier=$12
       WHERE id=$1 AND company_id=$2`,
      [req.params.id, req.user.cid, d.code, d.name, d.category, d.binLocation, d.minStock, d.maxStock, d.reorderPoint, d.unitPrice, d.unit, d.supplier]);
    if (!rowCount) return res.status(404).json({ error: 'Item não encontrado' });
    await audit(null, req, 'UPDATE', 'inventory_item', req.params.id);
    res.json({ ok: true });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: `Código "${d.code}" já existe` });
    throw e;
  }
});

const moveSchema = z.object({
  kind: z.enum(['IN', 'OUT', 'ADJUST']),
  quantity: z.number().positive(),   // para ADJUST: novo saldo absoluto (>=0 tratado abaixo)
  note: z.string().max(300).optional(),
}).or(z.object({ kind: z.literal('ADJUST'), quantity: z.number().min(0), note: z.string().max(300).optional() }));

r.post('/:id/movements', requireRole('ADMIN', 'MANAGER', 'PLANNER', 'TECHNICIAN'), async (req, res) => {
  const p = moveSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Movimentação inválida' });
  const { kind, quantity, note } = p.data;
  if (kind === 'ADJUST' && !['ADMIN', 'MANAGER'].includes(req.user.role))
    return res.status(403).json({ error: 'Apenas gestores podem ajustar inventário' });
  const out = await tx(async (c) => {
    const { rows } = await c.query('SELECT * FROM inventory_items WHERE id=$1 AND company_id=$2 FOR UPDATE', [req.params.id, req.user.cid]);
    const it = rows[0];
    if (!it) return { status: 404, error: 'Item não encontrado' };
    const cur = Number(it.current_stock), res_ = Number(it.reserved_stock);
    let next;
    if (kind === 'IN') next = cur + quantity;
    else if (kind === 'OUT') {
      if (quantity > cur - res_) return { status: 409, error: `Saldo disponível insuficiente (${cur - res_} ${it.unit})` };
      next = cur - quantity;
    } else {
      if (quantity < res_) return { status: 409, error: `Saldo não pode ficar abaixo do reservado (${res_})` };
      next = quantity;
    }
    await c.query('UPDATE inventory_items SET current_stock=$1 WHERE id=$2', [next, it.id]);
    await c.query('INSERT INTO stock_movements (company_id,item_id,kind,quantity,user_id,note) VALUES ($1,$2,$3,$4,$5,$6)',
      [req.user.cid, it.id, kind, kind === 'ADJUST' ? next - cur : quantity, req.user.sub, note || null]);
    await audit(c, req, 'MOVEMENT_' + kind, 'inventory_item', it.id, { from: cur, to: next });
    return { status: 200, balance: next };
  });
  if (out.error) return res.status(out.status).json({ error: out.error });
  res.json({ balance: out.balance });
});

r.get('/:id/movements', async (req, res) => {
  const { rows } = await query(
    `SELECT m.id, m.kind, m.quantity::float AS quantity, m.note, m.created_at AS "createdAt", u.name AS "userName"
     FROM stock_movements m LEFT JOIN users u ON u.id=m.user_id
     WHERE m.item_id=$1 AND m.company_id=$2 ORDER BY m.id DESC LIMIT 100`, [req.params.id, req.user.cid]);
  res.json(rows);
});

export default r;
