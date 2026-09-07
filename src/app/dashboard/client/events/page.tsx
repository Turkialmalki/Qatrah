import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatSAR, formatDate, EVENT_TYPE_LABELS, STATUS_LABELS } from "@/lib/utils";
import type { EventRow } from "@/lib/types/database";

export default async function EventsListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: events } = await supabase.from("events").select("*").eq("client_id", user!.id).order("created_at", { ascending: false });
  const list = (events ?? []) as EventRow[];

  return (
    <div>
      <PageHeader title="مناسباتي" action={<Button href="/dashboard/client/events/new">+ مناسبة جديدة</Button>} />
      <div className="grid gap-4 sm:grid-cols-2">
        {list.map((e) => (
          <Link key={e.id} href={`/dashboard/client/events/${e.id}`}>
            <Card className="p-5 transition hover:-translate-y-0.5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-navy-950">{e.title}</h3>
                  <p className="mt-1 text-xs text-navy-900/50">{EVENT_TYPE_LABELS[e.event_type]} · {e.city}</p>
                </div>
                <Badge tone={e.status === "completed" ? "green" : "gold"}>{STATUS_LABELS[e.status]}</Badge>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-navy-900/60">{formatDate(e.event_date)}</span>
                <span className="font-bold text-navy-950">{formatSAR(e.total_budget)}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
