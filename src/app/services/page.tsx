import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatSAR, CATEGORY_LABELS } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import type { ServiceItem, ProviderProfile } from "@/lib/types/database";

export default async function ServicesPage() {
  const supabase = await createClient();
  const { data: services } = await supabase
    .from("services")
    .select("*, provider_profiles!inner(*)")
    .eq("is_active", true)
    .eq("provider_profiles.status", "approved")
    .order("created_at", { ascending: false });

  const list = (services ?? []) as (ServiceItem & { provider_profiles: ProviderProfile })[];

  return (
    <div>
      <Navbar />
      <section className="navy-gradient py-16 text-center">
        <Sparkles className="mx-auto mb-3 h-8 w-8 text-gold-400" />
        <h1 className="text-3xl font-extrabold text-white">خدمات المناسبات</h1>
        <p className="mt-2 text-cream/70">تصوير، ديكور، ضيافة، وموسيقى من مقدمي خدمة معتمدين</p>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-14">
        {list.length === 0 ? (
          <p className="text-center text-navy-900/50">لا توجد خدمات معتمدة بعد — كن أول من ينضم كمقدم خدمة</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((s) => (
              <Card key={s.id}>
                <CardBody>
                  <div className="flex items-center justify-between">
                    <Badge tone="navy">{CATEGORY_LABELS[s.category]}</Badge>
                    <span className="font-bold text-gold-600">{formatSAR(s.base_price)}</span>
                  </div>
                  <h3 className="mt-2 font-bold text-navy-950">{s.title}</h3>
                  {s.description && <p className="mt-1 text-sm text-navy-900/60">{s.description}</p>}
                  <p className="mt-2 text-xs text-navy-900/50">{s.provider_profiles?.business_name}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
