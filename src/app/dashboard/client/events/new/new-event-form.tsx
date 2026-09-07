"use client";

import { useActionState, useState } from "react";
import { createEventAction, type FormState } from "@/lib/actions/events";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { CATEGORY_LABELS, EVENT_TYPE_LABELS } from "@/lib/utils";
import clsx from "clsx";

const initialState: FormState = {};
const CATEGORIES = Object.keys(CATEGORY_LABELS).filter((c) => c !== "other");

export function NewEventForm() {
  const [state, formAction, pending] = useActionState(createEventAction, initialState);
  const [selected, setSelected] = useState<string[]>(["hall", "catering", "decor"]);

  function toggle(cat: string) {
    setSelected((s) => (s.includes(cat) ? s.filter((c) => c !== cat) : [...s, cat]));
  }

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <Card>
        <CardBody className="space-y-4">
          <div>
            <Label htmlFor="title">اسم المناسبة</Label>
            <Input id="title" name="title" required placeholder="مثال: حفل زفاف سارة وأحمد" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="event_type">نوع المناسبة</Label>
              <Select id="event_type" name="event_type" defaultValue="wedding">
                {Object.entries(EVENT_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="city">المدينة</Label>
              <Input id="city" name="city" defaultValue="الرياض" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
            <Input id="total_budget" name="total_budget" type="number" min={1000} step={100} defaultValue={50000} required />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <Label>الخدمات المطلوبة وأولويتها</Label>
          <p className="mb-3 text-xs text-navy-900/50">اختر الخدمات، وحدد أولوية كل منها ليوزع محرك تحسين الميزانية المبلغ بشكل عادل</p>
          <div className="space-y-2">
            {CATEGORIES.map((cat) => (
              <div key={cat} className={clsx("flex items-center justify-between rounded-xl border p-3", selected.includes(cat) ? "border-gold-400 bg-gold-100/40" : "border-navy-900/10")}>
                <label className="flex items-center gap-2.5 text-sm font-semibold text-navy-900">
                  <input type="checkbox" name="categories" value={cat} checked={selected.includes(cat)} onChange={() => toggle(cat)} className="h-4 w-4 accent-[#c9a227]" />
                  {CATEGORY_LABELS[cat]}
                </label>
                {selected.includes(cat) && (
                  <select name={`priority_${cat}`} defaultValue={3} className="rounded-lg border border-navy-900/15 px-2 py-1 text-xs">
                    <option value={1}>أولوية منخفضة جداً</option>
                    <option value={2}>أولوية منخفضة</option>
                    <option value={3}>أولوية متوسطة</option>
                    <option value={4}>أولوية عالية</option>
                    <option value={5}>أولوية قصوى</option>
                  </select>
                )}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "جاري الإنشاء..." : "إنشاء المناسبة وتوزيع الميزانية"}
      </Button>
    </form>
  );
}
