export function normalizePath(input: string) {
  let p = decodeURIComponent(input.trim());
  p = p.replace(/\s+/g, "-");          // пробелы → дефис
  p = p.replace(/\/{2,}/g, "/");       // двойные слэши
  if (!p.startsWith("/")) p = "/" + p;
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0,-1);
  return p;
}
