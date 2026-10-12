import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageHero } from "@/components/layout/page-hero";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stat, StatGrid } from "@/components/ui/stat";
import { ServiceImage } from "@/components/ui/image-field";
import { CATEGORY_LABELS, formatSAR, providerCategories } from "@/lib/utils";
import { UNIT_LABELS } from "@/lib/catalog/packages";
import { Briefcase, Building2, Check, MapPin, PackageCheck, Star, Users } from "lucide-react";
import type { Evaluation, Hall, ProviderProfile, ServiceItem } from "@/lib/types/database";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("provider_profiles").select("business_name, bio").eq("id", id).single();
  const p = data as Pick<ProviderProfile, "business_name" | "bio"> | null;
  if (!p) return {};
  return { title: p.business_name, description: p.bio ?? undefined };
}

export default async function ProviderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: provider } = await supabase
    .from("provider_profiles")
    .select("*")
    .eq("id", id)
    .eq("status", "approved")
    .single();
  if (!provider) notFound();

  const [{ data: services }, { data: halls }, { data: evaluations }] = await Promise.all([
    supabase.from("services").select("*").eq("provider_id", id).eq("is_active", true).order("base_price"),
    supabase.from("halls").select("*").eq("provider_id", id).eq("is_active", true).order("base_price"),
    supabase.from("evaluations").select("*").eq("provider_id", id).order("created_at", { ascending: false }).limit(6),
  ]);

  const p = provider as ProviderProfile;
  const serviceList = (services ?? []) as ServiceItem[];
  const hallList = (halls ?? []) as Hall[];
  const reviews = (evaluations ?? []) as Evaluation[];
  const cats = providerCategories(p);

  // Grouped by category, because one provider may serve several of them.
  const byCategory = new Map<string, ServiceItem[]>();
  for (const s of serviceList) {
    byCategory.set(s.category, [...(byCategory.get(s.category) ?? []), s]);
  }

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((t, r) => t + (r.rating_quality + r.rating_price + r.rating_timeliness) / 3, 0) /
          reviews.length
        ).toFixed(1)
      : null;

  return (
    <div>
      <Navbar />
      <PageHero
        title={p.business_name}
        subtitle={p.bio ?? undefined}
        crumbs={[
          { href: "/", label: "الرئيسية" },
          { href: "/providers", label: "مقدمو الخدمة" },
          { href: `/providers/${p.id}`, label: p.business_name },
        ]}
      >
        <div className="flex flex-wrap justify-center gap-2">
          {cats.map((c) => (
            <Badge key={c} tone="gold">
              {CATEGORY_LABELS[c]}
            </Badge>
          ))}
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-5 py-14">
        <StatGrid className="mb-12">
          <Stat label="تقييم الجودة" value={`${p.quality_score ?? 0} / 5`} icon={Star} />
          <Stat label="أعمال منجزة" value={p.completed_jobs ?? 0} icon={Briefcase} />
          <Stat label="مدينة التشغيل" value={p.base_city} icon={MapPin} />
          <Stat
            label="مجالات الخدمة"
            value={cats.length}
            hint={cats.map((c) => CATEGORY_LABELS[c]).join(" · ")}
            icon={PackageCheck}
          />
        </StatGrid>

        {/* ---- halls ---- */}
        {hallList.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-5 text-xl font-extrabold text-navy-950">القاعات</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {hallList.map((h) => (
                <Link key={h.id} href={`/halls/${h.id}`} className="group">
                  <Card className="h-full overflow-hidden transition group-hover:-translate-y-1">
                    <ServiceImage src={h.images?.[0]} alt={h.name} className="h-40 w-full" />
                    <CardBody>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-navy-950">{h.name}</h3>
                        <span className="shrink-0 font-bold text-gold-600">{formatSAR(h.base_price)}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-xs text-navy-900/55">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {h.city}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" /> {h.capacity_min}-{h.capacity_max}
                        </span>
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ---- services, grouped by category ---- */}
        {byCategory.size > 0 && (
          <div className="mb-12">
            <h2 className="mb-1 text-xl font-extrabold text-navy-950">الخدمات والباقات</h2>
            <p className="mb-5 text-sm text-navy-900/60">
              هذه المنشأة تقدم خدمات في {byCategory.size} {byCategory.size === 1 ? "مجال" : "مجالات"}
            </p>

            <div className="space-y-8">
              {Array.from(byCategory.entries()).map(([cat, items]) => (
                <div key={cat}>
                  <div className="mb-3 flex items-center gap-2">
                    <Badge tone="navy">{CATEGORY_LABELS[cat]}</Badge>
                    <Link href={`/services/${cat}`} className="text-xs font-semibold text-gold-600 hover:underline">
                      كل عروض هذا المجال ←
                    </Link>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((s) => (
                      <Card key={s.id} className="flex h-full flex-col overflow-hidden">
                        {s.images?.[0] && <ServiceImage src={s.images[0]} alt={s.title} className="h-36 w-full" />}
                        <CardBody className="flex flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-navy-950">{s.title}</h3>
                            {s.package_key && <Badge tone="gold">باقة جاهزة</Badge>}
                          </div>
                          {s.description && (
                            <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-navy-900/65">
                              {s.description}
                            </p>
                          )}
                          {s.inclusions?.length > 0 && (
                            <ul className="mt-3 space-y-1">
                              {s.inclusions.slice(0, 3).map((inc) => (
                                <li key={inc} className="flex items-start gap-1.5 text-xs text-navy-900/70">
                                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-700" />
                                  {inc}
                                </li>
                              ))}
                            </ul>
                          )}
                          <div className="mt-4 flex items-baseline gap-1.5 border-t border-navy-900/8 pt-3">
                            <span className="text-lg font-extrabold text-navy-950">{formatSAR(s.base_price)}</span>
                            <span className="text-xs text-navy-900/50">{UNIT_LABELS[s.unit] ?? ""}</span>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {serviceList.length === 0 && hallList.length === 0 && (
          <Card className="p-10 text-center text-sm text-navy-900/50">
            <Building2 className="mx-auto mb-3 h-7 w-7 text-navy-900/25" />
            لم تُضف هذه المنشأة خدمات بعد
          </Card>
        )}

        {/* ---- reviews ---- */}
        {reviews.length > 0 && (
          <div>
            <h2 className="mb-1 text-xl font-extrabold text-navy-950">تقييمات العملاء</h2>
            {avgRating && <p className="mb-5 text-sm text-navy-900/60">متوسط التقييم {avgRating} من ٥</p>}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.map((r) => (
                <Card key={r.id} className="p-5">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={
                          i < Math.round((r.rating_quality + r.rating_price + r.rating_timeliness) / 3)
                            ? "h-4 w-4 fill-gold-400 text-gold-400"
                            : "h-4 w-4 text-navy-900/15"
                        }
                      />
                    ))}
                  </div>
                  {r.comment && <p className="mt-3 text-sm leading-6 text-navy-900/70">{r.comment}</p>}
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="mt-14 rounded-2xl navy-gradient px-6 py-10 text-center">
          <h2 className="text-xl font-extrabold text-white">تريد التعامل مع هذه المنشأة؟</h2>
          <p className="mt-2 text-sm text-cream/70">
            أنشئ مناسبتك وسيعرض محرك المطابقة أفضل العروض المناسبة لميزانيتك.
          </p>
          <Button href="/signup" size="lg" className="mt-6">
            ابدأ تخطيط مناسبتك
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
