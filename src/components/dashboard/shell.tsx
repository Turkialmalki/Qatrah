import { DashboardMobileBar, DashboardSidebar, type DashboardRole } from "@/components/dashboard/dashboard-nav";

export function DashboardShell({
  children,
  role,
  userName,
  roleLabel,
}: {
  children: React.ReactNode;
  role: DashboardRole;
  userName: string;
  roleLabel: string;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-cream-dark md:flex-row">
      <DashboardMobileBar role={role} userName={userName} roleLabel={roleLabel} />
      <DashboardSidebar role={role} userName={userName} roleLabel={roleLabel} />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-5 md:px-8 md:py-8">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
  backHref,
  backLabel,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="mb-6">
      {backHref && (
        <a href={backHref} className="mb-2 inline-block text-xs font-semibold text-navy-900/55 hover:text-navy-950">
          ← {backLabel ?? "رجوع"}
        </a>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold text-navy-950 sm:text-2xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm leading-6 text-navy-900/60">{subtitle}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}

/** Section heading used inside dashboard pages. */
export function SectionTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-4">
      <h2 className="font-bold text-navy-950">{title}</h2>
      {hint && <p className="mt-0.5 text-xs text-navy-900/50">{hint}</p>}
    </div>
  );
}
