import { Check } from "lucide-react";
import clsx from "clsx";
import { Badge } from "@/components/ui/badge";
import { formatSAR } from "@/lib/utils";
import { TIER_LABELS, UNIT_LABELS, type ServicePackage } from "@/lib/catalog/packages";

const TIER_TONE = { basic: "gray", standard: "gold", premium: "green" } as const;

/**
 * One ready-made package. Used on the public category pages and, with
 * `footer`, inside the provider's "adopt a package" list.
 */
export function PackageCard({
  pkg,
  highlight = false,
  footer,
  className,
}: {
  pkg: ServicePackage;
  highlight?: boolean;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex h-full flex-col rounded-2xl border bg-white p-5 transition",
        highlight ? "border-gold-500 card-shadow-lg" : "border-navy-900/8 card-shadow hover:border-gold-400/60",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <Badge tone={TIER_TONE[pkg.tier]}>{TIER_LABELS[pkg.tier]}</Badge>
        {highlight && <Badge tone="gold">الأكثر طلباً</Badge>}
      </div>

      <h3 className="mt-3 font-bold text-navy-950">{pkg.title}</h3>
      <p className="mt-1.5 text-sm leading-6 text-navy-900/65">{pkg.description}</p>

      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="text-2xl font-extrabold text-navy-950">{formatSAR(pkg.basePrice)}</span>
        <span className="text-xs font-semibold text-navy-900/50">{UNIT_LABELS[pkg.unit] ?? ""}</span>
      </div>

      <ul className="mt-4 flex-1 space-y-2">
        {pkg.inclusions.map((inc) => (
          <li key={inc} className="flex items-start gap-2 text-sm text-navy-900/75">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-700" />
            <span>{inc}</span>
          </li>
        ))}
      </ul>

      {footer && <div className="mt-5 border-t border-navy-900/8 pt-4">{footer}</div>}
    </div>
  );
}
