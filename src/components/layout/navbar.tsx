import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { PRIMARY_LINKS } from "@/components/layout/nav-links";

export async function Navbar() {
  let userId: string | null = null;
  let role: string | null = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;

    if (userId) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
      role = (profile as { role: string } | null)?.role ?? null;
    }
  } catch {
    // Supabase unreachable — render the public navbar as signed-out rather than crashing the page.
  }

  const dashboardHref = userId
    ? role === "admin"
      ? "/dashboard/admin"
      : role === "provider"
        ? "/dashboard/provider"
        : "/dashboard/client"
    : null;

  return (
    <header className="sticky top-0 z-40 border-b border-navy-900/8 bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image src="/brand/logo-icon.png" alt="قاطرة" width={40} height={33} className="rounded-md" priority />
          <div className="leading-tight">
            <div className="text-base font-extrabold text-navy-950 sm:text-lg">منصة قاطرة</div>
            <div className="text-[10px] font-medium text-gold-600 sm:text-[11px]">من الصحراء إلى العالم</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-semibold text-navy-900/75 md:flex lg:gap-7">
          {PRIMARY_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="transition hover:text-navy-950">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            {dashboardHref ? (
              <Button href={dashboardHref} size="sm">
                لوحة التحكم
              </Button>
            ) : (
              <>
                <Button href="/login" variant="ghost" size="sm">
                  تسجيل الدخول
                </Button>
                <Button href="/signup" size="sm">
                  ابدأ الآن
                </Button>
              </>
            )}
          </div>
          <MobileMenu dashboardHref={dashboardHref} />
        </div>
      </div>
    </header>
  );
}
