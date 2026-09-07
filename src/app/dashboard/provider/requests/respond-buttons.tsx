"use client";

import { useState, useTransition } from "react";
import { respondToMatchAction } from "@/lib/actions/provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RespondButtons({ matchId, currentPrice }: { matchId: string; currentPrice: number }) {
  const [pending, startTransition] = useTransition();
  const [price, setPrice] = useState(currentPrice);

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
        className="w-28"
        min={0}
      />
      <Button size="sm" disabled={pending} onClick={() => startTransition(() => respondToMatchAction(matchId, "quoted", price))}>
        إرسال عرض السعر
      </Button>
      <Button size="sm" variant="ghost" disabled={pending} onClick={() => startTransition(() => respondToMatchAction(matchId, "declined"))}>
        رفض
      </Button>
    </div>
  );
}
