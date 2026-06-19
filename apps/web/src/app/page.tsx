const foundations = [
  ["Tenant-aware identity", "Every user acts through an authorized organization membership."],
  ["Beneficiary records", "Private profiles and households remain separated from published causes."],
  ["Case workflow", "Need submission moves through verification, approval, payment, impact, and closure."],
  ["Immutable audit", "Material actions carry an actor, tenant, timestamp, and clear event type."]
];

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-16 sm:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand)]">
          Production foundation
        </span>
        <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-[-0.04em] sm:text-7xl">
          Arukah MissionOS is becoming a secure, database-backed platform.
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
          This Next.js application will replace browser-local prototype data with authenticated,
          tenant-scoped workflows backed by NestJS and PostgreSQL.
        </p>

        <section className="mt-14 grid gap-4 md:grid-cols-2">
          {foundations.map(([title, description]) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-2 leading-6 text-slate-600">{description}</p>
            </article>
          ))}
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <a className="rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-bold text-white" href="/health">
            Check web health
          </a>
          <a className="rounded-full border border-slate-300 px-5 py-3 text-sm font-bold" href="http://localhost:4000/api/health">
            Check API health
          </a>
        </div>
      </div>
    </main>
  );
}
