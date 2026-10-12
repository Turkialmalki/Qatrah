import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ServiceImage } from "@/components/ui/image-field";
import { formatSAR } from "@/lib/utils";
import { Check, MapPin, Star, Users } from "lucide-react";
import type { Hall, ProviderProfile } from "@/lib/types/database";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("halls").select("name, city").eq("id", id).single();
  const h = data as Pick<Hall, "name" | "city"> | null;
  if (!h) return {};
  return { title: h.name, description: `قاعة ${h.name} في ${h.city} — متاحة للحجز عبر منصة قاطرة.` };
}

export default async function HallDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: hall } = await supabase
    .from("halls")
    .select("*, provider_profiles!inner(*)")
    .eq("id", id)
    .eq("is_active", true)
    .eq("provider_profiles.status", "approved")
    .single();
  if (!hall) notFound();

  const h = hall as Hall & { provider_profiles: ProviderProfile };

  // Other halls from the same provider.
  const { data: siblings } = await supabase
    .from("halls")
    .select("*")
    .eq("provider_id", h.provider_id)
    .eq("is_active", true)
    .neq("id", id)
    .limit(3);
  const others = (siblings ?? []) as Hall[];

  return (
    <div>
      <Navbar />

      <section className="mx-auto max-w-7xl px-5 py-8 md:py-12">
        <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-navy-900/55">
          <Link href="/" className="hover:text-gold-600">
            الرئيسية
          </Link>
          <span aria-hidden>/</span>
          <Link href="/halls" className="hover:text-gold-600">
            القاعات
          </Link>
          <span aria-hidden>/</span>
          <span className="font-semibold text-navy-900">{h.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <ServiceImage src={h.images?.[0]} alt={h.name} className="h-64 w-full rounded-2xl sm:h-80" />

            <h1 className="mt-6 text-2xl font-extrabold text-navy-950 sm:text-3xl">{h.name}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-navy-900/60">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-gold-600" /> {h.city}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-gold-600" /> تستوعب {h.capacity_min}–{h.capacity_max} ضيف
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-gold-400 text-gold-400" /> {h.provider_profiles.quality_score ?? 0}/5
              </span>
            </div>

            {h.address && <p className="mt-4 text-sm leading-7 text-navy-900/70">{h.address}</p>}

            {h.amenities?.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-3 font-bold text-navy-950">المرافق والخدمات</h2>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {h.amenities.map((a) => (
                    <li key={a} className="flex items-start gap-2 text-sm text-navy-900/75">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-700" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ---- booking sidebar ---- */}
          <div className="space-y-5">
            <Card className="p-6">
              <div className="text-xs font-semibold text-navy-900/55">السعر الأساسي يبدأ من</div>
              <div className="mt-1 text-3xl font-extrabold text-navy-950">{formatSAR(h.base_price)}</div>
              <p className="mt-3 text-xs leading-6 text-navy-900/55">
                السعر النهائي يُحدَّد عبر محرك التسعير العادل بمقارنته بمتوسط السوق، بعد إنشاء مناسبتك.
              </p>
              <Button href="/signup" size="lg" className="mt-5 w-full">
                اطلب هذه القاعة
              </Button>
              <Button href="/how-it-works" variant="ghost" size="sm" className="mt-2 w-full">
                كيف تعمل المنصة؟
              </Button>
            </Card>

            <Card className="p-6">
              <div className="mb-1 text-xs font-semibold text-navy-900/55">مقدم الخدمة</div>
              <Link
                href={`/providers/${h.provider_id}`}
                className="font-bold text-navy-950 transition hover:text-gold-600"
              >
                {h.provider_profiles.business_name}
              </Link>
              <div className="mt-3 space-y-1.5 text-xs text-navy-900/60">
                <p>مدينة التشغيل: {h.provider_profiles.base_city}</p>
                {h.provider_profiles.years_experience > 0 && (
                  <p>{h.provider_profiles.years_experience} سنة خبرة</p>
                )}
                <p>{h.provider_profiles.completed_jobs ?? 0} عمل منجز</p>
              </div>
              <Badge tone="green" className="mt-4">
                معتمد من قاطرة
              </Badge>
            </Card>
          </div>
        </div>

        {others.length > 0 && (
          <div className="mt-14">
            <h2 className="mb-5 text-xl font-extrabold text-navy-950">قاعات أخرى من نفس المنشأة</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((o) => (
                <Link key={o.id} href={`/halls/${o.id}`} className="group">
                  <Card className="h-full overflow-hidden transition group-hover:-translate-y-1">
                    <ServiceImage src={o.images?.[0]} alt={o.name} className="h-36 w-full" />
                    <CardBody>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-navy-950">{o.name}</h3>
                        <span className="shrink-0 text-sm font-bold text-gold-600">{formatSAR(o.base_price)}</span>
                      </div>
                      <p className="mt-2 text-xs text-navy-900/55">
                        {o.capacity_min}–{o.capacity_max} ضيف · {o.city}
                      </p>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
