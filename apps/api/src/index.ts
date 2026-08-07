import { createServer, type IncomingMessage } from "node:http";
import { randomUUID } from "node:crypto";
import { handleCustomerPortalRoute } from "./customerPortal.js";

type RecordItem = { id: string; name: string; status: string };

const port = Number(process.env.API_PORT ?? 3001);
const records: RecordItem[] = [{ id: "001", name: "Destinasi Utama", status: "active" }];

// ERP Wisata in-memory store — replace with DB persistence via Prisma in production
const erpWisataStores: Record<string, RecordItem[]> = {
  destinasi: [{ id: "d001", name: "Wisata Alam Raya", status: "aktif" }],
  "paket-wisata": [],
  hotel: [],
  kendaraan: [],
  guide: [],
  customer: [],
  vendor: [],
  supplier: [],
  barang: [],
  gudang: [],
  karyawan: [],
  jabatan: [],
  departemen: [],
  bank: [],
  pajak: [],
  satuan: [],
  brand: [],
  kategori: [],
  reservasi: [],
  ticketing: [],
  pembayaran: [],
  kas: [],
  jurnal: []
};

const MAX_BODY_BYTES = 1_048_576; // 1 MB

function readBody(request: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    request.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) { reject(new Error("Payload too large")); return; }
      chunks.push(Buffer.from(chunk));
    });
    request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    request.on("error", reject);
  });
}

function safeParseBody(raw: string): Partial<RecordItem> | null {
  if (raw.length === 0) return {};
  try { return JSON.parse(raw) as Partial<RecordItem>; }
  catch { return null; }
}

createServer(async (request, response) => {
  try {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);
  const corsHeaders = {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS",
    "access-control-allow-headers": "content-type,authorization",
    "access-control-max-age": "86400",
  };

  if (request.method === "OPTIONS") {
    response.writeHead(204, corsHeaders);
    response.end();
    return;
  }

  Object.entries(corsHeaders).forEach(([key, value]) => response.setHeader(key, value));

  if (url.pathname.startsWith("/customer")) {
    const handled = await handleCustomerPortalRoute({ request, response, url, readBody, safeParseBody });
    if (handled) return;
  }

  if (request.method === "GET" && url.pathname === "/health") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ status: "ok", service: "api" }));
    return;
  }

  if (request.method === "GET" && url.pathname === "/records") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify(records));
    return;
  }

  if (request.method === "POST" && url.pathname === "/records") {
    const raw = await readBody(request);
    const parsed = safeParseBody(raw);
    if (!parsed) { response.writeHead(400, { "content-type": "application/json" }); response.end(JSON.stringify({ error: "Invalid JSON body" })); return; }
    const created = {
      id: randomUUID(),
      name: parsed.name ?? "Untitled Record",
      status: parsed.status ?? "active"
    };
    records.push(created);
    response.writeHead(201, { "content-type": "application/json" });
    response.end(JSON.stringify(created));
    return;
  }

  if (request.method === "POST" && url.pathname === "/auth/login") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ token: "workspace-token", user: "admin" }));
    return;
  }

  // ERP Wisata CRUD routes: /erp-wisata/{entity}
  const erpMatch = url.pathname.match(/^\/erp-wisata\/([a-z-]+)(\/([^/]+))?$/);
  if (erpMatch) {
    const entity = erpMatch[1];
    const id = erpMatch[3];
    const store = erpWisataStores[entity];
    if (!store) {
      response.writeHead(404, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: `Entity '${entity}' not found` }));
      return;
    }
    if (request.method === "GET" && !id) {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ data: store, total: store.length }));
      return;
    }
    if (request.method === "GET" && id) {
      const item = store.find(r => r.id === id);
      if (!item) { response.writeHead(404, { "content-type": "application/json" }); response.end(JSON.stringify({ error: "Not found" })); return; }
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify(item));
      return;
    }
    if (request.method === "POST") {
      const raw = await readBody(request);
      const parsed = safeParseBody(raw);
      if (!parsed) { response.writeHead(400, { "content-type": "application/json" }); response.end(JSON.stringify({ error: "Invalid JSON body" })); return; }
      const item = { id: randomUUID(), name: parsed.name ?? "New Item", status: parsed.status ?? "aktif" };
      store.push(item);
      response.writeHead(201, { "content-type": "application/json" });
      response.end(JSON.stringify(item));
      return;
    }
    if (request.method === "PUT" && id) {
      const idx = store.findIndex(r => r.id === id);
      if (idx === -1) { response.writeHead(404, { "content-type": "application/json" }); response.end(JSON.stringify({ error: "Not found" })); return; }
      const raw = await readBody(request);
      const parsed = safeParseBody(raw);
      if (!parsed) { response.writeHead(400, { "content-type": "application/json" }); response.end(JSON.stringify({ error: "Invalid JSON body" })); return; }
      const { id: _id, ...safe } = parsed; // prevent id overwrite
      store[idx] = { ...store[idx], ...safe };
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify(store[idx]));
      return;
    }
    if (request.method === "DELETE" && id) {
      const idx = store.findIndex(r => r.id === id);
      if (idx === -1) { response.writeHead(404, { "content-type": "application/json" }); response.end(JSON.stringify({ error: "Not found" })); return; }
      store.splice(idx, 1);
      response.writeHead(204);
      response.end();
      return;
    }
  }

  response.writeHead(404, { "content-type": "application/json" });
  response.end(JSON.stringify({ error: "Not Found" }));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    if (!response.headersSent) {
      response.writeHead(msg === "Payload too large" ? 413 : 500, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: msg }));
    }
  }
}).listen(port, () => {
  console.log(`[api] listening on http://127.0.0.1:${port}`);
});
