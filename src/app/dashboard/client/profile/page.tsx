import { createClient } from "@/lib/db/server";
import { PageHeader } from "@/components/dashboard/shell";
import { Card, CardBody } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Mail } from "lucide-react";
import type { Profile } from "@/lib/types/database";
import { AccountForm } from "./account-form";

export const metadata = { title: "حسابي" };

export default async function ClientProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
  const p = profile as Profile | null;

  return (
    <div>
      <PageHeader title="حسابي" subtitle="بياناتك الشخصية كما تظهر لمقدمي الخدمة" />

      <div className="max-w-2xl space-y-6">
        <AccountForm profile={p} />

        <Card>
          <CardBody className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 font-semibold text-navy-900">
                <Mail className="h-4 w-4 text-gold-600" /> البريد الإلكتروني
              </span>
              <span className="text-navy-900/60">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-navy-900/8 pt-3">
              <span className="font-semibold text-navy-900">تاريخ الانضمام</span>
              <span className="text-navy-900/60">{formatDate(p?.created_at ?? null)}</span>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
