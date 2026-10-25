import test from 'node:test';
import assert from 'node:assert/strict';
process.env.NODE_ENV = 'test';
const { app } = await import('../src/index.js');
const { pool } = await import('../src/db.js');

let server, base;
test.before(async () => {
  await new Promise((r) => { server = app.listen(0, r); });
  base = `http://127.0.0.1:${server.address().port}/api`;
});
test.after(async () => { server.close(); await pool.end(); });

async function api(method, path, token, body) {
  const res = await fetch(base + path, {
    method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}
const login = async (email) => (await api('POST', '/auth/login', null, { email, password: 'Demo@12345' })).body.token;

test('login invalido retorna 401 e rotas exigem token', async () => {
  assert.equal((await api('POST', '/auth/login', null, { email: 'admin@demo.com', password: 'errada' })).status, 401);
  assert.equal((await api('GET', '/assets')).status, 401);
});

test('isolamento multiempresa: outra empresa nao ve dados da demo', async () => {
  const email = `t${Date.now()}@outra.com`;
  const reg = await api('POST', '/auth/register', null, { companyName: 'Outra SA', name: 'X Admin', email, password: 'Senha1234' });
  assert.equal(reg.status, 201);
  const assets = await api('GET', '/assets', reg.body.token);
  assert.equal(assets.body.length, 0);
  const demoAssets = await api('GET', '/assets', await login('admin@demo.com'));
  const other = await api('GET', `/assets/${demoAssets.body[0].id}`, reg.body.token);
  assert.equal(other.status, 404);
  await pool.query('DELETE FROM companies WHERE id=$1', [reg.body.user.companyId]);
});

test('perfis: solicitante nao cria ativo; tecnico nao muda prioridade', async () => {
  const req = await login('solicitante@demo.com');
  assert.equal((await api('POST', '/assets', req, { tag: 'X', name: 'X' })).status, 403);
});

test('ciclo completo da OS: reserva, conclusao, baixa de estoque e custo', async () => {
  const adm = await login('admin@demo.com');
  const tech = await login('carlos@demo.com');
  const assets = (await api('GET', '/assets', adm)).body;
  const comp = assets.find((a) => a.tag === 'CMP-001');
  const inv = (await api('GET', '/inventory', adm)).body;
  const filtro = inv.find((i) => i.code === 'FLT-AR01');
  const techs = (await api('GET', '/technicians', adm)).body;
  const carlos = techs.find((t) => t.name.includes('Carlos'));

  const created = await api('POST', '/work-orders', adm, {
    title: 'Trocar filtro de ar', assetId: comp.id, type: 'PREVENTIVE', priority: 'MEDIUM',
    scheduledDate: '2026-11-01', assignedToId: carlos.id, estimatedHours: 2,
    checklist: [{ text: 'Despressurizar', done: false }],
  });
  assert.equal(created.status, 201);
  const id = created.body.id;

  // transicao invalida
  assert.equal((await api('POST', `/work-orders/${id}/status`, adm, { status: 'COMPLETED' })).status, 409);
  for (const s of ['TRIAGED', 'SCHEDULED']) assert.equal((await api('POST', `/work-orders/${id}/status`, adm, { status: s })).status, 200);

  // reserva acima do disponivel falha; dentro do disponivel funciona
  assert.equal((await api('POST', `/work-orders/${id}/parts`, adm, { itemId: filtro.id, quantity: filtro.availableStock + 1 })).status, 409);
  assert.equal((await api('POST', `/work-orders/${id}/parts`, adm, { itemId: filtro.id, quantity: 2 })).status, 201);
  const mid = (await api('GET', '/inventory', adm)).body.find((i) => i.code === 'FLT-AR01');
  assert.equal(mid.reservedStock, filtro.reservedStock + 2);
  assert.equal(mid.currentStock, filtro.currentStock);

  assert.equal((await api('POST', `/work-orders/${id}/status`, tech, { status: 'IN_PROGRESS' })).status, 200);
  // concluir sem checklist/solucao/horas deve falhar
  assert.equal((await api('POST', `/work-orders/${id}/status`, tech, { status: 'COMPLETED' })).status, 403); // tecnico nao conclui
  assert.equal((await api('POST', `/work-orders/${id}/status`, adm, { status: 'COMPLETED' })).status, 400);
  assert.equal((await api('PATCH', `/work-orders/${id}`, tech, { priority: 'LOW' })).status, 403);
  assert.equal((await api('PATCH', `/work-orders/${id}`, tech, {
    realHours: 2, solution: 'Filtro substituido', checklist: [{ text: 'Despressurizar', done: true }] })).status, 200);

  assert.equal((await api('POST', `/work-orders/${id}/status`, adm, { status: 'COMPLETED' })).status, 200);
  const done = (await api('GET', `/work-orders/${id}`, adm)).body;
  assert.equal(done.status, 'COMPLETED');
  assert.equal(done.costMaterials, +(2 * 289.9).toFixed(2));
  assert.equal(done.costLabor, 125); // 2h * R$62,50
  const after = (await api('GET', '/inventory', adm)).body.find((i) => i.code === 'FLT-AR01');
  assert.equal(after.currentStock, filtro.currentStock - 2);
  assert.equal(after.reservedStock, filtro.reservedStock);

  // OS encerrada nao edita
  assert.equal((await api('PATCH', `/work-orders/${id}`, adm, { title: 'novo titulo' })).status, 409);
});

test('hierarquia de ativos impede ciclo', async () => {
  const adm = await login('admin@demo.com');
  const assets = (await api('GET', '/assets', adm)).body;
  const line = assets.find((a) => a.tag === 'LIN-A');
  const comp = assets.find((a) => a.tag === 'CMP-001');
  const res = await api('PUT', `/assets/${line.id}`, adm, { ...line, parentId: comp.id, specs: {} });
  assert.equal(res.status, 400);
});
