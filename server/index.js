import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import { DataStore } from "./data/store.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");

const app = express();
const port = Number(process.env.PORT || 4000);
const activeTokens = new Set();
const store = new DataStore();

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

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

const getByPath = (source, path) =>
  path.split(".").reduce((value, key) => (value && typeof value === "object" ? value[key] : undefined), source);

const setByPath = (source, path, nextValue) => {
  const keys = path.split(".").filter(Boolean);
  if (keys.length === 0) return source;

  const draft = structuredClone(source);
  let cursor = draft;

  for (let index = 0; index < keys.length - 1; index += 1) {
    const key = keys[index];
    if (!cursor[key] || typeof cursor[key] !== "object") {
      cursor[key] = {};
    }
    cursor = cursor[key];
  }

  cursor[keys[keys.length - 1]] = nextValue;
  return draft;
};

const deleteByPath = (source, path) => {
  const keys = path.split(".").filter(Boolean);
  if (keys.length === 0) return source;

  const draft = structuredClone(source);
  let cursor = draft;

  for (let index = 0; index < keys.length - 1; index += 1) {
    const key = keys[index];
    if (!cursor[key] || typeof cursor[key] !== "object") {
      return draft;
    }
    cursor = cursor[key];
  }

  delete cursor[keys[keys.length - 1]];
  return draft;
};

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

const handleAdminLogin = async (req, res, next) => {
  try {
    const username = req.body?.username || "";
    const password = req.body?.password || "";

    const isValid = await store.verifyAdminCredentials(username, password);

    if (!isValid) {
      res.status(401).json({ message: "Invalid username or password." });
      return;
    }

    const token = randomUUID();
    activeTokens.add(token);
    res.json({ token });
  } catch (error) {
    next(error);
  }
};

app.post("/api/auth/login", handleAdminLogin);
app.post("/api/login", handleAdminLogin);

app.get("/api/auth/session", (req, res) => {
  const token = getBearerToken(req.headers.authorization);
  res.json({ authenticated: Boolean(token && activeTokens.has(token)) });
});

app.post("/api/auth/logout", requireAdminAuth, (req, res) => {
  const token = getBearerToken(req.headers.authorization);
  if (token) activeTokens.delete(token);
  res.status(204).send();
});

app.get("/api/admin/sections", requireAdminAuth, async (_req, res, next) => {
  try {
    const content = await store.getContent();
    res.json({ keys: Object.keys(content || {}) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/sections/:path", requireAdminAuth, async (req, res, next) => {
  try {
    const content = await store.getContent();
    const value = getByPath(content, req.params.path);
    if (typeof value === "undefined") {
      res.status(404).json({ message: `Section '${req.params.path}' not found.` });
      return;
    }
    res.json({ path: req.params.path, value });
  } catch (error) {
    next(error);
  }
});

app.put("/api/admin/sections/:path", requireAdminAuth, async (req, res, next) => {
  try {
    const content = await store.getContent();
    const updated = setByPath(content, req.params.path, req.body?.value);
    await store.updateContent(updated);
    res.json({ message: "Section updated.", path: req.params.path, value: getByPath(updated, req.params.path) });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/admin/sections/:path", requireAdminAuth, async (req, res, next) => {
  try {
    const content = await store.getContent();
    const updated = deleteByPath(content, req.params.path);
    await store.updateContent(updated);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.get("/api/content", async (_req, res, next) => {
  try {
    const content = await store.getContent();
    res.json(content);
  } catch (error) {
    next(error);
  }
});

app.put("/api/content", requireAdminAuth, async (req, res, next) => {
  try {
    assertObject(req.body, "A content object is required.");
    const content = await store.updateContent(req.body);
    res.json(content);
  } catch (error) {
    next(error);
  }
});

app.get("/api/vehicles", async (_req, res, next) => {
  try {
    const vehicles = await store.getVehicles();
    res.json(vehicles);
  } catch (error) {
    next(error);
  }
});

app.post("/api/vehicles", requireAdminAuth, async (req, res, next) => {
  try {
    assertObject(req.body, "Vehicle payload is required.");
    const vehicle = await store.createVehicle(req.body);
    res.status(201).json(vehicle);
  } catch (error) {
    next(error);
  }
});

app.put("/api/vehicles/:id", requireAdminAuth, async (req, res, next) => {
  try {
    assertObject(req.body, "Vehicle payload is required.");
    const vehicle = await store.updateVehicle(req.params.id, req.body);

    if (!vehicle) {
      res.status(404).json({ message: "Vehicle not found." });
      return;
    }

    res.json(vehicle);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/vehicles/:id", requireAdminAuth, async (req, res, next) => {
  try {
    const deleted = await store.deleteVehicle(req.params.id);

    if (!deleted) {
      res.status(404).json({ message: "Vehicle not found." });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.get("/api/inquiries", requireAdminAuth, async (_req, res, next) => {
  try {
    const inquiries = await store.getInquiries();
    res.json(inquiries);
  } catch (error) {
    next(error);
  }
});

app.post("/api/inquiries", async (req, res, next) => {
  try {
    assertObject(req.body, "Inquiry payload is required.");
    const inquiry = await store.createInquiry(req.body);
    res.status(201).json(inquiry);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/inquiries/:id", requireAdminAuth, async (req, res, next) => {
  try {
    const deleted = await store.deleteInquiry(req.params.id);

    if (!deleted) {
      res.status(404).json({ message: "Inquiry not found." });
      return;
    }

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

store
  .init()
  .then(() => {
    app.listen(port, () => {
      console.log(`FatumaMotors API listening on http://localhost:${port}`);
      if (store.useMysql) {
        console.log("Using MySQL storage backend.");
      } else {
        console.log("Using JSON file storage backend.");
      }
    });
  })
  .catch((error) => {
    console.error("Failed to initialize data store:", error);
    process.exit(1);
  });
