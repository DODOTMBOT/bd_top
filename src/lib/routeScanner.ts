import { promises as fs } from "fs";
import path from "path";

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, "app", "(app)");
const KEEP = ".keep";

export type NodeKind = "folder" | "page";
export type NodeRow = {
  route: string;           // "/a", "/a/b", "/a/b/c"
  file: string | null;     // путь к page.tsx или null
  kind: NodeKind;          // "folder" либо "page"
  isDynamic: boolean;      // содержит [param]
};

export async function scanAppRoutes(): Promise<NodeRow[]> {
  const out: NodeRow[] = [];
  async function walk(dir: string, segs: string[]) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const names = entries.map(e => e.name);

    // Маркер папки: есть .keep ИЛИ есть page.tsx ИЛИ есть поддиректории
    const route = "/" + segs.join("/");
    const pagePath = path.join(dir, "page.tsx");
    const hasPage = names.includes("page.tsx");
    const hasKeep = names.includes(KEEP);
    const hasSubdirs = entries.some(e => e.isDirectory());

    if (segs.length > 0 && (hasKeep || hasPage || hasSubdirs)) {
      out.push({
        route,
        file: hasPage ? pagePath : null,
        kind: hasPage ? "page" : "folder",
        isDynamic: /\[[^\]]+\]/.test(route),
      });
    }

    for (const ent of entries) {
      if (!ent.isDirectory()) continue;
      if (ent.name.startsWith("_")) continue;           // системные
      const child = path.join(dir, ent.name);
      await walk(child, [...segs, ent.name]);
    }
  }
  await walk(APP_DIR, []);
  // корень "/" как «папка»
  out.unshift({ route: "/", file: null, kind: "folder", isDynamic: false });
  return out.sort((a,b) => a.route.localeCompare(b.route));
}

export function slugifyPath(input: string): string {
  return input
    .trim()
    .replace(/[ё]/gi, "e")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}/-]+/gu, "-")
    .replace(/\/+/g, "/")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}
