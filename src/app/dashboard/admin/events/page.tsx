import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/shell";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatSAR, formatDate, STATUS_LABELS, EVENT_TYPE_LABELS } from "@/lib/utils";
import type { EventRow } from "@/lib/types/database";

export default async function AdminEventsPage() {
  const supabase = await createClient();
  const { data: events } = await supabase.from("events").select("*, profiles(full_name)").order("created_at", { ascending: false });
  const list = (events ?? []) as (EventRow & { profiles: { full_name: string } })[];

  return (
    <div>
      <PageHeader title="المناسبات" subtitle="جميع مناسبات المنصة" />
      <div className="space-y-3">
        {list.map((e) => (
          <Card key={e.id}>
            <CardBody className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-navy-950">{e.title}</span>
                  <Badge tone="gold">{STATUS_LABELS[e.status]}</Badge>
                </div>
                <p className="mt-1 text-xs text-navy-900/50">
                  {e.profiles?.full_name} · {EVENT_TYPE_LABELS[e.event_type]} · {e.city} · {formatDate(e.event_date)}
                </p>
              </div>
              <span className="font-bold text-navy-950">{formatSAR(e.total_budget)}</span>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
