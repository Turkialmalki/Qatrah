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
  other: "أخرى",
};

export const EVENT_TYPE_LABELS: Record<string, string> = {
  wedding: "زفاف",
  engagement: "خطوبة",
  graduation: "تخرج",
  corporate: "مناسبة شركات",
  birthday: "عيد ميلاد",
  other: "أخرى",
};

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
  todo: "لم يبدأ",
  done: "منجز",
  blocked: "معلّق",
  passed: "مطابق",
  flagged: "بحاجة مراجعة",
  failed: "غير مطابق",
};
