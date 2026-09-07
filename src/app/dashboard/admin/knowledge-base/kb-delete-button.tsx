"use client";

import { useTransition } from "react";
import { deleteKbArticleAction } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

export function KbDeleteButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button size="sm" variant="danger" disabled={pending} onClick={() => startTransition(() => deleteKbArticleAction(id))}>
      حذف
    </Button>
  );
}
