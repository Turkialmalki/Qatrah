import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface Crumb {
  href: string;
  label: string;
}

/** Dark banner shared by every public page below the home page. */
export function PageHero({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
  crumbs,
  children,
}: {
  icon?: LucideIcon;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
  children?: React.ReactNode;
}) {
  return (
    <section className="navy-gradient relative overflow-hidden">
      <div className="hero-grid pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-7xl px-5 py-14 text-center md:py-16">
        {crumbs && crumbs.length > 0 && (
          <nav className="mb-4 flex flex-wrap items-center justify-center gap-1.5 text-xs text-cream/55">
            {crumbs.map((c, i) => (
              <span key={c.href} className="flex items-center gap-1.5">
                {i > 0 && <span aria-hidden>/</span>}
                <Link href={c.href} className="transition hover:text-gold-300">
                  {c.label}
                </Link>
              </span>
            ))}
          </nav>
        )}

        {Icon && (
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/8">
            <Icon className="h-5 w-5 text-gold-400" />
          </div>
        )}

        {eyebrow && (
          <Badge tone="gold" className="mb-3">
            {eyebrow}
          </Badge>
        )}

        <h1 className="text-2xl font-extrabold text-white sm:text-3xl md:text-4xl">{title}</h1>
        {subtitle && <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-cream/70 sm:text-base">{subtitle}</p>}
        {children && <div className="mt-7">{children}</div>}
      </div>
    </section>
  );
}
