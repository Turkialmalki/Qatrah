import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS } from "@/lib/utils";
import {
  ArrowLeft,
  ClipboardList,
  Heart,
  MonitorPlay,
  PackageCheck,
  Scale,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";

const ENGINES = [
  {
    icon: Sparkles,
    title: "المطابقة الذكية",
    desc: "يطابق مناسبتك بأفضل مقدمي الخدمة حسب الميزانية والمدينة والجودة تلقائياً.",
  },
  {
    icon: Scale,
    title: "التسعير العادل",
    desc: "يقارن كل عرض بمتوسط السوق ليضمن لك سعراً شفافاً دون مفاجآت.",
  },
  {
    icon: Wallet,
    title: "تحسين الميزانية",
    desc: "يوزّع ميزانيتك على بنود المناسبة حسب أولوياتك للحصول على أفضل قيمة.",
  },
  {
    icon: ClipboardList,
    title: "التخطيط الذكي",
    desc: "يبني جدولاً زمنياً تلقائياً لتنفيذ كل تفصيل في وقته حتى يوم المناسبة.",
  },
];

const TRACKS = [
  {
    href: "/services",
    icon: Heart,
    eyebrow: "أفراح ومناسبات",
    title: "زفاف، خطوبة، تخرج",
    desc: "قاعة وضيافة وديكور وتصوير وموسيقى — بباقات جاهزة بأسعار معلنة تقارنها قبل أن تطلب.",
    categories: ["hall", "catering", "decor", "photography", "music"],
  },
  {
    href: "/events",
    icon: MonitorPlay,
    eyebrow: "فعاليات ومؤتمرات",
    title: "مؤتمر، معرض، منتدى",
    desc: "مسار مستقل يراعي الأجندة والجلسات والمتحدثين، مع تجهيزات صوت وعرض وترجمة فورية وأجنحة معارض.",
    categories: ["hall", "av", "booths", "translation", "transport"],
  },
];

const STEPS = [
  { n: "01", title: "أنشئ مناسبتك", desc: "اختر المسار، ثم حدد المدينة وعدد الحضور والميزانية." },
  { n: "02", title: "استلم المطابقات", desc: "يعرض المحرك أفضل القاعات ومقدمي الخدمة المناسبين لك فوراً." },
  { n: "03", title: "قارن واعتمد", desc: "قارن الأسعار العادلة والتقييمات، واعتمد العروض التي تناسبك." },
  { n: "04", title: "نفّذ وتابع", desc: "تابع خطة التنفيذ خطوة بخطوة، وقيّم تجربتك بعد الإغلاق." },
];

export default function Home() {
  return (
    <div>
      <Navbar />

      {/* ---------------- hero ---------------- */}
      <section className="navy-gradient relative overflow-hidden">
        <div className="hero-grid pointer-events-none absolute inset-0" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.09]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 20%, #E9D493 0, transparent 45%), radial-gradient(circle at 80% 65%, #2A634F 0, transparent 42%)",
          }}
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 md:grid-cols-2 md:py-24">
          <div className="animate-fade-up">
            <Badge tone="gold" className="mb-5">
              منصة سعودية ١٠٠٪ — من الصحراء إلى العالم
            </Badge>
            <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl md:text-5xl">
              مناسبتك، <span className="text-gold-gradient">بميزانية واضحة</span>
              <br className="hidden sm:block" /> وجودة مضمونة
            </h1>
            <p className="mt-5 max-w-lg text-base leading-8 text-cream/75 sm:text-lg">
              قاطرة تطابقك بأفضل القاعات ومقدمي الخدمة المعتمدين، بباقات جاهزة بأسعار معلنة وخطة تنفيذ تُدار خطوة بخطوة
              — للأفراح والمؤتمرات على حد سواء.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/signup" size="lg">
                ابدأ تخطيط مناسبتك <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                href="/signup?role=provider"
                size="lg"
                variant="outline"
                className="border-white/25 text-white hover:bg-white/10"
              >
                انضم كمقدم خدمة
              </Button>
            </div>

            <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-white/10 pt-7 text-cream/80">
              <div>
                <dt className="text-2xl font-extrabold text-white">+10</dt>
                <dd className="mt-0.5 text-xs leading-5">مليار ريال حجم السوق سنوياً</dd>
              </div>
              <div>
                <dt className="text-2xl font-extrabold text-white">14</dt>
                <dd className="mt-0.5 text-xs leading-5">وحدة متكاملة في المنصة</dd>
              </div>
              <div>
                <dt className="text-2xl font-extrabold text-white">100%</dt>
                <dd className="mt-0.5 text-xs leading-5">مقدمو خدمة معتمدون</dd>
              </div>
            </dl>
          </div>

          <div className="animate-fade-up [animation-delay:120ms]">
            <div className="mx-auto flex max-w-md items-center justify-center rounded-3xl bg-white/5 p-8 backdrop-blur-sm">
              <Image
                src="/brand/logo-full.png"
                alt="منصة قاطرة"
                width={520}
                height={568}
                className="w-full max-w-xs drop-shadow-2xl sm:max-w-sm"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- two tracks ---------------- */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <Badge tone="navy" className="mb-3">
            مسارا المنصة
          </Badge>
          <h2 className="text-2xl font-extrabold text-navy-950 sm:text-3xl">لكل مناسبة مسارها الخاص</h2>
          <p className="mt-3 text-sm leading-7 text-navy-900/65 sm:text-base">
            لا نستخدم نموذج أفراح لتخطيط مؤتمر. كل مسار يفتح الحقول والخدمات التي يحتاجها فعلاً.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {TRACKS.map((t) => (
            <Link key={t.href} href={t.href} className="group">
              <Card className="flex h-full flex-col p-7 transition group-hover:-translate-y-1 group-hover:border-gold-400/60">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl gold-gradient">
                    <t.icon className="h-5 w-5 text-navy-950" />
                  </div>
                  <ArrowLeft className="h-5 w-5 text-gold-600 transition group-hover:-translate-x-1" />
                </div>
                <div className="mt-5 text-xs font-bold text-gold-600">{t.eyebrow}</div>
                <h3 className="mt-1 text-lg font-extrabold text-navy-950">{t.title}</h3>
                <p className="mt-2.5 flex-1 text-sm leading-7 text-navy-900/65">{t.desc}</p>
                <div className="mt-5 flex flex-wrap gap-1.5 border-t border-navy-900/8 pt-4">
                  {t.categories.map((c) => (
                    <Badge key={c} tone="gray">
                      {CATEGORY_LABELS[c]}
                    </Badge>
                  ))}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- packages ---------------- */}
      <section className="bg-cream-dark py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Badge tone="gold" className="mb-3">
                باقات جاهزة
              </Badge>
              <h2 className="text-2xl font-extrabold text-navy-950 sm:text-3xl">
                أسعار معلنة قبل أن تسأل عن السعر
              </h2>
              <p className="mt-4 text-sm leading-8 text-navy-900/70 sm:text-base">
                لكل مجال خدمة باقات جاهزة محتوياتها وأسعارها معتمدة من المنصة — تقارنها جنباً إلى جنب وتعرف بالضبط ما
                تحصل عليه. ومقدم الخدمة الذي يعرض خدمة خارج هذه الباقات تُلزمه المنصة بصورة وشرح كامل، فلا يبقى شيء
                غامضاً.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button href="/services">استعرض الباقات</Button>
                <Button href="/how-it-works" variant="outline">
                  كيف تعمل المنصة
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: PackageCheck, title: "محتويات واضحة", desc: "كل بند داخل الباقة مكتوب ومعلن مسبقاً." },
                { icon: Scale, title: "سعر مقارَن", desc: "كل عرض يُقاس بمتوسط السوق لحظة المطابقة." },
                { icon: ShieldCheck, title: "مزود معتمد", desc: "لا تُعرض خدمة قبل مراجعة الإدارة لمقدمها." },
                { icon: Sparkles, title: "عروض مخصصة", desc: "وإن أراد المزود عرضاً خاصاً، فبصورة وشرح كامل." },
              ].map((f) => (
                <Card key={f.title} className="p-5">
                  <f.icon className="mb-3 h-5 w-5 text-gold-600" />
                  <h3 className="text-sm font-bold text-navy-950">{f.title}</h3>
                  <p className="mt-1.5 text-xs leading-6 text-navy-900/65">{f.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- engines ---------------- */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <Badge tone="green" className="mb-3">
            محركات المنصة
          </Badge>
          <h2 className="text-2xl font-extrabold text-navy-950 sm:text-3xl">
            أربعة محركات تدير مناسبتك من الألف إلى الياء
          </h2>
          <p className="mt-3 text-sm leading-7 text-navy-900/65">
            محركات قواعدية شفافة — تعرف دائماً لماذا ظهر لك هذا العرض بهذا السعر.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ENGINES.map((m) => (
            <Card key={m.title} className="p-6 transition hover:-translate-y-1">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl gold-gradient">
                <m.icon className="h-5 w-5 text-navy-950" />
              </div>
              <h3 className="font-bold text-navy-950">{m.title}</h3>
              <p className="mt-2 text-sm leading-6 text-navy-900/70">{m.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ---------------- steps ---------------- */}
      <section className="bg-cream-dark py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <Badge tone="navy" className="mb-3">
              كيف تعمل المنصة
            </Badge>
            <h2 className="text-2xl font-extrabold text-navy-950 sm:text-3xl">أربع خطوات بين فكرتك وتنفيذ مناسبتك</h2>
          </div>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n}>
                <div className="text-5xl font-extrabold text-navy-900/10">{s.n}</div>
                <h3 className="-mt-4 font-bold text-navy-950">{s.title}</h3>
                <p className="mt-2 text-sm leading-6 text-navy-900/70">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="navy-gradient relative overflow-hidden">
        <div className="hero-grid pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-4xl px-5 py-20 text-center">
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">ابدأ رحلة مناسبتك مع قاطرة اليوم</h2>
          <p className="mt-3 text-sm leading-7 text-cream/70">
            من الصحراء إلى العالم — نموذج سعودي تقني قابل للتصدير
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/signup" size="lg">
              إنشاء حساب مجاني
            </Button>
            <Button href="/login" size="lg" variant="outline" className="border-white/25 text-white hover:bg-white/10">
              تسجيل الدخول
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
