import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="navy-gradient text-cream/90">
      <div className="mx-auto max-w-7xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <Image src="/brand/logo-icon.png" alt="قاطرة" width={40} height={32} />
              <span className="text-lg font-extrabold text-white">منصة قاطرة</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-cream/70">
              منصة سعودية تقنية للحفلات والمناسبات، تربط طالب الخدمة بمقدمها المتخصص بضمانات الجودة والتسعير العادل.
            </p>
          </div>
          <div>
            <div className="mb-3 text-sm font-bold text-gold-300">المنصة</div>
            <ul className="space-y-2 text-sm text-cream/70">
              <li><Link href="/halls" className="hover:text-white">القاعات</Link></li>
              <li><Link href="/services" className="hover:text-white">الخدمات</Link></li>
              <li><Link href="/how-it-works" className="hover:text-white">كيف تعمل المنصة</Link></li>
            </ul>
          </div>
          <div>
            <div className="mb-3 text-sm font-bold text-gold-300">للأعمال</div>
            <ul className="space-y-2 text-sm text-cream/70">
              <li><Link href="/signup?role=provider" className="hover:text-white">انضم كمقدم خدمة</Link></li>
              <li><Link href="/knowledge-base" className="hover:text-white">قاعدة المعرفة</Link></li>
            </ul>
          </div>
          <div>
            <div className="mb-3 text-sm font-bold text-gold-300">تواصل معنا</div>
            <p className="text-sm text-cream/70">الرياض، المملكة العربية السعودية</p>
            <p className="mt-1 text-sm text-cream/70">support@qatrah.sa</p>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-cream/50">
          © {new Date().getFullYear()} منصة قاطرة السعودية — جميع الحقوق محفوظة
        </div>
      </div>
    </footer>
  );
}
