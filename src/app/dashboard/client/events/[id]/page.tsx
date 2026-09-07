import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/shell";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatSAR, formatDate, CATEGORY_LABELS, STATUS_LABELS, EVENT_TYPE_LABELS } from "@/lib/utils";
import type {
  EventRequirement,
  EventRow,
  ExecutionTask,
  MatchRow,
  ProviderProfile,
  Booking,
} from "@/lib/types/database";
import { RunMatchingButton, AcceptMatchButton, PayButton } from "./actions-client";
import { EvaluationForm } from "./evaluation-form";
import { CheckCircle2, Circle, Clock } from "lucide-react";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase.from("events").select("*").eq("id", id).single();
  if (!event) notFound();

  const { data: requirements } = await supabase.from("event_requirements").select("*").eq("event_id", id);
  const { data: matches } = await supabase
    .from("matches")
    .select("*, provider_profiles(*)")
    .eq("event_id", id)
    .order("match_score", { ascending: false });
  const { data: bookings } = await supabase.from("bookings").select("*, provider_profiles(*)").eq("event_id", id);
  const { data: tasks } = await supabase.from("execution_tasks").select("*").eq("event_id", id).order("sort_order");
  const { data: evaluatedBookingIds } = await supabase.from("evaluations").select("booking_id").in(
    "booking_id",
    ((bookings ?? []) as Booking[]).map((b) => b.id).length ? ((bookings ?? []) as Booking[]).map((b) => b.id) : ["-"]
  );
  const evaluatedSet = new Set((evaluatedBookingIds ?? []).map((e) => e.booking_id));

  const ev = event as EventRow;
  const reqs = (requirements ?? []) as EventRequirement[];
  const matchList = (matches ?? []) as (MatchRow & { provider_profiles: ProviderProfile })[];
  const bookingList = (bookings ?? []) as (Booking & { provider_profiles: ProviderProfile })[];
  const taskList = (tasks ?? []) as ExecutionTask[];

  const bookedRequirementProviderIds = new Set(bookingList.map((b) => b.provider_id));

  return (
    <div>
      <PageHeader
        title={ev.title}
        subtitle={`${EVENT_TYPE_LABELS[ev.event_type]} · ${ev.city} · ${ev.guest_count} ضيف · ${formatDate(ev.event_date)}`}
        action={<Badge tone="gold" className="text-sm">{STATUS_LABELS[ev.status]}</Badge>}
      />

      {/* Budget allocation — module 9 */}
      <Card className="mb-6">
        <CardBody>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-navy-950">توزيع الميزانية الذكي</h2>
            <span className="text-sm font-bold text-gold-600">{formatSAR(ev.total_budget)}</span>
          </div>
          <div className="space-y-3">
            {reqs.map((r) => (
              <div key={r.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-semibold text-navy-900">{CATEGORY_LABELS[r.category]}</span>
                  <span className="text-navy-900/60">{formatSAR(r.allocated_budget ?? 0)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-navy-900/8">
                  <div
                    className="h-full gold-gradient"
                    style={{ width: `${Math.min(100, ((r.allocated_budget ?? 0) / ev.total_budget) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Matching engine results — module 5 */}
      <Card className="mb-6">
        <CardBody>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-navy-950">مطابقات محرك المطابقة الذكية</h2>
              <p className="text-xs text-navy-900/50">مرتبة حسب التوافق مع ميزانيتك، جودة المزود، والمدينة</p>
            </div>
            <RunMatchingButton eventId={id} />
          </div>

          {matchList.length === 0 ? (
            <p className="py-6 text-center text-sm text-navy-900/50">لم تُشغَّل المطابقة بعد. اضغط على تشغيل المطابقة لاستعراض أفضل مقدمي الخدمة.</p>
          ) : (
            <div className="space-y-3">
              {matchList.map((m) => {
                const alreadyBooked = bookedRequirementProviderIds.has(m.provider_id);
                return (
                  <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-navy-900/8 p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-navy-950">{m.provider_profiles?.business_name}</span>
                        <Badge tone="green">{Math.round(m.match_score)}٪ توافق</Badge>
                        {m.fair_price_delta != null && (
                          <Badge tone={Math.abs(m.fair_price_delta) <= 15 ? "gold" : "red"}>
                            {m.fair_price_delta > 0 ? "+" : ""}
                            {m.fair_price_delta}٪ عن متوسط السوق
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-navy-900/50">
                        {CATEGORY_LABELS[m.provider_profiles?.category ?? "other"]} · تقييم الجودة {m.provider_profiles?.quality_score ?? 0}/5
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-navy-950">{formatSAR(m.quoted_price ?? 0)}</span>
                      {m.status === "accepted" || alreadyBooked ? (
                        <Badge tone="green">تم القبول</Badge>
                      ) : (
                        <AcceptMatchButton eventId={id} matchId={m.id} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Bookings / payment — الاعتماد والدفع */}
      {bookingList.length > 0 && (
        <Card className="mb-6">
          <CardBody>
            <h2 className="mb-4 font-bold text-navy-950">الحجوزات والدفع</h2>
            <div className="space-y-3">
              {bookingList.map((b) => (
                <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-navy-900/8 p-4">
                  <div>
                    <div className="font-semibold text-navy-950">{b.provider_profiles?.business_name}</div>
                    <div className="text-xs text-navy-900/50">{formatSAR(b.amount)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={b.status === "pending_payment" ? "gray" : "green"}>{STATUS_LABELS[b.status]}</Badge>
                    {b.status === "pending_payment" && <PayButton eventId={id} bookingId={b.id} />}
                    {(b.status === "paid" || b.status === "in_progress") && !evaluatedSet.has(b.id) && ev.status === "completed" && (
                      <EvaluationForm eventId={id} bookingId={b.id} providerId={b.provider_id} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Execution plan — module 10/11 */}
      {taskList.length > 0 && (
        <Card>
          <CardBody>
            <h2 className="mb-4 font-bold text-navy-950">خطة التنفيذ الذكية</h2>
            <ol className="space-y-3">
              {taskList.map((t) => (
                <li key={t.id} className="flex items-center gap-3">
                  {t.status === "done" ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-800" />
                  ) : t.status === "in_progress" ? (
                    <Clock className="h-5 w-5 shrink-0 text-gold-600" />
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-navy-900/25" />
                  )}
                  <span className="flex-1 text-sm font-medium text-navy-900">{t.title}</span>
                  <span className="text-xs text-navy-900/50">{formatDate(t.due_date)}</span>
                </li>
              ))}
            </ol>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
