// محرك التخطيط الذكي — Smart Planning Engine (rule-based)
// Generates a default execution timeline (tasks + due dates) once an
// event's bookings are confirmed, working backward from the event date.

import type { ProviderCategory } from "@/lib/types/database";
import type { EventTrack } from "@/lib/utils";

export interface PlanTaskTemplate {
  title: string;
  category: ProviderCategory | null;
  daysBeforeEvent: number;
}

/** Weddings, graduations and other social occasions. */
const SOCIAL_TIMELINE: PlanTaskTemplate[] = [
  { title: "تأكيد حجز القاعة والدفعة الأولى", category: "hall", daysBeforeEvent: 60 },
  { title: "اعتماد تصميم الديكور النهائي", category: "decor", daysBeforeEvent: 30 },
  { title: "تحديد قائمة الطعام والعدد النهائي للضيوف", category: "catering", daysBeforeEvent: 21 },
  { title: "تنسيق مواعيد التصوير", category: "photography", daysBeforeEvent: 14 },
  { title: "تأكيد فرقة أو دي جي الموسيقى", category: "music", daysBeforeEvent: 14 },
  { title: "المراجعة النهائية لخطة التنفيذ", category: "planning", daysBeforeEvent: 7 },
  { title: "تركيب الديكور وتجهيز القاعة", category: "decor", daysBeforeEvent: 1 },
  { title: "يوم التنفيذ", category: null, daysBeforeEvent: 0 },
];

/** Conferences, exhibitions, forums and corporate events. */
const CONFERENCE_TIMELINE: PlanTaskTemplate[] = [
  { title: "تأكيد حجز قاعة المؤتمر والمخطط الهندسي", category: "hall", daysBeforeEvent: 90 },
  { title: "إقرار الأجندة وقائمة المتحدثين", category: "planning", daysBeforeEvent: 60 },
  { title: "اعتماد مخططات أجنحة العرض وتوزيعها", category: "booths", daysBeforeEvent: 45 },
  { title: "تأكيد تجهيزات الصوت والعرض والبثّ", category: "av", daysBeforeEvent: 30 },
  { title: "تأكيد كابينات الترجمة الفورية واللغات", category: "translation", daysBeforeEvent: 30 },
  { title: "فتح باب التسجيل وإعداد منصة الحضور", category: "planning", daysBeforeEvent: 30 },
  { title: "تحديد قائمة ضيافة الاستراحات", category: "catering", daysBeforeEvent: 21 },
  { title: "إعداد خطة النقل للحضور والمتحدثين", category: "transport", daysBeforeEvent: 14 },
  { title: "اعتماد خطة التنظيم والأمن ومسارات الدخول", category: "security", daysBeforeEvent: 14 },
  { title: "تنسيق تغطية التصوير والمحتوى الإعلامي", category: "photography", daysBeforeEvent: 10 },
  { title: "التجربة الفنية الكاملة على الموقع", category: "av", daysBeforeEvent: 2 },
  { title: "تركيب الأجنحة وتجهيز مكاتب التسجيل", category: "booths", daysBeforeEvent: 1 },
  { title: "يوم الافتتاح", category: null, daysBeforeEvent: 0 },
];

export interface GeneratedTask {
  title: string;
  category: ProviderCategory | null;
  dueDate: string; // ISO date
}

export function generateExecutionPlan(
  eventDateISO: string,
  bookedCategories: ProviderCategory[],
  track: EventTrack = "social"
): GeneratedTask[] {
  const eventDate = new Date(eventDateISO);
  if (Number.isNaN(eventDate.getTime())) return [];

  const timeline = track === "conference" ? CONFERENCE_TIMELINE : SOCIAL_TIMELINE;

  return timeline
    .filter((t) => t.category === null || bookedCategories.includes(t.category))
    .map((t) => {
      const due = new Date(eventDate);
      due.setDate(due.getDate() - t.daysBeforeEvent);
      return { title: t.title, category: t.category, dueDate: due.toISOString().slice(0, 10) };
    });
}
