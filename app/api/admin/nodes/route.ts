import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { slugifyPath } from "@/src/lib/routeScanner";

const APP_DIR = path.join(process.cwd(), "app", "(app)");
const KEEP = ".keep";

function absFromRoute(route: string) {
  const clean = route.replace(/^\/+/, "");
  return path.join(APP_DIR, clean);
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
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e?.message ?? "ERROR" }, { status:500 });
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
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e?.message ?? "ERROR" }, { status:500 });
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
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e?.message ?? "ERROR" }, { status:500 });
  }
}
