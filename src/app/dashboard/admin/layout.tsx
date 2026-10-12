import { redirect } from "next/navigation";
import { createClient } from "@/lib/db/server";
import { DashboardShell } from "@/components/dashboard/shell";

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
    <DashboardShell role="admin" userName={p?.full_name ?? "مسؤول"} roleLabel="حساب إدارة">
      {children}
    </DashboardShell>
  );
}
