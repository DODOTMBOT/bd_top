import fg from "fast-glob";
import path from "path";

const PAGE_GLOBS = [
  "app/**/page.{ts,tsx,js,jsx,md,mdx}",
  "app/**/default.{ts,tsx,js,jsx,md,mdx}",
];

const EXCLUDE = [
  "!app/api/**",
  "!app/**/{__tests__,__mocks__}/**",
];

function stripRouteGroups(seg) {
  return seg.replace(/\([^/()]*\)/g, "");
}

function toRoute(fp) {
  let rel = fp
    .replace(/^app\//, "")
    .replace(/\/(page|default)\.(tsx|ts|js|jsx|md|mdx)$/, "");

  rel = stripRouteGroups(rel);
  rel = rel.replace(/\/+/g, "/").replace(/\/index$/i, "");
  if (!rel || rel === "/") return "/";
  return "/" + rel.replace(/^\/+/, "");
}

async function scanAppRoutes() {
  const entries = await fg([...PAGE_GLOBS, ...EXCLUDE], { dot: false, onlyFiles: true });
  console.log("Found files:", entries);
  
  const map = new Map();
  for (const fp of entries) {
    const route = toRoute(fp);
    const isDynamic = /\[.+?\]/.test(route);
    if (!map.has(route)) {
      map.set(route, {
        key: route + "::" + path.basename(fp),
        route, file: fp, isDynamic,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) =>
    a.route === b.route ? 0 :
    a.route.length === b.route.length ? a.route.localeCompare(b.route, "ru") :
    a.route.length - b.route.length
  );
}

scanAppRoutes().then(pages => {
  console.log("\nFinal routes:");
  pages.forEach(p => console.log(p.route, '->', p.file, p.isDynamic ? '(dynamic)' : '(static)'));
});
