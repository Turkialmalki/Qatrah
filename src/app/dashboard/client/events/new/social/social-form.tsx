"use client";

import { useActionState } from "react";
import { createEventAction, type FormState } from "@/lib/actions/events";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { CategoryPicker } from "../category-picker";
import { CITIES, EVENT_TYPE_LABELS, SOCIAL_CATEGORIES, SOCIAL_EVENT_TYPES } from "@/lib/utils";

const initialState: FormState = {};

export function SocialEventForm() {
  const [state, formAction, pending] = useActionState(createEventAction, initialState);

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <Card>
        <CardBody className="space-y-4">
          <div>
            <Label htmlFor="title">اسم المناسبة</Label>
            <Input id="title" name="title" required placeholder="مثال: حفل زفاف سارة وأحمد" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="event_type">نوع المناسبة</Label>
              <Select id="event_type" name="event_type" defaultValue="wedding">
                {SOCIAL_EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {EVENT_TYPE_LABELS[t]}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="city">المدينة</Label>
              <Select id="city" name="city" defaultValue="الرياض">
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="guest_count">عدد الضيوف</Label>
              <Input id="guest_count" name="guest_count" type="number" min={1} defaultValue={150} required />
            </div>
            <div>
              <Label htmlFor="event_date">تاريخ المناسبة</Label>
              <Input id="event_date" name="event_date" type="date" />
            </div>
          </div>

          <div>
            <Label htmlFor="total_budget">الميزانية الإجمالية (ريال)</Label>
            <Input
              id="total_budget"
              name="total_budget"
              type="number"
              min={1000}
              step={100}
              defaultValue={50000}
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">ملاحظات إضافية</Label>
            <Textarea id="notes" name="notes" className="min-h-20" placeholder="أي تفاصيل تريد أن يعرفها مقدمو الخدمة" />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <CategoryPicker categories={SOCIAL_CATEGORIES} defaultSelected={["hall", "catering", "decor"]} />
        </CardBody>
      </Card>

      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{state.error}</p>}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "جاري الإنشاء..." : "إنشاء المناسبة وتوزيع الميزانية"}
      </Button>
    </form>
  );
}
