import { redirect } from "next/navigation";
import { createClient } from "@/lib/db/server";

export default async function DashboardRouter() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = (profile as { role: string } | null)?.role ?? "client";

  redirect(`/dashboard/${role}`);
}
