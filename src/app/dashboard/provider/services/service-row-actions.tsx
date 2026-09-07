"use client";

import { useTransition } from "react";
import { deleteServiceAction, toggleServiceAction } from "@/lib/actions/provider";
import { Button } from "@/components/ui/button";

export function ServiceRowActions({ id, isActive }: { id: string; isActive: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" disabled={pending} onClick={() => startTransition(() => toggleServiceAction(id, isActive))}>
        {isActive ? "إيقاف" : "تفعيل"}
      </Button>
      <Button size="sm" variant="danger" disabled={pending} onClick={() => startTransition(() => deleteServiceAction(id))}>
        حذف
      </Button>
    </div>
  );
}
