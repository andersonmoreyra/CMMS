import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;
if (!SECRET || SECRET.length < 32) {
  throw new Error('JWT_SECRET ausente ou curto demais (min. 32 caracteres)');
}

export const signToken = (user) =>
  jwt.sign({ sub: user.id, cid: user.company_id, role: user.role, name: user.name }, SECRET, { expiresIn: '12h' });

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Não autenticado' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Sessão inválida ou expirada' });
  }
}

/** Restringe a rota aos perfis informados. */
export const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Sem permissão para esta ação' });

export const WRITERS = ['ADMIN', 'MANAGER', 'PLANNER'];
