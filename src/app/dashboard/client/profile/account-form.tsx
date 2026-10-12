"use client";

import { useActionState } from "react";
import { updateProfileAction, type FormState } from "@/lib/actions/profile";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { SectionTitle } from "@/components/dashboard/shell";
import { CITIES } from "@/lib/utils";
import type { Profile } from "@/lib/types/database";

const initialState: FormState = {};

/** Personal account details — shared by the client and provider dashboards. */
export function AccountForm({ profile }: { profile: Profile | null }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction}>
      <Card>
        <CardBody className="space-y-4">
          <SectionTitle title="بياناتي الشخصية" />

          <div>
            <Label htmlFor="full_name">الاسم الكامل</Label>
            <Input id="full_name" name="full_name" defaultValue={profile?.full_name ?? ""} required />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="phone">رقم الجوال</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                defaultValue={profile?.phone ?? ""}
                placeholder="05xxxxxxxx"
              />
            </div>
            <div>
              <Label htmlFor="city">المدينة</Label>
              <Select id="city" name="city" defaultValue={profile?.city ?? "الرياض"}>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {state.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{state.error}</p>
          )}
          {state.success && (
            <p className="rounded-lg bg-green-800/10 px-3 py-2 text-sm font-semibold text-green-800">{state.success}</p>
          )}

          <Button type="submit" disabled={pending}>
            {pending ? "جاري الحفظ..." : "حفظ البيانات"}
          </Button>
        </CardBody>
      </Card>
    </form>
  );
}
