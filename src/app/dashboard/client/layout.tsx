import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/shell";
import { LayoutDashboard, CalendarPlus, Calendar, Star, BookOpen } from "lucide-react";

const navItems = [
  { href: "/dashboard/client", label: "نظرة عامة", icon: LayoutDashboard },
  { href: "/dashboard/client/events/new", label: "مناسبة جديدة", icon: CalendarPlus },
  { href: "/dashboard/client/events", label: "مناسباتي", icon: Calendar },
  { href: "/dashboard/client/evaluations", label: "تقييماتي", icon: Star },
  { href: "/knowledge-base", label: "قاعدة المعرفة", icon: BookOpen },
];

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single();
  const p = profile as { full_name: string; role: string } | null;
  if (p?.role && p.role !== "client") redirect(`/dashboard/${p.role}`);

  return (
    <DashboardShell navItems={navItems} userName={p?.full_name ?? "عميل"} roleLabel="حساب عميل">
      {children}
    </DashboardShell>
  );
}
