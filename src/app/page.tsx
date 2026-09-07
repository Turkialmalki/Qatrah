import Image from "next/image";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ScaleIcon,
  Wallet,
  ShieldCheck,
  ClipboardList,
  Palette,
  Star,
  ArrowLeft,
} from "lucide-react";

const modules = [
  { icon: Sparkles, title: "محرك المطابقة الذكية", desc: "يطابق مناسبتك بأفضل مقدمي الخدمة حسب الميزانية والمدينة والجودة تلقائياً." },
  { icon: ScaleIcon, title: "محرك التسعير العادل", desc: "يقارن كل عرض سعر بمتوسط السوق ليضمن لك سعراً شفافاً وعادلاً دون مفاجآت." },
  { icon: Wallet, title: "محرك تحسين الميزانية", desc: "يوزّع ميزانيتك على بنود المناسبة حسب أولوياتك للحصول على أفضل قيمة." },
  { icon: ClipboardList, title: "محرك التخطيط الذكي", desc: "يبني لك جدولاً زمنياً تلقائياً لتنفيذ كل تفاصيل مناسبتك في وقتها." },
  { icon: Palette, title: "إدارة التصميم", desc: "استعرض واعتمد تصاميم الديكور المقترحة قبل التنفيذ بثقة كاملة." },
  { icon: ShieldCheck, title: "ضمان الجودة", desc: "لا تُقبل في قاطرة إلا مقدمو الخدمة المتخصصون المعتمدون بمعايير جودة صارمة." },
];

const steps = [
  { n: "01", title: "أنشئ مناسبتك", desc: "حدد نوع المناسبة، المدينة، عدد الضيوف، والميزانية الإجمالية." },
  { n: "02", title: "استلم المطابقات", desc: "يعرض محرك المطابقة أفضل القاعات ومقدمي الخدمة المناسبين لك فوراً." },
  { n: "03", title: "قارن واعتمد", desc: "قارن الأسعار العادلة والتقييمات، واعتمد العروض التي تناسبك." },
  { n: "04", title: "نفّذ وتابع", desc: "تابع خطة التنفيذ خطوة بخطوة حتى يوم المناسبة، وقيّم تجربتك بعدها." },
];

export default function Home() {
  return (
    <div>
      <Navbar />

      {/* Hero */}
      <section className="navy-gradient relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: "radial-gradient(circle at 25% 20%, #E9D493 0, transparent 45%), radial-gradient(circle at 80% 60%, #2A634F 0, transparent 40%)",
        }} />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:grid-cols-2 md:py-28">
          <div className="animate-fade-up">
            <Badge tone="gold" className="mb-5">من الصحراء إلى العالم — منصة سعودية 100%</Badge>
            <h1 className="text-4xl font-extrabold leading-tight text-white md:text-5xl">
              مناسبتك، <span className="text-gold-gradient">بميزانية واضحة</span> وجودة مضمونة
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-cream/75">
              قاطرة منصة ذكية للحفلات والمناسبات تطابقك بأفضل القاعات ومقدمي الخدمة المعتمدين، بتسعير عادل شفاف وخطة تنفيذ تُدار خطوة بخطوة — من إنشاء المناسبة حتى إغلاق المشروع.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/signup" size="lg">ابدأ تخطيط مناسبتك <ArrowLeft className="h-4 w-4" /></Button>
              <Button href="/signup?role=provider" size="lg" variant="outline" className="border-white/25 text-white hover:bg-white/10">
                انضم كمقدم خدمة
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-8 text-cream/80">
              <div><div className="text-2xl font-extrabold text-white">+10</div><div className="text-xs">مليار ريال حجم السوق سنوياً</div></div>
              <div><div className="text-2xl font-extrabold text-white">14</div><div className="text-xs">وحدة متكاملة في المنصة</div></div>
              <div><div className="text-2xl font-extrabold text-white">100%</div><div className="text-xs">مقدمو خدمة معتمدون</div></div>
            </div>
          </div>
          <div className="relative animate-fade-up [animation-delay:120ms]">
            <div className="mx-auto flex max-w-md items-center justify-center rounded-3xl bg-white/5 p-6 backdrop-blur">
              <Image src="/brand/logo-full.png" alt="منصة قاطرة" width={520} height={568} className="w-full max-w-sm drop-shadow-2xl" priority />
            </div>
          </div>
        </div>
      </section>

      {/* Why now */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <Badge tone="green" className="mb-3">لماذا قاطرة الآن</Badge>
          <h2 className="text-3xl font-extrabold text-navy-950">منصة قاطرة ليست وسيطاً فقط</h2>
          <p className="mt-3 text-navy-900/70">نعالج مشاكل السوق الحقيقية بدل الاكتفاء بالربط بين طالب الخدمة ومقدمها</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-4">
          {[
            "تفاوت الأسعار والتقييم الشخصي للعميل بلا معيار واضح",
            "غياب آلية واضحة لقياس جودة العمل مقارنة بالتكلفة",
            "عدم الالتزام بمواعيد تسليم واضحة للعميل",
            "دخول غير المتخصصين للمجال بنتائج سيئة على العميل",
          ].map((p, i) => (
            <Card key={i} className="p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-gold-100 text-sm font-extrabold text-gold-600">{i + 1}</div>
              <p className="text-sm leading-6 text-navy-900/75">{p}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section className="bg-cream-dark py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <Badge tone="gold" className="mb-3">وحدات المنصة</Badge>
            <h2 className="text-3xl font-extrabold text-navy-950">محركات ذكية تدير مناسبتك من الألف إلى الياء</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {modules.map((m) => (
              <Card key={m.title} className="p-6 transition hover:-translate-y-1">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl gold-gradient">
                  <m.icon className="h-5 w-5 text-navy-950" />
                </div>
                <h3 className="font-bold text-navy-950">{m.title}</h3>
                <p className="mt-2 text-sm leading-6 text-navy-900/70">{m.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <Badge tone="navy" className="mb-3">كيف تعمل المنصة</Badge>
          <h2 className="text-3xl font-extrabold text-navy-950">أربع خطوات بين فكرتك وتنفيذ مناسبتك</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="relative">
              <div className="text-5xl font-extrabold text-navy-900/10">{s.n}</div>
              <h3 className="-mt-4 font-bold text-navy-950">{s.title}</h3>
              <p className="mt-2 text-sm leading-6 text-navy-900/70">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="navy-gradient">
        <div className="mx-auto max-w-4xl px-5 py-16 text-center">
          <div className="mb-4 flex justify-center gap-1">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-gold-400 text-gold-400" />)}
          </div>
          <h2 className="text-3xl font-extrabold text-white">ابدأ رحلة مناسبتك مع قاطرة اليوم</h2>
          <p className="mt-3 text-cream/70">من الصحراء إلى العالم — نموذج سعودي تقني قابل للتصدير</p>
          <div className="mt-8 flex justify-center gap-3">
            <Button href="/signup" size="lg">إنشاء حساب مجاني</Button>
            <Button href="/login" size="lg" variant="outline" className="border-white/25 text-white hover:bg-white/10">تسجيل الدخول</Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
