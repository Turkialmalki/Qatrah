"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { ALL_LINKS } from "@/components/layout/nav-links";

/** Slide-down navigation sheet for the public pages on small screens. */
export function MobileMenu({ dashboardHref }: { dashboardHref: string | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [openedAt, setOpenedAt] = useState(pathname);

  // Close on navigation. Adjusting state during render is React's recommended
  // alternative to a setState-in-effect, which would cascade an extra render.
  if (openedAt !== pathname) {
    setOpenedAt(pathname);
    if (open) setOpen(false);
  }

  // Close when the viewport grows to where the desktop bar takes over.
  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    document.body.style.overflow = "hidden";
    return () => {
      mq.removeEventListener("change", onChange);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
        aria-expanded={open}
        className="rounded-xl p-2 text-navy-900 transition hover:bg-navy-900/5"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="fixed inset-x-0 top-[61px] z-50 max-h-[calc(100vh-61px)] overflow-y-auto border-t border-navy-900/8 bg-cream px-5 pb-8 pt-4 card-shadow-lg">
          <nav className="space-y-1">
            {ALL_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={clsx(
                  "block rounded-xl px-3 py-3 text-sm font-semibold transition",
                  pathname === l.href ? "bg-gold-100 text-navy-950" : "text-navy-900/75 hover:bg-navy-900/5"
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="mt-5 grid gap-2 border-t border-navy-900/8 pt-5">
            {dashboardHref ? (
              <Button href={dashboardHref} className="w-full">
                لوحة التحكم
              </Button>
            ) : (
              <>
                <Button href="/signup" className="w-full">
                  ابدأ الآن
                </Button>
                <Button href="/login" variant="outline" className="w-full">
                  تسجيل الدخول
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
