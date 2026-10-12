import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageHero } from "@/components/layout/page-hero";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Compass, Flag, Scale, ShieldCheck, Sparkles, Target } from "lucide-react";

export const metadata = {
  title: "عن قاطرة",
  description: "منصة قاطرة — نموذج سعودي تقني لتنظيم المناسبات والمؤتمرات بتسعير عادل وجودة مقاسة.",
};

const PROBLEMS = [
  "تفاوت الأسعار بلا معيار واضح يحتكم إليه العميل",
  "غياب آلية لقياس جودة العمل مقارنة بالتكلفة المدفوعة",
  "عدم الالتزام بمواعيد تسليم واضحة ومتابعة مكتوبة",
  "دخول غير المتخصصين للمجال بنتائج سيئة على العميل",
];

const VALUES = [
  { icon: Scale, title: "الشفافية", desc: "كل سعر يُقارن بمتوسط السوق، وكل باقة محتوياتها معلنة قبل الطلب." },
  { icon: ShieldCheck, title: "الجودة", desc: "لا يُقبل في قاطرة إلا مقدمو خدمة معتمدون تمر أعمالهم بمراجعة." },
  { icon: Target, title: "الالتزام", desc: "خطة تنفيذ مكتوبة بمواعيد محددة تُتابع خطوة بخطوة حتى الإغلاق." },
  { icon: Compass, title: "التمكين", desc: "أدوات تساعد المنشآت الصغيرة على المنافسة بعدالة أمام العميل." },
];

export default function AboutPage() {
  return (
    <div>
      <Navbar />
      <PageHero
        icon={Flag}
        eyebrow="من الصحراء إلى العالم"
        title="عن منصة قاطرة"
        subtitle="منصة سعودية تقنية تعيد تنظيم سوق المناسبات والمؤتمرات: بتسعير عادل قابل للقياس، وجودة موثّقة، وخطة تنفيذ لا تترك شيئاً للصدفة."
      />

      <section className="mx-auto max-w-4xl px-5 py-16">
        <Badge tone="green" className="mb-3">
          المشكلة
        </Badge>
        <h2 className="text-2xl font-extrabold text-navy-950">لماذا وُجدت قاطرة</h2>
        <p className="mt-3 text-sm leading-7 text-navy-900/70">
          سوق المناسبات في المملكة ضخم ونشط، لكنه يفتقر إلى معيار واضح يحمي العميل ويكافئ مقدم الخدمة المتخصص. قاطرة
          ليست وسيطاً ينقل الطلب فحسب — بل طبقة تنظيمية تعالج هذه الفجوات:
        </p>
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {PROBLEMS.map((p, i) => (
            <Card key={p} className="p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-gold-100 text-sm font-extrabold text-gold-600">
                {i + 1}
              </div>
              <p className="text-sm leading-6 text-navy-900/75">{p}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-cream-dark py-16">
        <div className="mx-auto max-w-5xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <Badge tone="gold" className="mb-3">
              قيمنا
            </Badge>
            <h2 className="text-2xl font-extrabold text-navy-950">أربع قيم تحكم كل قرار في المنصة</h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {VALUES.map((v) => (
              <Card key={v.title} className="p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl gold-gradient">
                  <v.icon className="h-5 w-5 text-navy-950" />
                </div>
                <h3 className="font-bold text-navy-950">{v.title}</h3>
                <p className="mt-2 text-sm leading-6 text-navy-900/70">{v.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16 text-center">
        <Sparkles className="mx-auto mb-4 h-8 w-8 text-gold-500" />
        <h2 className="text-2xl font-extrabold text-navy-950">نموذج قابل للتصدير</h2>
        <p className="mt-3 text-sm leading-7 text-navy-900/70">
          بُنيت قاطرة على محركات قواعدية شفافة — مطابقة، تسعير عادل، تحسين ميزانية، وتخطيط تنفيذ — يمكن تطبيقها على أي
          سوق مناسبات. نبدأ من المملكة، والطموح أن يخرج النموذج السعودي إلى العالم.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/signup" size="lg">
            ابدأ تخطيط مناسبتك
          </Button>
          <Button href="/contact" size="lg" variant="outline">
            تواصل معنا
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
