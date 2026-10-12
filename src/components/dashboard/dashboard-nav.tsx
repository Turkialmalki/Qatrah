"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Building2,
  Calendar,
  CalendarPlus,
  ClipboardList,
  CreditCard,
  Inbox,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Palette,
  ShieldCheck,
  Star,
  UserCog,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import clsx from "clsx";
import { logoutAction } from "@/lib/actions/auth";

export type DashboardRole = "client" | "provider" | "admin";

interface Item {
  href: string;
  label: string;
  icon: LucideIcon;
}

// Nav config lives in this client module so the icon components never have to
// cross the server/client boundary — layouts pass only the role string.
const NAV: Record<DashboardRole, Item[]> = {
  client: [
    { href: "/dashboard/client", label: "نظرة عامة", icon: LayoutDashboard },
    { href: "/dashboard/client/events/new", label: "مناسبة جديدة", icon: CalendarPlus },
    { href: "/dashboard/client/events", label: "مناسباتي", icon: Calendar },
    { href: "/dashboard/client/payments", label: "المدفوعات", icon: CreditCard },
    { href: "/dashboard/client/evaluations", label: "تقييماتي", icon: Star },
    { href: "/dashboard/client/profile", label: "حسابي", icon: UserCog },
    { href: "/knowledge-base", label: "قاعدة المعرفة", icon: BookOpen },
  ],
  provider: [
    { href: "/dashboard/provider", label: "نظرة عامة", icon: LayoutDashboard },
    { href: "/dashboard/provider/services", label: "خدماتي", icon: ListChecks },
    { href: "/dashboard/provider/halls", label: "قاعاتي", icon: Building2 },
    { href: "/dashboard/provider/requests", label: "الطلبات المطابقة", icon: Inbox },
    { href: "/dashboard/provider/tasks", label: "التنفيذ", icon: ClipboardList },
    { href: "/dashboard/provider/designs", label: "التصاميم", icon: Palette },
    { href: "/dashboard/provider/settlements", label: "مستحقاتي", icon: Wallet },
    { href: "/dashboard/provider/reviews", label: "التقييمات", icon: Star },
    { href: "/dashboard/provider/profile", label: "ملف المنشأة", icon: UserCog },
  ],
  admin: [
    { href: "/dashboard/admin", label: "نظرة عامة", icon: LayoutDashboard },
    { href: "/dashboard/admin/providers", label: "مقدمو الخدمة", icon: Users },
    { href: "/dashboard/admin/events", label: "المناسبات", icon: Calendar },
    { href: "/dashboard/admin/bookings", label: "الحجوزات والمدفوعات", icon: CreditCard },
    { href: "/dashboard/admin/quality", label: "الجودة", icon: ShieldCheck },
    { href: "/dashboard/admin/settlements", label: "التسوية المالية", icon: Wallet },
    { href: "/dashboard/admin/knowledge-base", label: "قاعدة المعرفة", icon: BookOpen },
  ],
};

/** Exact match for index routes, prefix match for the rest. */
function isActive(pathname: string, href: string, allItems: Item[]): boolean {
  if (pathname === href) return true;
  if (!pathname.startsWith(`${href}/`)) return false;
  // Don't light up a parent when a more specific sibling also matches.
  return !allItems.some((i) => i.href !== href && i.href.length > href.length && pathname.startsWith(i.href));
}

function NavList({ role, onNavigate }: { role: DashboardRole; onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = NAV[role];

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const active = isActive(pathname, item.href, items);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
              active ? "bg-white/12 text-white" : "text-cream/70 hover:bg-white/8 hover:text-white"
            )}
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function UserBlock({ userName, roleLabel }: { userName: string; roleLabel: string }) {
  return (
    <div className="border-t border-white/10 px-4 py-4">
      <div className="mb-3 px-1">
        <div className="truncate text-sm font-bold text-white">{userName}</div>
        <div className="text-xs text-gold-300">{roleLabel}</div>
      </div>
      <form action={logoutAction}>
        <button className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-cream/70 transition hover:bg-white/8 hover:text-white">
          <LogOut className="h-4 w-4" /> تسجيل الخروج
        </button>
      </form>
    </div>
  );
}

/** Fixed sidebar, desktop only. */
export function DashboardSidebar({
  role,
  userName,
  roleLabel,
}: {
  role: DashboardRole;
  userName: string;
  roleLabel: string;
}) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col navy-gradient text-cream md:flex">
      <Link href="/" className="flex items-center gap-2.5 px-6 py-6">
        <Image src="/brand/logo-icon.png" alt="قاطرة" width={36} height={30} />
        <span className="text-base font-extrabold text-white">منصة قاطرة</span>
      </Link>
      <div className="flex-1 overflow-y-auto px-3">
        <NavList role={role} />
      </div>
      <UserBlock userName={userName} roleLabel={roleLabel} />
    </aside>
  );
}

/** Top bar + slide-in drawer, mobile only. */
export function DashboardMobileBar({
  role,
  userName,
  roleLabel,
}: {
  role: DashboardRole;
  userName: string;
  roleLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [openedAt, setOpenedAt] = useState(pathname);

  // Close the drawer on navigation. Adjusting state during render avoids the
  // cascading re-render a setState-in-effect would cause.
  if (openedAt !== pathname) {
    setOpenedAt(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between navy-gradient px-4 py-3 md:hidden">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/brand/logo-icon.png" alt="قاطرة" width={30} height={25} />
          <span className="text-sm font-extrabold text-white">منصة قاطرة</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="فتح قائمة لوحة التحكم"
          className="rounded-xl p-2 text-cream transition hover:bg-white/10"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="إغلاق القائمة"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 right-0 flex w-72 max-w-[85vw] flex-col navy-gradient text-cream card-shadow-lg">
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-base font-extrabold text-white">منصة قاطرة</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="إغلاق القائمة"
                className="rounded-lg p-1.5 text-cream/80 transition hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3">
              <NavList role={role} onNavigate={() => setOpen(false)} />
            </div>
            <UserBlock userName={userName} roleLabel={roleLabel} />
          </div>
        </div>
      )}
    </>
  );
}
