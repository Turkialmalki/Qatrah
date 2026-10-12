// The demo dataset.
//
// This is the whole "database": a coherent snapshot that makes every page in
// all three dashboards show real content on a cold start. Writes during a
// session mutate these rows in memory and are lost when the server restarts —
// see `src/lib/demo/store.ts`.

import { findPackage } from "@/lib/catalog/packages";
import { hashPassword } from "@/lib/demo/password";
import type { Row, TableName } from "@/lib/demo/schema";

/** Password for every seeded account. Published in the README on purpose. */
export const DEMO_PASSWORD = "Qatrah@Demo2026";

/** Stock photography stands in for provider uploads in the demo data. */
const PHOTO = {
  hallMasa: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
  hallLulu: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=80",
  conferenceHall: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
  decor: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80",
  decorNajdi: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=1200&q=80",
  design1: "https://images.unsplash.com/photo-1465495910839-1ffb983ac3ba?w=1200&q=80",
  design2: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=80",
};

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

/** Credentials live beside the profile rows; passwords are stored hashed. */
export interface DemoUser {
  id: string;
  email: string;
  password_hash: string;
}

interface AccountSpec {
  id: string;
  email: string;
  full_name: string;
  role: "client" | "provider" | "admin";
  phone?: string;
  city?: string;
}

const ACCOUNTS: AccountSpec[] = [
  { id: "u-client", email: "client@qatrah.demo", full_name: "نورة العتيبي", role: "client", phone: "0551234567" },
  { id: "u-client2", email: "client2@qatrah.demo", full_name: "فهد الدوسري", role: "client", phone: "0559876543" },
  { id: "u-admin", email: "admin@qatrah.demo", full_name: "مدير منصة قاطرة", role: "admin" },
  { id: "p-hall", email: "hall-riyadh@qatrah.demo", full_name: "قصر الرياض للحفلات", role: "provider" },
  { id: "p-catering", email: "catering-riyadh@qatrah.demo", full_name: "ضيافة الرياض", role: "provider" },
  { id: "p-decor", email: "decor-riyadh@qatrah.demo", full_name: "لمسات ديكور", role: "provider" },
  { id: "p-photo", email: "photo-riyadh@qatrah.demo", full_name: "عدسة الرياض", role: "provider" },
  { id: "p-av", email: "av-riyadh@qatrah.demo", full_name: "تقنيات العرض", role: "provider" },
  { id: "p-logistics", email: "logistics-riyadh@qatrah.demo", full_name: "الرياض للخدمات اللوجستية", role: "provider" },
];

interface ProviderSpec {
  id: string;
  business_name: string;
  categories: string[];
  bio: string;
  years_experience: number;
  quality_score: number;
  completed_jobs: number;
  status?: string;
}

const PROVIDERS: ProviderSpec[] = [
  {
    id: "p-hall",
    business_name: "قصر الرياض للحفلات",
    categories: ["hall"],
    bio: "قاعتان في شمال الرياض بسعات مختلفة، بخبرة تمتد لأكثر من عشر سنوات في استضافة الأفراح والمناسبات الكبرى.",
    years_experience: 12,
    quality_score: 4.7,
    completed_jobs: 180,
  },
  {
    id: "p-catering",
    business_name: "ضيافة الرياض للتموين",
    categories: ["catering"],
    bio: "بوفيهات وخدمة تقديم بإشراف طهاة محترفين، بقوائم عربية وعالمية تناسب الأفراح والمؤتمرات.",
    years_experience: 9,
    quality_score: 4.5,
    completed_jobs: 240,
  },
  {
    // The multi-category provider — three lines of business at once.
    id: "p-decor",
    business_name: "لمسات للديكور والتصميم",
    categories: ["decor", "planning", "photography"],
    bio: "استوديو تصميم يقدم الديكور وتنسيق المناسبات والتصوير تحت سقف واحد، بهوية بصرية متكاملة لكل مناسبة.",
    years_experience: 7,
    quality_score: 4.8,
    completed_jobs: 95,
  },
  {
    id: "p-photo",
    business_name: "استوديو عدسة الرياض",
    categories: ["photography"],
    bio: "تغطية فوتوغرافية وسينمائية للأفراح والفعاليات، بفريق متخصص وتسليم سريع.",
    years_experience: 6,
    quality_score: 4.4,
    completed_jobs: 150,
  },
  {
    id: "p-av",
    business_name: "تقنيات العرض للمؤتمرات",
    categories: ["av", "translation", "booths"],
    bio: "تجهيزات صوت وعرض وبثّ مباشر، كابينات ترجمة فورية، وتصميم وتنفيذ أجنحة المعارض للمؤتمرات والفعاليات الكبرى.",
    years_experience: 11,
    quality_score: 4.6,
    completed_jobs: 70,
  },
  {
    id: "p-logistics",
    business_name: "الرياض للتنظيم والنقل",
    categories: ["security", "transport"],
    bio: "فرق تنظيم وأمن معتمدة وخدمات نقل منظمة للحضور والمتحدثين في الفعاليات والمؤتمرات.",
    years_experience: 8,
    quality_score: 4.2,
    completed_jobs: 60,
  },
  {
    // Left pending so the admin approvals queue is not empty.
    id: "p-pending",
    business_name: "ورود الشمال للتنسيق",
    categories: ["decor"],
    bio: "منشأة جديدة متخصصة في تنسيق الزهور والديكور، بانتظار اعتماد الإدارة.",
    years_experience: 2,
    quality_score: 0,
    completed_jobs: 0,
    status: "pending",
  },
];

