import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/shell";
import { LayoutDashboard, Building2, ListChecks, Inbox, ClipboardList, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/lib/utils";
import type { ProviderProfile } from "@/lib/types/database";

const navItems = [
  { href: "/dashboard/provider", label: "نظرة عامة", icon: LayoutDashboard },
  { href: "/dashboard/provider/halls", label: "قاعاتي", icon: Building2 },
  { href: "/dashboard/provider/services", label: "خدماتي", icon: ListChecks },
  { href: "/dashboard/provider/requests", label: "الطلبات المطابقة", icon: Inbox },
  { href: "/dashboard/provider/tasks", label: "التنفيذ", icon: ClipboardList },
  { href: "/dashboard/provider/reviews", label: "التقييمات", icon: Star },
];

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
    <DashboardShell navItems={navItems} userName={p?.full_name ?? "مقدم خدمة"} roleLabel="حساب مقدم خدمة">
      {pp?.status !== "approved" && (
        <div className="mb-6 rounded-xl border border-gold-400/40 bg-gold-100/40 px-4 py-3 text-sm text-navy-900">
          حالة حسابك: <Badge tone={pp?.status === "rejected" ? "red" : "gold"}>{STATUS_LABELS[pp?.status ?? "pending"]}</Badge>
          {pp?.status !== "rejected" && " — لن تظهر خدماتك للعملاء حتى تعتمد الإدارة حسابك."}
        </div>
      )}
      {children}
    </DashboardShell>
  );
}
