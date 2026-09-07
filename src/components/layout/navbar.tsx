import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

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

  return (
    <header className="sticky top-0 z-40 border-b border-navy-900/8 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/brand/logo-icon.png" alt="قاطرة" width={44} height={36} className="rounded-md" priority />
          <div className="leading-tight">
            <div className="text-lg font-extrabold text-navy-950">منصة قاطرة</div>
            <div className="text-[11px] font-medium text-gold-600">من الصحراء إلى العالم</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-semibold text-navy-900/80 md:flex">
          <Link href="/halls" className="hover:text-navy-950">القاعات</Link>
          <Link href="/services" className="hover:text-navy-950">الخدمات</Link>
          <Link href="/how-it-works" className="hover:text-navy-950">كيف تعمل المنصة</Link>
          <Link href="/knowledge-base" className="hover:text-navy-950">قاعدة المعرفة</Link>
        </nav>

        <div className="flex items-center gap-2.5">
          {userId ? (
            <Button href={role === "admin" ? "/dashboard/admin" : role === "provider" ? "/dashboard/provider" : "/dashboard/client"} size="sm">
              لوحة التحكم
            </Button>
          ) : (
            <>
              <Button href="/login" variant="ghost" size="sm">تسجيل الدخول</Button>
              <Button href="/signup" size="sm">ابدأ الآن</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
