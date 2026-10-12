import Image from "next/image";
import Link from "next/link";
import { MapPin, Mail } from "lucide-react";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "المنصة",
    links: [
      { href: "/halls", label: "القاعات" },
      { href: "/services", label: "الخدمات" },
      { href: "/events", label: "الفعاليات والمؤتمرات" },
      { href: "/providers", label: "مقدمو الخدمة" },
    ],
  },
  {
    title: "للأعمال",
    links: [
      { href: "/signup?role=provider", label: "انضم كمقدم خدمة" },
      { href: "/how-it-works", label: "كيف تعمل المنصة" },
      { href: "/knowledge-base", label: "قاعدة المعرفة" },
      { href: "/about", label: "عن قاطرة" },
    ],
  },
  {
    title: "قانوني",
    links: [
      { href: "/terms", label: "الشروط والأحكام" },
      { href: "/privacy", label: "سياسة الخصوصية" },
      { href: "/contact", label: "تواصل معنا" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="navy-gradient text-cream/90">
      <div className="mx-auto max-w-7xl px-5 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <Image src="/brand/logo-icon.png" alt="قاطرة" width={40} height={32} />
              <span className="text-lg font-extrabold text-white">منصة قاطرة</span>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-6 text-cream/65">
              منصة سعودية تقنية للحفلات والمناسبات والمؤتمرات، تربط طالب الخدمة بمقدمها المتخصص بضمانات الجودة
              والتسعير العادل.
            </p>
            <div className="mt-5 space-y-2 text-sm text-cream/65">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gold-400" /> الرياض، المملكة العربية السعودية
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gold-400" /> support@qatrah.sa
              </p>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="mb-3 text-sm font-bold text-gold-300">{col.title}</div>
              <ul className="space-y-2.5 text-sm text-cream/65">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="transition hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-cream/45">
          © {new Date().getFullYear()} منصة قاطرة السعودية — جميع الحقوق محفوظة
        </div>
      </div>
    </footer>
  );
}
