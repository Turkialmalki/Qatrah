/**
 * Demo data seeder for the Qatrah platform.
 *
 * Creates approved providers — including one that serves several categories —
 * with halls, adopted ready-made packages, and one custom listing that carries
 * the photo and full description the platform requires.
 *
 * Usage: npm run seed   (requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local)
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { SERVICE_PACKAGES, findPackage } from "../src/lib/catalog/packages";
import type { ProviderCategory } from "../src/lib/types/database";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

const DEMO_PASSWORD = "Qatrah@Demo2026";

/** A stock photo stands in for the provider upload a custom listing requires. */
const SAMPLE_IMAGE = "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80";

interface DemoProvider {
  email: string;
  full_name: string;
  business_name: string;
  /** First entry is the primary/display category. */
  categories: ProviderCategory[];
  halls?: { name: string; city: string; capacity_min: number; capacity_max: number; base_price: number }[];
  /** Ready-made packages this provider adopts. */
  packages?: string[];
  /** A listing written by the provider — needs an image and a full description. */
  custom?: { category: ProviderCategory; title: string; description: string; base_price: number; inclusions: string[] };
}

const PROVIDERS: DemoProvider[] = [
  {
    email: "hall-riyadh@qatrah.demo",
    full_name: "قصر الرياض للحفلات",
    business_name: "قصر الرياض للحفلات",
    categories: ["hall"],
    halls: [
      { name: "قاعة الماسة", city: "الرياض", capacity_min: 100, capacity_max: 400, base_price: 22000 },
      { name: "قاعة اللؤلؤة", city: "الرياض", capacity_min: 50, capacity_max: 150, base_price: 12000 },
    ],
  },
  {
    email: "catering-riyadh@qatrah.demo",
    full_name: "ضيافة الرياض",
    business_name: "ضيافة الرياض للتموين",
    categories: ["catering"],
    packages: ["catering-buffet-basic", "catering-buffet-standard", "catering-buffet-premium"],
  },
  {
    // Serves three categories at once — the multi-service case.
    email: "decor-riyadh@qatrah.demo",
    full_name: "لمسات ديكور",
    business_name: "لمسات للديكور والتصميم",
    categories: ["decor", "planning", "photography"],
    packages: ["decor-classic-basic", "decor-modern-standard", "planning-day-basic", "photo-essentials-basic"],
    custom: {
      category: "decor",
      title: "ديكور بطابع نجدي معاصر",
      description:
        "تصميم وتنفيذ ديكور مستوحى من العمارة النجدية بلمسة معاصرة: جدران طينية مُعاد تفسيرها، أعمال خشب محفورة يدوياً، وإضاءة دافئة تبرز التفاصيل. يشمل العرض زيارة معاينة للموقع، تصميماً ثلاثي الأبعاد قبل التنفيذ، وفريق تركيب وفك كامل يوم المناسبة.",
      base_price: 38000,
      inclusions: [
        "زيارة معاينة وتصميم ثلاثي الأبعاد",
        "أعمال خشب محفورة يدوياً",
        "إضاءة دافئة مخصصة",
        "فريق تركيب وفك",
      ],
    },
  },
  {
    email: "photo-riyadh@qatrah.demo",
    full_name: "عدسة الرياض",
    business_name: "استوديو عدسة الرياض",
    categories: ["photography"],
    packages: ["photo-full-standard", "photo-cinematic-premium"],
  },
  {
    // Conference specialist covering the new categories.
    email: "av-riyadh@qatrah.demo",
    full_name: "تقنيات العرض",
    business_name: "تقنيات العرض للمؤتمرات",
    categories: ["av", "translation", "booths"],
    packages: [
      "av-conference-basic",
      "av-conference-standard",
      "av-hybrid-premium",
      "translation-booth-standard",
      "booths-standard",
      "booths-premium",
    ],
  },
  {
    email: "logistics-riyadh@qatrah.demo",
    full_name: "الرياض للخدمات اللوجستية",
    business_name: "الرياض للتنظيم والنقل",
    categories: ["security", "transport"],
    packages: ["security-standard", "transport-standard"],
  },
];

async function main() {
  const { data: existing } = await supabase.auth.admin.listUsers();

  for (const p of PROVIDERS) {
    let userId = existing.users.find((u) => u.email === p.email)?.id;

    if (!userId) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: p.email,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: p.full_name,
          role: "provider",
          business_name: p.business_name,
          category: p.categories[0],
          categories: p.categories,
        },
      });
      if (error) {
        console.error(`Failed to create ${p.email}:`, error.message);
        continue;
      }
      userId = data.user!.id;
      console.log(`Created provider ${p.business_name}`);
    } else {
      console.log(`Provider ${p.business_name} already exists`);
    }

    await supabase
      .from("provider_profiles")
      .update({
        status: "approved",
        category: p.categories[0],
        categories: p.categories,
        years_experience: 8,
        quality_score: 4.5,
        completed_jobs: 25,
      })
      .eq("id", userId);

    for (const h of p.halls ?? []) {
      const { data: hall } = await supabase
        .from("halls")
        .select("id")
        .eq("provider_id", userId)
        .eq("name", h.name)
        .maybeSingle();
      if (!hall) {
        await supabase.from("halls").insert({
          provider_id: userId,
          ...h,
          amenities: ["موقف سيارات", "تكييف مركزي", "إضاءة احترافية"],
        });
      }
    }

    for (const key of p.packages ?? []) {
      const pkg = findPackage(key);
      if (!pkg) {
        console.warn(`Unknown package key: ${key}`);
        continue;
      }
      const { data: svc } = await supabase
        .from("services")
        .select("id")
        .eq("provider_id", userId)
        .eq("package_key", key)
        .maybeSingle();
      if (!svc) {
        await supabase.from("services").insert({
          provider_id: userId,
          category: pkg.category,
          title: pkg.title,
          description: pkg.description,
          unit: pkg.unit,
          base_price: pkg.basePrice,
          package_key: pkg.key,
          inclusions: pkg.inclusions,
        });
      }
    }

    if (p.custom) {
      const { data: svc } = await supabase
        .from("services")
        .select("id")
        .eq("provider_id", userId)
        .eq("title", p.custom.title)
        .maybeSingle();
      if (!svc) {
        // Custom listings must carry an image and a full description.
        await supabase.from("services").insert({
          provider_id: userId,
          category: p.custom.category,
          title: p.custom.title,
          description: p.custom.description,
          unit: "package",
          base_price: p.custom.base_price,
          package_key: null,
          inclusions: p.custom.inclusions,
          images: [SAMPLE_IMAGE],
        });
      }
    }
  }

  console.log(`\nSeeded ${PROVIDERS.length} providers from ${SERVICE_PACKAGES.length} available packages.`);
  console.log(`Demo provider password: ${DEMO_PASSWORD}`);
}

main().then(() => process.exit(0));
