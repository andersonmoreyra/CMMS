import { Router } from 'express';
import { z } from 'zod';
import { query, tx, audit } from '../db.js';
import { requireAuth, requireRole, WRITERS } from '../auth.js';

const r = Router();
r.use(requireAuth);

// Maquina de estados: apenas estas transicoes sao permitidas
const TRANSITIONS = {
  REQUESTED: ['TRIAGED', 'CANCELLED'],
  TRIAGED: ['SCHEDULED', 'CANCELLED'],
  SCHEDULED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['WAITING_PARTS', 'WAITING_VALIDATION', 'COMPLETED', 'CANCELLED'],
  WAITING_PARTS: ['IN_PROGRESS', 'CANCELLED'],
  WAITING_VALIDATION: ['COMPLETED', 'IN_PROGRESS'],
  COMPLETED: [],
  CANCELLED: [],
};
const CLOSED = ['COMPLETED', 'CANCELLED'];

const SELECT = `w.id, w.code, w.title, w.description, w.asset_id AS "assetId", a.tag AS "assetTag", a.name AS "assetName",
  w.type, w.priority, w.status, w.requested_by AS "requestedById", rq.name AS "requestedBy",
  w.assigned_to AS "assignedToId", tc.name AS "assignedTechnician",
  w.scheduled_date AS "scheduledDate", w.deadline_date AS "deadlineDate",
  w.estimated_hours::float AS "estimatedHours", w.real_hours::float AS "realHours",
  w.cost_labor::float AS "costLabor", w.cost_materials::float AS "costMaterials",
  (w.cost_labor + w.cost_materials)::float AS "totalCost",
  w.failure_mode AS "failureMode", w.root_cause AS "rootCause", w.solution, w.checklist,
  w.requires_loto AS "requiresLoto", w.completed_at AS "completedAt", w.created_at AS "createdAt"`;
const FROM = `FROM work_orders w LEFT JOIN assets a ON a.id=w.asset_id
  LEFT JOIN users rq ON rq.id=w.requested_by LEFT JOIN users tc ON tc.id=w.assigned_to`;

const createSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(4000).default(''),
  assetId: z.string().uuid(),
  type: z.enum(['CORRECTIVE', 'PREVENTIVE', 'PREDICTIVE', 'EMERGENCY', 'IMPROVEMENT']),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  scheduledDate: z.string().nullish(),
  deadlineDate: z.string().nullish(),
  estimatedHours: z.number().min(0).default(0),
  assignedToId: z.string().uuid().nullish(),
  requiresLoto: z.boolean().default(false),
  checklist: z.array(z.object({ text: z.string().min(1).max(300), done: z.boolean().default(false) })).default([]),
});

r.get('/', async (req, res) => {
  const { status, assetId } = req.query;
  const where = ['w.company_id=$1']; const params = [req.user.cid];
  if (status) { params.push(status); where.push(`w.status=$${params.length}`); }
  if (assetId) { params.push(assetId); where.push(`w.asset_id=$${params.length}`); }
  // Tecnico enxerga apenas as proprias OS
  if (req.user.role === 'TECHNICIAN') { params.push(req.user.sub); where.push(`w.assigned_to=$${params.length}`); }
  const { rows } = await query(`SELECT ${SELECT} ${FROM} WHERE ${where.join(' AND ')} ORDER BY w.created_at DESC LIMIT 500`, params);
  res.json(rows);
});

r.get('/:id', async (req, res) => {
  const { rows } = await query(`SELECT ${SELECT} ${FROM} WHERE w.id=$1 AND w.company_id=$2`, [req.params.id, req.user.cid]);
  const wo = rows[0];
  if (!wo) return res.status(404).json({ error: 'OS não encontrada' });
  if (req.user.role === 'TECHNICIAN' && wo.assignedToId !== req.user.sub) return res.status(403).json({ error: 'Sem permissão' });
  const parts = await query(
    `SELECT p.id, p.item_id AS "itemId", i.code, i.name, p.quantity::float AS quantity, p.unit_price::float AS "unitPrice"
     FROM work_order_parts p JOIN inventory_items i ON i.id=p.item_id WHERE p.work_order_id=$1 ORDER BY p.id`, [wo.id]);
  res.json({ ...wo, parts: parts.rows });
});

async function assertSameCompany(c, table, id, cid) {
  if (!id) return true;
  const { rowCount } = await c.query(`SELECT 1 FROM ${table} WHERE id=$1 AND company_id=$2`, [id, cid]);
  return rowCount > 0;
}

