import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/db/server";
import { PageHeader, SectionTitle } from "@/components/dashboard/shell";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  formatSAR,
  formatDate,
  CATEGORY_LABELS,
  STATUS_LABELS,
  EVENT_TYPE_LABELS,
  trackForEventType,
} from "@/lib/utils";
import type {
  Booking,
  ConferenceDetails,
  EventRequirement,
  EventRow,
  ExecutionTask,
  MatchRow,
  ProviderProfile,
} from "@/lib/types/database";
import { RunMatchingButton, AcceptMatchButton, PayButton } from "./actions-client";
import { EvaluationForm } from "./evaluation-form";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Circle,
  ClipboardList,
  Clock,
  Languages,
  Mic2,
  Palette,
  Presentation,
  Projector,
  UserCheck,
} from "lucide-react";

export const metadata = { title: "تفاصيل المناسبة" };

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase.from("events").select("*").eq("id", id).single();
  if (!event) notFound();

  const ev = event as EventRow;
  const isConference = trackForEventType(ev.event_type) === "conference";

  const [
    { data: requirements },
    { data: matches },
    { data: bookings },
    { data: tasks },
    { data: conference },
    { data: designCount },
  ] = await Promise.all([
    supabase.from("event_requirements").select("*").eq("event_id", id),
    supabase
      .from("matches")
      .select("*, provider_profiles(*)")
      .eq("event_id", id)
      .order("match_score", { ascending: false }),
    supabase.from("bookings").select("*, provider_profiles(*)").eq("event_id", id),
    supabase.from("execution_tasks").select("*").eq("event_id", id).order("sort_order"),
    isConference
      ? supabase.from("conference_details").select("*").eq("event_id", id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from("design_concepts").select("id, is_selected").eq("event_id", id),
  ]);

  const reqs = (requirements ?? []) as EventRequirement[];
  const matchList = (matches ?? []) as (MatchRow & { provider_profiles: ProviderProfile })[];
  const bookingList = (bookings ?? []) as (Booking & { provider_profiles: ProviderProfile })[];
  const taskList = (tasks ?? []) as ExecutionTask[];
  const conf = conference as ConferenceDetails | null;
  const designs = (designCount ?? []) as { id: string; is_selected: boolean }[];

  const { data: evaluatedBookingIds } = await supabase
    .from("evaluations")
    .select("booking_id")
    .in("booking_id", bookingList.length > 0 ? bookingList.map((b) => b.id) : ["-"]);
  const evaluatedSet = new Set((evaluatedBookingIds ?? []).map((e) => e.booking_id));

  const bookedProviderIds = new Set(bookingList.map((b) => b.provider_id));
  const tasksDone = taskList.filter((t) => t.status === "done").length;

  return (
    <div>
      <PageHeader
        title={ev.title}
        subtitle={`${EVENT_TYPE_LABELS[ev.event_type]} · ${ev.city} · ${ev.guest_count} ${
          isConference ? "حاضر" : "ضيف"
        } · ${formatDate(ev.event_date)}`}
        backHref="/dashboard/client/events"
        backLabel="كل مناسباتي"
        action={
          <Badge tone="gold" className="text-sm">
            {STATUS_LABELS[ev.status]}
          </Badge>
        }
      />

      {/* ---- quick links to the module pages ---- */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <ModuleLink
          href={`/dashboard/client/events/${id}/design`}
          icon={Palette}
          title="إدارة التصميم"
          hint={
            designs.length === 0
              ? "لم تُضف تصاميم بعد"
              : designs.some((d) => d.is_selected)
                ? `${designs.length} تصميم · تم اعتماد تصميم`
                : `${designs.length} تصميم · لم يُعتمد بعد`
          }
        />
        <ModuleLink
          href={`/dashboard/client/events/${id}/execution`}
          icon={ClipboardList}
          title="خطة التنفيذ"
          hint={taskList.length === 0 ? "تُبنى بعد إتمام الدفع" : `${tasksDone} من ${taskList.length} مهمة منجزة`}
        />
      </div>

      {/* ---- conference specifics ---- */}
      {isConference && conf && (
        <Card className="mb-6">
          <CardBody>
            <SectionTitle title="تفاصيل الفعالية" hint={conf.organizer_entity ?? undefined} />
            <div className="grid gap-4 sm:grid-cols-3">
              <ConfStat icon={CalendarDays} label="عدد الأيام" value={conf.days_count} />
              <ConfStat icon={Presentation} label="عدد الجلسات" value={conf.sessions_count} />
              <ConfStat icon={Mic2} label="عدد المتحدثين" value={conf.speakers_count} />
            </div>

            <div className="mt-5 flex flex-wrap gap-2 border-t border-navy-900/8 pt-4">
              {conf.needs_av && <Badge tone="navy">تجهيزات صوت وعرض</Badge>}
              {conf.needs_translation && <Badge tone="navy">ترجمة فورية</Badge>}
              {conf.needs_booths && <Badge tone="navy">{conf.booths_count} جناح عرض</Badge>}
              {conf.needs_registration && <Badge tone="navy">مكتب تسجيل</Badge>}
              {conf.needs_security && <Badge tone="navy">تنظيم وأمن</Badge>}
              {conf.needs_transport && <Badge tone="navy">نقل الحضور</Badge>}
            </div>

            {conf.agenda_notes && (
              <p className="mt-4 rounded-xl bg-cream-dark/60 px-3.5 py-3 text-sm leading-7 text-navy-900/70">
                {conf.agenda_notes}
              </p>
            )}
          </CardBody>
        </Card>
      )}

      {/* ---- budget allocation (module 9) ---- */}
      <Card className="mb-6">
        <CardBody>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-bold text-navy-950">توزيع الميزانية الذكي</h2>
            <span className="font-bold text-gold-600">{formatSAR(ev.total_budget)}</span>
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

      {/* ---- matching results (module 5) ---- */}
      <Card className="mb-6">
        <CardBody>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-navy-950">مطابقات محرك المطابقة الذكية</h2>
              <p className="text-xs text-navy-900/50">مرتبة حسب التوافق مع ميزانيتك، جودة المزود، والمدينة</p>
            </div>
            <RunMatchingButton eventId={id} />
          </div>

          {matchList.length === 0 ? (
            <p className="py-6 text-center text-sm text-navy-900/50">
              لم تُشغَّل المطابقة بعد. اضغط على تشغيل المطابقة لاستعراض أفضل مقدمي الخدمة.
            </p>
          ) : (
            <div className="space-y-3">
              {matchList.map((m) => {
                const alreadyBooked = bookedProviderIds.has(m.provider_id);
                return (
                  <div
                    key={m.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-navy-900/8 p-4"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
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
                        {CATEGORY_LABELS[m.provider_profiles?.category ?? "other"]} · تقييم الجودة{" "}
                        {m.provider_profiles?.quality_score ?? 0}/5
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

      {/* ---- bookings & payment ---- */}
      {bookingList.length > 0 && (
        <Card className="mb-6">
          <CardBody>
            <h2 className="mb-4 font-bold text-navy-950">الحجوزات والدفع</h2>
            <div className="space-y-3">
              {bookingList.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-navy-900/8 p-4"
                >
                  <div>
                    <div className="font-semibold text-navy-950">{b.provider_profiles?.business_name}</div>
                    <div className="text-xs text-navy-900/50">{formatSAR(b.amount)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={b.status === "pending_payment" ? "gray" : "green"}>{STATUS_LABELS[b.status]}</Badge>
                    {b.status === "pending_payment" && <PayButton eventId={id} bookingId={b.id} />}
                    {(b.status === "paid" || b.status === "in_progress") &&
                      !evaluatedSet.has(b.id) &&
                      ev.status === "completed" && (
                        <EvaluationForm eventId={id} bookingId={b.id} providerId={b.provider_id} />
                      )}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* ---- execution plan preview (modules 10/11) ---- */}
      {taskList.length > 0 && (
        <Card>
          <CardBody>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-bold text-navy-950">خطة التنفيذ الذكية</h2>
              <Link
                href={`/dashboard/client/events/${id}/execution`}
                className="text-xs font-bold text-gold-600 hover:underline"
              >
                إدارة الخطة ←
              </Link>
            </div>
            <ol className="space-y-3">
              {taskList.slice(0, 6).map((t) => (
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
            {taskList.length > 6 && (
              <p className="mt-3 text-xs text-navy-900/45">و{taskList.length - 6} مهمة أخرى في صفحة خطة التنفيذ</p>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function ModuleLink({
  href,
  icon: Icon,
  title,
  hint,
}: {
  href: string;
  icon: typeof Palette;
  title: string;
  hint: string;
}) {
  return (
    <Link href={href} className="group">
      <Card className="flex items-center gap-4 p-4 transition group-hover:border-gold-400/60">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-100">
          <Icon className="h-4 w-4 text-gold-600" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-navy-950">{title}</div>
          <div className="text-xs text-navy-900/55">{hint}</div>
        </div>
        <ArrowLeft className="h-4 w-4 shrink-0 text-gold-600 transition group-hover:-translate-x-1" />
      </Card>
    </Link>
  );
}

function ConfStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Projector | typeof Languages | typeof UserCheck;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-cream-dark/60 p-3.5">
      <Icon className="h-4 w-4 shrink-0 text-gold-600" />
      <div>
        <div className="text-xs font-semibold text-navy-900/55">{label}</div>
        <div className="text-lg font-extrabold text-navy-950">{value}</div>
      </div>
    </div>
  );
}
