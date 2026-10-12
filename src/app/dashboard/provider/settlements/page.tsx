import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stat, StatGrid } from "@/components/ui/stat";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, formatSAR, STATUS_LABELS } from "@/lib/utils";
import { Banknote, Clock, Wallet } from "lucide-react";
import type { Settlement } from "@/lib/types/database";

export const metadata = { title: "مستحقاتي" };

export default async function ProviderSettlementsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: settlements } = await supabase
    .from("settlements")
    .select("*")
    .eq("provider_id", user!.id)
    .order("created_at", { ascending: false });

  const list = (settlements ?? []) as Settlement[];
  const released = list.filter((s) => s.status === "released");
  const pending = list.filter((s) => s.status !== "released");

  const sum = (rows: Settlement[]) => rows.reduce((t, s) => t + Number(s.net_payout), 0);

  return (
    <div>
      <PageHeader
        title="مستحقاتي"
        subtitle="صافي مستحقاتك بعد عمولة المنصة على كل حجز مدفوع"
      />

      <StatGrid className="mb-6 lg:grid-cols-3">
        <Stat label="تم تحويله" value={formatSAR(sum(released))} hint={`${released.length} تسوية`} icon={Banknote} />
        <Stat label="قيد التحويل" value={formatSAR(sum(pending))} hint={`${pending.length} تسوية`} icon={Clock} />
        <Stat label="إجمالي المبيعات" value={formatSAR(list.reduce((t, s) => t + Number(s.gross_amount), 0))} icon={Wallet} />
      </StatGrid>

      {list.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="لا توجد مستحقات بعد"
          description="تُسجَّل التسوية تلقائياً بعد أن يدفع العميل قيمة الحجز."
          actionLabel="عرض الطلبات المطابقة"
          actionHref="/dashboard/provider/requests"
        />
      ) : (
        <Card>
          <div className="scroll-x">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-navy-900/8 text-right text-xs font-bold text-navy-900/55">
                  <th className="px-5 py-3">التاريخ</th>
                  <th className="px-5 py-3">قيمة الحجز</th>
                  <th className="px-5 py-3">العمولة</th>
                  <th className="px-5 py-3">الصافي لك</th>
                  <th className="px-5 py-3">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {list.map((s) => (
                  <tr key={s.id} className="border-b border-navy-900/5 last:border-0">
                    <td className="px-5 py-3.5 text-navy-900/70">{formatDate(s.created_at)}</td>
                    <td className="px-5 py-3.5 font-semibold text-navy-950">{formatSAR(s.gross_amount)}</td>
                    <td className="px-5 py-3.5 text-navy-900/60">
                      {formatSAR(s.commission_amount)}
                      <span className="text-xs text-navy-900/40"> ({Math.round(Number(s.commission_rate) * 100)}٪)</span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-green-800">{formatSAR(s.net_payout)}</td>
                    <td className="px-5 py-3.5">
                      <Badge tone={s.status === "released" ? "green" : "gold"}>
                        {STATUS_LABELS[s.status] ?? s.status}
                      </Badge>
                    </td>
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
