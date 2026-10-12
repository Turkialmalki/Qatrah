import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageHero } from "@/components/layout/page-hero";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CATEGORY_LABELS, providerCategories } from "@/lib/utils";
import { ArrowLeft, MapPin, Star, Store } from "lucide-react";
import type { ProviderProfile } from "@/lib/types/database";

export const metadata = {
  title: "مقدمو الخدمة",
  description: "دليل مقدمي الخدمة المعتمدين في منصة قاطرة — قاعات، ضيافة، ديكور، تصوير وتجهيزات مؤتمرات.",
};

export default async function ProvidersPage() {
  const supabase = await createClient();

  const { data: providers } = await supabase
    .from("provider_profiles")
    .select("*")
    .eq("status", "approved")
    .order("quality_score", { ascending: false });

  const list = (providers ?? []) as ProviderProfile[];

  return (
    <div>
      <Navbar />
      <PageHero
        icon={Store}
        eyebrow={`${list.length} مقدم خدمة معتمد`}
        title="دليل مقدمي الخدمة"
        subtitle="كل مقدم خدمة في قاطرة يمر بمراجعة الإدارة قبل أن تظهر خدماته — ويمكن للمنشأة الواحدة تقديم عدة خدمات في أكثر من مجال."
      />

      <section className="mx-auto max-w-7xl px-5 py-14">
        {list.length === 0 ? (
          <EmptyState
            icon={Store}
            title="لا يوجد مقدمو خدمة معتمدون بعد"
            description="كن أول من ينضم إلى المنصة كمقدم خدمة معتمد."
            actionLabel="انضم كمقدم خدمة"
            actionHref="/signup?role=provider"
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => {
              const cats = providerCategories(p);
              return (
                <Link key={p.id} href={`/providers/${p.id}`} className="group">
                  <Card className="h-full p-5 transition group-hover:-translate-y-1 group-hover:border-gold-400/60">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-navy-950">{p.business_name}</h3>
                      <ArrowLeft className="h-4 w-4 shrink-0 text-gold-600 transition group-hover:-translate-x-1" />
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-navy-900/55">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {p.base_city}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" /> {p.quality_score ?? 0}/5
                      </span>
                      {p.years_experience > 0 && <span>{p.years_experience} سنة خبرة</span>}
                    </div>

                    {p.bio && <p className="mt-3 line-clamp-2 text-sm leading-6 text-navy-900/65">{p.bio}</p>}

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {cats.slice(0, 4).map((c) => (
                        <Badge key={c} tone="navy">
                          {CATEGORY_LABELS[c]}
                        </Badge>
                      ))}
                      {cats.length > 4 && <Badge tone="gray">+{cats.length - 4}</Badge>}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
