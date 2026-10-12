import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageHero } from "@/components/layout/page-hero";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ServiceImage } from "@/components/ui/image-field";
import { formatSAR } from "@/lib/utils";
import { Building2, MapPin, Users } from "lucide-react";
import type { Hall, ProviderProfile } from "@/lib/types/database";

export const metadata = {
  title: "القاعات",
  description: "قاعات ومواقع معتمدة في منصة قاطرة لكل أحجام المناسبات والمؤتمرات.",
};

export default async function HallsPage() {
  const supabase = await createClient();
  const { data: halls } = await supabase
    .from("halls")
    .select("*, provider_profiles!inner(*)")
    .eq("is_active", true)
    .eq("provider_profiles.status", "approved")
    .order("base_price", { ascending: true });

  const list = (halls ?? []) as (Hall & { provider_profiles: ProviderProfile })[];
  const cities = Array.from(new Set(list.map((h) => h.city)));

  return (
    <div>
      <Navbar />
      <PageHero
        icon={Building2}
        eyebrow={list.length > 0 ? `${list.length} قاعة في ${cities.length} مدينة` : "قاعات معتمدة"}
        title="القاعات المعتمدة"
        subtitle="قاعات من مقدمي خدمة معتمدين حسب معايير الجودة في منصة قاطرة — بأسعار معلنة وسعات واضحة."
      />

      <section className="mx-auto max-w-7xl px-5 py-14">
        {list.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="لا توجد قاعات معتمدة بعد"
            description="كن أول من ينضم كمقدم خدمة ويعرض قاعاته على المنصة."
            actionLabel="انضم كمقدم خدمة"
            actionHref="/signup?role=provider"
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((h) => (
              <Link key={h.id} href={`/halls/${h.id}`} className="group">
                <Card className="flex h-full flex-col overflow-hidden transition group-hover:-translate-y-1 group-hover:border-gold-400/60">
                  <ServiceImage src={h.images?.[0]} alt={h.name} className="h-44 w-full" />
                  <CardBody className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-navy-950">{h.name}</h3>
                      <Badge tone="gold">{formatSAR(h.base_price)}</Badge>
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-navy-900/55">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {h.city}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> {h.capacity_min}–{h.capacity_max} ضيف
                      </span>
                    </div>

                    {h.amenities?.length > 0 && (
                      <div className="mt-3 flex flex-1 flex-wrap gap-1.5">
                        {h.amenities.slice(0, 3).map((a) => (
                          <Badge key={a} tone="gray">
                            {a}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <p className="mt-3 border-t border-navy-900/8 pt-3 text-xs text-navy-900/50">
                      {h.provider_profiles?.business_name}
                    </p>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
