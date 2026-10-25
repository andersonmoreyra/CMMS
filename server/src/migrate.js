import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { pool } from './db.js';

const here = path.dirname(fileURLToPath(import.meta.url));

export async function migrate() {
  await pool.query(fs.readFileSync(path.join(here, 'schema.sql'), 'utf8'));
  console.log('Schema aplicado.');
}

/** Dados de demonstracao: empresa "Demo Industrial" com usuarios de cada perfil. */
export async function seed() {
  const ex = await pool.query("SELECT 1 FROM companies WHERE tax_id='00.000.000/0001-00'");
  if (ex.rowCount) { console.log('Seed já existe, ignorando.'); return; }
  const hash = await bcrypt.hash('Demo@12345', 10);
  const co = (await pool.query("INSERT INTO companies (name,tax_id) VALUES ('Demo Industrial S.A.','00.000.000/0001-00') RETURNING id")).rows[0].id;
  const users = [
    ['Admin Demo', 'admin@demo.com', 'ADMIN', 0, ''],
    ['Marina Gestora', 'gestor@demo.com', 'MANAGER', 0, ''],
    ['Paulo Planejador', 'planejador@demo.com', 'PLANNER', 0, ''],
    ['Carlos Mecânico', 'carlos@demo.com', 'TECHNICIAN', 62.5, 'Mecânica'],
    ['Ana Eletricista', 'ana@demo.com', 'TECHNICIAN', 70, 'Elétrica'],
    ['Rafael Solicitante', 'solicitante@demo.com', 'REQUESTER', 0, ''],
  ];
  for (const [n, e, r, rate, sp] of users)
    await pool.query('INSERT INTO users (company_id,name,email,password_hash,role,hourly_rate,specialty) VALUES ($1,$2,$3,$4,$5,$6,$7)', [co, n, e, hash, r, rate, sp]);

  const mk = async (tag, name, cat, parent, crit, extra = {}) => (await pool.query(
    `INSERT INTO assets (company_id,tag,name,category,parent_id,plant,area,line,criticality,manufacturer,model,power_kw,voltage_v,install_date)
     VALUES ($1,$2,$3,$4,$5,'Unidade 01',$6,$7,$8,$9,$10,$11,$12,'2021-03-15') RETURNING id`,
    [co, tag, name, cat, parent, extra.area || 'Produção', extra.line || 'Linha A', crit, extra.mfr || '', extra.model || '', extra.kw || 0, extra.v || 0])).rows[0].id;
  const line = await mk('LIN-A', 'Linha de Envase A', 'Linha', null, 'A');
  const comp = await mk('CMP-001', 'Compressor de Parafuso 75kW', 'Compressor', line, 'A', { mfr: 'Atlas Copco', model: 'GA75', kw: 75, v: 380 });
  const bomba = await mk('BMB-014', 'Bomba Centrífuga de Processo', 'Bomba', line, 'B', { mfr: 'KSB', model: 'Meganorm', kw: 22, v: 380 });
  await mk('MOT-014', 'Motor da Bomba BMB-014', 'Motor', bomba, 'B', { mfr: 'WEG', model: 'W22', kw: 22, v: 380 });
  await mk('ESC-003', 'Esteira Transportadora', 'Transportador', line, 'C', { mfr: 'Interroll', kw: 5.5, v: 380 });

  const items = [
    ['ROL-6205', 'Rolamento 6205 2RS', 'Rolamentos', 'A-01', 40, 10, 80, 15, 38.9, 'UN', 'SKF Brasil'],
    ['ROL-6310', 'Rolamento 6310 ZZ', 'Rolamentos', 'A-02', 12, 4, 30, 6, 142.5, 'UN', 'SKF Brasil'],
    ['FLT-AR01', 'Filtro de Ar Compressor', 'Filtros', 'B-03', 6, 2, 12, 3, 289.9, 'UN', 'Atlas Copco'],
    ['OLE-ISO68', 'Óleo Lubrificante ISO 68', 'Lubrificantes', 'C-01', 120, 40, 300, 60, 24.5, 'L', 'Shell'],
    ['SEL-MEC32', 'Selo Mecânico 32mm', 'Vedações', 'A-05', 2, 2, 8, 3, 760, 'UN', 'John Crane'],
  ];
  for (const [c, n, cat, bin, st, mn, mx, rp, pr, un, sup] of items)
    await pool.query(
      'INSERT INTO inventory_items (company_id,code,name,category,bin_location,current_stock,min_stock,max_stock,reorder_point,unit_price,unit,supplier) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',
      [co, c, n, cat, bin, st, mn, mx, rp, pr, un, sup]);
  console.log('Seed criado. Login: admin@demo.com / Demo@12345 (e gestor@, planejador@, carlos@, ana@, solicitante@)');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await migrate();
  if (process.argv.includes('--seed')) await seed();
  await pool.end();
}
