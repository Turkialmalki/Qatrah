import { createClient } from "@/lib/db/server";
import { PageHeader } from "@/components/dashboard/shell";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ServiceImage } from "@/components/ui/image-field";
import { formatSAR, CATEGORY_LABELS, providerCategories } from "@/lib/utils";
import { UNIT_LABELS } from "@/lib/catalog/packages";
import type { ProviderProfile, ServiceItem } from "@/lib/types/database";
import { ListChecks, PackageCheck, PencilLine } from "lucide-react";
import { NewServiceForm } from "./new-service-form";
import { ServiceRowActions } from "./service-row-actions";

export const metadata = { title: "خدماتي" };

export default async function ProviderServicesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: services }, { data: providerProfile }] = await Promise.all([
    supabase.from("services").select("*").eq("provider_id", user!.id).order("created_at", { ascending: false }),
    supabase.from("provider_profiles").select("*").eq("id", user!.id).single(),
  ]);

  const list = (services ?? []) as ServiceItem[];
  const pp = providerProfile as ProviderProfile | null;
  // A provider may serve several categories — offer every one of them here.
  const categories = pp ? providerCategories(pp).filter((c) => c !== "hall") : [];
  const packageCount = list.filter((s) => s.package_key).length;

  return (
    <div>
      <PageHeader
        title="خدماتي"
        subtitle="أضف الخدمات التي تقدمها ليتم مطابقتها مع احتياجات العملاء"
        action={
          list.length > 0 ? (
            <div className="flex gap-2 text-xs">
              <Badge tone="gold">{packageCount} باقة جاهزة</Badge>
              <Badge tone="navy">{list.length - packageCount} خدمة مخصصة</Badge>
            </div>
          ) : null
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {list.length === 0 ? (
            <EmptyState
              icon={ListChecks}
              title="لا توجد خدمات مضافة بعد"
              description="ابدأ بإضافة باقة جاهزة من القائمة المجاورة — تضاف بضغطة واحدة بأسعار ومحتويات معتمدة."
            />
          ) : (
            list.map((s) => (
              <Card key={s.id} className="overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <ServiceImage
                    src={s.images?.[0]}
                    alt={s.title}
                    className="h-36 w-full shrink-0 sm:h-auto sm:w-40"
                  />
                  <CardBody className="flex flex-1 flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-navy-950">{s.title}</span>
                        <Badge tone="navy">{CATEGORY_LABELS[s.category]}</Badge>
                        <Badge tone={s.is_active ? "green" : "gray"}>{s.is_active ? "مفعّلة" : "متوقفة"}</Badge>
                        {s.package_key ? (
                          <Badge tone="gold" className="gap-1">
                            <PackageCheck className="h-3 w-3" /> باقة جاهزة
                          </Badge>
                        ) : (
                          <Badge tone="gray" className="gap-1">
                            <PencilLine className="h-3 w-3" /> مخصصة
                          </Badge>
                        )}
                      </div>
                      {s.description && (
                        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-navy-900/55">{s.description}</p>
                      )}
                      {s.inclusions?.length > 0 && (
                        <p className="mt-1.5 text-xs text-navy-900/45">
                          تشمل {s.inclusions.length} بنداً · {s.inclusions.slice(0, 2).join(" · ")}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <div className="text-left">
                        <div className="font-bold text-navy-950">{formatSAR(s.base_price)}</div>
                        <div className="text-[10px] text-navy-900/50">{UNIT_LABELS[s.unit] ?? ""}</div>
                      </div>
                      <ServiceRowActions id={s.id} isActive={s.is_active} />
                    </div>
                  </CardBody>
                </div>
              </Card>
            ))
          )}
        </div>

        {categories.length > 0 ? (
          <NewServiceForm categories={categories} />
        ) : (
          <EmptyState
            icon={ListChecks}
            title="حدّد مجالات خدمتك أولاً"
            description="اختر المجالات التي تقدم فيها خدمات من ملف المنشأة، ثم عد لإضافة الباقات."
            actionLabel="ملف المنشأة"
            actionHref="/dashboard/provider/profile"
            className="h-fit"
          />
        )}
      </div>
    </div>
  );
}
