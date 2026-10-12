"use client";

import { useState } from "react";
import { useActionState } from "react";
import { createConferenceEventAction, type FormState } from "@/lib/actions/events";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { SectionTitle } from "@/components/dashboard/shell";
import { CategoryPicker } from "../category-picker";
import { CITIES, CONFERENCE_CATEGORIES, CONFERENCE_EVENT_TYPES, EVENT_TYPE_LABELS } from "@/lib/utils";
import type { ProviderCategory } from "@/lib/types/database";

const initialState: FormState = {};
const DEFAULT_SELECTED: ProviderCategory[] = ["hall", "av", "catering"];

export function ConferenceEventForm() {
  const [state, formAction, pending] = useActionState(createConferenceEventAction, initialState);
  const [selected, setSelected] = useState<ProviderCategory[]>(DEFAULT_SELECTED);

  // The booth count only matters when exhibition stands were actually requested.
  const wantsBooths = selected.includes("booths");

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <Card>
        <CardBody className="space-y-4">
          <SectionTitle title="بيانات الفعالية" />

          <div>
            <Label htmlFor="title">اسم الفعالية</Label>
            <Input id="title" name="title" required placeholder="مثال: مؤتمر التقنية المالية ٢٠٢٦" />
          </div>

          <div>
            <Label htmlFor="organizer_entity">الجهة المنظمة</Label>
            <Input id="organizer_entity" name="organizer_entity" placeholder="اسم الجهة أو الشركة المنظمة" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="event_type">نوع الفعالية</Label>
              <Select id="event_type" name="event_type" defaultValue="conference">
                {CONFERENCE_EVENT_TYPES.map((t) => (
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
              <Label htmlFor="guest_count">عدد الحضور المتوقع</Label>
              <Input id="guest_count" name="guest_count" type="number" min={1} defaultValue={300} required />
            </div>
            <div>
              <Label htmlFor="event_date">تاريخ الافتتاح</Label>
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
              step={500}
              defaultValue={250000}
              required
            />
          </div>
        </CardBody>
      </Card>

      {/* ---- conference-specific detail ---- */}
      <Card>
        <CardBody className="space-y-4">
          <SectionTitle
            title="الأجندة والتنظيم"
            hint="هذه الحقول خاصة بمسار الفعاليات والمؤتمرات وتُستخدم في بناء خطة التنفيذ"
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="days_count">عدد الأيام</Label>
              <Input id="days_count" name="days_count" type="number" min={1} max={30} defaultValue={2} required />
            </div>
            <div>
              <Label htmlFor="sessions_count">عدد الجلسات</Label>
              <Input id="sessions_count" name="sessions_count" type="number" min={0} defaultValue={8} />
            </div>
            <div>
              <Label htmlFor="speakers_count">عدد المتحدثين</Label>
              <Input id="speakers_count" name="speakers_count" type="number" min={0} defaultValue={12} />
            </div>
          </div>

          {wantsBooths && (
            <div>
              <Label htmlFor="booths_count">عدد أجنحة العرض</Label>
              <Input id="booths_count" name="booths_count" type="number" min={0} defaultValue={20} />
            </div>
          )}

          <label className="flex items-start gap-2.5 rounded-xl border border-navy-900/10 p-3">
            <input
              type="checkbox"
              name="needs_registration"
              defaultChecked
              className="mt-0.5 h-4 w-4 accent-[#c9a227]"
            />
            <span>
              <span className="block text-sm font-semibold text-navy-900">مكتب تسجيل وإدارة حضور</span>
              <span className="block text-xs text-navy-900/50">
                تسجيل مسبق، طباعة بطاقات الحضور، ومكتب استقبال في الموقع
              </span>
            </span>
          </label>

          <div>
            <Label htmlFor="agenda_notes">ملاحظات الأجندة</Label>
            <Textarea
              id="agenda_notes"
              name="agenda_notes"
              placeholder="محاور الفعالية، توزيع الجلسات على الأيام، أو أي متطلبات خاصة بالمتحدثين."
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <CategoryPicker
            categories={CONFERENCE_CATEGORIES}
            defaultSelected={DEFAULT_SELECTED}
            onSelectionChange={setSelected}
          />
        </CardBody>
      </Card>

      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{state.error}</p>}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "جاري الإنشاء..." : "إنشاء الفعالية وتوزيع الميزانية"}
      </Button>
    </form>
  );
}
