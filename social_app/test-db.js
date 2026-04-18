const mysql = require('mysql2/promise');
async function run() {
  require('dotenv').config({ path: '.env' });
  try {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    const [rows] = await connection.execute('SELECT 1 as val');
    console.log("Success:", rows);
    connection.end();
  } catch (e) {
    console.error("Error connecting URL directly:", e.message);
    try {
      const connection2 = await mysql.createConnection({
        uri: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: true }
      });
      const [rows2] = await connection2.execute('SELECT 1 as val');
      console.log("Success with ssl:", rows2);
      connection2.end();
    } catch (e2) {
      console.error("Error connecting with ssl:", e2.message);
    }
  }
}
run();
