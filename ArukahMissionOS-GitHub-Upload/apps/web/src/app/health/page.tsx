export default function HealthPage() {
  return (
    <main className="grid min-h-screen place-items-center p-8">
      <div className="rounded-2xl border border-emerald-200 bg-white p-8 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-700">✓</div>
        <h1 className="mt-4 text-2xl font-semibold">Web application healthy</h1>
        <p className="mt-2 text-slate-600">Next.js is running.</p>
      </div>
    </main>
  );
}
