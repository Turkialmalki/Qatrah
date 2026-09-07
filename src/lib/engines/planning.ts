// محرك التخطيط الذكي — Smart Planning Engine (rule-based)
// Generates a default execution timeline (tasks + due dates) once an
// event's bookings are confirmed, working backward from the event date.

import type { ProviderCategory } from "@/lib/types/database";

export interface PlanTaskTemplate {
  title: string;
  category: ProviderCategory | null;
  daysBeforeEvent: number;
}

const DEFAULT_TIMELINE: PlanTaskTemplate[] = [
  { title: "تأكيد حجز القاعة والدفعة الأولى", category: "hall", daysBeforeEvent: 60 },
  { title: "اعتماد تصميم الديكور النهائي", category: "decor", daysBeforeEvent: 30 },
  { title: "تحديد قائمة الطعام والعدد النهائي للضيوف", category: "catering", daysBeforeEvent: 21 },
  { title: "تنسيق مواعيد التصوير", category: "photography", daysBeforeEvent: 14 },
  { title: "تأكيد فرقة أو دي جي الموسيقى", category: "music", daysBeforeEvent: 14 },
  { title: "المراجعة النهائية لخطة التنفيذ", category: "planning", daysBeforeEvent: 7 },
  { title: "تركيب الديكور وتجهيز القاعة", category: "decor", daysBeforeEvent: 1 },
  { title: "يوم التنفيذ", category: null, daysBeforeEvent: 0 },
];

export interface GeneratedTask {
  title: string;
  category: ProviderCategory | null;
  dueDate: string; // ISO date
}

export function generateExecutionPlan(eventDateISO: string, bookedCategories: ProviderCategory[]): GeneratedTask[] {
  const eventDate = new Date(eventDateISO);
  if (Number.isNaN(eventDate.getTime())) return [];

  return DEFAULT_TIMELINE.filter((t) => t.category === null || bookedCategories.includes(t.category)).map((t) => {
    const due = new Date(eventDate);
    due.setDate(due.getDate() - t.daysBeforeEvent);
    return { title: t.title, category: t.category, dueDate: due.toISOString().slice(0, 10) };
  });
}
