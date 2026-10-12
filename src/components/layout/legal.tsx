/** Shared reading layout for the terms and privacy pages. */
export function LegalShell({ updated, children }: { updated: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-3xl px-5 py-14">
      <p className="mb-10 text-xs font-semibold text-navy-900/45">{updated}</p>
      <div className="space-y-9">{children}</div>
    </section>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2.5 font-bold text-navy-950">{title}</h2>
      <p className="text-sm leading-8 text-navy-900/70">{children}</p>
    </section>
  );
}
