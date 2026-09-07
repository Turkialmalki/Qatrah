import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/shell";
import { Card, CardBody } from "@/components/ui/card";
import { Star } from "lucide-react";

export default async function EvaluationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: evaluations } = await supabase
    .from("evaluations")
    .select("*, provider_profiles(business_name)")
    .eq("client_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader title="تقييماتي" subtitle="التقييمات التي قدمتها لمقدمي الخدمة" />
      {(!evaluations || evaluations.length === 0) ? (
        <Card className="p-10 text-center text-navy-900/50">لا توجد تقييمات بعد</Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {evaluations.map((e) => (
            <Card key={e.id}>
              <CardBody>
                <div className="font-bold text-navy-950">{(e.provider_profiles as { business_name: string } | null)?.business_name}</div>
                <div className="mt-2 flex gap-1">
                  {[...Array(Math.round((e.rating_quality + e.rating_price + e.rating_timeliness) / 3))].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-gold-400 text-gold-400" />
                  ))}
                </div>
                {e.comment && <p className="mt-2 text-sm text-navy-900/70">{e.comment}</p>}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