r.post('/', requireRole('ADMIN', 'MANAGER', 'PLANNER', 'REQUESTER', 'TECHNICIAN'), async (req, res) => {
  const p = createSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.issues[0].path.join('.') + ': ' + p.error.issues[0].message });
  const d = p.data;
  const isWriter = WRITERS.includes(req.user.role);
  const out = await tx(async (c) => {
    if (!(await assertSameCompany(c, 'assets', d.assetId, req.user.cid))) return { status: 400, error: 'Ativo inválido' };
    if (d.assignedToId && !isWriter) return { status: 403, error: 'Sem permissão para atribuir técnico' };
    if (d.assignedToId && !(await assertSameCompany(c, 'users', d.assignedToId, req.user.cid))) return { status: 400, error: 'Técnico inválido' };
    await c.query('SELECT pg_advisory_xact_lock(hashtext($1))', [req.user.cid]);
    const { rows: s } = await c.query('SELECT COALESCE(MAX(seq),0)+1 AS n FROM work_orders WHERE company_id=$1', [req.user.cid]);
    const seq = s[0].n;
    const code = `OS-${new Date().getFullYear()}-${String(seq).padStart(5, '0')}`;
    const { rows } = await c.query(
      `INSERT INTO work_orders (company_id,seq,code,title,description,asset_id,type,priority,status,requested_by,assigned_to,scheduled_date,deadline_date,estimated_hours,requires_loto,checklist)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'REQUESTED',$9,$10,$11,$12,$13,$14,$15) RETURNING id, code`,
      [req.user.cid, seq, code, d.title, d.description, d.assetId, d.type, d.priority, req.user.sub, d.assignedToId || null,
       d.scheduledDate || null, d.deadlineDate || null, d.estimatedHours, d.requiresLoto, JSON.stringify(d.checklist)]);
    await audit(c, req, 'CREATE', 'work_order', rows[0].id, { code });
    return { status: 201, body: rows[0] };
  });
  if (out.error) return res.status(out.status).json({ error: out.error });
  res.status(201).json(out.body);
});

const patchSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(4000).optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  scheduledDate: z.string().nullish(),
  deadlineDate: z.string().nullish(),
  estimatedHours: z.number().min(0).optional(),
  assignedToId: z.string().uuid().nullish(),
  realHours: z.number().min(0).optional(),
  failureMode: z.string().max(300).nullish(),
  rootCause: z.string().max(1000).nullish(),
  solution: z.string().max(2000).nullish(),
  checklist: z.array(z.object({ text: z.string().min(1).max(300), done: z.boolean() })).optional(),
});

r.patch('/:id', requireRole('ADMIN', 'MANAGER', 'PLANNER', 'TECHNICIAN'), async (req, res) => {
  const p = patchSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.issues[0].path.join('.') + ': ' + p.error.issues[0].message });
  const d = p.data;
  const isWriter = WRITERS.includes(req.user.role);
  const out = await tx(async (c) => {
    const { rows } = await c.query('SELECT * FROM work_orders WHERE id=$1 AND company_id=$2 FOR UPDATE', [req.params.id, req.user.cid]);
    const wo = rows[0];
    if (!wo) return { status: 404, error: 'OS não encontrada' };
    if (CLOSED.includes(wo.status)) return { status: 409, error: 'OS encerrada não pode ser editada' };
    if (!isWriter) {
      if (wo.assigned_to !== req.user.sub) return { status: 403, error: 'Sem permissão' };
      // Tecnico so atualiza execucao
      const allowed = ['realHours', 'failureMode', 'rootCause', 'solution', 'checklist'];
      if (Object.keys(d).some((k) => !allowed.includes(k))) return { status: 403, error: 'Técnico só pode atualizar dados de execução' };
    }
    if (d.assignedToId && !(await assertSameCompany(c, 'users', d.assignedToId, req.user.cid))) return { status: 400, error: 'Técnico inválido' };
    const has = (k) => k in d;
    await c.query(
      `UPDATE work_orders SET
         title=COALESCE($3,title), description=COALESCE($4,description), priority=COALESCE($5,priority),
         scheduled_date = CASE WHEN $6 THEN $7::date ELSE scheduled_date END,
         deadline_date  = CASE WHEN $8 THEN $9::date ELSE deadline_date END,
         estimated_hours=COALESCE($10,estimated_hours), assigned_to = CASE WHEN $11 THEN $12::uuid ELSE assigned_to END,
         real_hours=COALESCE($13,real_hours),
         failure_mode = CASE WHEN $14 THEN $15 ELSE failure_mode END,
         root_cause = CASE WHEN $16 THEN $17 ELSE root_cause END,
         solution = CASE WHEN $18 THEN $19 ELSE solution END,
         checklist=COALESCE($20::jsonb,checklist), updated_at=now()
       WHERE id=$1 AND company_id=$2`,
      [wo.id, req.user.cid, d.title ?? null, d.description ?? null, d.priority ?? null,
       has('scheduledDate'), d.scheduledDate || null, has('deadlineDate'), d.deadlineDate || null,
       d.estimatedHours ?? null, has('assignedToId'), d.assignedToId || null, d.realHours ?? null,
       has('failureMode'), d.failureMode ?? null, has('rootCause'), d.rootCause ?? null, has('solution'), d.solution ?? null,
       d.checklist ? JSON.stringify(d.checklist) : null]);
    await audit(c, req, 'UPDATE', 'work_order', wo.id, { fields: Object.keys(d) });
    return { status: 200 };
  });
  if (out.error) return res.status(out.status).json({ error: out.error });
  res.json({ ok: true });
});

