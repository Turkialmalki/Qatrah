import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageHero } from "@/components/layout/page-hero";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Headphones, Mail, MapPin, Store } from "lucide-react";

export const metadata = {
  title: "تواصل معنا",
  description: "تواصل مع فريق منصة قاطرة — دعم العملاء، انضمام مقدمي الخدمة، وتنظيم المؤتمرات.",
};

const CHANNELS = [
  {
    icon: Headphones,
    title: "دعم العملاء",
    desc: "استفسارات عن مناسبتك، الحجوزات، أو المدفوعات.",
    email: "support@qatrah.sa",
  },
  {
    icon: Store,
    title: "انضمام مقدمي الخدمة",
    desc: "لعرض قاعاتك أو خدماتك على المنصة واعتماد حسابك.",
    email: "partners@qatrah.sa",
  },
  {
    icon: Building2,
    title: "الفعاليات والمؤتمرات",
    desc: "تنظيم مؤتمرات ومعارض للجهات والشركات.",
    email: "events@qatrah.sa",
  },
];

export default function ContactPage() {
  return (
    <div>
      <Navbar />
      <PageHero
        icon={Mail}
        title="تواصل معنا"
        subtitle="اختر القناة المناسبة لطلبك وسيردّ عليك الفريق المختص في أقرب وقت."
      />

      <section className="mx-auto max-w-5xl px-5 py-16">
        <div className="grid gap-5 md:grid-cols-3">
          {CHANNELS.map((c) => (
            <Card key={c.email} className="flex flex-col p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl gold-gradient">
                <c.icon className="h-5 w-5 text-navy-950" />
              </div>
              <h2 className="font-bold text-navy-950">{c.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-navy-900/70">{c.desc}</p>
              <a
                href={`mailto:${c.email}`}
                className="mt-4 block border-t border-navy-900/8 pt-3 text-sm font-bold text-gold-600 hover:underline"
              >
                {c.email}
              </a>
            </Card>
          ))}
        </div>

        <Card className="mt-8 p-6">
          <h2 className="flex items-center gap-2 font-bold text-navy-950">
            <MapPin className="h-4 w-4 text-gold-600" /> المقر
          </h2>
          <p className="mt-2 text-sm leading-7 text-navy-900/70">
            الرياض، المملكة العربية السعودية
          </p>
        </Card>

        <div className="mt-12 rounded-2xl navy-gradient px-6 py-10 text-center">
          <h2 className="text-xl font-extrabold text-white">هل تريد البدء مباشرة؟</h2>
          <p className="mt-2 text-sm text-cream/70">أنشئ حسابك وابدأ تخطيط مناسبتك في دقائق.</p>
          <Button href="/signup" size="lg" className="mt-6">
            إنشاء حساب مجاني
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
