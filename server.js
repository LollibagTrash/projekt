const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

const PORT = Number(process.env.PORT || 3000);
const DATA_FILE = path.join(__dirname, "db.json");
const STATIC_FILES = {
  "/": "index.html",
  "/index.html": "index.html",
  "/about": "about.html",
  "/about.html": "about.html",
  "/app.js": "app.js",
  "/style.css": "style.css"
};
const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

async function readDatabase() {
  return JSON.parse(await fs.readFile(DATA_FILE, "utf8"));
}

async function writeDatabase(database) {
  await fs.writeFile(DATA_FILE, `${JSON.stringify(database, null, 2)}\n`, "utf8");
}

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  response.end(JSON.stringify(data));
}

function sendError(response, statusCode, message) {
  sendJson(response, statusCode, { error: message });
}

async function readBody(request) {
  let body = "";
  for await (const chunk of request) body += chunk;
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch {
    throw new Error("Érvénytelen JSON kérés.");
  }
}

function validateShoe(shoe) {
  return shoe && typeof shoe.name === "string" && shoe.name.trim()
    && typeof shoe.brand === "string" && shoe.brand.trim()
    && Number.isFinite(Number(shoe.price)) && Number(shoe.price) > 0
    && (shoe.oldPrice == null || (Number.isFinite(Number(shoe.oldPrice)) && Number(shoe.oldPrice) > Number(shoe.price)));
}

async function handleApi(request, response, pathname) {
  const database = await readDatabase();
  const match = pathname.match(/^\/api\/shoes(?:\/([^/]+))?$/);
  if (!match) {
    sendError(response, 404, "Az API-végpont nem található.");
    return true;
  }

  const id = match[1];
  if (request.method === "GET") {
    if (!id) return sendJson(response, 200, database.shoes);
    const shoe = database.shoes.find((item) => String(item.id) === id);
    return shoe ? sendJson(response, 200, shoe) : sendError(response, 404, "A termék nem található.");
  }

  if (request.method === "POST" && !id) {
    const payload = await readBody(request);
    if (!validateShoe(payload)) return sendError(response, 400, "A név, márka és pozitív akciós ár kötelező; az eredeti árnak magasabbnak kell lennie.");
    const shoe = { ...payload, id: randomUUID(), price: Number(payload.price), oldPrice: payload.oldPrice == null ? null : Number(payload.oldPrice) };
    database.shoes.push(shoe);
    await writeDatabase(database);
    return sendJson(response, 201, shoe);
  }

  if ((request.method === "PUT" || request.method === "DELETE") && id) {
    const index = database.shoes.findIndex((item) => String(item.id) === id);
    if (index === -1) return sendError(response, 404, "A termék nem található.");
    if (request.method === "DELETE") {
      const [removed] = database.shoes.splice(index, 1);
      await writeDatabase(database);
      return sendJson(response, 200, removed);
    }
    const payload = await readBody(request);
    const updated = { ...database.shoes[index], ...payload, id: database.shoes[index].id };
    if (!validateShoe(updated)) return sendError(response, 400, "A név, márka és pozitív akciós ár kötelező; az eredeti árnak magasabbnak kell lennie.");
    database.shoes[index] = { ...updated, price: Number(updated.price), oldPrice: updated.oldPrice == null ? null : Number(updated.oldPrice) };
    await writeDatabase(database);
    return sendJson(response, 200, database.shoes[index]);
  }

  sendError(response, 405, "A HTTP művelet nem támogatott.");
  return true;
}

async function serveStatic(response, pathname) {
  const filename = STATIC_FILES[pathname];
  if (!filename) return sendError(response, 404, "Az oldal nem található.");
  const filePath = path.join(__dirname, filename);
  const content = await fs.readFile(filePath);
  response.writeHead(200, { "Content-Type": CONTENT_TYPES[path.extname(filename)] });
  response.end(content);
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
    if (request.method === "OPTIONS") return sendJson(response, 204, {});
    if (url.pathname.startsWith("/api/")) {
      await handleApi(request, response, url.pathname);
      return;
    }
    if (request.method !== "GET") return sendError(response, 405, "A HTTP művelet nem támogatott.");
    await serveStatic(response, url.pathname);
  } catch (error) {
    sendError(response, 500, error.message);
  }
});

if (require.main === module) {
  server.listen(PORT, () => console.log(`StrideLab REST API: http://localhost:${PORT}`));
}

module.exports = { server, readDatabase, writeDatabase };
