import { notFound } from "next/navigation";
import { createClient } from "@/lib/db/server";
import { PageHeader } from "@/components/dashboard/shell";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ServiceImage } from "@/components/ui/image-field";
import { formatSAR } from "@/lib/utils";
import { Palette } from "lucide-react";
import type { DesignConcept, EventRow, ProviderProfile } from "@/lib/types/database";
import { DeleteDesignButton, NewDesignForm, SelectDesignButton } from "./design-client";

export const metadata = { title: "إدارة التصميم" };

export default async function EventDesignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase.from("events").select("*").eq("id", id).single();
  if (!event) notFound();

  const { data: concepts } = await supabase
    .from("design_concepts")
    .select("*, provider_profiles(business_name)")
    .eq("event_id", id)
    .order("is_selected", { ascending: false })
    .order("created_at", { ascending: false });

  const ev = event as EventRow;
  const list = (concepts ?? []) as (DesignConcept & { provider_profiles: Pick<ProviderProfile, "business_name"> | null })[];
  const selected = list.find((c) => c.is_selected);

  return (
    <div>
      <PageHeader
        title="إدارة التصميم"
        subtitle={`لوحة تصاميم «${ev.title}» — اعتمد تصميماً واحداً ليكون المرجع لمقدم خدمة الديكور`}
        backHref={`/dashboard/client/events/${id}`}
        backLabel="رجوع إلى المناسبة"
        action={selected ? <Badge tone="green">تم اعتماد تصميم</Badge> : <Badge tone="gold">لم يُعتمد تصميم بعد</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          {list.length === 0 ? (
            <EmptyState
              icon={Palette}
              title="لا توجد تصاميم في اللوحة بعد"
              description="أضف تصوراً مرجعياً بصورة ولوحة ألوان، أو انتظر مقترحات مقدم خدمة الديكور."
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {list.map((c) => (
                <Card
                  key={c.id}
                  className={c.is_selected ? "overflow-hidden border-green-700/40 card-shadow-lg" : "overflow-hidden"}
                >
                  <ServiceImage src={c.images?.[0]} alt={c.title} className="h-44 w-full" />
                  <CardBody>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-navy-950">{c.title}</h3>
                        {c.style && <p className="mt-0.5 text-xs text-navy-900/55">طابع {c.style}</p>}
                      </div>
                      <DeleteDesignButton eventId={id} conceptId={c.id} />
                    </div>

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

                    {c.provider_profiles?.business_name && (
                      <p className="mt-2 text-xs text-navy-900/45">
                        مقترح من {c.provider_profiles.business_name}
                      </p>
                    )}

                    <div className="mt-4 border-t border-navy-900/8 pt-3">
                      <SelectDesignButton eventId={id} conceptId={c.id} isSelected={c.is_selected} />
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>

        <NewDesignForm eventId={id} />
      </div>
    </div>
  );
}
