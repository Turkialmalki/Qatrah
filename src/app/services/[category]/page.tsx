import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageHero } from "@/components/layout/page-hero";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PackageCard } from "@/components/ui/package-card";
import { ServiceImage } from "@/components/ui/image-field";
import { CATEGORY_LABELS, CATEGORY_TAGLINES, formatSAR } from "@/lib/utils";
import { UNIT_LABELS, packagesForCategory } from "@/lib/catalog/packages";
import { PackageCheck, Sparkles, Store } from "lucide-react";
import type { ProviderCategory, ProviderProfile, ServiceItem } from "@/lib/types/database";

/** Every category the platform knows about, minus halls (they have their own page). */
const VALID_CATEGORIES: ProviderCategory[] = [
  "catering",
  "decor",
  "photography",
  "music",
  "planning",
  "av",
  "translation",
  "booths",
  "security",
  "transport",
  "other",
];

export function generateStaticParams() {
  return VALID_CATEGORIES.map((category) => ({ category }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  if (!VALID_CATEGORIES.includes(category as ProviderCategory)) return {};
  return {
    title: CATEGORY_LABELS[category],
    description: CATEGORY_TAGLINES[category],
  };
}

export default async function ServiceCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  if (!VALID_CATEGORIES.includes(category as ProviderCategory)) notFound();

  const cat = category as ProviderCategory;
  const packages = packagesForCategory(cat);

  const supabase = await createClient();
  const { data: services } = await supabase
    .from("services")
    .select("*, provider_profiles!inner(*)")
    .eq("category", cat)
    .eq("is_active", true)
    .eq("provider_profiles.status", "approved")
    .order("base_price", { ascending: true });

  const offers = (services ?? []) as (ServiceItem & { provider_profiles: ProviderProfile })[];

  // Which providers actually offer each ready-made package, and from what price.
  const byPackage = new Map<string, (ServiceItem & { provider_profiles: ProviderProfile })[]>();
  for (const o of offers) {
    if (!o.package_key) continue;
    byPackage.set(o.package_key, [...(byPackage.get(o.package_key) ?? []), o]);
  }
  const customOffers = offers.filter((o) => !o.package_key);

  return (
    <div>
      <Navbar />
      <PageHero
        icon={Sparkles}
        title={CATEGORY_LABELS[cat]}
        subtitle={CATEGORY_TAGLINES[cat]}
        crumbs={[
          { href: "/", label: "الرئيسية" },
          { href: "/services", label: "الخدمات" },
          { href: `/services/${cat}`, label: CATEGORY_LABELS[cat] },
        ]}
      />

      <section className="mx-auto max-w-7xl px-5 py-14">
        {/* ---------------- ready-made packages ---------------- */}
        {packages.length > 0 && (
          <div>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <Badge tone="gold" className="mb-2">
                  باقات جاهزة
                </Badge>
                <h2 className="text-xl font-extrabold text-navy-950">باقات معتمدة من المنصة</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-navy-900/60">
                  محتويات وأسعار موحّدة تقارنها بسهولة. مقدمو الخدمة يتبنّون الباقة كما هي، فما تراه هنا هو ما تحصل
                  عليه فعلاً.
                </p>
              </div>
              <Button href="/signup" size="sm">
                اطلب هذه الخدمة
              </Button>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg) => {
                const providers = byPackage.get(pkg.key) ?? [];
                const from = providers.length > 0 ? Math.min(...providers.map((p) => p.base_price)) : null;
                return (
                  <PackageCard
                    key={pkg.key}
                    pkg={pkg}
                    highlight={pkg.tier === "standard"}
                    footer={
                      providers.length > 0 ? (
                        <div className="text-xs">
                          <div className="font-bold text-green-800">
                            {providers.length} مقدم خدمة يقدم هذه الباقة
                          </div>
                          {from != null && (
                            <div className="mt-1 text-navy-900/60">
                              تبدأ فعلياً من {formatSAR(from)} {UNIT_LABELS[pkg.unit]}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-navy-900/50">لا يوجد مقدم خدمة لهذه الباقة بعد</p>
                      )
                    }
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* ---------------- providers' own listings ---------------- */}
        <div className={packages.length > 0 ? "mt-16" : ""}>
          <div className="mb-6">
            <Badge tone="navy" className="mb-2">
              عروض مخصصة
            </Badge>
            <h2 className="text-xl font-extrabold text-navy-950">عروض خاصة من مقدمي الخدمة</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-navy-900/60">
              عروض كتبها مقدمو الخدمة بأنفسهم خارج الباقات الجاهزة — ولذلك تُلزم المنصة كل عرض منها بصورة وشرح كامل.
            </p>
          </div>

          {customOffers.length === 0 ? (
            <EmptyState
              icon={Store}
              title="لا توجد عروض مخصصة في هذا المجال بعد"
              description="الباقات الجاهزة بالأعلى متاحة للطلب، أو انضم كمقدم خدمة لتعرض خدمتك الخاصة."
              actionLabel="انضم كمقدم خدمة"
              actionHref="/signup?role=provider"
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {customOffers.map((s) => (
                <Card key={s.id} className="flex flex-col overflow-hidden">
                  <ServiceImage src={s.images?.[0]} alt={s.title} className="h-44 w-full" />
                  <CardBody className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-navy-950">{s.title}</h3>
                      <div className="shrink-0 text-left">
                        <div className="font-bold text-gold-600">{formatSAR(s.base_price)}</div>
                        <div className="text-[10px] text-navy-900/50">{UNIT_LABELS[s.unit] ?? ""}</div>
                      </div>
                    </div>
                    {s.description && (
                      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-navy-900/65">{s.description}</p>
                    )}
                    {s.inclusions?.length > 0 && (
                      <ul className="mt-3 space-y-1">
                        {s.inclusions.slice(0, 3).map((inc) => (
                          <li key={inc} className="flex items-start gap-1.5 text-xs text-navy-900/70">
                            <PackageCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-700" />
                            {inc}
                          </li>
                        ))}
                      </ul>
                    )}
                    <Link
                      href={`/providers/${s.provider_id}`}
                      className="mt-4 border-t border-navy-900/8 pt-3 text-xs font-semibold text-navy-900/60 transition hover:text-gold-600"
                    >
                      {s.provider_profiles?.business_name} ←
                    </Link>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
