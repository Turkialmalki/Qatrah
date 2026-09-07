"use client";

import { useState } from "react";
import { submitEvaluationAction } from "@/lib/actions/events";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

function StarInput({ name, label }: { name: string; label: string }) {
  const [value, setValue] = useState(5);
  return (
    <div>
      <input type="hidden" name={name} value={value} />
      <div className="mb-1 text-xs text-navy-900/60">{label}</div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} onClick={() => setValue(n)}>
            <Star className={`h-5 w-5 ${n <= value ? "fill-gold-400 text-gold-400" : "text-navy-900/20"}`} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function EvaluationForm({ eventId, bookingId, providerId }: { eventId: string; bookingId: string; providerId: string }) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return <Button size="sm" variant="outline" onClick={() => setOpen(true)}>قيّم التجربة</Button>;
  }
  return (
    <form action={submitEvaluationAction} className="w-full space-y-3 rounded-xl border border-gold-400/40 bg-gold-100/30 p-4">
      <input type="hidden" name="event_id" value={eventId} />
      <input type="hidden" name="booking_id" value={bookingId} />
      <input type="hidden" name="provider_id" value={providerId} />
      <div className="grid grid-cols-3 gap-4">
        <StarInput name="rating_quality" label="الجودة" />
        <StarInput name="rating_price" label="السعر" />
        <StarInput name="rating_timeliness" label="الالتزام بالوقت" />
      </div>
      <textarea name="comment" placeholder="أضف تعليقاً (اختياري)" className="w-full rounded-lg border border-navy-900/15 p-2 text-sm" rows={2} />
      <Button size="sm" type="submit">إرسال التقييم</Button>
    </form>
  );
}
