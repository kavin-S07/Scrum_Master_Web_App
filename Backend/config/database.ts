import { Pool, type QueryResultRow } from 'pg';
import { env } from './env';
import logger from '../utils/logger';

const pool = new Pool({
  connectionString: env.db.databaseUrl,
  max: env.db.poolMax,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on('connect', () => {
  logger.info('PostgreSQL pool: new client connected');
});

// A pool-level 'error' fires when an *idle* client errors out (e.g. the
// connection was dropped by the server). This does NOT mean the whole app
// is broken — pg automatically removes the bad client and the pool keeps
// serving requests with the remaining/new connections. Crashing the process
// here (the original behavior) would take the entire API down over a single
// transient network blip, so we log and let the pool recover instead.
pool.on('error', (err) => {
  logger.error('Unexpected PostgreSQL pool error (client removed from pool)', err);
});

export default pool;

export const query = async <T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
) => {
  const start = Date.now();
  const res = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  if (!env.isProduction) {
    logger.debug(`SQL [${duration}ms, ${res.rowCount ?? 0} row(s)]: ${text}`);
  } else if (duration > 1000) {
    // Always surface slow queries, even in production.
    logger.warn(`Slow SQL [${duration}ms]: ${text}`);
  }
  return res;
};

/** Run a set of queries inside a single transaction, rolling back on error. */
export const withTransaction = async <T>(
  fn: (client: import('pg').PoolClient) => Promise<T>
): Promise<T> => {
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
};