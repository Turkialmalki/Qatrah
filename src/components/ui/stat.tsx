import { type LucideIcon } from "lucide-react";
import clsx from "clsx";

/** Compact KPI tile used across the three dashboards. */
export function Stat({
  label,
  value,
  hint,
  icon: Icon,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-navy-900/8 bg-white p-5 card-shadow",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-navy-900/55">{label}</div>
          <div className="mt-1.5 truncate text-2xl font-extrabold text-navy-950">{value}</div>
          {hint && <div className="mt-1 text-xs text-navy-900/45">{hint}</div>}
        </div>
        {Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-100">
            <Icon className="h-4 w-4 text-gold-600" />
          </div>
        )}
      </div>
    </div>
  );
}

export function StatGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>{children}</div>;
}
