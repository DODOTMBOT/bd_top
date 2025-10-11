import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { slugifyPath, scanAppRoutes } from "@/src/lib/routeScanner";

const APP_DIR = path.join(process.cwd(), "app", "(app)");
const KEEP = ".keep";

// Типы для узлов
type PageNode = { type: "page"; name?: string; path: string };
type FolderNode = { type: "folder"; name?: string; path: string; children?: Node[] };
type Node = PageNode | FolderNode;

// Type guards и утилиты
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function asStr(v: unknown, def = ""): string { 
  return typeof v === "string" ? v : def; 
}

function normPath(p: string): string { 
  const s = p.trim().replace(/\/+$/, ""); 
  return s === "" ? "/" : s.startsWith("/") ? s : `/${s}`; 
}

function toPage(x: unknown): PageNode | null {
  if (!isRecord(x)) return null;
  const type = asStr(x.type ?? x.kind);
  const rawPath = asStr(x.path ?? x.url ?? "");
  if (type !== "page" && rawPath === "") return null;
  const path = normPath(rawPath);
  const name = asStr(x.name ?? x.title ?? path.split("/").pop() ?? "");
  return { type: "page", name, path };
}

function toFolder(x: unknown): FolderNode | null {
  if (!isRecord(x)) return null;
  const type = asStr(x.type ?? x.kind);
  if (type !== "folder") return null;
  const raw = asStr(x.path ?? x.url ?? asStr(x.name ?? x.title ?? ""));
  const path = normPath(raw);
  const name = asStr(x.name ?? x.title ?? path.split("/").pop() ?? "");
  let children: Node[] | undefined;
  const kids = (isRecord(x.children) || Array.isArray(x.children)) ? x.children
             : (isRecord(x.items) || Array.isArray(x.items)) ? x.items
             : undefined;
  if (Array.isArray(kids)) {
    const arr: Node[] = [];
    for (const it of kids) {
      const f = toFolder(it);
      if (f) { arr.push(f); continue; }
      const p = toPage(it);
      if (p) arr.push(p);
    }
    children = arr;
  }
  return { type: "folder", name, path, children };
}

function absFromRoute(route: string) {
  const clean = route.replace(/^\/+/, "");
  return path.join(APP_DIR, clean);
}

export async function GET() {
  // получение структуры узлов для модалки доступа
  try {
    const routes = await scanAppRoutes();
    
    // преобразуем в древовидную структуру
    const nodes: Node[] = routes.map(route => ({
      type: route.kind as "folder" | "page",
      name: route.route.split("/").pop() || route.route,
      path: route.route,
      children: route.kind === "folder" ? [] : undefined
    }));

    return NextResponse.json({ nodes }, { status: 200 });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "ERROR";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // создание: { type: "folder"|"page", route: "/parent/new-seg", title? }
  try {
    const { type, route, title } = await req.json();
    const norm = "/" + slugifyPath(String(route ?? ""));
    if (!norm || norm === "/") return NextResponse.json({ ok:false, error:"bad route" }, { status:400 });
    const base = absFromRoute(norm);
    await fs.mkdir(base, { recursive: true });

    if (type === "folder") {
      await fs.writeFile(path.join(base, KEEP), "", "utf8");  // маркер, чтобы папка была видна
      revalidatePath("/admin"); return NextResponse.json({ ok:true });
    }

    if (type === "page") {
      const file = path.join(base, "page.tsx");
      const titleStr = String(title ?? "").trim() || norm.split("/").pop();
      const tpl = `export default function Page(){return <div className="p-6"><h1 className="text-xl font-semibold">${titleStr}</h1></div>}\n`;
      await fs.writeFile(file, tpl, "utf8");
      revalidatePath("/admin"); revalidatePath("/");
      return NextResponse.json({ ok:true, path: norm });
    }

    return NextResponse.json({ ok:false, error:"bad type" }, { status:400 });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "ERROR";
    return NextResponse.json({ ok:false, error: errorMessage }, { status:500 });
  }
}

export async function PATCH(req: Request) {
  // перемещение: { from: "/a/old", to: "/b/new" }
  try {
    const { from, to } = await req.json();
    const src = absFromRoute("/" + slugifyPath(String(from ?? "")));
    const dst = absFromRoute("/" + slugifyPath(String(to ?? "")));
    if (src === dst) return NextResponse.json({ ok:true });
    await fs.mkdir(path.dirname(dst), { recursive: true });
    await fs.rename(src, dst); // перемещает как папку со всем содержимым
    revalidatePath("/admin"); revalidatePath("/");
    return NextResponse.json({ ok:true });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "ERROR";
    return NextResponse.json({ ok:false, error: errorMessage }, { status:500 });
  }
}

export async function DELETE(req: Request) {
  // удаление: { route: "/a/b" } — удалит папку/страницу
  try {
    const { route } = await req.json();
    const dir = absFromRoute("/" + slugifyPath(String(route ?? "")));
    await fs.rm(dir, { recursive: true, force: true });
    revalidatePath("/admin"); revalidatePath("/");
    return NextResponse.json({ ok:true });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "ERROR";
    return NextResponse.json({ ok:false, error: errorMessage }, { status:500 });
  }
}
