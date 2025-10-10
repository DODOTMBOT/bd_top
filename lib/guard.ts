import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export type Role = 'OWNER' | 'PARTNER' | 'POINT' | 'USER';

const ACCESS: Record<'/owner' | '/partner' | '/point' | '/employee', Role[]> = {
  '/owner':    ['OWNER'],
  '/partner':  ['OWNER', 'PARTNER'],
  '/point':    ['OWNER', 'POINT', 'PARTNER'],
  '/employee': ['OWNER', 'USER', 'PARTNER'],
};

export async function guard(path: keyof typeof ACCESS) {
  const session = await auth();

  if (!session?.user) {
    redirect(`/login?cb=${encodeURIComponent(path)}`);
  }

  const role = (session.user as { role?: string }).role as Role | undefined;

  if (!role || !ACCESS[path].includes(role)) {
    redirect('/');
  }

  return { session, role };
}


