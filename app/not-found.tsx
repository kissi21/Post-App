export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-6 px-4 py-12 sm:px-8">
        <div className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-600/90">Not found</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-950">Page not found</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">The page you are looking for does not exist.</p>
        </div>
      </main>
    </div>
  );
}
