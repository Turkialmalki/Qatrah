import { createClient } from "@/lib/db/server";
import { PageHeader } from "@/components/dashboard/shell";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatSAR } from "@/lib/utils";
import type { Hall } from "@/lib/types/database";
import { NewHallForm } from "./new-hall-form";
import { HallRowActions } from "./hall-row-actions";

export default async function HallsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: halls } = await supabase.from("halls").select("*").eq("provider_id", user!.id).order("created_at", { ascending: false });
  const list = (halls ?? []) as Hall[];

  return (
    <div>
      <PageHeader title="قاعاتي" subtitle="أضف القاعات التي تديرها ليتم مطابقتها تلقائياً مع مناسبات العملاء" />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {list.length === 0 && <Card className="p-10 text-center text-navy-900/50">لا توجد قاعات مضافة بعد</Card>}
          {list.map((h) => (
            <Card key={h.id}>
              <CardBody className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-navy-950">{h.name}</span>
                    <Badge tone={h.is_active ? "green" : "gray"}>{h.is_active ? "مفعّلة" : "متوقفة"}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-navy-900/50">
                    {h.city} · تتسع {h.capacity_min}-{h.capacity_max} ضيف
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-navy-950">{formatSAR(h.base_price)}</span>
                  <HallRowActions id={h.id} isActive={h.is_active} />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
        <NewHallForm />
      </div>
    </div>
  );
}
