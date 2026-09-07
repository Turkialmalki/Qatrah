"use client";

import { useTransition } from "react";
import { setProviderStatusAction } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

export function ProviderActions({ providerId, status }: { providerId: string; status: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex gap-2">
      {status !== "approved" && (
        <Button size="sm" disabled={pending} onClick={() => startTransition(() => setProviderStatusAction(providerId, "approved"))}>
          اعتماد
        </Button>
      )}
      {status !== "rejected" && (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => startTransition(() => setProviderStatusAction(providerId, "rejected"))}>
          رفض
        </Button>
      )}
      {status === "approved" && (
        <Button size="sm" variant="danger" disabled={pending} onClick={() => startTransition(() => setProviderStatusAction(providerId, "suspended"))}>
          إيقاف
        </Button>
      )}
    </div>
  );
}
