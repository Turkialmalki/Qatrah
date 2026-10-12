// باقات الخدمات الجاهزة — platform-defined service packages.
//
// Every service category ships a small set of ready-made packages. A provider
// either adopts one of these (price and inclusions are pre-filled, so listing a
// service takes one click) or writes their own listing — and a custom listing
// must carry a photo and a full description, enforced both in
// `createServiceAction` and by the `services_custom_requires_media` constraint.

import type { ProviderCategory } from "@/lib/types/database";

export type PackageTier = "basic" | "standard" | "premium";

export interface ServicePackage {
  /** Stable identifier stored on `services.package_key`. */
  key: string;
  category: ProviderCategory;
  tier: PackageTier;
  title: string;
  description: string;
  /** What the package covers — copied onto `services.inclusions`. */
  inclusions: string[];
  basePrice: number;
  /** package | per_person | per_hour | per_day — matches `services.unit`. */
  unit: string;
}

export const TIER_LABELS: Record<PackageTier, string> = {
  basic: "أساسية",
  standard: "قياسية",
  premium: "متميزة",
};

export const UNIT_LABELS: Record<string, string> = {
  package: "للباقة",
  per_person: "للفرد",
  per_hour: "للساعة",
  per_day: "لليوم",
};

export const SERVICE_PACKAGES: ServicePackage[] = [
  // ------------------------------------------------------------------ ضيافة
  {
    key: "catering-buffet-basic",
    category: "catering",
    tier: "basic",
    title: "بوفيه ضيافة أساسي",
    description: "بوفيه مفتوح يغطي الأطباق الرئيسية والمقبلات والحلويات، مع طاقم تقديم وتجهيز الطاولات.",
    inclusions: ["٣ أطباق رئيسية", "٥ أنواع مقبلات", "حلويات وقهوة عربية", "طاقم تقديم ٤ أفراد", "أدوات تقديم وتجهيز الطاولات"],
    basePrice: 95,
    unit: "per_person",
  },
  {
    key: "catering-buffet-standard",
    category: "catering",
    tier: "standard",
    title: "بوفيه ضيافة متكامل",
    description: "بوفيه موسّع بتنويعة عربية وعالمية، مع محطات تقديم حيّة وإشراف شيف على الموقع.",
    inclusions: ["٥ أطباق رئيسية", "٨ أنواع مقبلات", "محطة شاورما أو مشاوي حيّة", "بوفيه حلويات موسّع", "طاقم تقديم ٨ أفراد", "إشراف شيف على الموقع"],
    basePrice: 165,
    unit: "per_person",
  },
  {
    key: "catering-buffet-premium",
    category: "catering",
    tier: "premium",
    title: "ضيافة فاخرة بخدمة الطاولات",
    description: "تجربة ضيافة راقية بخدمة تقديم على الطاولات، قائمة مخصصة بالتنسيق مع العميل، وتنسيق كامل لتجهيزات الطعام.",
    inclusions: ["قائمة مخصصة بالتنسيق مع الشيف", "خدمة تقديم على الطاولات", "محطات ضيافة فاخرة", "بار قهوة ومشروبات متخصص", "طاقم تقديم ١٥ فرداً", "تنسيق وإشراف كامل ليوم المناسبة"],
    basePrice: 290,
    unit: "per_person",
  },

  // ------------------------------------------------------------------- ديكور
  {
    key: "decor-classic-basic",
    category: "decor",
    tier: "basic",
    title: "ديكور كلاسيكي أساسي",
    description: "تنسيق كلاسيكي أنيق لمسرح المناسبة ومدخل القاعة، بإضاءة محيطة وتنسيق زهور طبيعية.",
    inclusions: ["تنسيق مسرح المناسبة", "تنسيق مدخل القاعة", "إضاءة محيطة", "زهور طبيعية للطاولات", "التركيب والفك"],
    basePrice: 9000,
    unit: "package",
  },
  {
    key: "decor-modern-standard",
    category: "decor",
    tier: "standard",
    title: "ديكور عصري متكامل",
    description: "تصميم عصري متكامل يشمل خلفية المسرح، ممر الدخول، وتنسيق الطاولات، مع لوحة ألوان مخصصة ومخطط إضاءة.",
    inclusions: ["تصميم ثلاثي الأبعاد قبل التنفيذ", "خلفية مسرح مخصصة", "ممر دخول منسّق", "تنسيق كامل للطاولات", "مخطط إضاءة احترافي", "لوحة ألوان مخصصة"],
    basePrice: 24000,
    unit: "package",
  },
  {
    key: "decor-luxury-premium",
    category: "decor",
    tier: "premium",
    title: "ديكور فاخر بتصميم مخصص",
    description: "هوية بصرية كاملة للمناسبة من التصميم حتى التنفيذ، بعناصر مصنوعة خصيصاً وإشراف فني على الموقع.",
    inclusions: ["هوية بصرية كاملة للمناسبة", "عناصر ديكور مصنوعة خصيصاً", "تنسيق زهور فاخر", "إضاءة مسرحية وتأثيرات", "فريق تنفيذ وإشراف فني", "تجربة تركيب قبل الموعد"],
    basePrice: 65000,
    unit: "package",
  },

  // ------------------------------------------------------------------- تصوير
  {
    key: "photo-essentials-basic",
    category: "photography",
    tier: "basic",
    title: "تغطية تصوير أساسية",
    description: "تغطية فوتوغرافية لأهم لحظات المناسبة بمصوّر واحد، مع تسليم الصور المعالجة رقمياً.",
    inclusions: ["مصوّر فوتوغرافي واحد", "تغطية ٤ ساعات", "١٥٠ صورة معالجة", "تسليم رقمي خلال ٧ أيام"],
    basePrice: 4500,
    unit: "package",
  },
  {
    key: "photo-full-standard",
    category: "photography",
    tier: "standard",
    title: "تغطية فوتوغرافية وفيديو",
    description: "تغطية متكاملة بالصور والفيديو ليوم المناسبة، مع فيلم ملخص قصير ومونتاج احترافي.",
    inclusions: ["مصوّر فوتوغرافي ومصوّر فيديو", "تغطية ٨ ساعات", "٤٠٠ صورة معالجة", "فيلم ملخص ٣ دقائق", "ألبوم مطبوع"],
    basePrice: 11000,
    unit: "package",
  },
  {
    key: "photo-cinematic-premium",
    category: "photography",
    tier: "premium",
    title: "تغطية سينمائية كاملة",
    description: "فريق تصوير كامل بتغطية سينمائية متعددة الكاميرات، تصوير جوي، وإنتاج فيلم للمناسبة.",
    inclusions: ["فريق من ٤ مصوّرين", "تغطية يوم كامل", "تصوير جوي بطائرة مسيّرة", "٨٠٠ صورة معالجة", "فيلم سينمائي ١٠ دقائق", "ألبوم فاخر وبثّ مباشر"],
    basePrice: 28000,
    unit: "package",
  },

  // ------------------------------------------------------------------ موسيقى
  {
    key: "music-dj-basic",
    category: "music",
    tier: "basic",
    title: "دي جي وصوتيات",
    description: "دي جي محترف مع منظومة صوت مناسبة لحجم القاعة وإضاءة راقصة أساسية.",
    inclusions: ["دي جي محترف", "منظومة صوت للقاعة", "إضاءة راقصة أساسية", "تغطية ٤ ساعات"],
    basePrice: 3500,
    unit: "package",
  },
  {
    key: "music-band-standard",
    category: "music",
    tier: "standard",
    title: "فرقة موسيقية حيّة",
    description: "فرقة موسيقية حيّة بتشكيلة تناسب طابع المناسبة، مع منظومة صوت كاملة ومهندس صوت.",
    inclusions: ["فرقة من ٥ عازفين", "منظومة صوت كاملة", "مهندس صوت", "تغطية ٣ ساعات", "تنسيق قائمة الأغاني"],
    basePrice: 14000,
    unit: "package",
  },

  // ------------------------------------------------------- تنسيق وتخطيط
  {
    key: "planning-day-basic",
    category: "planning",
    tier: "basic",
    title: "تنسيق يوم المناسبة",
    description: "منسّق مناسبات يدير يوم الحفل كاملاً، ينظّم الجدول الزمني ويتابع جميع مقدمي الخدمة على الموقع.",
    inclusions: ["منسّق على الموقع يوم المناسبة", "إدارة الجدول الزمني", "متابعة مقدمي الخدمة", "اجتماع تحضيري واحد"],
    basePrice: 6000,
    unit: "package",
  },
  {
    key: "planning-full-premium",
    category: "planning",
    tier: "premium",
    title: "تخطيط وإدارة كاملة",
    description: "إدارة المناسبة من الفكرة حتى الإغلاق: اختيار الموردين، إدارة الميزانية، ومتابعة التنفيذ بفريق كامل.",
    inclusions: ["مدير مناسبة مخصص", "اختيار وتعاقد الموردين", "إدارة الميزانية والتدفقات", "جدول تنفيذ تفصيلي", "فريق تنسيق يوم المناسبة", "تقرير إغلاق المشروع"],
    basePrice: 32000,
    unit: "package",
  },

  // -------------------------------------------- صوتيات وعرض (مؤتمرات)
  {
    key: "av-conference-basic",
    category: "av",
    tier: "basic",
    title: "تجهيزات صوت وعرض أساسية",
    description: "منظومة صوت ومنصة عرض لقاعة مؤتمر واحدة، مع فني تشغيل خلال أيام الفعالية.",
    inclusions: ["منظومة صوت للقاعة", "شاشة عرض ومسلاط", "٤ ميكروفونات", "فني تشغيل على الموقع"],
    basePrice: 7500,
    unit: "per_day",
  },
  {
    key: "av-conference-standard",
    category: "av",
    tier: "standard",
    title: "تجهيزات مؤتمرات متكاملة",
    description: "تجهيز كامل لقاعة المؤتمر بشاشات LED، منظومة صوت احترافية، وتحكم مركزي بالعرض والتسجيل.",
    inclusions: ["شاشة LED رئيسية", "منظومة صوت احترافية", "١٢ ميكروفوناً سلكياً ولاسلكياً", "غرفة تحكم وتسجيل الجلسات", "فريق فني من ٣ أفراد", "إضاءة مسرح المتحدثين"],
    basePrice: 24000,
    unit: "per_day",
  },
  {
    key: "av-hybrid-premium",
    category: "av",
    tier: "premium",
    title: "تجهيزات مؤتمر هجين وبثّ مباشر",
    description: "تجهيزات كاملة لمؤتمر هجين مع بثّ مباشر متعدد الكاميرات ومنصة حضور افتراضي.",
    inclusions: ["بثّ مباشر متعدد الكاميرات", "منصة حضور افتراضي", "شاشات LED متعددة", "منظومة صوت وإضاءة متكاملة", "تسجيل وأرشفة كل الجلسات", "فريق فني من ٨ أفراد"],
    basePrice: 68000,
    unit: "per_day",
  },

  // ------------------------------------------------ ترجمة فورية (مؤتمرات)
  {
    key: "translation-booth-standard",
    category: "translation",
    tier: "standard",
    title: "ترجمة فورية ثنائية اللغة",
    description: "كابينة ترجمة فورية معتمدة مع مترجمين محترفين وأجهزة استقبال للحضور.",
    inclusions: ["كابينة ترجمة معزولة", "مترجمان محترفان", "١٠٠ جهاز استقبال", "فني تشغيل", "تغطية يوم كامل"],
    basePrice: 16000,
    unit: "per_day",
  },

  // ------------------------------------------ أجنحة ومعارض (مؤتمرات)
  {
    key: "booths-standard",
    category: "booths",
    tier: "standard",
    title: "جناح معرض قياسي",
    description: "جناح معرض جاهز بمساحة ٩ أمتار مربعة، يشمل التصميم والتركيب والطباعة والأثاث.",
    inclusions: ["مساحة ٣×٣ أمتار", "تصميم وطباعة الواجهة", "طاولة استقبال ومقاعد", "إضاءة ونقاط كهرباء", "التركيب والفك"],
    basePrice: 12000,
    unit: "package",
  },
  {
    key: "booths-premium",
    category: "booths",
    tier: "premium",
    title: "جناح معرض مخصص",
    description: "جناح مصمم خصيصاً بمساحة موسّعة، بعناصر تفاعلية وشاشات عرض وتصميم ثلاثي الأبعاد قبل التنفيذ.",
    inclusions: ["مساحة ٦×٦ أمتار", "تصميم ثلاثي الأبعاد مخصص", "شاشات عرض تفاعلية", "منطقة اجتماعات مغلقة", "مضيفون على الجناح", "التركيب والتشغيل والفك"],
    basePrice: 48000,
    unit: "package",
  },

  // ------------------------------------------------------- تنظيم وأمن
  {
    key: "security-standard",
    category: "security",
    tier: "standard",
    title: "تنظيم وأمن الفعالية",
    description: "فريق تنظيم وأمن معتمد لإدارة دخول الحضور، تنظيم المسارات، وتأمين الموقع خلال الفعالية.",
    inclusions: ["١٠ أفراد تنظيم وأمن", "إدارة بوابات الدخول", "تنظيم مسارات الحضور", "مشرف ميداني", "تغطية يوم كامل"],
    basePrice: 9500,
    unit: "per_day",
  },

  // ---------------------------------------------------------- نقل الحضور
  {
    key: "transport-standard",
    category: "transport",
    tier: "standard",
    title: "نقل الحضور والمتحدثين",
    description: "خدمة نقل منظمة للحضور والمتحدثين بين الفندق وموقع الفعالية، مع تنسيق الجدول والسائقين.",
    inclusions: ["حافلتان سعة ٥٠ راكباً", "٣ سيارات للمتحدثين", "تنسيق جدول الرحلات", "سائقون محترفون", "تغطية يوم كامل"],
    basePrice: 8000,
    unit: "per_day",
  },
];

/** Packages offered for one category, cheapest tier first. */
export function packagesForCategory(category: ProviderCategory): ServicePackage[] {
  const order: Record<PackageTier, number> = { basic: 0, standard: 1, premium: 2 };
  return SERVICE_PACKAGES.filter((p) => p.category === category).sort((a, b) => order[a.tier] - order[b.tier]);
}

export function findPackage(key: string): ServicePackage | undefined {
  return SERVICE_PACKAGES.find((p) => p.key === key);
}

/** Categories that have at least one ready-made package. */
export function categoriesWithPackages(): ProviderCategory[] {
  return Array.from(new Set(SERVICE_PACKAGES.map((p) => p.category)));
}
