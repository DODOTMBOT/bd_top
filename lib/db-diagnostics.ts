import { URL } from "node:url";

export function redactDbUrl(dbUrl: string | undefined) {
  if (!dbUrl) return "MISSING";
  try {
    const u = new URL(dbUrl);
    const host = u.host;
    u.password = u.password ? "****" : "";
    return { host, urlSample: `${u.protocol}//${u.username}:${u.password}@${u.host}${u.pathname}` };
  } catch {
    return "INVALID_URL";
  }
}

