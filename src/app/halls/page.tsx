import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatSAR } from "@/lib/utils";
import { Building2, MapPin, Users } from "lucide-react";
import type { Hall, ProviderProfile } from "@/lib/types/database";

export default async function HallsPage() {
  const supabase = await createClient();
  const { data: halls } = await supabase
    .from("halls")
    .select("*, provider_profiles!inner(*)")
    .eq("is_active", true)
    .eq("provider_profiles.status", "approved")
    .order("created_at", { ascending: false });

  const list = (halls ?? []) as (Hall & { provider_profiles: ProviderProfile })[];

  return (
    <div>
      <Navbar />
      <section className="navy-gradient py-16 text-center">
        <Building2 className="mx-auto mb-3 h-8 w-8 text-gold-400" />
        <h1 className="text-3xl font-extrabold text-white">القاعات المعتمدة</h1>
        <p className="mt-2 text-cream/70">قاعات من مقدمي خدمة معتمدين حسب معايير الجودة في منصة قاطرة</p>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-14">
        {list.length === 0 ? (
          <p className="text-center text-navy-900/50">لا توجد قاعات معتمدة بعد — كن أول من ينضم كمقدم خدمة</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((h) => (
              <Card key={h.id} className="overflow-hidden">
                <div className="flex h-32 items-center justify-center navy-gradient">
                  <Building2 className="h-10 w-10 text-gold-300" />
                </div>
                <CardBody>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-navy-950">{h.name}</h3>
                    <Badge tone="gold">{formatSAR(h.base_price)}</Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-navy-900/55">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {h.city}</span>
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {h.capacity_min}-{h.capacity_max}</span>
                  </div>
                  <p className="mt-2 text-xs text-navy-900/50">{h.provider_profiles?.business_name}</p>
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
