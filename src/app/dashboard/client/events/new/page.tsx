import Link from "next/link";
import { PageHeader } from "@/components/dashboard/shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS, CONFERENCE_EVENT_TYPES, EVENT_TYPE_LABELS, SOCIAL_EVENT_TYPES } from "@/lib/utils";
import { ArrowLeft, Heart, MonitorPlay } from "lucide-react";

export const metadata = { title: "مناسبة جديدة" };

const TRACKS = [
  {
    href: "/dashboard/client/events/new/social",
    icon: Heart,
    title: "أفراح ومناسبات اجتماعية",
    desc: "زفاف، خطوبة، تخرج أو عيد ميلاد — تخطيط يركّز على القاعة والضيافة والديكور والتصوير.",
    types: SOCIAL_EVENT_TYPES.filter((t) => t !== "other"),
    categories: ["hall", "catering", "decor", "photography", "music"],
    tone: "gold" as const,
  },
  {
    href: "/dashboard/client/events/new/conference",
    icon: MonitorPlay,
    title: "فعاليات ومؤتمرات",
    desc: "مؤتمر، معرض، منتدى أو ورشة عمل — نموذج يراعي الأجندة والجلسات والمتحدثين والأجنحة.",
    types: CONFERENCE_EVENT_TYPES,
    categories: ["hall", "av", "booths", "translation", "security", "transport"],
    tone: "green" as const,
  },
];

export default function NewEventChooserPage() {
  return (
    <div>
      <PageHeader
        title="مناسبة جديدة"
        subtitle="اختر نوع المناسبة أولاً — كل مسار يفتح نموذج تخطيط بالحقول التي يحتاجها فعلاً"
      />

      <div className="grid gap-5 md:grid-cols-2">
        {TRACKS.map((t) => (
          <Link key={t.href} href={t.href} className="group">
            <Card className="flex h-full flex-col p-6 transition group-hover:-translate-y-1 group-hover:border-gold-400/60">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl gold-gradient">
                  <t.icon className="h-5 w-5 text-navy-950" />
                </div>
                <ArrowLeft className="h-5 w-5 text-gold-600 transition group-hover:-translate-x-1" />
              </div>

              <h2 className="mt-4 text-lg font-extrabold text-navy-950">{t.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-navy-900/65">{t.desc}</p>

              <div className="mt-5">
                <div className="mb-2 text-xs font-bold text-navy-900/50">الأنواع المتاحة</div>
                <div className="flex flex-wrap gap-1.5">
                  {t.types.map((type) => (
                    <Badge key={type} tone={t.tone}>
                      {EVENT_TYPE_LABELS[type]}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-4 border-t border-navy-900/8 pt-4">
                <div className="mb-2 text-xs font-bold text-navy-900/50">الخدمات التي يغطيها</div>
                <p className="text-xs leading-5 text-navy-900/60">
                  {t.categories.map((c) => CATEGORY_LABELS[c]).join(" · ")}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
