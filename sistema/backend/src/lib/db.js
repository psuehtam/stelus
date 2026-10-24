import mysql from 'mysql2/promise';

function parseDatabaseUrl(url) {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: Number(u.port) || 3306,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ''),
  };
}

const config = process.env.DATABASE_URL
  ? parseDatabaseUrl(process.env.DATABASE_URL)
  : {
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 3306),
      user: process.env.DB_USER ?? 'root',
      password: process.env.DB_PASSWORD ?? '',
      database: process.env.DB_NAME ?? 'stelus_bordados',
    };

const pool = mysql.createPool({
  ...config,
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: ['DATE', 'DATETIME'],
});

export default pool;

let poolClosed = false;

export async function closePool() {
  if (poolClosed) return;
  poolClosed = true;
  await pool.end();
}

export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] ?? null;
}

export async function withTransaction(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function txQuery(conn, sql, params = []) {
  const [rows] = await conn.execute(sql, params);
  return rows;
}

export async function txQueryOne(conn, sql, params = []) {
  const rows = await txQuery(conn, sql, params);
  return rows[0] ?? null;
}
