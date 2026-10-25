import { Router } from 'express';
import { z } from 'zod';
import { query, audit } from '../db.js';
import { requireAuth, requireRole, WRITERS } from '../auth.js';

const r = Router();
r.use(requireAuth);

const COLS = `id, tag, name, category, parent_id AS "parentId", plant, area, line, criticality, status,
  manufacturer, model, serial_number AS "serialNumber", install_date AS "installDate",
  power_kw::float AS "powerKw", voltage_v::float AS "voltageV", warranty_expiry AS "warrantyExpiry", specs`;

const assetSchema = z.object({
  tag: z.string().min(1).max(60),
  name: z.string().min(1).max(160),
  category: z.string().max(80).default(''),
  parentId: z.string().uuid().nullish(),
  plant: z.string().max(80).default(''),
  area: z.string().max(80).default(''),
  line: z.string().max(80).default(''),
  criticality: z.enum(['A', 'B', 'C']).default('B'),
  status: z.enum(['OPERATIONAL', 'IN_MAINTENANCE', 'STANDBY', 'QUARANTINE', 'DECOMMISSIONED']).default('OPERATIONAL'),
  manufacturer: z.string().max(80).default(''),
  model: z.string().max(80).default(''),
  serialNumber: z.string().max(80).default(''),
  installDate: z.string().nullish(),
  powerKw: z.number().min(0).default(0),
  voltageV: z.number().min(0).default(0),
  warrantyExpiry: z.string().nullish(),
  specs: z.record(z.string()).default({}),
});

r.get('/', async (req, res) => {
  const { rows } = await query(
    `SELECT ${COLS},
       (SELECT COUNT(*)::int FROM work_orders w WHERE w.asset_id=a.id AND w.status NOT IN ('COMPLETED','CANCELLED')) AS "openOrders",
       (SELECT COALESCE(SUM(cost_labor+cost_materials),0)::float FROM work_orders w WHERE w.asset_id=a.id AND w.status='COMPLETED') AS "totalMaintenanceCost"
     FROM assets a WHERE company_id=$1 ORDER BY tag`, [req.user.cid]);
  res.json(rows);
});

r.get('/:id', async (req, res) => {
  const { rows } = await query(`SELECT ${COLS} FROM assets a WHERE id=$1 AND company_id=$2`, [req.params.id, req.user.cid]);
  if (!rows[0]) return res.status(404).json({ error: 'Ativo não encontrado' });
  res.json(rows[0]);
});

// Valida que o pai pertence a mesma empresa e nao cria ciclo na hierarquia
async function validateParent(cid, id, parentId) {
  if (!parentId) return null;
  if (id && parentId === id) return 'Um ativo não pode ser pai de si mesmo';
  const p = await query('SELECT 1 FROM assets WHERE id=$1 AND company_id=$2', [parentId, cid]);
  if (!p.rowCount) return 'Ativo pai inválido';
  if (id) {
    const cyc = await query(
      `WITH RECURSIVE anc AS (
         SELECT id, parent_id FROM assets WHERE id=$1
         UNION ALL SELECT a.id, a.parent_id FROM assets a JOIN anc ON a.id=anc.parent_id)
       SELECT 1 FROM anc WHERE id=$2`, [parentId, id]);
    if (cyc.rowCount) return 'A hierarquia criaria um ciclo';
  }
  return null;
}

r.post('/', requireRole(...WRITERS), async (req, res) => {
  const p = assetSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.issues[0].path.join('.') + ': ' + p.error.issues[0].message });
  const d = p.data;
  const err = await validateParent(req.user.cid, null, d.parentId);
  if (err) return res.status(400).json({ error: err });
  try {
    const { rows } = await query(
      `INSERT INTO assets (company_id,tag,name,category,parent_id,plant,area,line,criticality,status,manufacturer,model,serial_number,install_date,power_kw,voltage_v,warranty_expiry,specs)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING id`,
      [req.user.cid, d.tag, d.name, d.category, d.parentId || null, d.plant, d.area, d.line, d.criticality, d.status,
       d.manufacturer, d.model, d.serialNumber, d.installDate || null, d.powerKw, d.voltageV, d.warrantyExpiry || null, d.specs]);
    await audit(null, req, 'CREATE', 'asset', rows[0].id, { tag: d.tag });
    res.status(201).json({ id: rows[0].id });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: `TAG "${d.tag}" já existe` });
    throw e;
  }
});

r.put('/:id', requireRole(...WRITERS), async (req, res) => {
  const p = assetSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.issues[0].path.join('.') + ': ' + p.error.issues[0].message });
  const d = p.data;
  const err = await validateParent(req.user.cid, req.params.id, d.parentId);
  if (err) return res.status(400).json({ error: err });
  try {
    const { rowCount } = await query(
      `UPDATE assets SET tag=$3,name=$4,category=$5,parent_id=$6,plant=$7,area=$8,line=$9,criticality=$10,status=$11,
         manufacturer=$12,model=$13,serial_number=$14,install_date=$15,power_kw=$16,voltage_v=$17,warranty_expiry=$18,specs=$19,updated_at=now()
       WHERE id=$1 AND company_id=$2`,
      [req.params.id, req.user.cid, d.tag, d.name, d.category, d.parentId || null, d.plant, d.area, d.line, d.criticality, d.status,
       d.manufacturer, d.model, d.serialNumber, d.installDate || null, d.powerKw, d.voltageV, d.warrantyExpiry || null, d.specs]);
    if (!rowCount) return res.status(404).json({ error: 'Ativo não encontrado' });
    await audit(null, req, 'UPDATE', 'asset', req.params.id);
    res.json({ ok: true });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: `TAG "${d.tag}" já existe` });
    throw e;
  }
});

r.delete('/:id', requireRole('ADMIN', 'MANAGER'), async (req, res) => {
  const open = await query(
    "SELECT 1 FROM work_orders WHERE asset_id=$1 AND company_id=$2 AND status NOT IN ('COMPLETED','CANCELLED') LIMIT 1",
    [req.params.id, req.user.cid]);
  if (open.rowCount) return res.status(409).json({ error: 'Ativo possui ordens de serviço abertas' });
  const { rowCount } = await query('DELETE FROM assets WHERE id=$1 AND company_id=$2', [req.params.id, req.user.cid]);
  if (!rowCount) return res.status(404).json({ error: 'Ativo não encontrado' });
  await audit(null, req, 'DELETE', 'asset', req.params.id);
  res.json({ ok: true });
});

export default r;