/** Which ready-made packages each provider has adopted. */
const ADOPTED: Record<string, string[]> = {
  "p-catering": ["catering-buffet-basic", "catering-buffet-standard", "catering-buffet-premium"],
  "p-decor": ["decor-classic-basic", "decor-modern-standard", "planning-day-basic", "photo-essentials-basic"],
  "p-photo": ["photo-full-standard", "photo-cinematic-premium"],
  "p-av": [
    "av-conference-basic",
    "av-conference-standard",
    "av-hybrid-premium",
    "translation-booth-standard",
    "booths-standard",
    "booths-premium",
  ],
  "p-logistics": ["security-standard", "transport-standard"],
};

export interface SeedResult {
  tables: Record<TableName, Row[]>;
  users: DemoUser[];
}

export function buildSeed(): SeedResult {
  const passwordHash = hashPassword(DEMO_PASSWORD);

  const users: DemoUser[] = ACCOUNTS.map((a) => ({
    id: a.id,
    email: a.email,
    password_hash: passwordHash,
  }));
  // The pending provider has a login too, so the "awaiting approval" state is reachable.
  users.push({ id: "p-pending", email: "pending@qatrah.demo", password_hash: passwordHash });

  const profiles: Row[] = ACCOUNTS.map((a) => ({
    id: a.id,
    full_name: a.full_name,
    phone: a.phone ?? null,
    role: a.role,
    avatar_url: null,
    city: a.city ?? "الرياض",
    created_at: isoDaysAgo(120),
    updated_at: isoDaysAgo(120),
  }));
  profiles.push({
    id: "p-pending",
    full_name: "ورود الشمال للتنسيق",
    phone: null,
    role: "provider",
    avatar_url: null,
    city: "الرياض",
    created_at: isoDaysAgo(3),
    updated_at: isoDaysAgo(3),
  });

  const provider_profiles: Row[] = PROVIDERS.map((p) => ({
    id: p.id,
    business_name: p.business_name,
    category: p.categories[0],
    categories: p.categories,
    bio: p.bio,
    status: p.status ?? "approved",
    commercial_registration: `10${Math.abs(hashCode(p.id)) % 100000000}`,
    years_experience: p.years_experience,
    quality_score: p.quality_score,
    fair_price_index: 1,
    response_rate: 95,
    completed_jobs: p.completed_jobs,
    base_city: "الرياض",
    created_at: isoDaysAgo(100),
  }));

  // ---------------------------------------------------------------- halls
  const halls: Row[] = [
    {
      id: "h-masa",
      provider_id: "p-hall",
      name: "قاعة الماسة",
      city: "الرياض",
      address: "طريق الملك فهد، شمال الرياض",
      capacity_min: 100,
      capacity_max: 400,
      base_price: 22000,
      amenities: ["موقف سيارات", "تكييف مركزي", "إضاءة احترافية", "مسرح رئيسي", "غرفة عروس"],
      images: [PHOTO.hallMasa],
      is_active: true,
      created_at: isoDaysAgo(90),
    },
    {
      id: "h-lulu",
      provider_id: "p-hall",
      name: "قاعة اللؤلؤة",
      city: "الرياض",
      address: "حي الياسمين، الرياض",
      capacity_min: 50,
      capacity_max: 150,
      base_price: 12000,
      amenities: ["موقف سيارات", "تكييف مركزي", "شاشة عرض"],
      images: [PHOTO.hallLulu],
      is_active: true,
      created_at: isoDaysAgo(88),
    },
    {
      id: "h-conf",
      provider_id: "p-hall",
      name: "قاعة المؤتمرات الكبرى",
      city: "الرياض",
      address: "مركز الرياض للمؤتمرات",
      capacity_min: 200,
      capacity_max: 900,
      base_price: 48000,
      amenities: ["منصة متحدثين", "كابينات ترجمة", "شاشات LED", "موقف سيارات واسع", "قاعات فرعية"],
      images: [PHOTO.conferenceHall],
      is_active: true,
      created_at: isoDaysAgo(60),
    },
  ];

  // ------------------------------------------------------------- services
  const services: Row[] = [];
  let svcSeq = 0;
  for (const [providerId, keys] of Object.entries(ADOPTED)) {
    for (const key of keys) {
      const pkg = findPackage(key);
      if (!pkg) continue;
      svcSeq++;
      services.push({
        // Keyed off the package so match rows can reference it without
        // depending on iteration order.
        id: serviceId(key),
        provider_id: providerId,
        category: pkg.category,
        title: pkg.title,
        description: pkg.description,
        unit: pkg.unit,
        base_price: pkg.basePrice,
        min_price: null,
        max_price: null,
        package_key: pkg.key,
        inclusions: pkg.inclusions,
        images: [],
        is_active: true,
        created_at: isoDaysAgo(70 - svcSeq),
      });
    }
  }

  // A custom listing — carries the photo and full description the platform requires.
  services.push({
    id: "s-custom-najdi",
    provider_id: "p-decor",
    category: "decor",
    title: "ديكور بطابع نجدي معاصر",
    description:
      "تصميم وتنفيذ ديكور مستوحى من العمارة النجدية بلمسة معاصرة: جدران طينية مُعاد تفسيرها، أعمال خشب محفورة يدوياً، وإضاءة دافئة تبرز التفاصيل. يشمل العرض زيارة معاينة للموقع، تصميماً ثلاثي الأبعاد قبل التنفيذ، وفريق تركيب وفك كامل يوم المناسبة.",
    unit: "package",
    base_price: 38000,
    min_price: null,
    max_price: null,
    package_key: null,
    inclusions: [
      "زيارة معاينة وتصميم ثلاثي الأبعاد",
      "أعمال خشب محفورة يدوياً",
      "إضاءة دافئة مخصصة",
      "فريق تركيب وفك",
    ],
    images: [PHOTO.decorNajdi],
    is_active: true,
    created_at: isoDaysAgo(20),
  });

  // --------------------------------------------------------------- events
  // Event 1 — a wedding mid-execution, so bookings/payments/tasks all exist.
  // Event 2 — a conference still at the matching stage.
  const events: Row[] = [
    {
      id: "e-wedding",
      client_id: "u-client",
      title: "حفل زفاف نورة وعبدالله",
      event_type: "wedding",
      city: "الرياض",
      guest_count: 250,
      event_date: daysFromNow(45),
      total_budget: 120000,
      status: "confirmed",
      notes: "نرغب بطابع كلاسيكي ذهبي، مع مراعاة قسم خاص للعائلة.",
      created_at: isoDaysAgo(30),
      updated_at: isoDaysAgo(5),
    },
    {
      id: "e-conference",
      client_id: "u-client",
      title: "مؤتمر التقنية المالية ٢٠٢٦",
      event_type: "conference",
      city: "الرياض",
      guest_count: 600,
      event_date: daysFromNow(120),
      total_budget: 480000,
      status: "matched",
      notes: "مؤتمر على يومين بجلسات متوازية ومعرض مصاحب.",
      created_at: isoDaysAgo(12),
      updated_at: isoDaysAgo(2),
    },
    {
      id: "e-graduation",
      client_id: "u-client2",
      title: "حفل تخرج كلية الهندسة",
      event_type: "graduation",
      city: "الرياض",
      guest_count: 180,
      event_date: daysFromNow(70),
      total_budget: 60000,
      status: "planning",
      notes: null,
      created_at: isoDaysAgo(6),
      updated_at: isoDaysAgo(6),
    },
  ];

  const conference_details: Row[] = [
    {
      event_id: "e-conference",
      organizer_entity: "جمعية التقنية المالية",
      days_count: 2,
      sessions_count: 14,
      speakers_count: 22,
      needs_av: true,
      needs_translation: true,
      needs_booths: true,
      booths_count: 30,
      needs_registration: true,
      needs_security: true,
      needs_transport: true,
      agenda_notes:
        "اليوم الأول: الجلسة الافتتاحية ثم أربع جلسات متوازية. اليوم الثاني: ورش عمل تطبيقية ومعرض مصاحب، مع حفل ختام وتكريم.",
      created_at: isoDaysAgo(12),
    },
  ];

  // Budget splits — mirror what the optimizer would produce.
  const event_requirements: Row[] = [
    req("r-w1", "e-wedding", "hall", 5, 44000),
    req("r-w2", "e-wedding", "catering", 4, 38000),
    req("r-w3", "e-wedding", "decor", 4, 24000),
    req("r-w4", "e-wedding", "photography", 3, 14000),
    req("r-c1", "e-conference", "hall", 5, 150000),
    req("r-c2", "e-conference", "av", 5, 140000),
    req("r-c3", "e-conference", "booths", 4, 90000),
    req("r-c4", "e-conference", "catering", 3, 60000),
    req("r-c5", "e-conference", "translation", 3, 40000),
    req("r-g1", "e-graduation", "hall", 4, 30000),
    req("r-g2", "e-graduation", "catering", 3, 20000),
    req("r-g3", "e-graduation", "photography", 3, 10000),
  ];

  // -------------------------------------------------------------- matches
  const matches: Row[] = [
    match("m-w1", "e-wedding", "r-w1", "p-hall", { hall_id: "h-masa" }, 92.4, 22000, -8.5, "accepted"),
    match("m-w2", "e-wedding", "r-w2", "p-catering", { service_id: serviceId("catering-buffet-standard") }, 88.1, 24750, 4.2, "accepted"),
    match("m-w3", "e-wedding", "r-w3", "p-decor", { service_id: serviceId("decor-modern-standard") }, 85.6, 24000, -2.1, "accepted"),
    match("m-w4", "e-wedding", "r-w4", "p-photo", { service_id: serviceId("photo-full-standard") }, 79.3, 11000, 6.8, "proposed"),
    match("m-c1", "e-conference", "r-c1", "p-hall", { hall_id: "h-conf" }, 90.8, 48000, -5.0, "proposed"),
    match("m-c2", "e-conference", "r-c2", "p-av", { service_id: serviceId("av-conference-standard") }, 94.2, 24000, -3.4, "quoted"),
    match("m-c3", "e-conference", "r-c3", "p-av", { service_id: serviceId("booths-premium") }, 87.5, 48000, 9.1, "proposed"),
    match("m-c4", "e-conference", "r-c5", "p-av", { service_id: serviceId("translation-booth-standard") }, 82.0, 16000, 1.5, "proposed"),
  ];

  // ------------------------------------------------- bookings & payments
  const bookings: Row[] = [
    booking("b-w1", "e-wedding", "m-w1", "p-hall", "u-client", 22000, "paid"),
    booking("b-w2", "e-wedding", "m-w2", "p-catering", "u-client", 24750, "paid"),
    booking("b-w3", "e-wedding", "m-w3", "p-decor", "u-client", 24000, "pending_payment"),
  ];

  const payments: Row[] = [
    { id: "pay-1", booking_id: "b-w1", amount: 22000, status: "paid", method: "card", paid_at: isoDaysAgo(20), created_at: isoDaysAgo(20) },
    { id: "pay-2", booking_id: "b-w2", amount: 24750, status: "paid", method: "card", paid_at: isoDaysAgo(14), created_at: isoDaysAgo(14) },
  ];

  const settlements: Row[] = [
    settlement("st-1", "b-w1", "p-hall", 22000, "released"),
    settlement("st-2", "b-w2", "p-catering", 24750, "pending"),
  ];

  // --------------------------------------------------------- execution
  // owner_provider_id is set so the provider's execution page has content.
  const execution_tasks: Row[] = [
    task("t-1", "e-wedding", "تأكيد حجز القاعة والدفعة الأولى", "hall", -40, "done", "p-hall", 0),
    task("t-2", "e-wedding", "اعتماد تصميم الديكور النهائي", "decor", -10, "in_progress", "p-decor", 1),
    task("t-3", "e-wedding", "تحديد قائمة الطعام والعدد النهائي للضيوف", "catering", 10, "todo", "p-catering", 2),
    task("t-4", "e-wedding", "تنسيق مواعيد التصوير", "photography", 20, "todo", "p-photo", 3),
    task("t-5", "e-wedding", "المراجعة النهائية لخطة التنفيذ", "planning", 38, "todo", "p-decor", 4),
    task("t-6", "e-wedding", "تركيب الديكور وتجهيز القاعة", "decor", 44, "todo", "p-decor", 5),
    task("t-7", "e-wedding", "يوم التنفيذ", null, 45, "todo", null, 6),
  ];

  // ----------------------------------------------------------- quality
  const quality_checks: Row[] = [
    {
      id: "q-1",
      booking_id: "b-w1",
      checklist: [
        { label: "مطابقة القاعة للمواصفات المتفق عليها", passed: true },
        { label: "الالتزام بموعد التجهيز", passed: true },
        { label: "نظافة الموقع قبل الاستلام", passed: true },
      ],
      status: "passed",
      reviewed_by: "u-admin",
      notes: "تم التحقق ميدانياً، لا ملاحظات.",
      created_at: isoDaysAgo(18),
    },
    {
      id: "q-2",
      booking_id: "b-w2",
      checklist: [
        { label: "مطابقة قائمة الطعام للعرض", passed: true },
        { label: "عدد طاقم التقديم", passed: false },
      ],
      status: "flagged",
      reviewed_by: "u-admin",
      notes: "طاقم التقديم أقل بفردين عن المتفق عليه — بانتظار رد مقدم الخدمة.",
      created_at: isoDaysAgo(9),
    },
  ];

  // -------------------------------------------------------- evaluations
  const evaluations: Row[] = [
    {
      id: "ev-1",
      booking_id: "b-w1",
      client_id: "u-client",
      provider_id: "p-hall",
      rating_quality: 5,
      rating_price: 4,
      rating_timeliness: 5,
      comment: "القاعة كانت نظيفة ومجهزة بالكامل، والتعامل كان راقياً من أول زيارة.",
      created_at: isoDaysAgo(15),
    },
    {
      id: "ev-2",
      booking_id: "b-w2",
      client_id: "u-client",
      provider_id: "p-catering",
      rating_quality: 4,
      rating_price: 4,
      rating_timeliness: 3,
      comment: "الطعام ممتاز، لكن التجهيز تأخر قليلاً عن الموعد.",
      created_at: isoDaysAgo(8),
    },
  ];

  // ------------------------------------------------------------ design
  const design_concepts: Row[] = [
    {
      id: "d-1",
      event_id: "e-wedding",
      provider_id: "p-decor",
      title: "تصور كلاسيكي ذهبي",
      palette: ["ذهبي", "عاجي", "أبيض"],
      style: "كلاسيكي",
      images: [PHOTO.design1],
      estimated_cost: 24000,
      is_selected: true,
      created_at: isoDaysAgo(22),
    },
    {
      id: "d-2",
      event_id: "e-wedding",
      provider_id: "p-decor",
      title: "تصور نجدي معاصر",
      palette: ["ترابي", "نحاسي", "أخضر زيتي"],
      style: "نجدي معاصر",
      images: [PHOTO.decorNajdi],
      estimated_cost: 38000,
      is_selected: false,
      created_at: isoDaysAgo(21),
    },
    {
      id: "d-3",
      event_id: "e-wedding",
      provider_id: null,
      title: "تصور عصري مبسّط",
      palette: ["أبيض", "رمادي فاتح", "أخضر"],
      style: "عصري",
      images: [PHOTO.design2],
      estimated_cost: 19000,
      is_selected: false,
      created_at: isoDaysAgo(19),
    },
  ];

  // ---------------------------------------------------- knowledge base
  const knowledge_base: Row[] = [
    {
      id: "kb-1",
      category: "الميزانية",
      title: "كيف توزّع ميزانية حفل زفافك؟",
      content:
        "القاعدة العملية أن القاعة تستهلك نحو ٣٥٪ من الميزانية، والضيافة ٢٥٪، والديكور ١٥٪، والتصوير ١٠٪، ويبقى الباقي للموسيقى والتنسيق واحتياطي للطوارئ. ابدأ بتحديد عدد الضيوف أولاً لأنه العامل الأكبر تأثيراً على التكلفة: كل زيادة في العدد ترفع تكلفة الضيافة والقاعة معاً. واحتفظ دائماً بنسبة ١٠٪ احتياطياً للمتغيرات غير المتوقعة.",
      tags: ["ميزانية", "زفاف", "تخطيط"],
      published: true,
      created_by: "u-admin",
      created_at: isoDaysAgo(60),
    },
    {
      id: "kb-2",
      category: "القاعات",
      title: "ما تسأل عنه قبل حجز القاعة",
      content:
        "اسأل عن السعة الفعلية بعد توزيع الطاولات لا السعة النظرية، وعن ساعات التجهيز المسموحة قبل المناسبة، وهل يُسمح بإدخال مزود ضيافة خارجي أم أن الضيافة حصرية على القاعة. تأكد كذلك من عدد مواقف السيارات، وسياسة الإلغاء والتأجيل مكتوبةً، ووجود مخرج طوارئ ومولد كهربائي احتياطي.",
      tags: ["قاعات", "حجز", "نصائح"],
      published: true,
      created_by: "u-admin",
      created_at: isoDaysAgo(50),
    },
    {
      id: "kb-3",
      category: "المؤتمرات",
      title: "جدول زمني لتنظيم مؤتمر ناجح",
      content:
        "ابدأ قبل ٩٠ يوماً بتثبيت القاعة والمخطط الهندسي، ثم أقرّ الأجندة وقائمة المتحدثين قبل ٦٠ يوماً. وزّع مخططات أجنحة العرض قبل ٤٥ يوماً، وثبّت تجهيزات الصوت والعرض وكابينات الترجمة قبل ٣٠ يوماً مع فتح باب التسجيل. قبل أسبوعين اعتمد خطة النقل والتنظيم والأمن، ولا تتخطَّ التجربة الفنية الكاملة على الموقع قبل يومين من الافتتاح.",
      tags: ["مؤتمرات", "تخطيط", "فعاليات"],
      published: true,
      created_by: "u-admin",
      created_at: isoDaysAgo(30),
    },
  ];

  return {
    users,
    tables: {
      profiles,
      provider_profiles,
      halls,
      services,
      events,
      event_requirements,
      conference_details,
      design_concepts,
      matches,
      bookings,
      payments,
      execution_tasks,
      quality_checks,
      evaluations,
      settlements,
      knowledge_base,
    },
  };
}

