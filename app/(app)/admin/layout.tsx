export const revalidate = 0;
export const runtime = "nodejs";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl p-6">
      {children}
    </div>
  );
}
