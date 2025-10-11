import { promises as fs } from "fs";
import path from "path";

type PageInfo = { route: string; file: string; isDynamic: boolean };

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, "app", "(app)");

const IGNORE_DIR = new Set(["api", "(auth)"]);
const PAGE_FILE = "page.tsx";

export async function scanAppRoutes(): Promise<PageInfo[]> {
  const results: PageInfo[] = [];
  async function walk(dirAbs: string, baseRoute: string) {
    const entries = await fs.readdir(dirAbs, { withFileTypes: true });
    for (const e of entries) {
      if (e.name.startsWith(".")) continue;
      if (e.isDirectory()) {
        if (IGNORE_DIR.has(e.name)) continue;
        const nextAbs = path.join(dirAbs, e.name);
        const seg = e.name;                       // допускаем [id]
        const nextRoute = seg === "(app)" ? baseRoute : path.join(baseRoute, seg).replace(/\\/g, "/");
        await walk(nextAbs, nextRoute);
      } else if (e.isFile() && e.name === PAGE_FILE) {
        const rel = path.relative(APP_DIR, dirAbs).replace(/\\/g, "/");
        const route = "/" + rel.replace(/^\(app\)\//, "");
        const isDynamic = /\[[^\]]+\]/.test(route);
        results.push({ route, file: path.join("app/(app)", rel, PAGE_FILE).replace(/\\/g, "/"), isDynamic });
      }
    }
  }
  await walk(APP_DIR, "");
  // нормализуем маршруты: /segment (убираем лишние "/")
  return results.map(p => ({ ...p, route: p.route.replace(/\/+/g, "/") }))
                .sort((a,b)=> a.route.localeCompare(b.route));
}