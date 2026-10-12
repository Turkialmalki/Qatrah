import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageHero } from "@/components/layout/page-hero";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PackageCard } from "@/components/ui/package-card";
import { CATEGORY_LABELS, CATEGORY_TAGLINES, CONFERENCE_CATEGORIES, EVENT_TYPE_LABELS } from "@/lib/utils";
import { packagesForCategory } from "@/lib/catalog/packages";
import {
  ArrowLeft,
  Building2,
  CalendarRange,
  ClipboardList,
  Megaphone,
  Mic2,
  MonitorPlay,
  Presentation,
  Users,
} from "lucide-react";
import type { ProviderCategory } from "@/lib/types/database";

export const metadata = {
  title: "الفعاليات والمؤتمرات",
  description:
    "تنظيم المؤتمرات والمعارض والمنتديات وورش العمل — قاعات، تجهيزات صوت وعرض، ترجمة فورية، أجنحة معارض وخدمات لوجستية من مقدمي خدمة معتمدين.",
};

const EVENT_KINDS: { type: string; icon: typeof Mic2; desc: string }[] = [
  { type: "conference", icon: Mic2, desc: "مؤتمرات بجلسات متعددة ومتحدثين وضيافة استراحات" },
  { type: "exhibition", icon: Presentation, desc: "معارض بأجنحة عرض وتنظيم زوار ومساحات تفاعلية" },
  { type: "forum", icon: Megaphone, desc: "منتديات حوارية بجلسات نقاش وتغطية إعلامية" },
  { type: "workshop", icon: ClipboardList, desc: "ورش عمل تدريبية بمجموعات صغيرة وتجهيزات تفاعلية" },
  { type: "corporate", icon: Building2, desc: "مناسبات الشركات واللقاءات السنوية وحفلات التكريم" },
  { type: "festival", icon: CalendarRange, desc: "مهرجانات ومناسبات مفتوحة بمساحات ومسارات زوار" },
];

const STEPS = [
  { n: "01", title: "حدد نوع الفعالية", desc: "مؤتمر، معرض، منتدى أو ورشة — ولكل نوع نموذج تخطيط خاص به." },
  { n: "02", title: "أدخل تفاصيل الأجندة", desc: "عدد الأيام، الجلسات، المتحدثين، والأجنحة المطلوبة." },
  { n: "03", title: "استلم توزيع الميزانية", desc: "يوزّع المحرك ميزانيتك على القاعة والتجهيزات والخدمات اللوجستية." },
  { n: "04", title: "اعتمد ونفّذ", desc: "قارن العروض، اعتمد الأفضل، وتابع خطة تنفيذ مبنية على ٩٠ يوماً." },
];

