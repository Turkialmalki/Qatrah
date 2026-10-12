import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { Stat, StatGrid } from "@/components/ui/stat";
import { EmptyState } from "@/components/ui/empty-state";
import { STATUS_LABELS, providerCategories } from "@/lib/utils";
import { Award, Briefcase, Star, UserCog } from "lucide-react";
import type { Profile, ProviderProfile } from "@/lib/types/database";
import { ProviderProfileForm } from "./provider-profile-form";
import { AccountForm } from "@/app/dashboard/client/profile/account-form";

export const metadata = { title: "ملف المنشأة" };

export default async function ProviderProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: providerProfile }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
    supabase.from("provider_profiles").select("*").eq("id", user!.id).single(),
  ]);

  const p = profile as Profile | null;
  const pp = providerProfile as ProviderProfile | null;

  if (!pp) {
    return (
      <div>
        <PageHeader title="ملف المنشأة" />
        <EmptyState
          icon={UserCog}
          title="لم يتم إنشاء ملف منشأة لحسابك"
          description="تواصل مع فريق الدعم لربط حسابك بملف مقدم خدمة."
          actionLabel="تواصل معنا"
          actionHref="/contact"
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="ملف المنشأة"
        subtitle="بياناتك ومجالات خدمتك كما تظهر للعملاء"
        action={
          <Badge tone={pp.status === "approved" ? "green" : pp.status === "rejected" ? "red" : "gold"}>
            {STATUS_LABELS[pp.status]}
          </Badge>
        }
      />

      <StatGrid className="mb-6 lg:grid-cols-3">
        <Stat label="تقييم الجودة" value={`${pp.quality_score ?? 0} / 5`} icon={Star} />
        <Stat label="أعمال منجزة" value={pp.completed_jobs ?? 0} icon={Briefcase} />
        <Stat
          label="مجالات الخدمة"
          value={providerCategories(pp).length}
          hint="يمكنك تقديم عدة خدمات"
          icon={Award}
        />
      </StatGrid>

      <ProviderProfileForm profile={pp} initialCategories={providerCategories(pp)} />

      <div className="mt-10 max-w-3xl border-t border-navy-900/10 pt-8">
        <AccountForm profile={p} />
      </div>
    </div>
  );
}
