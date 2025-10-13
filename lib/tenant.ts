import { cookies } from 'next/headers';

export function getImpersonatedPartnerId(): string | null {
  return cookies().get('impersonatePartnerId')?.value ?? null;
}
