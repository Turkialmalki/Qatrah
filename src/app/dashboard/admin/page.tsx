import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/shell";
import { Card } from "@/components/ui/card";
import { formatSAR } from "@/lib/utils";
import { Users, Calendar, Wallet, ShieldCheck, Clock } from "lucide-react";

export default async function AdminOverview() {
  const supabase = await createClient();

  const [{ count: providersCount }, { count: pendingCount }, { count: eventsCount }, { data: settlements }, { count: flaggedCount }] =
    await Promise.all([
      supabase.from("provider_profiles").select("id", { count: "exact", head: true }),
      supabase.from("provider_profiles").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("events").select("id", { count: "exact", head: true }),
      supabase.from("settlements").select("commission_amount"),
      supabase.from("quality_checks").select("id", { count: "exact", head: true }).eq("status", "flagged"),
    ]);

  const totalCommission = (settlements ?? []).reduce((s, r) => s + Number(r.commission_amount), 0);

  return (
    <div>
      <PageHeader title="نظرة عامة على المنصة" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={Users} label="مقدمو الخدمة" value={String(providersCount ?? 0)} />
        <StatCard icon={Clock} label="بانتظار الاعتماد" value={String(pendingCount ?? 0)} />
        <StatCard icon={Calendar} label="إجمالي المناسبات" value={String(eventsCount ?? 0)} />
        <StatCard icon={Wallet} label="إيرادات العمولة" value={formatSAR(totalCommission)} />
        <StatCard icon={ShieldCheck} label="حالات جودة معلّقة" value={String(flaggedCount ?? 0)} />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <Card className="p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-100 text-gold-600">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="mt-3 text-xs text-navy-900/50">{label}</div>
      <div className="text-lg font-extrabold text-navy-950">{value}</div>
    </Card>
  );
}
