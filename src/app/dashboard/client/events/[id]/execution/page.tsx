import { notFound } from "next/navigation";
import { createClient } from "@/lib/db/server";
import { PageHeader } from "@/components/dashboard/shell";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stat, StatGrid } from "@/components/ui/stat";
import { EmptyState } from "@/components/ui/empty-state";
import { CATEGORY_LABELS, STATUS_LABELS, formatDate } from "@/lib/utils";
import { CalendarCheck, CircleDashed, ClipboardList, ListChecks } from "lucide-react";
import type { EventRow, ExecutionTask } from "@/lib/types/database";
import { TaskToggle } from "./task-toggle";

export const metadata = { title: "خطة التنفيذ" };

export default async function EventExecutionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase.from("events").select("*").eq("id", id).single();
  if (!event) notFound();

  const { data: tasks } = await supabase
    .from("execution_tasks")
    .select("*")
    .eq("event_id", id)
    .order("sort_order");

  const ev = event as EventRow;
  const list = (tasks ?? []) as ExecutionTask[];

  const done = list.filter((t) => t.status === "done").length;
  const inProgress = list.filter((t) => t.status === "in_progress").length;
  const progress = list.length > 0 ? Math.round((done / list.length) * 100) : 0;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <PageHeader
        title="خطة التنفيذ"
        subtitle={`الجدول الزمني لـ «${ev.title}» — مبني تلقائياً بالعمل عكسياً من تاريخ المناسبة`}
        backHref={`/dashboard/client/events/${id}`}
        backLabel="رجوع إلى المناسبة"
        action={<Badge tone="gold">{STATUS_LABELS[ev.status]}</Badge>}
      />

      {list.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="لم تُبنَ خطة التنفيذ بعد"
          description="تُولَّد الخطة تلقائياً بعد دفع جميع حجوزات المناسبة وتحديد تاريخها."
          actionLabel="رجوع إلى المناسبة"
          actionHref={`/dashboard/client/events/${id}`}
        />
      ) : (
        <>
          <StatGrid className="mb-6 lg:grid-cols-3">
            <Stat label="نسبة الإنجاز" value={`${progress}٪`} hint={`${done} من ${list.length} مهمة`} icon={ListChecks} />
            <Stat label="قيد التنفيذ" value={inProgress} icon={CircleDashed} />
            <Stat label="تاريخ المناسبة" value={formatDate(ev.event_date)} icon={CalendarCheck} />
          </StatGrid>

          <Card className="mb-6">
            <CardBody>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-semibold text-navy-900">تقدم التنفيذ</span>
                <span className="font-bold text-gold-600">{progress}٪</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-navy-900/8">
                <div className="h-full gold-gradient transition-all" style={{ width: `${progress}%` }} />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <ol className="space-y-1">
                {list.map((t) => {
                  const overdue = t.status !== "done" && t.due_date != null && t.due_date < today;
                  return (
                    <li
                      key={t.id}
                      className="flex flex-wrap items-center gap-3 rounded-xl px-2 py-3 transition hover:bg-cream-dark/50"
                    >
                      <TaskToggle eventId={id} taskId={t.id} status={t.status} />
                      <div className="min-w-0 flex-1">
                        <span
                          className={
                            t.status === "done"
                              ? "text-sm font-medium text-navy-900/45 line-through"
                              : "text-sm font-medium text-navy-900"
                          }
                        >
                          {t.title}
                        </span>
                        {t.category && (
                          <span className="mt-0.5 block text-xs text-navy-900/45">{CATEGORY_LABELS[t.category]}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {overdue && <Badge tone="red">متأخرة</Badge>}
                        <span className="text-xs text-navy-900/50">{formatDate(t.due_date)}</span>
                      </div>
                    </li>
                  );
                })}
              </ol>
              <p className="mt-4 border-t border-navy-900/8 pt-3 text-xs text-navy-900/45">
                اضغط على الدائرة لتغيير حالة المهمة: لم تبدأ ← جاري التنفيذ ← منجزة
              </p>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
