import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/shell";
import { Card, CardBody } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { ExecutionTask, EventRow } from "@/lib/types/database";
import { TaskStatusSelect } from "./task-status-select";

export default async function ProviderTasksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: tasks } = await supabase
    .from("execution_tasks")
    .select("*, events(title)")
    .eq("owner_provider_id", user!.id)
    .order("due_date");

  const list = (tasks ?? []) as (ExecutionTask & { events: Pick<EventRow, "title"> })[];

  return (
    <div>
      <PageHeader title="مهام التنفيذ" subtitle="تابع مهامك ضمن خطة التنفيذ الذكية لكل مناسبة" />
      {list.length === 0 ? (
        <Card className="p-10 text-center text-navy-900/50">لا توجد مهام مسندة إليك حالياً</Card>
      ) : (
        <div className="space-y-3">
          {list.map((t) => (
            <Card key={t.id}>
              <CardBody className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-navy-950">{t.title}</div>
                  <div className="text-xs text-navy-900/50">{t.events?.title} · موعد الاستحقاق {formatDate(t.due_date)}</div>
                </div>
                <TaskStatusSelect taskId={t.id} status={t.status} />
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
