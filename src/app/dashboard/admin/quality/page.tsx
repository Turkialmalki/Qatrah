import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/shell";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatSAR, STATUS_LABELS } from "@/lib/utils";
import { QualityActions } from "./quality-actions";

export default async function AdminQualityPage() {
  const supabase = await createClient();
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, provider_profiles(business_name), events(title), quality_checks(*)")
    .in("status", ["paid", "in_progress", "completed"])
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader title="مراقبة الجودة" subtitle="راجع الحجوزات المدفوعة واعتمد جودة التنفيذ" />
      <div className="space-y-3">
        {(bookings ?? []).map((b) => {
          const qc = Array.isArray(b.quality_checks) ? b.quality_checks[0] : b.quality_checks;
          return (
            <Card key={b.id}>
              <CardBody className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-navy-950">{(b.events as { title: string } | null)?.title}</span>
                    <Badge tone="navy">{(b.provider_profiles as { business_name: string } | null)?.business_name}</Badge>
                    {qc && <Badge tone={qc.status === "passed" ? "green" : qc.status === "flagged" ? "gold" : "red"}>{STATUS_LABELS[qc.status]}</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-navy-900/50">{formatSAR(b.amount)}</p>
                </div>
                <QualityActions bookingId={b.id} currentStatus={qc?.status} />
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
