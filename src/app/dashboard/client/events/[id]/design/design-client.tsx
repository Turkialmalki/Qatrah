"use client";

import { useActionState, useTransition } from "react";
import { Check, Trash2 } from "lucide-react";
import {
  createDesignConceptAction,
  deleteDesignConceptAction,
  selectDesignConceptAction,
  type FormState,
} from "@/lib/actions/design";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { ImageField } from "@/components/ui/image-field";

const initialState: FormState = {};

export function NewDesignForm({ eventId }: { eventId: string }) {
  const [state, formAction, pending] = useActionState(createDesignConceptAction, initialState);

  return (
    <Card className="h-fit">
      <CardBody>
        <h3 className="font-bold text-navy-950">إضافة تصميم</h3>
        <p className="mt-1 text-xs leading-5 text-navy-900/55">
          ارفع صورة مرجعية ولوحة ألوان لتوحيد التصور مع مقدم خدمة الديكور.
        </p>

        <form action={formAction} className="mt-4 space-y-4">
          <input type="hidden" name="event_id" value={eventId} />

          <div>
            <Label htmlFor="title">عنوان التصميم</Label>
            <Input id="title" name="title" required placeholder="مثال: تصور كلاسيكي ذهبي" />
          </div>

          <ImageField name="image" label="صورة مرجعية" hint="صورة توضح الطابع المطلوب" />

          <div>
            <Label htmlFor="style">الطابع</Label>
            <Input id="style" name="style" placeholder="كلاسيكي، عصري، نجدي..." />
          </div>

          <div>
            <Label htmlFor="palette">لوحة الألوان</Label>
            <Textarea
              id="palette"
              name="palette"
              className="min-h-16"
              placeholder="ذهبي، عاجي، أخضر زيتي (افصل بفاصلة)"
            />
          </div>

          <div>
            <Label htmlFor="estimated_cost">التكلفة التقديرية (ريال)</Label>
            <Input id="estimated_cost" name="estimated_cost" type="number" min={0} />
          </div>

          {state.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{state.error}</p>
          )}
          {state.success && (
            <p className="rounded-lg bg-green-800/10 px-3 py-2 text-sm font-semibold text-green-800">{state.success}</p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "جاري الإضافة..." : "إضافة التصميم"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}

export function SelectDesignButton({
  eventId,
  conceptId,
  isSelected,
}: {
  eventId: string;
  conceptId: string;
  isSelected: boolean;
}) {
  const [pending, start] = useTransition();

  if (isSelected) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-800">
        <Check className="h-4 w-4" /> التصميم المعتمد
      </span>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() => start(() => selectDesignConceptAction(eventId, conceptId))}
    >
      {pending ? "..." : "اعتماد هذا التصميم"}
    </Button>
  );
}

export function DeleteDesignButton({ eventId, conceptId }: { eventId: string; conceptId: string }) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      aria-label="حذف التصميم"
      disabled={pending}
      onClick={() => start(() => deleteDesignConceptAction(eventId, conceptId))}
      className="rounded-lg p-2 text-navy-900/40 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
