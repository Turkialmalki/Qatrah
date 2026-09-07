/**
 * Demo data seeder for the Qatrah platform.
 * Creates a few approved providers with halls/services so the landing
 * pages and matching engine have real data to work with.
 *
 * Usage: npm run seed   (requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local)
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

const PROVIDERS = [
  {
    email: "hall-riyadh@qatrah.demo",
    full_name: "قصر الرياض للحفلات",
    business_name: "قصر الرياض للحفلات",
    category: "hall",
    halls: [
      { name: "قاعة الماسة", city: "الرياض", capacity_min: 100, capacity_max: 400, base_price: 22000 },
      { name: "قاعة اللؤلؤة", city: "الرياض", capacity_min: 50, capacity_max: 150, base_price: 12000 },
    ],
  },
  {
    email: "catering-riyadh@qatrah.demo",
    full_name: "ضيافة الرياض",
    business_name: "ضيافة الرياض للتموين",
    category: "catering",
    services: [{ title: "باقة ضيافة فاخرة", category: "catering", base_price: 15000, description: "بوفيه مفتوح لـ150 ضيف" }],
  },
  {
    email: "decor-riyadh@qatrah.demo",
    full_name: "لمسات ديكور",
    business_name: "لمسات للديكور والتصميم",
    category: "decor",
    services: [{ title: "تصميم ديكور كلاسيكي", category: "decor", base_price: 9000, description: "ديكور ذهبي كلاسيكي مع إضاءة" }],
  },
  {
    email: "photo-riyadh@qatrah.demo",
    full_name: "عدسة الرياض",
    business_name: "استوديو عدسة الرياض",
    category: "photography",
    services: [{ title: "تغطية تصوير كاملة", category: "photography", base_price: 6000, description: "تصوير فوتوغرافي وفيديو ليوم كامل" }],
  },
];

async function main() {
  for (const p of PROVIDERS) {
    const { data: existing } = await supabase.auth.admin.listUsers();
    const already = existing.users.find((u) => u.email === p.email);
    let userId = already?.id;

    if (!userId) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: p.email,
        password: "Qatrah@Demo2026",
        email_confirm: true,
        user_metadata: { full_name: p.full_name, role: "provider", business_name: p.business_name, category: p.category },
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

    await supabase.from("provider_profiles").update({ status: "approved", years_experience: 8, quality_score: 4.5, completed_jobs: 25 }).eq("id", userId);

    if (p.halls) {
      for (const h of p.halls) {
        await supabase.from("halls").upsert(
          { provider_id: userId, ...h, amenities: ["موقف سيارات", "تكييف مركزي", "إضاءة احترافية"] },
          { onConflict: "id" }
        );
      }
    }
    if (p.services) {
      for (const s of p.services) {
        const { data: existingService } = await supabase.from("services").select("id").eq("provider_id", userId).eq("title", s.title).maybeSingle();
        if (!existingService) {
          await supabase.from("services").insert({ provider_id: userId, ...s, unit: "package" });
        }
      }
    }
  }

  console.log("\nSeed complete. Demo provider password: Qatrah@Demo2026");
}

main().then(() => process.exit(0));
