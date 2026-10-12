import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PRIMARY_LINKS } from "@/components/layout/nav-links";

export const metadata = { title: "الصفحة غير موجودة" };

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center navy-gradient px-5 text-center">
      <div className="hero-grid pointer-events-none absolute inset-0" />

      <div className="relative">
        <Link href="/" className="mx-auto mb-8 flex items-center justify-center gap-2.5">
          <Image src="/brand/logo-icon.png" alt="قاطرة" width={44} height={36} />
          <span className="text-lg font-extrabold text-white">منصة قاطرة</span>
        </Link>

        <div className="text-6xl font-extrabold text-gold-gradient">٤٠٤</div>
        <h1 className="mt-4 text-2xl font-extrabold text-white">الصفحة غير موجودة</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-cream/70">
          الرابط الذي وصلت إليه غير صحيح أو أن الصفحة نُقلت. جرّب العودة إلى الرئيسية أو أحد الأقسام التالية.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/" size="lg">
            العودة إلى الرئيسية
          </Button>
          <Button href="/contact" size="lg" variant="outline" className="border-white/25 text-white hover:bg-white/10">
            تواصل معنا
          </Button>
        </div>

        <nav className="mt-10 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm font-semibold text-cream/60">
          {PRIMARY_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="transition hover:text-gold-300">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
