import Image from "next/image";
import Link from "next/link";
import { SignupForm } from "./signup-form";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 navy-gradient p-12 md:flex md:flex-col md:items-center md:justify-center">
        <Image src="/brand/logo-full.png" alt="قاطرة" width={340} height={370} className="drop-shadow-2xl" />
        <p className="mt-6 max-w-xs text-center text-cream/70">من الصحراء إلى العالم — منصتك الذكية لتخطيط المناسبات</p>
      </div>
      <div className="flex w-full flex-col items-center justify-center px-6 py-16 md:w-1/2">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 flex items-center gap-2.5 md:hidden">
            <Image src="/brand/logo-icon.png" alt="قاطرة" width={40} height={32} />
            <span className="text-lg font-extrabold text-navy-950">منصة قاطرة</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-navy-950">إنشاء حساب جديد</h1>
          <p className="mt-1.5 text-sm text-navy-900/60">انضم إلى قاطرة وابدأ رحلتك اليوم</p>
          <SignupForm defaultRole={role === "provider" ? "provider" : "client"} />
          <p className="mt-6 text-center text-sm text-navy-900/70">
            لديك حساب بالفعل؟ <Link href="/login" className="font-bold text-gold-600 hover:underline">تسجيل الدخول</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
