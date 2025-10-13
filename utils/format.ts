export function labelFromPath(path: string) {
  const seg = path.split('/').filter(Boolean).pop() ?? '';
  const txt = decodeURIComponent(seg).replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  return txt ? txt[0].toUpperCase() + txt.slice(1) : '/';
}
