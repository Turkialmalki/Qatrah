"use client";

import { useTransition } from "react";
import { updateTaskStatusAction } from "@/lib/actions/provider";
import { STATUS_LABELS } from "@/lib/utils";

const OPTIONS = ["todo", "in_progress", "done", "blocked"];

export function TaskStatusSelect({ taskId, status }: { taskId: string; status: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => startTransition(() => updateTaskStatusAction(taskId, e.target.value))}
      className="rounded-lg border border-navy-900/15 px-3 py-1.5 text-sm"
    >
      {OPTIONS.map((o) => (
        <option key={o} value={o}>{STATUS_LABELS[o]}</option>
      ))}
    </select>
  );
}
