import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.join(__dirname, "..", "data", "mysql-schema.sql");

const host = process.env.MYSQL_HOST;
const port = Number(process.env.MYSQL_PORT || 3306);
const user = process.env.MYSQL_USER || "root";
const password = process.env.MYSQL_PASSWORD || "";
const database = process.env.MYSQL_DATABASE || "site_fatumamotors_db";

if (!host) {
  console.error("Missing MYSQL_HOST. Example: MYSQL_HOST=127.0.0.1");
  process.exit(1);
}

try {
  const mysqlModule = await import("mysql2/promise");
  const mysql = mysqlModule.default || mysqlModule;
  const schemaSql = await readFile(schemaPath, "utf8");

  const rootConnection = await mysql.createConnection({ host, port, user, password, multipleStatements: true });
  await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
  await rootConnection.end();

  const connection = await mysql.createConnection({ host, port, user, password, database, multipleStatements: true });
  await connection.query(schemaSql);
  await connection.end();

  console.log(`MySQL migration completed successfully for database: ${database}`);
} catch (error) {
  console.error("Failed to run MySQL migration:", error.message);
  process.exit(1);
}