export default async function EventsPage() {
  const supabase = await createClient();

  // Which conference categories already have approved providers behind them.
  const { data: services } = await supabase
    .from("services")
    .select("category, provider_profiles!inner(status)")
    .eq("is_active", true)
    .eq("provider_profiles.status", "approved");

  const counts = new Map<string, number>();
  for (const row of (services ?? []) as { category: string }[]) {
    counts.set(row.category, (counts.get(row.category) ?? 0) + 1);
  }

  const conferenceCategories = CONFERENCE_CATEGORIES.filter((c) => c !== "hall");
  const featured = packagesForCategory("av").concat(packagesForCategory("booths").slice(0, 1));

  return (
    <div>
      <Navbar />

      <PageHero
        icon={MonitorPlay}
        eyebrow="مسار الفعاليات والمؤتمرات"
        title="مؤتمرك ومعرضك بتخطيط مؤسسي كامل"
        subtitle="مسار مستقل داخل قاطرة مخصص للمؤتمرات والمعارض والمنتديات — بنموذج تخطيط يراعي الأجندة والجلسات والمتحدثين، وبخدمات متخصصة لا تحتاجها المناسبات الاجتماعية."
      >
        <div className="flex flex-wrap justify-center gap-3">
          <Button href="/dashboard/client/events/new/conference" size="lg">
            ابدأ تخطيط فعاليتك <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            href="/signup?role=provider"
            size="lg"
            variant="outline"
            className="border-white/25 text-white hover:bg-white/10"
          >
            انضم كمقدم خدمة للمؤتمرات
          </Button>
        </div>
      </PageHero>

      {/* ---- event kinds ---- */}
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <Badge tone="navy" className="mb-3">
            أنواع الفعاليات
          </Badge>
          <h2 className="text-2xl font-extrabold text-navy-950 sm:text-3xl">اختر نوع فعاليتك</h2>
          <p className="mt-3 text-sm leading-7 text-navy-900/65">
            كل نوع يفتح نموذج تخطيط مخصصاً بالحقول التي يحتاجها فعلاً — لا نماذج أفراح لمؤتمر.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {EVENT_KINDS.map((k) => (
            <Card key={k.type} className="p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl gold-gradient">
                <k.icon className="h-5 w-5 text-navy-950" />
              </div>
              <h3 className="font-bold text-navy-950">{EVENT_TYPE_LABELS[k.type]}</h3>
              <p className="mt-2 text-sm leading-6 text-navy-900/65">{k.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ---- specialist categories ---- */}
      <section className="bg-cream-dark py-16">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <Badge tone="gold" className="mb-3">
              خدمات متخصصة
            </Badge>
            <h2 className="text-2xl font-extrabold text-navy-950 sm:text-3xl">كل ما يحتاجه المؤتمر في مكان واحد</h2>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {conferenceCategories.map((cat: ProviderCategory) => (
              <Link key={cat} href={`/services/${cat}`} className="group">
                <Card className="h-full p-5 transition group-hover:-translate-y-1 group-hover:border-gold-400/60">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-navy-950">{CATEGORY_LABELS[cat]}</h3>
                    <ArrowLeft className="h-4 w-4 shrink-0 text-gold-600 transition group-hover:-translate-x-1" />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-navy-900/65">{CATEGORY_TAGLINES[cat]}</p>
                  <Badge tone={(counts.get(cat) ?? 0) > 0 ? "green" : "gray"} className="mt-3">
                    {(counts.get(cat) ?? 0) > 0 ? `${counts.get(cat)} عرض متاح` : "قريباً"}
                  </Badge>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---- featured packages ---- */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <Badge tone="gold" className="mb-3">
              باقات جاهزة
            </Badge>
            <h2 className="text-2xl font-extrabold text-navy-950 sm:text-3xl">باقات تجهيزات المؤتمرات</h2>
            <p className="mt-3 text-sm leading-7 text-navy-900/65">
              أسعار ومحتويات معلنة مسبقاً لتقارن قبل أن تطلب.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {featured.map((pkg) => (
              <PackageCard key={pkg.key} pkg={pkg} highlight={pkg.tier === "standard"} />
            ))}
          </div>
        </section>
      )}

      {/* ---- how it works ---- */}
      <section className="bg-cream-dark py-16">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <Badge tone="navy" className="mb-3">
              كيف يعمل المسار
            </Badge>
            <h2 className="text-2xl font-extrabold text-navy-950 sm:text-3xl">من الأجندة إلى يوم الافتتاح</h2>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n}>
                <div className="text-4xl font-extrabold text-navy-900/10">{s.n}</div>
                <h3 className="-mt-3 font-bold text-navy-950">{s.title}</h3>
                <p className="mt-2 text-sm leading-6 text-navy-900/65">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="navy-gradient">
        <div className="mx-auto max-w-4xl px-5 py-16 text-center">
          <Users className="mx-auto mb-4 h-8 w-8 text-gold-400" />
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">جاهز لتخطيط مؤتمرك القادم؟</h2>
          <p className="mt-3 text-sm leading-7 text-cream/70">
            أنشئ فعاليتك الآن ودع محركات قاطرة توزّع الميزانية وتبني خطة التنفيذ.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/dashboard/client/events/new/conference" size="lg">
              إنشاء فعالية
            </Button>
            <Button
              href="/contact"
              size="lg"
              variant="outline"
              className="border-white/25 text-white hover:bg-white/10"
            >
              تحدّث مع فريق قاطرة
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
