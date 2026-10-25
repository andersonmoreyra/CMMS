import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../auth.js';

const r = Router();
r.use(requireAuth);

// Lista de pessoas atribuiveis (tecnicos e gestores) - qualquer perfil autenticado pode ver nome/especialidade
r.get('/technicians', async (req, res) => {
  const { rows } = await query(
    `SELECT u.id, u.name, u.specialty, u.hourly_rate::float AS "hourlyRate",
       (SELECT COUNT(*)::int FROM work_orders w WHERE w.assigned_to=u.id AND w.status NOT IN ('COMPLETED','CANCELLED')) AS "openOrders"
     FROM users u WHERE u.company_id=$1 AND u.active AND u.role IN ('TECHNICIAN','PLANNER','MANAGER') ORDER BY u.name`, [req.user.cid]);
  res.json(rows);
});

r.get('/dashboard', async (req, res) => {
  const cid = req.user.cid;
  const [wo, assets, inv, trend, byType, topAssets] = await Promise.all([
    query(
      `SELECT
         COUNT(*) FILTER (WHERE status NOT IN ('COMPLETED','CANCELLED'))::int AS open,
         COUNT(*) FILTER (WHERE status='COMPLETED')::int AS completed,
         COUNT(*) FILTER (WHERE status NOT IN ('COMPLETED','CANCELLED') AND deadline_date < CURRENT_DATE)::int AS overdue,
         COUNT(*) FILTER (WHERE priority='CRITICAL' AND status NOT IN ('COMPLETED','CANCELLED'))::int AS critical,
         COALESCE(SUM(cost_labor+cost_materials) FILTER (WHERE status='COMPLETED' AND completed_at >= date_trunc('month', now())),0)::float AS "costMonth",
         COALESCE(AVG(real_hours) FILTER (WHERE status='COMPLETED' AND type IN ('CORRECTIVE','EMERGENCY')),0)::float AS mttr,
         COUNT(*) FILTER (WHERE status='COMPLETED' AND type IN ('PREVENTIVE','PREDICTIVE'))::int AS planned,
         COUNT(*) FILTER (WHERE status='COMPLETED')::int AS total_done
       FROM work_orders WHERE company_id=$1`, [cid]),
    query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status='OPERATIONAL')::int AS operational,
             COUNT(*) FILTER (WHERE status='IN_MAINTENANCE')::int AS "inMaintenance" FROM assets WHERE company_id=$1`, [cid]),
    query(`SELECT COUNT(*) FILTER (WHERE current_stock - reserved_stock <= reorder_point)::int AS low,
             COALESCE(SUM(current_stock*unit_price),0)::float AS value FROM inventory_items WHERE company_id=$1`, [cid]),
    query(
      `SELECT to_char(m, 'YYYY-MM') AS month,
         COUNT(w.id) FILTER (WHERE w.status='COMPLETED')::int AS completed,
         COALESCE(SUM(w.cost_labor+w.cost_materials) FILTER (WHERE w.status='COMPLETED'),0)::float AS cost
       FROM generate_series(date_trunc('month', now()) - interval '5 months', date_trunc('month', now()), interval '1 month') m
       LEFT JOIN work_orders w ON w.company_id=$1 AND date_trunc('month', w.completed_at)=m
       GROUP BY m ORDER BY m`, [cid]),
    query(`SELECT type, COUNT(*)::int AS count FROM work_orders WHERE company_id=$1 GROUP BY type`, [cid]),
    query(
      `SELECT a.tag, a.name, COUNT(w.id)::int AS orders, COALESCE(SUM(w.cost_labor+w.cost_materials),0)::float AS cost
       FROM assets a JOIN work_orders w ON w.asset_id=a.id WHERE a.company_id=$1 AND w.status='COMPLETED'
       GROUP BY a.id ORDER BY cost DESC LIMIT 5`, [cid]),
  ]);
  const w = wo.rows[0];
  res.json({
    workOrders: { open: w.open, completed: w.completed, overdue: w.overdue, critical: w.critical },
    costMonth: w.costMonth,
    mttrHours: Number(w.mttr.toFixed(1)),
    plannedRatio: w.total_done ? Math.round((w.planned / w.total_done) * 100) : 0,
    assets: assets.rows[0],
    inventory: inv.rows[0],
    trend: trend.rows,
    byType: byType.rows,
    topAssets: topAssets.rows,
  });
});

export default r;
