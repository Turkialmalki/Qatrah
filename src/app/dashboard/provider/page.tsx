import { createClient } from "@/lib/db/server";
import { PageHeader } from "@/components/dashboard/shell";
import { Card } from "@/components/ui/card";
import { formatSAR } from "@/lib/utils";
import { Building2, ListChecks, Inbox, Wallet, Star } from "lucide-react";
import type { ProviderProfile } from "@/lib/types/database";

export default async function ProviderOverview() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: pp }, { count: hallsCount }, { count: servicesCount }, { count: requestsCount }, { data: settlements }] =
    await Promise.all([
      supabase.from("provider_profiles").select("*").eq("id", user!.id).single(),
      supabase.from("halls").select("id", { count: "exact", head: true }).eq("provider_id", user!.id),
      supabase.from("services").select("id", { count: "exact", head: true }).eq("provider_id", user!.id),
      supabase.from("matches").select("id", { count: "exact", head: true }).eq("provider_id", user!.id).eq("status", "proposed"),
      supabase.from("settlements").select("net_payout").eq("provider_id", user!.id),
    ]);

  const provider = pp as ProviderProfile | null;
  const totalPayout = (settlements ?? []).reduce((s, r) => s + Number(r.net_payout), 0);

  return (
    <div>
      <PageHeader title="نظرة عامة" subtitle={`مرحباً ${provider?.business_name ?? ""}`} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={Building2} label="القاعات" value={String(hallsCount ?? 0)} />
        <StatCard icon={ListChecks} label="الخدمات" value={String(servicesCount ?? 0)} />
        <StatCard icon={Inbox} label="طلبات جديدة" value={String(requestsCount ?? 0)} />
        <StatCard icon={Wallet} label="إجمالي المستحقات" value={formatSAR(totalPayout)} />
        <StatCard icon={Star} label="تقييم الجودة" value={`${provider?.quality_score ?? 0}/5`} />
      </div>

      <Card className="mt-8 p-6">
        <h2 className="mb-2 font-bold text-navy-950">مؤشر التسعير العادل</h2>
        <p className="text-sm text-navy-900/60">
          مؤشرك الحالي: <span className="font-bold text-gold-600">{provider?.fair_price_index ?? 1}</span> — كلما اقترب من 1
          كانت أسعارك متوافقة أكثر مع متوسط السوق لنفس الفئة والمدينة.
        </p>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: string }) {
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
