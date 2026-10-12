import { createClient } from "@/lib/db/server";
import { PageHeader } from "@/components/dashboard/shell";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatSAR, STATUS_LABELS, EVENT_TYPE_LABELS } from "@/lib/utils";
import type { EventRow, MatchRow } from "@/lib/types/database";
import { RespondButtons } from "./respond-buttons";

export default async function RequestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: matches } = await supabase
    .from("matches")
    .select("*, events(*)")
    .eq("provider_id", user!.id)
    .order("created_at", { ascending: false });

  const list = (matches ?? []) as (MatchRow & { events: EventRow })[];

  return (
    <div>
      <PageHeader title="الطلبات المطابقة" subtitle="طلبات وصلتك عبر محرك المطابقة الذكية بناءً على قاعاتك وخدماتك" />
      {list.length === 0 ? (
        <Card className="p-10 text-center text-navy-900/50">لا توجد طلبات مطابقة حتى الآن</Card>
      ) : (
        <div className="space-y-4">
          {list.map((m) => (
            <Card key={m.id}>
              <CardBody className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-navy-950">{m.events?.title}</span>
                    <Badge tone="gold">{Math.round(m.match_score)}٪ توافق</Badge>
                    <Badge tone={m.status === "accepted" ? "green" : "navy"}>{STATUS_LABELS[m.status]}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-navy-900/50">
                    {EVENT_TYPE_LABELS[m.events?.event_type]} · {m.events?.city} · {m.events?.guest_count} ضيف
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-navy-950">{formatSAR(m.quoted_price ?? 0)}</span>
                  {m.status === "proposed" && <RespondButtons matchId={m.id} currentPrice={m.quoted_price ?? 0} />}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
