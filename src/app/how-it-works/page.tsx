import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarPlus, Sparkles, ScaleIcon, Wallet, ClipboardList, ShieldCheck } from "lucide-react";

const steps = [
  { icon: CalendarPlus, title: "أنشئ مناسبتك", desc: "أدخل نوع المناسبة، المدينة، عدد الضيوف، والميزانية الإجمالية. يوزّع محرك تحسين الميزانية المبلغ تلقائياً على بنود مناسبتك حسب أولوياتك." },
  { icon: Sparkles, title: "المطابقة الذكية", desc: "يحلل محرك المطابقة القاعات ومقدمي الخدمة حسب الميزانية، الجودة، والمدينة، ويقترح عليك أفضل الخيارات مرتبة بنسبة توافق واضحة." },
  { icon: ScaleIcon, title: "تسعير عادل وشفاف", desc: "يقارن محرك التسعير العادل كل عرض بمتوسط السوق، فتعرف فوراً إن كان السعر عادلاً أو أعلى أو أقل من المتوسط." },
  { icon: Wallet, title: "الاعتماد والدفع", desc: "اعتمد العروض التي تناسبك وادفع بأمان داخل المنصة — تُحفظ مستحقات مقدمي الخدمة حتى إتمام الجودة." },
  { icon: ClipboardList, title: "خطة تنفيذ ذكية", desc: "بمجرد تأكيد حجوزاتك، يبني محرك التخطيط الذكي جدولاً زمنياً تلقائياً لكل تفاصيل التنفيذ حتى يوم المناسبة." },
  { icon: ShieldCheck, title: "ضمان الجودة والتقييم", desc: "تراجع الإدارة جودة التنفيذ، وتقيّم تجربتك بعد المناسبة لتحسين مؤشرات الجودة والتسعير العادل لمقدمي الخدمة." },
];

export default function HowItWorksPage() {
  return (
    <div>
      <Navbar />
      <section className="navy-gradient py-16 text-center">
        <h1 className="text-3xl font-extrabold text-white">كيف تعمل منصة قاطرة</h1>
        <p className="mt-2 text-cream/70">من فكرة المناسبة إلى تنفيذها — بمحركات ذكية تدير كل خطوة</p>
      </section>
      <section className="mx-auto max-w-4xl px-5 py-16">
        <div className="space-y-6">
          {steps.map((s, i) => (
            <Card key={s.title} className="flex items-start gap-5 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gold-gradient">
                <s.icon className="h-5 w-5 text-navy-950" />
              </div>
              <div>
                <div className="text-xs font-bold text-gold-600">الخطوة {i + 1}</div>
                <h3 className="mt-0.5 font-bold text-navy-950">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-navy-900/70">{s.desc}</p>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button href="/signup" size="lg">ابدأ الآن مجاناً</Button>
        </div>
      </section>
      <Footer />
    </div>
  );
}
