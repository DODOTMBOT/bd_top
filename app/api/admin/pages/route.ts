import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const APP_DIR = path.join(process.cwd(), "app", "(app)");

function translit(input: string): string {
  const m: Record<string,string> = { а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"e",ж:"zh",з:"z",и:"i",й:"i",к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"h",ц:"c",ч:"ch",ш:"sh",щ:"sch",ъ:"",ы:"y",ь:"",э:"e",ю:"yu",я:"ya" };
  return input.toLowerCase().replace(/[а-яё]/g, ch => m[ch] ?? "").replace(/[^a-z0-9- ]+/g," ").trim();
}
function toSlug(src: string) {
  return translit(src).replace(/\s+/g,"-").replace(/--+/g,"-").replace(/^-+|-+$/g,"");
}

export async function POST(req: Request) {
  try {
    const { title, slug: rawSlug } = await req.json();
    const titleStr = String(title ?? "").trim();
    const slug = toSlug(String(rawSlug ?? "") || titleStr);
    if (!titleStr) return NextResponse.json({ ok:false, error:"Пустой заголовок" }, { status:400 });
    if (!slug)     return NextResponse.json({ ok:false, error:"Не удалось сгенерировать slug" }, { status:400 });

    const dir  = path.join(APP_DIR, slug);
    const file = path.join(dir, "page.tsx");
    await fs.mkdir(dir, { recursive:true });
    await fs.writeFile(file, `export default function Page(){return <div className="p-6"><h1 className="text-xl font-semibold">${titleStr}</h1></div>}\n`, "utf8");

    return NextResponse.json({ ok:true, path:"/"+slug });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:e?.message ?? "ERROR" }, { status:500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { slug: raw } = await req.json();
    const slug = String(raw ?? "").replace(/^\/+/, "");
    if (!slug) return NextResponse.json({ ok:false, error:"empty slug" }, { status:400 });

    const dir = path.join(APP_DIR, slug);
    await fs.rm(dir, { recursive:true, force:true }); // идемпотентно

    return NextResponse.json({ ok:true });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:e?.message ?? "ERROR" }, { status:500 });
  }
}
