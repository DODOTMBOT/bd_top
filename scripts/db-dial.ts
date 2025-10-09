import "dotenv/config";
import fs from "node:fs";
import { Client } from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("[db-dial] DATABASE_URL is missing");
  process.exit(2);
}

const caPath =
  process.env.SSL_CERT_FILE ||
  process.env.PGSSLROOTCERT ||
  `${process.env.HOME}/.cloud-certs/root.crt`;

const ssl =
  caPath && fs.existsSync(caPath)
    ? { rejectUnauthorized: true, ca: fs.readFileSync(caPath, "utf8") }
    : { rejectUnauthorized: false }; // fallback, чтобы увидеть ошибку коннекта

(async () => {
  const u = new URL(url);
  console.log("[db-dial] URL host:", u.host);
  console.log("[db-dial] CA:", caPath || "(none)", "exists:", !!(caPath && fs.existsSync(caPath)));

  const c = new Client({
    connectionString: url,
    ssl,
    // чтобы не висеть:
    connectionTimeoutMillis: 5000,
    statement_timeout: 5000,
    query_timeout: 5000,
  });

  const t0 = Date.now();
  const abort = setTimeout(() => {
    console.error("[db-dial] TIMEOUT after 7s");
    process.exit(3);
  }, 7000);

  try {
    await c.connect();
    const r = await c.query("select version() as v, inet_server_addr() as addr, inet_server_port() as port");
    clearTimeout(abort);
    console.log("[db-dial] OK in", Date.now() - t0, "ms");
    console.log("[db-dial] ver:", r.rows[0].v);
    console.log("[db-dial] addr:", r.rows[0].addr, "port:", r.rows[0].port);
    process.exit(0);
  } catch (e: any) {
    clearTimeout(abort);
    console.error("[db-dial] ERROR:", e?.name || "Error", e?.message || e);
    if (e?.code) console.error("[db-dial] code:", e.code);
    process.exit(2);
  } finally {
    try { await c.end(); } catch {}
  }
})();
