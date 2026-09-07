"use client";

import { useActionState } from "react";
import { createHallAction, type FormState } from "@/lib/actions/provider";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";

const initialState: FormState = {};

export function NewHallForm() {
  const [state, formAction, pending] = useActionState(createHallAction, initialState);
  return (
    <Card className="h-fit">
      <CardBody>
        <h3 className="mb-3 font-bold text-navy-950">إضافة قاعة</h3>
        <form action={formAction} className="space-y-3">
          <div>
            <Label htmlFor="name">اسم القاعة</Label>
            <Input id="name" name="name" required />
          </div>
          <div>
            <Label htmlFor="city">المدينة</Label>
            <Input id="city" name="city" defaultValue="الرياض" required />
          </div>
          <div>
            <Label htmlFor="address">العنوان</Label>
            <Input id="address" name="address" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="capacity_min">أقل سعة</Label>
              <Input id="capacity_min" name="capacity_min" type="number" min={0} defaultValue={50} />
            </div>
            <div>
              <Label htmlFor="capacity_max">أعلى سعة</Label>
              <Input id="capacity_max" name="capacity_max" type="number" min={1} defaultValue={300} required />
            </div>
          </div>
          <div>
            <Label htmlFor="base_price">السعر الأساسي (ريال)</Label>
            <Input id="base_price" name="base_price" type="number" min={0} required />
          </div>
          <div>
            <Label htmlFor="amenities">المرافق (افصل بفاصلة)</Label>
            <Input id="amenities" name="amenities" placeholder="موقف سيارات، تكييف، مسرح" />
          </div>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>{pending ? "جاري الإضافة..." : "إضافة القاعة"}</Button>
        </form>
      </CardBody>
    </Card>
  );
}
