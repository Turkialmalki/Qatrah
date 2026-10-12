"use client";

import { useTransition } from "react";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import clsx from "clsx";
import { updateEventTaskStatusAction } from "@/lib/actions/events";

const NEXT_STATUS: Record<string, string> = {
  todo: "in_progress",
  in_progress: "done",
  done: "todo",
  blocked: "in_progress",
};

/** Cycles a task through todo → in progress → done. */
export function TaskToggle({
  eventId,
  taskId,
  status,
}: {
  eventId: string;
  taskId: string;
  status: string;
}) {
  const [pending, start] = useTransition();
  const Icon = status === "done" ? CheckCircle2 : status === "in_progress" ? Clock : Circle;

  return (
    <button
      type="button"
      disabled={pending}
      aria-label="تغيير حالة المهمة"
      onClick={() => start(() => updateEventTaskStatusAction(eventId, taskId, NEXT_STATUS[status] ?? "todo"))}
      className={clsx(
        "shrink-0 rounded-full transition disabled:opacity-40",
        status === "done" ? "text-green-800" : status === "in_progress" ? "text-gold-600" : "text-navy-900/25",
        "hover:scale-110"
      )}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
