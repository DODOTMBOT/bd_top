export default function Header() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'HoReCa SaaS';
  return (
    <header className="border-b">
      <div className="mx-auto max-w-5xl p-6">
        <span className="text-xl font-semibold">{appName}</span>
      </div>
    </header>
  );
}


