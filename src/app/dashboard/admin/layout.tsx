import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/shell";
import { LayoutDashboard, Users, ShieldCheck, BookOpen, Wallet, Calendar } from "lucide-react";

const navItems = [
  { href: "/dashboard/admin", label: "نظرة عامة", icon: LayoutDashboard },
  { href: "/dashboard/admin/providers", label: "مقدمو الخدمة", icon: Users },
  { href: "/dashboard/admin/events", label: "المناسبات", icon: Calendar },
  { href: "/dashboard/admin/quality", label: "الجودة", icon: ShieldCheck },
  { href: "/dashboard/admin/settlements", label: "التسوية المالية", icon: Wallet },
  { href: "/dashboard/admin/knowledge-base", label: "قاعدة المعرفة", icon: BookOpen },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single();
  const p = profile as { full_name: string; role: string } | null;
  if (p?.role !== "admin") redirect(`/dashboard/${p?.role ?? "client"}`);

  return (
    <DashboardShell navItems={navItems} userName={p?.full_name ?? "مسؤول"} roleLabel="حساب إدارة">
      {children}
    </DashboardShell>
  );
}
