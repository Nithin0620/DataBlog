import mysql, { Pool } from 'mysql2/promise';
import { initDb } from './initDb';

declare const globalThis: {
  mysqlPool?: Pool;
  mysqlPoolReady?: Promise<Pool>;
} & typeof global;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

/**
 * Returns a pool that is guaranteed to have run CREATE TABLE IF NOT EXISTS
 * for every application table before the first query fires.
 *
 * The initialisation is done once per process (or per hot-reload in dev)
 * and the result is cached via globalThis so subsequent imports get the
 * already-ready pool immediately.
 */
function createAndInitPool(): Promise<Pool> {
  const pool = mysql.createPool({
    uri: process.env.DATABASE_URL as string,
  });

  // Run CREATE TABLE IF NOT EXISTS for all tables, then return the pool.
  return initDb(pool).then(() => pool);
}

// In development, Next.js hot-reloads modules frequently.
// We cache both the pool AND the init promise on globalThis so we never
// run CREATE TABLE queries more than once per process lifetime.
if (!globalThis.mysqlPoolReady) {
  globalThis.mysqlPoolReady = createAndInitPool();

  // Also stash the resolved pool for synchronous access after boot.
  globalThis.mysqlPoolReady.then((pool) => {
    globalThis.mysqlPool = pool;
  });
}

/**
 * `db` – resolves to the MySQL pool after all tables have been verified.
 *
 * Usage in route handlers:
 *   const pool = await db;
 *   const [rows] = await pool.execute('SELECT ...', [...]);
 *
 * Or, if you import the default export and call `.execute()` directly,
 * use the `getDb()` helper below instead.
 */
const dbReady: Promise<Pool> = globalThis.mysqlPoolReady!;

export default dbReady;

/**
 * Convenience helper – awaits the pool and returns it.
 * Identical to `await db` but reads more clearly in route files.
 */
export async function getDb(): Promise<Pool> {
  return dbReady;
}
