import { cookies } from 'next/headers';

export default async function ImpersonationBanner() {
  const cookieStore = await cookies();
  const pid = cookieStore.get('impersonatePartnerId')?.value;
  if (!pid) return null;
  
  return (
    <div className="mb-4 rounded-xl border bg-amber-50 text-amber-900 px-4 py-2 text-sm">
      Режим партнёра: <span className="font-medium">{pid}</span>. 
      Помните, что действия выполняются от имени партнёра.
    </div>
  );
}