// ----------------------------------------------------------------- helpers

/** Stable id for a service created from a ready-made package. */
function serviceId(packageKey: string): string {
  return `svc-${packageKey}`;
}

function req(id: string, event_id: string, category: string, priority: number, allocated_budget: number): Row {
  return { id, event_id, category, priority, allocated_budget, notes: null, created_at: isoDaysAgo(25) };
}

function match(
  id: string,
  event_id: string,
  requirement_id: string,
  provider_id: string,
  target: { hall_id?: string; service_id?: string },
  match_score: number,
  quoted_price: number,
  fair_price_delta: number,
  status: string
): Row {
  return {
    id,
    event_id,
    requirement_id,
    provider_id,
    hall_id: target.hall_id ?? null,
    service_id: target.service_id ?? null,
    match_score,
    score_breakdown: { budgetFit: 30.2, quality: 23.5, cityMatch: 15, capacityFit: 13.7, experience: 10 },
    status,
    quoted_price,
    fair_price_delta,
    created_at: isoDaysAgo(24),
  };
}

function booking(
  id: string,
  event_id: string,
  match_id: string,
  provider_id: string,
  client_id: string,
  amount: number,
  status: string
): Row {
  return { id, event_id, match_id, provider_id, client_id, amount, status, created_at: isoDaysAgo(23) };
}

function settlement(id: string, booking_id: string, provider_id: string, gross: number, status: string): Row {
  const commission_amount = Math.round(gross * 0.1);
  return {
    id,
    booking_id,
    provider_id,
    gross_amount: gross,
    commission_rate: 0.1,
    commission_amount,
    net_payout: gross - commission_amount,
    status,
    created_at: isoDaysAgo(19),
  };
}

function task(
  id: string,
  event_id: string,
  title: string,
  category: string | null,
  dueInDays: number,
  status: string,
  owner_provider_id: string | null,
  sort_order: number
): Row {
  return {
    id,
    event_id,
    booking_id: null,
    title,
    category,
    due_date: daysFromNow(dueInDays),
    status,
    owner_provider_id,
    sort_order,
    created_at: isoDaysAgo(20),
  };
}

/** Small stable hash, only used to fabricate plausible registration numbers. */
function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}
