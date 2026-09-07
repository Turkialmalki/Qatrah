"use client";

import { useState, useTransition } from "react";
import { setQualityStatusAction } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

export function QualityActions({ bookingId }: { bookingId: string; currentStatus?: string }) {
  const [pending, startTransition] = useTransition();
  const [notes, setNotes] = useState("");

  return (
    <div className="flex items-center gap-2">
      <input
        placeholder="ملاحظات (اختياري)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="rounded-lg border border-navy-900/15 px-2 py-1.5 text-xs"
      />
      <Button size="sm" disabled={pending} onClick={() => startTransition(() => setQualityStatusAction(bookingId, "passed", notes))}>
        مطابق
      </Button>
      <Button size="sm" variant="outline" disabled={pending} onClick={() => startTransition(() => setQualityStatusAction(bookingId, "flagged", notes))}>
        بحاجة مراجعة
      </Button>
      <Button size="sm" variant="danger" disabled={pending} onClick={() => startTransition(() => setQualityStatusAction(bookingId, "failed", notes))}>
        غير مطابق
      </Button>
    </div>
  );
}
