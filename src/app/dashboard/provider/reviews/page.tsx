import { createClient } from "@/lib/db/server";
import { PageHeader } from "@/components/dashboard/shell";
import { Card, CardBody } from "@/components/ui/card";
import { Star } from "lucide-react";

export default async function ProviderReviewsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: evaluations } = await supabase
    .from("evaluations")
    .select("*, profiles(full_name)")
    .eq("provider_id", user!.id)
    .order("created_at", { ascending: false });

  const list = evaluations ?? [];
  const avg =
    list.length > 0
      ? list.reduce((s, e) => s + (e.rating_quality + e.rating_price + e.rating_timeliness) / 3, 0) / list.length
      : 0;

  return (
    <div>
      <PageHeader title="التقييمات" subtitle={`متوسط تقييمك: ${avg.toFixed(1)} / 5`} />
      {list.length === 0 ? (
        <Card className="p-10 text-center text-navy-900/50">لا توجد تقييمات بعد</Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((e) => (
            <Card key={e.id}>
              <CardBody>
                <div className="font-bold text-navy-950">{(e.profiles as { full_name: string } | null)?.full_name}</div>
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
