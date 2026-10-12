import { type LucideIcon } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-navy-900/15 bg-white/60 px-6 py-14 text-center",
        className
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold-100">
        <Icon className="h-5 w-5 text-gold-600" />
      </div>
      <h3 className="font-bold text-navy-950">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm leading-6 text-navy-900/55">{description}</p>}
      {actionLabel && actionHref && (
        <Button href={actionHref} size="sm" className="mt-5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
