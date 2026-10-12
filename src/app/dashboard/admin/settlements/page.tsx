import { createClient } from "@/lib/db/server";
import { PageHeader } from "@/components/dashboard/shell";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatSAR } from "@/lib/utils";

export default async function AdminSettlementsPage() {
  const supabase = await createClient();
  const { data: settlements } = await supabase
    .from("settlements")
    .select("*, provider_profiles(business_name)")
    .order("created_at", { ascending: false });

  const list = settlements ?? [];
  const totalCommission = list.reduce((s, r) => s + Number(r.commission_amount), 0);
  const totalPayout = list.reduce((s, r) => s + Number(r.net_payout), 0);

  return (
    <div>
      <PageHeader title="التسوية المالية" subtitle={`إجمالي العمولات: ${formatSAR(totalCommission)} · إجمالي المستحقات: ${formatSAR(totalPayout)}`} />
      <div className="space-y-3">
        {list.map((s) => (
          <Card key={s.id}>
            <CardBody className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="font-bold text-navy-950">{(s.provider_profiles as { business_name: string } | null)?.business_name}</span>
                <p className="mt-1 text-xs text-navy-900/50">إجمالي {formatSAR(s.gross_amount)} · عمولة {formatSAR(s.commission_amount)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-green-800">{formatSAR(s.net_payout)}</span>
                <Badge tone={s.status === "released" ? "green" : "gold"}>{s.status === "released" ? "تم الصرف" : "بانتظار الصرف"}</Badge>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
