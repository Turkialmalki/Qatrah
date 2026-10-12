import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/lib/utils";
import type { ProviderProfile } from "@/lib/types/database";

export default async function ProviderLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single();
  const p = profile as { full_name: string; role: string } | null;
  if (p?.role && p.role !== "provider") redirect(`/dashboard/${p.role}`);

  const { data: providerProfile } = await supabase.from("provider_profiles").select("*").eq("id", user.id).single();
  const pp = providerProfile as ProviderProfile | null;

  return (
    <DashboardShell role="provider" userName={p?.full_name ?? "مقدم خدمة"} roleLabel="حساب مقدم خدمة">
      {pp?.status !== "approved" && (
        <div className="mb-6 rounded-xl border border-gold-400/40 bg-gold-100/50 px-4 py-3 text-sm text-navy-900">
          حالة حسابك: <Badge tone={pp?.status === "rejected" ? "red" : "gold"}>{STATUS_LABELS[pp?.status ?? "pending"]}</Badge>
          {pp?.status !== "rejected" && " — لن تظهر خدماتك للعملاء حتى تعتمد الإدارة حسابك."}
        </div>
      )}
      {children}
    </DashboardShell>
  );
}
