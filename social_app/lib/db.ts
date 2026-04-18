import mysql, { Pool } from 'mysql2/promise';

declare const globalThis: {
  mysqlPool?: Pool;
} & typeof global;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const db = globalThis.mysqlPool || mysql.createPool({
  uri: process.env.DATABASE_URL as string,
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.mysqlPool = db;
}

export default db;
