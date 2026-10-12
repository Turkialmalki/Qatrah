import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageHero } from "@/components/layout/page-hero";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarPlus,
  ClipboardList,
  Compass,
  Heart,
  MonitorPlay,
  PackageCheck,
  Scale,
  ShieldCheck,
  Sparkles,
  Store,
  Wallet,
} from "lucide-react";

export const metadata = {
  title: "كيف تعمل المنصة",
  description: "من فكرة المناسبة إلى تنفيذها — شرح خطوات منصة قاطرة للعملاء ولمقدمي الخدمة.",
};

const CLIENT_STEPS = [
  {
    icon: Compass,
    title: "اختر مسار مناسبتك",
    desc: "أفراح ومناسبات اجتماعية، أو فعاليات ومؤتمرات. كل مسار يفتح نموذجاً بالحقول التي يحتاجها فعلاً — فنموذج المؤتمر يسألك عن الأجندة والجلسات والمتحدثين وأجنحة العرض.",
  },
  {
    icon: CalendarPlus,
    title: "أنشئ مناسبتك",
    desc: "أدخل المدينة وعدد الحضور والميزانية الإجمالية، وحدد أولوية كل خدمة. يوزّع محرك تحسين الميزانية المبلغ تلقائياً على بنود مناسبتك حسب تلك الأولويات.",
  },
  {
    icon: Sparkles,
    title: "استلم المطابقات",
    desc: "يحلل محرك المطابقة القاعات ومقدمي الخدمة حسب الميزانية والجودة والمدينة والسعة، ويقترح أفضل الخيارات مرتبة بنسبة توافق واضحة.",
  },
  {
    icon: Scale,
    title: "قارن بتسعير عادل",
    desc: "يقارن محرك التسعير العادل كل عرض بمتوسط السوق، فتعرف فوراً إن كان السعر عادلاً أو أعلى أو أقل من المتوسط — بنسبة مئوية معلنة.",
  },
  {
    icon: Wallet,
    title: "اعتمد وادفع",
    desc: "اعتمد العروض التي تناسبك وادفع داخل المنصة. تُسجَّل تسوية مالية لكل حجز تبيّن حصة مقدم الخدمة وعمولة المنصة بشفافية.",
  },
  {
    icon: ClipboardList,
    title: "نفّذ وتابع",
    desc: "بمجرد اكتمال الدفع يبني محرك التخطيط الذكي جدولاً زمنياً بالعمل عكسياً من تاريخ المناسبة، تتابعه مهمة بمهمة حتى الإغلاق.",
  },
  {
    icon: ShieldCheck,
    title: "الجودة والتقييم",
    desc: "تراجع الإدارة جودة التنفيذ، وتقيّم أنت تجربتك بعد المناسبة. تنعكس التقييمات على مؤشر جودة مقدم الخدمة وترتيبه في المطابقات القادمة.",
  },
];

const PROVIDER_STEPS = [
  {
    icon: Store,
    title: "سجّل واختر مجالاتك",
    desc: "يمكنك تقديم عدة خدمات في أكثر من مجال — اختر كل مجال تعمل فيه عند التسجيل أو عدّله لاحقاً من ملف المنشأة.",
  },
  {
    icon: PackageCheck,
    title: "أضف باقاتك",
    desc: "تبنَّ باقة جاهزة بضغطة واحدة بمحتويات معتمدة وسعر مقترح تعدّله كما تشاء. وإن أردت عرضاً خاصاً خارج الباقات، فالمنصة تلزمك برفع صورة وكتابة شرح كامل للخدمة.",
  },
  {
    icon: ShieldCheck,
    title: "اعتماد الإدارة",
    desc: "تراجع الإدارة بيانات منشأتك قبل أن تظهر خدماتك للعملاء — وهذا ما يحمي السوق من دخول غير المتخصصين.",
  },
  {
    icon: Wallet,
    title: "استلم الطلبات ومستحقاتك",
    desc: "تصلك الطلبات المطابقة لخدماتك، وتدير مهام التنفيذ، وتتابع صافي مستحقاتك بعد عمولة المنصة في صفحة واحدة.",
  },
];

export default function HowItWorksPage() {
  return (
    <div>
      <Navbar />
      <PageHero
        icon={Compass}
        title="كيف تعمل منصة قاطرة"
        subtitle="من فكرة المناسبة إلى تنفيذها — بمحركات قواعدية شفافة تعرف دائماً لماذا أعطتك هذه النتيجة."
      />

      {/* ---- tracks ---- */}
      <section className="mx-auto max-w-5xl px-5 pt-14">
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/services" className="group">
            <Card className="flex h-full items-start gap-4 p-5 transition group-hover:border-gold-400/60">
              <Heart className="h-5 w-5 shrink-0 text-gold-600" />
              <div>
                <h2 className="font-bold text-navy-950">مسار الأفراح والمناسبات</h2>
                <p className="mt-1 text-sm leading-6 text-navy-900/65">قاعة، ضيافة، ديكور، تصوير وموسيقى</p>
              </div>
            </Card>
          </Link>
          <Link href="/events" className="group">
            <Card className="flex h-full items-start gap-4 p-5 transition group-hover:border-gold-400/60">
              <MonitorPlay className="h-5 w-5 shrink-0 text-gold-600" />
              <div>
                <h2 className="font-bold text-navy-950">مسار الفعاليات والمؤتمرات</h2>
                <p className="mt-1 text-sm leading-6 text-navy-900/65">تجهيزات عرض، ترجمة، أجنحة ولوجستيات</p>
              </div>
            </Card>
          </Link>
        </div>
      </section>

      {/* ---- client journey ---- */}
      <section className="mx-auto max-w-4xl px-5 py-16">
        <Badge tone="gold" className="mb-3">
          للعملاء
        </Badge>
        <h2 className="text-2xl font-extrabold text-navy-950">رحلة العميل خطوة بخطوة</h2>

        <div className="mt-8 space-y-5">
          {CLIENT_STEPS.map((s, i) => (
            <Card key={s.title} className="flex items-start gap-5 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gold-gradient">
                <s.icon className="h-5 w-5 text-navy-950" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-gold-600">الخطوة {i + 1}</div>
                <h3 className="mt-0.5 font-bold text-navy-950">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-7 text-navy-900/70">{s.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ---- provider journey ---- */}
      <section className="bg-cream-dark py-16">
        <div className="mx-auto max-w-4xl px-5">
          <Badge tone="green" className="mb-3">
            لمقدمي الخدمة
          </Badge>
          <h2 className="text-2xl font-extrabold text-navy-950">كيف تنضم وتبدأ البيع</h2>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {PROVIDER_STEPS.map((s) => (
              <Card key={s.title} className="p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl gold-gradient">
                  <s.icon className="h-5 w-5 text-navy-950" />
                </div>
                <h3 className="font-bold text-navy-950">{s.title}</h3>
                <p className="mt-2 text-sm leading-7 text-navy-900/70">{s.desc}</p>
              </Card>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button href="/signup" size="lg">
              ابدأ الآن مجاناً
            </Button>
            <Button href="/signup?role=provider" size="lg" variant="outline">
              انضم كمقدم خدمة
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
