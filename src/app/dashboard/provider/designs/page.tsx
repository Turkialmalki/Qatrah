import { createClient } from "@/lib/db/server";
import { PageHeader } from "@/components/dashboard/shell";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ServiceImage } from "@/components/ui/image-field";
import { formatDate, formatSAR } from "@/lib/utils";
import { Palette } from "lucide-react";
import type { DesignConcept, EventRow, MatchRow } from "@/lib/types/database";

export const metadata = { title: "التصاميم" };

export default async function ProviderDesignsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Events this provider is matched on — RLS also limits design_concepts to these.
  const { data: matches } = await supabase.from("matches").select("event_id").eq("provider_id", user!.id);
  const eventIds = Array.from(new Set(((matches ?? []) as Pick<MatchRow, "event_id">[]).map((m) => m.event_id)));

  const { data: concepts } = await supabase
    .from("design_concepts")
    .select("*, events(title, event_date, city)")
    .in("event_id", eventIds.length > 0 ? eventIds : ["00000000-0000-0000-0000-000000000000"])
    .order("is_selected", { ascending: false })
    .order("created_at", { ascending: false });

  const list = (concepts ?? []) as (DesignConcept & {
    events: Pick<EventRow, "title" | "event_date" | "city"> | null;
  })[];

  return (
    <div>
      <PageHeader
        title="التصاميم"
        subtitle="لوحات التصميم للمناسبات المطابقة لك — التصميم المعتمد هو المرجع عند التنفيذ"
      />

      {list.length === 0 ? (
        <EmptyState
          icon={Palette}
          title="لا توجد تصاميم متاحة"
          description="تظهر هنا لوحات التصميم للمناسبات التي طابقك بها محرك المطابقة."
          actionLabel="عرض الطلبات المطابقة"
          actionHref="/dashboard/provider/requests"
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => (
            <Card
              key={c.id}
              className={c.is_selected ? "overflow-hidden border-green-700/40 card-shadow-lg" : "overflow-hidden"}
            >
              <ServiceImage src={c.images?.[0]} alt={c.title} className="h-40 w-full" />
              <CardBody>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-navy-950">{c.title}</h3>
                  {c.is_selected && <Badge tone="green">معتمد</Badge>}
                </div>

                {c.events && (
                  <p className="mt-1.5 text-xs text-navy-900/55">
                    {c.events.title} · {c.events.city} · {formatDate(c.events.event_date)}
                  </p>
                )}

                {c.style && <p className="mt-2 text-xs text-navy-900/60">طابع {c.style}</p>}

                {c.palette?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {c.palette.map((p) => (
                      <Badge key={p} tone="gray">
                        {p}
                      </Badge>
                    ))}
                  </div>
                )}

                {c.estimated_cost != null && (
                  <p className="mt-3 text-sm font-bold text-gold-600">{formatSAR(c.estimated_cost)}</p>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
