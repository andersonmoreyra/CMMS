import 'dotenv/config';
import pg from 'pg';

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 10 });

export const query = (text, params) => pool.query(text, params);

/** Executa fn dentro de uma transacao; faz rollback em qualquer erro. */
export async function tx(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function audit(client, req, action, entity, entityId, detail = null) {
  await (client || pool).query(
    'INSERT INTO audit_log (company_id, user_id, action, entity, entity_id, detail) VALUES ($1,$2,$3,$4,$5,$6)',
    [req.user.cid, req.user.sub, action, entity, entityId ? String(entityId) : null, detail]
  );
}
