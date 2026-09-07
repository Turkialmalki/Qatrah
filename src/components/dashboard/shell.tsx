import Image from "next/image";
import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { LogOut } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function DashboardShell({
  children,
  navItems,
  userName,
  roleLabel,
}: {
  children: React.ReactNode;
  navItems: NavItem[];
  userName: string;
  roleLabel: string;
}) {
  return (
    <div className="flex min-h-screen bg-cream-dark">
      <aside className="hidden w-64 shrink-0 navy-gradient text-cream md:flex md:flex-col">
        <Link href="/" className="flex items-center gap-2.5 px-6 py-6">
          <Image src="/brand/logo-icon.png" alt="قاطرة" width={38} height={31} />
          <span className="text-base font-extrabold text-white">منصة قاطرة</span>
        </Link>
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-cream/75 transition hover:bg-white/8 hover:text-white"
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/10 px-4 py-4">
          <div className="mb-3 px-1">
            <div className="text-sm font-bold text-white">{userName}</div>
            <div className="text-xs text-gold-300">{roleLabel}</div>
          </div>
          <form action={logoutAction}>
            <button className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-cream/70 hover:bg-white/8 hover:text-white">
              <LogOut className="h-4 w-4" /> تسجيل الخروج
            </button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-950">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-navy-900/60">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
