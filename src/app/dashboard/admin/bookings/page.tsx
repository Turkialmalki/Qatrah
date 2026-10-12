import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stat, StatGrid } from "@/components/ui/stat";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, formatSAR, STATUS_LABELS } from "@/lib/utils";
import { CreditCard, Receipt, TrendingUp, Wallet } from "lucide-react";
import type { Booking, EventRow, Profile, ProviderProfile } from "@/lib/types/database";

export const metadata = { title: "الحجوزات والمدفوعات" };

export default async function AdminBookingsPage() {
  const supabase = await createClient();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, provider_profiles(business_name), profiles(full_name), events(title, event_date)")
    .order("created_at", { ascending: false })
    .limit(200);

  const list = (bookings ?? []) as (Booking & {
    provider_profiles: Pick<ProviderProfile, "business_name"> | null;
    profiles: Pick<Profile, "full_name"> | null;
    events: Pick<EventRow, "title" | "event_date"> | null;
  })[];

  const paid = list.filter((b) => b.status !== "pending_payment" && b.status !== "cancelled");
  const gmv = paid.reduce((t, b) => t + Number(b.amount), 0);
  const pendingValue = list
    .filter((b) => b.status === "pending_payment")
    .reduce((t, b) => t + Number(b.amount), 0);

  return (
    <div>
      <PageHeader title="الحجوزات والمدفوعات" subtitle="متابعة كل الحجوزات على المنصة وحالة تحصيلها" />

      <StatGrid className="mb-6">
        <Stat label="حجم المبيعات المحصّلة" value={formatSAR(gmv)} icon={TrendingUp} />
        <Stat label="عمولة المنصة (١٠٪)" value={formatSAR(Math.round(gmv * 0.1))} icon={Wallet} />
        <Stat label="بانتظار الدفع" value={formatSAR(pendingValue)} icon={CreditCard} />
        <Stat label="عدد الحجوزات" value={list.length} icon={Receipt} />
      </StatGrid>

      {list.length === 0 ? (
        <EmptyState icon={Receipt} title="لا توجد حجوزات بعد" description="تظهر الحجوزات هنا بعد أن يعتمد العملاء العروض المطابقة." />
      ) : (
        <Card>
          <div className="scroll-x">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-navy-900/8 text-right text-xs font-bold text-navy-900/55">
                  <th className="px-5 py-3">المناسبة</th>
                  <th className="px-5 py-3">العميل</th>
                  <th className="px-5 py-3">مقدم الخدمة</th>
                  <th className="px-5 py-3">القيمة</th>
                  <th className="px-5 py-3">الحالة</th>
                  <th className="px-5 py-3">تاريخ الحجز</th>
                </tr>
              </thead>
              <tbody>
                {list.map((b) => (
                  <tr key={b.id} className="border-b border-navy-900/5 last:border-0">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-navy-950">{b.events?.title ?? "—"}</div>
                      <div className="text-xs text-navy-900/45">{formatDate(b.events?.event_date ?? null)}</div>
                    </td>
                    <td className="px-5 py-3.5 text-navy-900/70">{b.profiles?.full_name ?? "—"}</td>
                    <td className="px-5 py-3.5 text-navy-900/70">{b.provider_profiles?.business_name ?? "—"}</td>
                    <td className="px-5 py-3.5 font-bold text-navy-950">{formatSAR(b.amount)}</td>
                    <td className="px-5 py-3.5">
                      <Badge tone={b.status === "pending_payment" ? "gold" : b.status === "cancelled" ? "red" : "green"}>
                        {STATUS_LABELS[b.status]}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-navy-900/55">{formatDate(b.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
