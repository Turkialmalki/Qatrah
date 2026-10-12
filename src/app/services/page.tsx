import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageHero } from "@/components/layout/page-hero";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS, CATEGORY_TAGLINES, CONFERENCE_CATEGORIES, SOCIAL_CATEGORIES } from "@/lib/utils";
import { packagesForCategory } from "@/lib/catalog/packages";
import { ArrowLeft, Sparkles } from "lucide-react";
import type { ProviderCategory } from "@/lib/types/database";

export const metadata = {
  title: "الخدمات",
  description: "باقات خدمات جاهزة للمناسبات والمؤتمرات من مقدمي خدمة معتمدين في منصة قاطرة",
};

/** Social categories first, then the conference-only ones, without repeats. */
const SOCIAL = SOCIAL_CATEGORIES.filter((c) => c !== "hall");
const CONFERENCE_ONLY = CONFERENCE_CATEGORIES.filter((c) => c !== "hall" && !SOCIAL.includes(c));

export default async function ServicesPage() {
  const supabase = await createClient();

  // How many approved providers currently offer each category.
  const { data: services } = await supabase
    .from("services")
    .select("category, provider_profiles!inner(status)")
    .eq("is_active", true)
    .eq("provider_profiles.status", "approved");

  const counts = new Map<string, number>();
  for (const row of (services ?? []) as { category: string }[]) {
    counts.set(row.category, (counts.get(row.category) ?? 0) + 1);
  }

  return (
    <div>
      <Navbar />
      <PageHero
        icon={Sparkles}
        eyebrow="باقات جاهزة بأسعار معلنة"
        title="خدمات المناسبات والمؤتمرات"
        subtitle="لكل مجال باقات جاهزة معتمدة من المنصة بمحتويات وأسعار واضحة — اختر المجال لتستعرض الباقات ومقدمي الخدمة المعتمدين."
      />

      <section className="mx-auto max-w-7xl px-5 py-14">
        <CategoryGrid heading="خدمات الأفراح والمناسبات" categories={SOCIAL} counts={counts} />
        <CategoryGrid
          heading="خدمات الفعاليات والمؤتمرات"
          hint="مجالات متخصصة تخدم المؤتمرات والمعارض والمنتديات"
          categories={CONFERENCE_ONLY}
          counts={counts}
          className="mt-14"
        />
      </section>

      <Footer />
    </div>
  );
}

function CategoryGrid({
  heading,
  hint,
  categories,
  counts,
  className,
}: {
  heading: string;
  hint?: string;
  categories: ProviderCategory[];
  counts: Map<string, number>;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-navy-950">{heading}</h2>
        {hint && <p className="mt-1 text-sm text-navy-900/60">{hint}</p>}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const packages = packagesForCategory(cat);
          const providerCount = counts.get(cat) ?? 0;
          const cheapest = packages.length > 0 ? Math.min(...packages.map((p) => p.basePrice)) : null;

          return (
            <Link key={cat} href={`/services/${cat}`} className="group">
              <Card className="h-full p-5 transition group-hover:-translate-y-1 group-hover:border-gold-400/60">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-navy-950">{CATEGORY_LABELS[cat]}</h3>
                  <ArrowLeft className="h-4 w-4 shrink-0 text-gold-600 transition group-hover:-translate-x-1" />
                </div>
                <p className="mt-2 text-sm leading-6 text-navy-900/65">{CATEGORY_TAGLINES[cat]}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {packages.length > 0 && <Badge tone="gold">{packages.length} باقة جاهزة</Badge>}
                  <Badge tone={providerCount > 0 ? "green" : "gray"}>
                    {providerCount > 0 ? `${providerCount} عرض متاح` : "لا عروض بعد"}
                  </Badge>
                </div>
                {cheapest != null && (
                  <p className="mt-3 text-xs text-navy-900/50">تبدأ من {cheapest.toLocaleString("ar-SA")} ﷼</p>
                )}
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
