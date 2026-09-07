"use client";

import { useTransition } from "react";
import { runMatchingAction, acceptMatchAction, payBookingAction } from "@/lib/actions/events";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function RunMatchingButton({ eventId }: { eventId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="secondary"
      disabled={pending}
      onClick={() => startTransition(() => runMatchingAction(eventId))}
    >
      <Sparkles className="h-4 w-4" /> {pending ? "جاري المطابقة..." : "تشغيل المطابقة"}
    </Button>
  );
}

export function AcceptMatchButton({ eventId, matchId }: { eventId: string; matchId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button size="sm" disabled={pending} onClick={() => startTransition(() => acceptMatchAction(eventId, matchId))}>
      {pending ? "..." : "قبول العرض"}
    </Button>
  );
}

export function PayButton({ eventId, bookingId }: { eventId: string; bookingId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button size="sm" disabled={pending} onClick={() => startTransition(() => payBookingAction(eventId, bookingId))}>
      {pending ? "جاري الدفع..." : "الدفع الآن"}
    </Button>
  );
}
