import Link from "next/link";
import { createClient } from "@/lib/db/server";
import { PageHeader } from "@/components/dashboard/shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatSAR, formatDate, EVENT_TYPE_LABELS, STATUS_LABELS } from "@/lib/utils";
import type { EventRow } from "@/lib/types/database";
import { Calendar, Wallet, CheckCircle2, Clock } from "lucide-react";

export default async function ClientOverview() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("client_id", user!.id)
    .order("created_at", { ascending: false });

  const list = (events ?? []) as EventRow[];
  const active = list.filter((e) => !["completed", "cancelled"].includes(e.status));
  const totalBudget = list.reduce((s, e) => s + Number(e.total_budget), 0);
  const completed = list.filter((e) => e.status === "completed").length;

  return (
    <div>
      <PageHeader
        title="نظرة عامة"
        subtitle="تابع مناسباتك وميزانياتك من مكان واحد"
        action={<Button href="/dashboard/client/events/new">+ مناسبة جديدة</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Calendar} label="مناسبات نشطة" value={String(active.length)} />
        <StatCard icon={Wallet} label="إجمالي الميزانيات" value={formatSAR(totalBudget)} />
        <StatCard icon={CheckCircle2} label="مناسبات مكتملة" value={String(completed)} />
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-bold text-navy-950">مناسباتي</h2>
        {list.length === 0 ? (
          <Card className="p-10 text-center">
            <Clock className="mx-auto mb-3 h-8 w-8 text-navy-900/30" />
            <p className="text-navy-900/60">لا توجد مناسبات بعد. أنشئ مناسبتك الأولى الآن.</p>
            <Button href="/dashboard/client/events/new" className="mt-4">إنشاء مناسبة</Button>
          </Card>
        ) : (
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
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-100 text-gold-600">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs text-navy-900/50">{label}</div>
          <div className="text-lg font-extrabold text-navy-950">{value}</div>
        </div>
      </div>
    </Card>
  );
}
