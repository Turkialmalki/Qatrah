"use client";

import { useActionState } from "react";
import { createServiceAction, type FormState } from "@/lib/actions/provider";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { CATEGORY_LABELS } from "@/lib/utils";

const initialState: FormState = {};
const CATEGORIES = Object.keys(CATEGORY_LABELS).filter((c) => c !== "hall");

export function NewServiceForm() {
  const [state, formAction, pending] = useActionState(createServiceAction, initialState);
  return (
    <Card className="h-fit">
      <CardBody>
        <h3 className="mb-3 font-bold text-navy-950">إضافة خدمة</h3>
        <form action={formAction} className="space-y-3">
          <div>
            <Label htmlFor="title">اسم الخدمة</Label>
            <Input id="title" name="title" required />
          </div>
          <div>
            <Label htmlFor="category">الفئة</Label>
            <Select id="category" name="category" defaultValue="catering">
              {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
            </Select>
          </div>
          <div>
            <Label htmlFor="description">الوصف</Label>
            <Textarea id="description" name="description" />
          </div>
          <div>
            <Label htmlFor="base_price">السعر الأساسي (ريال)</Label>
            <Input id="base_price" name="base_price" type="number" min={0} required />
          </div>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>{pending ? "جاري الإضافة..." : "إضافة الخدمة"}</Button>
        </form>
      </CardBody>
    </Card>
  );
}
