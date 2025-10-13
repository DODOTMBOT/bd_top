import { notFound } from "next/navigation";

const RESERVED = new Set<string>([
  "/",
  "/admin", 
  "/dashboard", 
  "/employee", 
  "/owner", 
  "/partner", 
  "/point"
]);

export default async function DbPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = "/" + slug.map(s => decodeURIComponent(s)).join("/");

  if (RESERVED.has(path)) return notFound(); // отдаём физические страницы

  // Временно возвращаем 404 для всех динамических страниц
  return notFound();
}
