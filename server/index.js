import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";
import { randomUUID } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const dbFile = path.join(__dirname, "data", "db.json");
const distDir = path.join(projectRoot, "dist");

const app = express();
const port = Number(process.env.PORT || 4000);
const adminUsername = process.env.ADMIN_USERNAME || "admin";
const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
const activeTokens = new Set();

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

const readDb = async () => {
  const raw = await fs.readFile(dbFile, "utf8");
  return JSON.parse(raw);
};

const writeDb = async (db) => {
  await fs.writeFile(dbFile, JSON.stringify(db, null, 2));
};

const assertObject = (value, message) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  }
};

const getBearerToken = (authorizationHeader = "") => {
  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
};

const requireAdminAuth = (req, res, next) => {
  const token = getBearerToken(req.headers.authorization);

  if (!token || !activeTokens.has(token)) {
    res.status(401).json({ message: "Unauthorized. Please log in as admin." });
    return;
  }

  next();
};

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/login", (req, res) => {
  const username = req.body?.username || "";
  const password = req.body?.password || "";

  if (username !== adminUsername || password !== adminPassword) {
    res.status(401).json({ message: "Invalid username or password." });
    return;
  }

  const token = randomUUID();
  activeTokens.add(token);
  res.json({ token });
});

app.get("/api/auth/session", (req, res) => {
  const token = getBearerToken(req.headers.authorization);
  res.json({ authenticated: Boolean(token && activeTokens.has(token)) });
});

app.post("/api/auth/logout", requireAdminAuth, (req, res) => {
  const token = getBearerToken(req.headers.authorization);
  if (token) activeTokens.delete(token);
  res.status(204).send();
});

app.get("/api/content", async (_req, res, next) => {
  try {
    const db = await readDb();
    res.json(db.content);
  } catch (error) {
    next(error);
  }
});

app.put("/api/content", requireAdminAuth, async (req, res, next) => {
  try {
    assertObject(req.body, "A content object is required.");
    const db = await readDb();
    db.content = req.body;
    await writeDb(db);
    res.json(db.content);
  } catch (error) {
    next(error);
  }
});

app.get("/api/vehicles", async (_req, res, next) => {
  try {
    const db = await readDb();
    res.json(db.vehicles);
  } catch (error) {
    next(error);
  }
});

app.post("/api/vehicles", requireAdminAuth, async (req, res, next) => {
  try {
    assertObject(req.body, "Vehicle payload is required.");
    const db = await readDb();
    const vehicle = { ...req.body, id: req.body.id || randomUUID() };
    db.vehicles.push(vehicle);
    await writeDb(db);
    res.status(201).json(vehicle);
  } catch (error) {
    next(error);
  }
});

app.put("/api/vehicles/:id", requireAdminAuth, async (req, res, next) => {
  try {
    assertObject(req.body, "Vehicle payload is required.");
    const db = await readDb();
    const index = db.vehicles.findIndex((vehicle) => vehicle.id === req.params.id);

    if (index === -1) {
      res.status(404).json({ message: "Vehicle not found." });
      return;
    }

    const updatedVehicle = { ...req.body, id: req.params.id };
    db.vehicles[index] = updatedVehicle;
    await writeDb(db);
    res.json(updatedVehicle);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/vehicles/:id", requireAdminAuth, async (req, res, next) => {
  try {
    const db = await readDb();
    const remainingVehicles = db.vehicles.filter((vehicle) => vehicle.id !== req.params.id);

    if (remainingVehicles.length === db.vehicles.length) {
      res.status(404).json({ message: "Vehicle not found." });
      return;
    }

    db.vehicles = remainingVehicles;
    await writeDb(db);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.get("/api/inquiries", requireAdminAuth, async (_req, res, next) => {
  try {
    const db = await readDb();
    const inquiries = [...db.inquiries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(inquiries);
  } catch (error) {
    next(error);
  }
});

app.post("/api/inquiries", async (req, res, next) => {
  try {
    assertObject(req.body, "Inquiry payload is required.");
    const db = await readDb();
    const inquiry = {
      id: randomUUID(),
      name: req.body.name || "",
      email: req.body.email || "",
      phone: req.body.phone || "",
      subject: req.body.subject || "general",
      message: req.body.message || "",
      vehicleName: req.body.vehicleName || "",
      createdAt: new Date().toISOString(),
    };

    db.inquiries.unshift(inquiry);
    await writeDb(db);
    res.status(201).json(inquiry);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/inquiries/:id", requireAdminAuth, async (req, res, next) => {
  try {
    const db = await readDb();
    const remainingInquiries = db.inquiries.filter((inquiry) => inquiry.id !== req.params.id);

    if (remainingInquiries.length === db.inquiries.length) {
      res.status(404).json({ message: "Inquiry not found." });
      return;
    }

    db.inquiries = remainingInquiries;
    await writeDb(db);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.use(express.static(distDir));

app.get("/{*path}", async (req, res, next) => {
  try {
    if (req.path.startsWith("/api/")) {
      res.status(404).json({ message: "API route not found." });
      return;
    }

    const indexFile = path.join(distDir, "index.html");
    await fs.access(indexFile);
    res.sendFile(indexFile);
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    message: error.message || "Unexpected server error.",
  });
});

app.listen(port, () => {
  console.log(`FatumaMotors API listening on http://localhost:${port}`);
});
