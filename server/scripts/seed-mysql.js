import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { createHash } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.join(__dirname, "..", "data", "mysql-schema.sql");
const snapshotPath = path.join(__dirname, "..", "data", "db.json");

const host = process.env.MYSQL_HOST;
const port = Number(process.env.MYSQL_PORT || 3306);
const user = process.env.MYSQL_USER || "root";
const password = process.env.MYSQL_PASSWORD || "";
const database = process.env.MYSQL_DATABASE || "site_fatumamotors_db";

const hashPassword = (raw) => createHash("sha256").update(raw).digest("hex");

if (!host) {
  console.error("Missing MYSQL_HOST. Example: MYSQL_HOST=127.0.0.1");
  process.exit(1);
}

try {
  const mysqlModule = await import("mysql2/promise");
  const mysql = mysqlModule.default || mysqlModule;
  const schemaSql = await readFile(schemaPath, "utf8");
  const snapshot = JSON.parse(await readFile(snapshotPath, "utf8"));

  const rootConnection = await mysql.createConnection({ host, port, user, password, multipleStatements: true });
  await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
  await rootConnection.end();

  const connection = await mysql.createConnection({ host, port, user, password, database, multipleStatements: true });
  await connection.query(schemaSql);

  await connection.query("DELETE FROM inquiries");
  await connection.query("DELETE FROM vehicles");
  await connection.query("DELETE FROM site_content");

  await connection.query("INSERT INTO site_content (id, content_json) VALUES (1, ?)", [JSON.stringify(snapshot.content)]);

  for (const vehicle of snapshot.vehicles || []) {
    await connection.query("INSERT INTO vehicles (id, data_json) VALUES (?, ?)", [vehicle.id, JSON.stringify(vehicle)]);
  }

  for (const inquiry of snapshot.inquiries || []) {
    const createdAt = inquiry.createdAt || new Date().toISOString();
    await connection.query("INSERT INTO inquiries (id, data_json, created_at) VALUES (?, ?, ?)", [
      inquiry.id,
      JSON.stringify({ ...inquiry, createdAt }),
      new Date(createdAt),
    ]);
  }

  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  await connection.query(
    `
      INSERT INTO admin_users (username, password_hash, created_at)
      VALUES (?, ?, NOW())
      ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)
    `,
    [adminUsername, hashPassword(adminPassword)],
  );

  await connection.end();

  console.log(`MySQL seed completed successfully for database: ${database}`);
  console.log(`Seeded vehicles: ${(snapshot.vehicles || []).length}`);
  console.log(`Seeded inquiries: ${(snapshot.inquiries || []).length}`);
} catch (error) {
  if ((error.code === "ERR_MODULE_NOT_FOUND" || String(error.message).includes("Cannot find package 'mysql2'"))) {
    console.error("mysql2 package is missing. Install it first with: npm install mysql2");
  }
  console.error("Failed to seed MySQL:", error.message);
  process.exit(1);
}
