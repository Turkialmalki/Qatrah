import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/shell";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatSAR, CATEGORY_LABELS } from "@/lib/utils";
import type { ServiceItem } from "@/lib/types/database";
import { NewServiceForm } from "./new-service-form";
import { ServiceRowActions } from "./service-row-actions";

export default async function ServicesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: services } = await supabase.from("services").select("*").eq("provider_id", user!.id).order("created_at", { ascending: false });
  const list = (services ?? []) as ServiceItem[];

  return (
    <div>
      <PageHeader title="خدماتي" subtitle="أضف الخدمات التي تقدمها ليتم مطابقتها مع احتياجات العملاء" />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {list.length === 0 && <Card className="p-10 text-center text-navy-900/50">لا توجد خدمات مضافة بعد</Card>}
          {list.map((s) => (
            <Card key={s.id}>
              <CardBody className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-navy-950">{s.title}</span>
                    <Badge tone="navy">{CATEGORY_LABELS[s.category]}</Badge>
                    <Badge tone={s.is_active ? "green" : "gray"}>{s.is_active ? "مفعّلة" : "متوقفة"}</Badge>
                  </div>
                  {s.description && <p className="mt-1 text-xs text-navy-900/50">{s.description}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-navy-950">{formatSAR(s.base_price)}</span>
                  <ServiceRowActions id={s.id} isActive={s.is_active} />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
        <NewServiceForm />
      </div>
    </div>
  );
}
