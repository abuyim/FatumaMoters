import path from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";
import { createHash, randomUUID } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFile = path.join(__dirname, "db.json");

const hashPassword = (password) => createHash("sha256").update(password).digest("hex");

const parseRowJson = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export class DataStore {
  constructor() {
    this.useMysql = Boolean(process.env.MYSQL_HOST);
    this.mysql = null;
    this.pool = null;
  }

  async init() {
    if (!this.useMysql) return;

    try {
      const mysqlModule = await import("mysql2/promise");
      this.mysql = mysqlModule.default || mysqlModule;
      this.pool = this.mysql.createPool({
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT || 3306),
        user: process.env.MYSQL_USER || "root",
        password: process.env.MYSQL_PASSWORD || "",
        database: process.env.MYSQL_DATABASE || "fatumamotors",
        connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT || 10),
      });
    } catch (error) {
      console.warn("MySQL backend requested but mysql2 is unavailable. Falling back to JSON storage.");
      this.useMysql = false;
      this.mysql = null;
      this.pool = null;
      return;
    }

    try {
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS site_content (
          id INT PRIMARY KEY,
          content_json LONGTEXT NOT NULL
        )
      `);

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS vehicles (
          id VARCHAR(191) PRIMARY KEY,
          data_json LONGTEXT NOT NULL
        )
      `);

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS inquiries (
          id VARCHAR(191) PRIMARY KEY,
          data_json LONGTEXT NOT NULL,
          created_at DATETIME NOT NULL
        )
      `);

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS admin_users (
          username VARCHAR(191) PRIMARY KEY,
          password_hash VARCHAR(255) NOT NULL,
          created_at DATETIME NOT NULL
        )
      `);

      const defaultAdminUser = process.env.ADMIN_USERNAME || "admin";
      const defaultAdminPass = process.env.ADMIN_PASSWORD || "admin123";

      await this.pool.query(
        `
        INSERT INTO admin_users (username, password_hash, created_at)
        VALUES (?, ?, NOW())
        ON DUPLICATE KEY UPDATE username = username
      `,
        [defaultAdminUser, hashPassword(defaultAdminPass)],
      );

      const [contentRows] = await this.pool.query("SELECT id FROM site_content WHERE id = 1");
      if (contentRows.length === 0) {
        const snapshot = await this.readJsonSnapshot();
        await this.pool.query("INSERT INTO site_content (id, content_json) VALUES (1, ?)", [JSON.stringify(snapshot.content)]);
        for (const vehicle of snapshot.vehicles || []) {
          await this.pool.query("INSERT INTO vehicles (id, data_json) VALUES (?, ?)", [vehicle.id || randomUUID(), JSON.stringify(vehicle)]);
        }
        for (const inquiry of snapshot.inquiries || []) {
          const createdAt = inquiry.createdAt || new Date().toISOString();
          await this.pool.query("INSERT INTO inquiries (id, data_json, created_at) VALUES (?, ?, ?)", [
            inquiry.id || randomUUID(),
            JSON.stringify({ ...inquiry, createdAt }),
            new Date(createdAt),
          ]);
        }
      }
    } catch (error) {
      console.warn("MySQL connection/init failed. Falling back to JSON storage.");
      this.useMysql = false;
      this.mysql = null;
      this.pool = null;
    }
  }

  async readJsonSnapshot() {
    const raw = await fs.readFile(dbFile, "utf8");
    return JSON.parse(raw);
  }

  async writeJsonSnapshot(nextDb) {
    await fs.writeFile(dbFile, JSON.stringify(nextDb, null, 2));
  }

  async getContent() {
    if (!this.useMysql) {
      const db = await this.readJsonSnapshot();
      return db.content;
    }

    const [rows] = await this.pool.query("SELECT content_json FROM site_content WHERE id = 1 LIMIT 1");
    const row = rows[0];
    return parseRowJson(row?.content_json || "{}", {});
  }

  async updateContent(content) {
    if (!this.useMysql) {
      const db = await this.readJsonSnapshot();
      db.content = content;
      await this.writeJsonSnapshot(db);
      return db.content;
    }

    await this.pool.query(
      `
      INSERT INTO site_content (id, content_json)
      VALUES (1, ?)
      ON DUPLICATE KEY UPDATE content_json = VALUES(content_json)
    `,
      [JSON.stringify(content)],
    );
    return content;
  }

  async getVehicles() {
    if (!this.useMysql) {
      const db = await this.readJsonSnapshot();
      return db.vehicles;
    }

    const [rows] = await this.pool.query("SELECT data_json FROM vehicles ORDER BY id ASC");
    return rows.map((row) => parseRowJson(row.data_json, {}));
  }

  async createVehicle(vehicle) {
    const nextVehicle = { ...vehicle, id: vehicle.id || randomUUID() };

    if (!this.useMysql) {
      const db = await this.readJsonSnapshot();
      db.vehicles.push(nextVehicle);
      await this.writeJsonSnapshot(db);
      return nextVehicle;
    }

    await this.pool.query("INSERT INTO vehicles (id, data_json) VALUES (?, ?)", [nextVehicle.id, JSON.stringify(nextVehicle)]);
    return nextVehicle;
  }

  async updateVehicle(id, vehicle) {
    const nextVehicle = { ...vehicle, id };

    if (!this.useMysql) {
      const db = await this.readJsonSnapshot();
      const index = db.vehicles.findIndex((entry) => entry.id === id);
      if (index === -1) return null;
      db.vehicles[index] = nextVehicle;
      await this.writeJsonSnapshot(db);
      return nextVehicle;
    }

    const [result] = await this.pool.query("UPDATE vehicles SET data_json = ? WHERE id = ?", [JSON.stringify(nextVehicle), id]);
    if (result.affectedRows === 0) return null;
    return nextVehicle;
  }

  async deleteVehicle(id) {
    if (!this.useMysql) {
      const db = await this.readJsonSnapshot();
      const before = db.vehicles.length;
      db.vehicles = db.vehicles.filter((entry) => entry.id !== id);
      if (db.vehicles.length === before) return false;
      await this.writeJsonSnapshot(db);
      return true;
    }

    const [result] = await this.pool.query("DELETE FROM vehicles WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  async getInquiries() {
    if (!this.useMysql) {
      const db = await this.readJsonSnapshot();
      return [...db.inquiries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const [rows] = await this.pool.query("SELECT data_json FROM inquiries ORDER BY created_at DESC");
    return rows.map((row) => parseRowJson(row.data_json, {}));
  }

  async createInquiry(payload) {
    const inquiry = {
      id: randomUUID(),
      name: payload.name || "",
      email: payload.email || "",
      phone: payload.phone || "",
      subject: payload.subject || "general",
      message: payload.message || "",
      vehicleName: payload.vehicleName || "",
      createdAt: new Date().toISOString(),
    };

    if (!this.useMysql) {
      const db = await this.readJsonSnapshot();
      db.inquiries.unshift(inquiry);
      await this.writeJsonSnapshot(db);
      return inquiry;
    }

    await this.pool.query("INSERT INTO inquiries (id, data_json, created_at) VALUES (?, ?, ?)", [
      inquiry.id,
      JSON.stringify(inquiry),
      new Date(inquiry.createdAt),
    ]);

    return inquiry;
  }

  async deleteInquiry(id) {
    if (!this.useMysql) {
      const db = await this.readJsonSnapshot();
      const before = db.inquiries.length;
      db.inquiries = db.inquiries.filter((entry) => entry.id !== id);
      if (db.inquiries.length === before) return false;
      await this.writeJsonSnapshot(db);
      return true;
    }

    const [result] = await this.pool.query("DELETE FROM inquiries WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  async verifyAdminCredentials(username, password) {
    if (!this.useMysql) {
      const expectedUser = process.env.ADMIN_USERNAME || "admin";
      const expectedPassword = process.env.ADMIN_PASSWORD || "admin123";
      return username === expectedUser && password === expectedPassword;
    }

    const [rows] = await this.pool.query("SELECT password_hash FROM admin_users WHERE username = ? LIMIT 1", [username]);
    const row = rows[0];
    if (!row) return false;
    return row.password_hash === hashPassword(password);
  }
}