// ---- Materiais: reserva estoque ao adicionar; libera ao remover/cancelar; baixa ao concluir ----
const partSchema = z.object({ itemId: z.string().uuid(), quantity: z.number().positive() });

r.post('/:id/parts', requireRole('ADMIN', 'MANAGER', 'PLANNER', 'TECHNICIAN'), async (req, res) => {
  const p = partSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Material inválido' });
  const out = await tx(async (c) => {
    const { rows } = await c.query('SELECT * FROM work_orders WHERE id=$1 AND company_id=$2 FOR UPDATE', [req.params.id, req.user.cid]);
    const wo = rows[0];
    if (!wo) return { status: 404, error: 'OS não encontrada' };
    if (CLOSED.includes(wo.status)) return { status: 409, error: 'OS encerrada' };
    if (req.user.role === 'TECHNICIAN' && wo.assigned_to !== req.user.sub) return { status: 403, error: 'Sem permissão' };
    const it = (await c.query('SELECT * FROM inventory_items WHERE id=$1 AND company_id=$2 FOR UPDATE', [p.data.itemId, req.user.cid])).rows[0];
    if (!it) return { status: 400, error: 'Item de estoque inválido' };
    const avail = Number(it.current_stock) - Number(it.reserved_stock);
    if (p.data.quantity > avail) return { status: 409, error: `Estoque disponível insuficiente: ${avail} ${it.unit}` };
    await c.query('UPDATE inventory_items SET reserved_stock = reserved_stock + $1 WHERE id=$2', [p.data.quantity, it.id]);
    await c.query('INSERT INTO stock_movements (company_id,item_id,kind,quantity,work_order_id,user_id) VALUES ($1,$2,\'RESERVE\',$3,$4,$5)',
      [req.user.cid, it.id, p.data.quantity, wo.id, req.user.sub]);
    const ins = await c.query('INSERT INTO work_order_parts (work_order_id,item_id,quantity,unit_price) VALUES ($1,$2,$3,$4) RETURNING id',
      [wo.id, it.id, p.data.quantity, it.unit_price]);
    await audit(c, req, 'ADD_PART', 'work_order', wo.id, { item: it.code, qty: p.data.quantity });
    return { status: 201, body: { id: ins.rows[0].id } };
  });
  if (out.error) return res.status(out.status).json({ error: out.error });
  res.status(201).json(out.body);
});

r.delete('/:id/parts/:partId', requireRole('ADMIN', 'MANAGER', 'PLANNER', 'TECHNICIAN'), async (req, res) => {
  const out = await tx(async (c) => {
    const wo = (await c.query('SELECT * FROM work_orders WHERE id=$1 AND company_id=$2 FOR UPDATE', [req.params.id, req.user.cid])).rows[0];
    if (!wo) return { status: 404, error: 'OS não encontrada' };
    if (CLOSED.includes(wo.status)) return { status: 409, error: 'OS encerrada' };
    if (req.user.role === 'TECHNICIAN' && wo.assigned_to !== req.user.sub) return { status: 403, error: 'Sem permissão' };
    const part = (await c.query('DELETE FROM work_order_parts WHERE id=$1 AND work_order_id=$2 RETURNING *', [req.params.partId, wo.id])).rows[0];
    if (!part) return { status: 404, error: 'Material não encontrado' };
    await c.query('UPDATE inventory_items SET reserved_stock = GREATEST(reserved_stock - $1, 0) WHERE id=$2', [part.quantity, part.item_id]);
    await c.query('INSERT INTO stock_movements (company_id,item_id,kind,quantity,work_order_id,user_id) VALUES ($1,$2,\'RELEASE\',$3,$4,$5)',
      [req.user.cid, part.item_id, part.quantity, wo.id, req.user.sub]);
    return { status: 200 };
  });
  if (out.error) return res.status(out.status).json({ error: out.error });
  res.json({ ok: true });
});

