import { createClient } from "@/lib/db/server";
import { PageHeader } from "@/components/dashboard/shell";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/utils";
import type { ProviderProfile } from "@/lib/types/database";
import { ProviderActions } from "./provider-actions";

export default async function AdminProvidersPage() {
  const supabase = await createClient();
  const { data: providers } = await supabase
    .from("provider_profiles")
    .select("*, profiles(full_name, phone)")
    .order("created_at", { ascending: false });

  const list = (providers ?? []) as (ProviderProfile & { profiles: { full_name: string; phone: string | null } })[];

  return (
    <div>
      <PageHeader title="مقدمو الخدمة" subtitle="اعتماد أو رفض حسابات مقدمي الخدمة الجدد" />
      <div className="space-y-3">
        {list.map((p) => (
          <Card key={p.id}>
            <CardBody className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-navy-950">{p.business_name}</span>
                  <Badge tone="navy">{CATEGORY_LABELS[p.category]}</Badge>
                  <Badge tone={p.status === "approved" ? "green" : p.status === "rejected" ? "red" : "gold"}>{STATUS_LABELS[p.status]}</Badge>
                </div>
                <p className="mt-1 text-xs text-navy-900/50">{p.profiles?.full_name} · {p.base_city}</p>
              </div>
              <ProviderActions providerId={p.id} status={p.status} />
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
