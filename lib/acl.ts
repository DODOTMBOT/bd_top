export function canAccess(session: unknown, slug: string): boolean {
  const pages = (session as { user?: { pages?: string[] } })?.user?.pages as string[] | undefined;
  if (!Array.isArray(pages)) return false;
  return pages.includes(slug);
}