// ---- Mudanca de status com validacao de regras de negocio ----
r.post('/:id/status', requireRole('ADMIN', 'MANAGER', 'PLANNER', 'TECHNICIAN'), async (req, res) => {
  const p = z.object({ status: z.enum(Object.keys(TRANSITIONS)) }).safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: 'Status inválido' });
  const to = p.data.status;
  const isWriter = WRITERS.includes(req.user.role);
  const out = await tx(async (c) => {
    const wo = (await c.query('SELECT * FROM work_orders WHERE id=$1 AND company_id=$2 FOR UPDATE', [req.params.id, req.user.cid])).rows[0];
    if (!wo) return { status: 404, error: 'OS não encontrada' };
    if (!TRANSITIONS[wo.status].includes(to))
      return { status: 409, error: `Transição ${wo.status} → ${to} não permitida` };
    if (!isWriter) {
      if (wo.assigned_to !== req.user.sub) return { status: 403, error: 'Sem permissão' };
      if (!['IN_PROGRESS', 'WAITING_PARTS', 'WAITING_VALIDATION'].includes(to))
        return { status: 403, error: 'Técnico não pode executar esta transição' };
    }
    if (to === 'SCHEDULED' && !wo.scheduled_date) return { status: 400, error: 'Informe a data programada antes de agendar' };
    if (['SCHEDULED', 'IN_PROGRESS'].includes(to) && !wo.assigned_to) return { status: 400, error: 'Atribua um técnico antes de prosseguir' };

    let extra = '';
    if (to === 'COMPLETED') {
      const pending = (wo.checklist || []).filter((i) => !i.done);
      if (pending.length) return { status: 400, error: `Checklist incompleto (${pending.length} item(ns) pendente(s))` };
      if (!wo.solution || wo.solution.trim().length < 3) return { status: 400, error: 'Descreva a solução aplicada para concluir' };
      if (Number(wo.real_hours) <= 0) return { status: 400, error: 'Informe as horas reais trabalhadas' };
      // Baixa de materiais: consome estoque reservado e calcula custo
      const parts = (await c.query('SELECT * FROM work_order_parts WHERE work_order_id=$1', [wo.id])).rows;
      let matCost = 0;
      for (const pt of parts) {
        await c.query('UPDATE inventory_items SET current_stock=current_stock-$1, reserved_stock=GREATEST(reserved_stock-$1,0) WHERE id=$2', [pt.quantity, pt.item_id]);
        await c.query('INSERT INTO stock_movements (company_id,item_id,kind,quantity,work_order_id,user_id,note) VALUES ($1,$2,\'OUT\',$3,$4,$5,$6)',
          [req.user.cid, pt.item_id, pt.quantity, wo.id, req.user.sub, 'Consumo ' + wo.code]);
        matCost += Number(pt.quantity) * Number(pt.unit_price);
      }
      const rate = wo.assigned_to ? Number((await c.query('SELECT hourly_rate FROM users WHERE id=$1', [wo.assigned_to])).rows[0]?.hourly_rate || 0) : 0;
      await c.query('UPDATE work_orders SET cost_materials=$2, cost_labor=$3, completed_at=now() WHERE id=$1', [wo.id, matCost, rate * Number(wo.real_hours)]);
    }
    if (to === 'CANCELLED') {
      const parts = (await c.query('SELECT * FROM work_order_parts WHERE work_order_id=$1', [wo.id])).rows;
      for (const pt of parts) {
        await c.query('UPDATE inventory_items SET reserved_stock=GREATEST(reserved_stock-$1,0) WHERE id=$2', [pt.quantity, pt.item_id]);
        await c.query('INSERT INTO stock_movements (company_id,item_id,kind,quantity,work_order_id,user_id) VALUES ($1,$2,\'RELEASE\',$3,$4,$5)',
          [req.user.cid, pt.item_id, pt.quantity, wo.id, req.user.sub]);
      }
    }
    await c.query('UPDATE work_orders SET status=$2, updated_at=now() WHERE id=$1', [wo.id, to]);
    // Ativo acompanha a manutencao em andamento
    if (wo.asset_id && to === 'IN_PROGRESS') await c.query("UPDATE assets SET status='IN_MAINTENANCE' WHERE id=$1 AND status='OPERATIONAL'", [wo.asset_id]);
    if (wo.asset_id && ['COMPLETED', 'CANCELLED'].includes(to)) {
      const other = await c.query("SELECT 1 FROM work_orders WHERE asset_id=$1 AND id<>$2 AND status='IN_PROGRESS' LIMIT 1", [wo.asset_id, wo.id]);
      if (!other.rowCount) await c.query("UPDATE assets SET status='OPERATIONAL' WHERE id=$1 AND status='IN_MAINTENANCE'", [wo.asset_id]);
    }
    await audit(c, req, 'STATUS', 'work_order', wo.id, { from: wo.status, to });
    return { status: 200 };
  });
  if (out.error) return res.status(out.status).json({ error: out.error });
  res.json({ ok: true });
});

export default r;
