/** Public navigation, shared by the desktop bar, the mobile sheet and the footer. */
export interface NavLink {
  href: string;
  label: string;
}

/** Shown in the desktop bar. */
export const PRIMARY_LINKS: NavLink[] = [
  { href: "/halls", label: "القاعات" },
  { href: "/services", label: "الخدمات" },
  { href: "/events", label: "الفعاليات والمؤتمرات" },
  { href: "/how-it-works", label: "كيف تعمل المنصة" },
];

/** Added to the mobile sheet and the footer. */
export const SECONDARY_LINKS: NavLink[] = [
  { href: "/providers", label: "مقدمو الخدمة" },
  { href: "/knowledge-base", label: "قاعدة المعرفة" },
  { href: "/about", label: "عن قاطرة" },
  { href: "/contact", label: "تواصل معنا" },
];

export const ALL_LINKS: NavLink[] = [...PRIMARY_LINKS, ...SECONDARY_LINKS];
