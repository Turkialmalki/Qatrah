import type { EventType, ProviderCategory } from "@/lib/types/database";

export function formatSAR(amount: number): string {
  return new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 0 }).format(amount) + " ﷼";
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("ar-SA-u-nu-latn", { year: "numeric", month: "long", day: "numeric" }).format(
    new Date(iso)
  );
}

export const CATEGORY_LABELS: Record<string, string> = {
  hall: "قاعات",
  catering: "ضيافة وتموين",
  decor: "ديكور وتصميم",
  photography: "تصوير",
  music: "موسيقى وترفيه",
  planning: "تنسيق وتخطيط",
  av: "صوتيات وعرض",
  translation: "ترجمة فورية",
  booths: "أجنحة ومعارض",
  security: "تنظيم وأمن",
  transport: "نقل الحضور",
  other: "أخرى",
};

/** One-line explainer used on the public category pages. */
export const CATEGORY_TAGLINES: Record<string, string> = {
  hall: "قاعات ومواقع معتمدة لكل أحجام المناسبات",
  catering: "بوفيهات وخدمة تقديم بإشراف طهاة محترفين",
  decor: "تصميم وتنفيذ ديكور يعكس هوية مناسبتك",
  photography: "تغطية فوتوغرافية وفيديو بجودة احترافية",
  music: "فرق حيّة ودي جي ومنظومات صوت للحفلات",
  planning: "منسّقو مناسبات يديرون التفاصيل بدلاً عنك",
  av: "شاشات ومنظومات صوت وبثّ مباشر للمؤتمرات",
  translation: "كابينات ومترجمون فوريون معتمدون",
  booths: "تصميم وتنفيذ أجنحة المعارض والفعاليات",
  security: "فرق تنظيم وأمن لإدارة دخول الحضور",
  transport: "نقل منظم للحضور والمتحدثين",
  other: "خدمات مساندة أخرى للمناسبات والفعاليات",
};

/** Categories relevant to social occasions (weddings, graduations …). */
export const SOCIAL_CATEGORIES: ProviderCategory[] = [
  "hall",
  "catering",
  "decor",
  "photography",
  "music",
  "planning",
];

/** Categories relevant to conferences, exhibitions and corporate events. */
export const CONFERENCE_CATEGORIES: ProviderCategory[] = [
  "hall",
  "av",
  "catering",
  "booths",
  "translation",
  "security",
  "transport",
  "photography",
  "planning",
];

export const EVENT_TYPE_LABELS: Record<string, string> = {
  wedding: "زفاف",
  engagement: "خطوبة",
  graduation: "تخرج",
  birthday: "عيد ميلاد",
  corporate: "مناسبة شركات",
  conference: "مؤتمر",
  exhibition: "معرض",
  forum: "منتدى",
  workshop: "ورشة عمل",
  festival: "مهرجان",
  other: "أخرى",
};

export type EventTrack = "social" | "conference";

/** Which creation flow an event type belongs to. */
export const SOCIAL_EVENT_TYPES: EventType[] = ["wedding", "engagement", "graduation", "birthday", "other"];
export const CONFERENCE_EVENT_TYPES: EventType[] = [
  "conference",
  "exhibition",
  "forum",
  "workshop",
  "corporate",
  "festival",
];

export function trackForEventType(type: EventType): EventTrack {
  return CONFERENCE_EVENT_TYPES.includes(type) ? "conference" : "social";
}

export const STATUS_LABELS: Record<string, string> = {
  draft: "مسودة",
  planning: "قيد التخطيط",
  matched: "تمت المطابقة",
  confirmed: "مؤكدة",
  in_execution: "قيد التنفيذ",
  completed: "مكتملة",
  cancelled: "ملغاة",
  pending: "قيد الانتظار",
  approved: "معتمد",
  rejected: "مرفوض",
  suspended: "موقوف",
  proposed: "مقترح",
  quoted: "تم التسعير",
  accepted: "مقبول",
  declined: "مرفوض",
  expired: "منتهي",
  pending_payment: "بانتظار الدفع",
  paid: "مدفوع",
  in_progress: "جاري التنفيذ",
  disputed: "قيد النزاع",
  refunded: "مُسترد",
  failed: "فشل",
  released: "تم التحويل",
  todo: "لم يبدأ",
  done: "منجز",
  blocked: "معلّق",
  passed: "مطابق",
  flagged: "بحاجة مراجعة",
};

/** Saudi cities offered across the forms. */
export const CITIES = [
  "الرياض",
  "جدة",
  "مكة المكرمة",
  "المدينة المنورة",
  "الدمام",
  "الخبر",
  "الأحساء",
  "الطائف",
  "أبها",
  "تبوك",
  "القصيم",
  "نجران",
];

/** Returns the full category list for a provider, tolerating the legacy single column. */
export function providerCategories(p: {
  category: ProviderCategory;
  categories?: ProviderCategory[] | null;
}): ProviderCategory[] {
  const many = p.categories ?? [];
  return many.length > 0 ? many : [p.category];
}
