"use client";

import { useTransition } from "react";
import { deleteHallAction, toggleHallAction } from "@/lib/actions/provider";
import { Button } from "@/components/ui/button";

export function HallRowActions({ id, isActive }: { id: string; isActive: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" disabled={pending} onClick={() => startTransition(() => toggleHallAction(id, isActive))}>
        {isActive ? "إيقاف" : "تفعيل"}
      </Button>
      <Button size="sm" variant="danger" disabled={pending} onClick={() => startTransition(() => deleteHallAction(id))}>
        حذف
      </Button>
    </div>
  );
}
