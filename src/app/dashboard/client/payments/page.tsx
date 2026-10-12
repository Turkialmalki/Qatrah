import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/shell";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stat, StatGrid } from "@/components/ui/stat";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, formatSAR, STATUS_LABELS } from "@/lib/utils";
import { CreditCard, Receipt, Wallet } from "lucide-react";
import type { Booking, EventRow, Payment, ProviderProfile } from "@/lib/types/database";

export const metadata = { title: "المدفوعات" };

export default async function ClientPaymentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, provider_profiles(*), events(id, title, event_date)")
    .eq("client_id", user!.id)
    .order("created_at", { ascending: false });

  const list = (bookings ?? []) as (Booking & {
    provider_profiles: ProviderProfile | null;
    events: Pick<EventRow, "id" | "title" | "event_date"> | null;
  })[];

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .in("booking_id", list.length > 0 ? list.map((b) => b.id) : ["-"]);

  const paymentByBooking = new Map<string, Payment>();
  for (const pay of (payments ?? []) as Payment[]) paymentByBooking.set(pay.booking_id, pay);

  const totalPaid = list
    .filter((b) => b.status !== "pending_payment" && b.status !== "cancelled")
    .reduce((sum, b) => sum + Number(b.amount), 0);
  const totalDue = list.filter((b) => b.status === "pending_payment").reduce((sum, b) => sum + Number(b.amount), 0);

  return (
    <div>
      <PageHeader title="المدفوعات" subtitle="كل حجوزاتك ومدفوعاتها في مكان واحد" />

      <StatGrid className="mb-6 lg:grid-cols-3">
        <Stat label="إجمالي المدفوع" value={formatSAR(totalPaid)} icon={Wallet} />
        <Stat label="بانتظار الدفع" value={formatSAR(totalDue)} icon={CreditCard} />
        <Stat label="عدد الحجوزات" value={list.length} icon={Receipt} />
      </StatGrid>

      {list.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="لا توجد حجوزات بعد"
          description="أنشئ مناسبة، شغّل المطابقة، واعتمد أحد العروض ليظهر الحجز هنا."
          actionLabel="إنشاء مناسبة"
          actionHref="/dashboard/client/events/new"
        />
      ) : (
        <div className="space-y-3">
          {list.map((b) => {
            const pay = paymentByBooking.get(b.id);
            return (
              <Card key={b.id}>
                <CardBody className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-navy-950">{b.provider_profiles?.business_name ?? "مقدم خدمة"}</span>
                      <Badge tone={b.status === "pending_payment" ? "gold" : b.status === "cancelled" ? "red" : "green"}>
                        {STATUS_LABELS[b.status]}
                      </Badge>
                    </div>
                    {b.events && (
                      <Link
                        href={`/dashboard/client/events/${b.events.id}`}
                        className="mt-1.5 block text-xs font-semibold text-navy-900/60 transition hover:text-gold-600"
                      >
                        {b.events.title} · {formatDate(b.events.event_date)} ←
                      </Link>
                    )}
                    <p className="mt-1 text-xs text-navy-900/45">
                      {pay?.paid_at ? `تم الدفع في ${formatDate(pay.paid_at)}` : "لم يتم الدفع بعد"}
                      {pay?.method && pay.status === "paid" ? ` · ${pay.method === "card" ? "بطاقة" : pay.method}` : ""}
                    </p>
                  </div>

                  <div className="text-left">
                    <div className="text-lg font-extrabold text-navy-950">{formatSAR(b.amount)}</div>
                    {b.status === "pending_payment" && b.events && (
                      <Link
                        href={`/dashboard/client/events/${b.events.id}`}
                        className="text-xs font-bold text-gold-600 hover:underline"
                      >
                        إتمام الدفع ←
                      </Link>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
