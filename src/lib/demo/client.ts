// The demo data client. Mirrors the slice of the Supabase client the app uses
// (`.from`, `.auth`, `.storage`) so no page or server action had to change when
// the Postgres backend was swapped for the in-memory store.

import { hashPassword, verifyPassword } from "@/lib/demo/password";
import { fromTable } from "@/lib/demo/query";
import type { Row, TableName } from "@/lib/demo/schema";
import { currentUserId, endSession, startSession } from "@/lib/demo/session";
import { newId, store } from "@/lib/demo/store";

export interface DemoAuthUser {
  id: string;
  email: string;
}

const MIN_PASSWORD = 6;

async function getUser(): Promise<{ data: { user: DemoAuthUser | null }; error: null }> {
  const id = await currentUserId();
  if (!id) return { data: { user: null }, error: null };

  const user = store().users.find((u) => u.id === id);
  if (!user) return { data: { user: null }, error: null };

  return { data: { user: { id: user.id, email: user.email } }, error: null };
}

async function signInWithPassword(credentials: { email: string; password: string }) {
  const email = credentials.email.trim().toLowerCase();
  const user = store().users.find((u) => u.email.toLowerCase() === email);

  if (!user || !verifyPassword(credentials.password, user.password_hash)) {
    return { data: { user: null }, error: { message: "Invalid login credentials" } };
  }

  await startSession(user.id);
  return { data: { user: { id: user.id, email: user.email } }, error: null };
}

interface SignUpArgs {
  email: string;
  password: string;
  options?: { data?: Record<string, unknown> };
}

/**
 * Creates the account plus the rows the database trigger used to create:
 * a `profiles` row always, and a `provider_profiles` row for providers.
 */
async function signUp(args: SignUpArgs) {
  const email = args.email.trim().toLowerCase();
  const s = store();

  if (args.password.length < MIN_PASSWORD) {
    return { data: { user: null }, error: { message: "Password should be at least 6 characters" } };
  }
  if (s.users.some((u) => u.email.toLowerCase() === email)) {
    return { data: { user: null }, error: { message: "User already registered" } };
  }

  const meta = args.options?.data ?? {};
  const id = newId("user");

  s.users.push({ id, email, password_hash: hashPassword(args.password) });

  const role = typeof meta.role === "string" ? meta.role : "client";
  const now = new Date().toISOString();

  s.tables.profiles.push({
    id,
    full_name: typeof meta.full_name === "string" && meta.full_name ? meta.full_name : "مستخدم جديد",
    phone: null,
    role,
    avatar_url: null,
    city: typeof meta.city === "string" && meta.city ? meta.city : "الرياض",
    created_at: now,
    updated_at: now,
  });

  if (role === "provider") {
    const categories = Array.isArray(meta.categories) && meta.categories.length > 0
      ? (meta.categories as string[])
      : [typeof meta.category === "string" ? meta.category : "other"];

    s.tables.provider_profiles.push({
      id,
      business_name:
        typeof meta.business_name === "string" && meta.business_name ? meta.business_name : "مقدم خدمة جديد",
      category: categories[0],
      categories,
      bio: null,
      status: "pending",
      commercial_registration: null,
      years_experience: 0,
      quality_score: 0,
      fair_price_index: 1,
      response_rate: 100,
      completed_jobs: 0,
      base_city: typeof meta.city === "string" && meta.city ? meta.city : "الرياض",
      created_at: now,
    });
  }

  await startSession(id);
  return { data: { user: { id, email } }, error: null };
}

async function signOut() {
  await endSession();
  return { error: null };
}

/** Stores an upload in memory; /api/demo-image/<path> serves it back. */
function uploadImage(path: string, bytes: Buffer, contentType: string): void {
  store().images.set(path, { bytes, contentType });
}

export function createDemoClient() {
  return {
    from: (name: string) => fromTable(name as TableName),
    auth: { getUser, signInWithPassword, signUp, signOut },
    storage: {
      from: (bucket: string) => ({
        async upload(path: string, file: File, opts?: { contentType?: string }) {
          // Keyed by bucket + path so getPublicUrl(path) resolves to the
          // same entry, and the route can serve it back verbatim.
          const bytes = Buffer.from(await file.arrayBuffer());
          uploadImage(`${bucket}/${path}`, bytes, opts?.contentType ?? file.type ?? "image/jpeg");
          return { data: { path }, error: null };
        },
        getPublicUrl(path: string) {
          return { data: { publicUrl: `/api/demo-image/${bucket}/${path}` } };
        },
      }),
    },
  };
}

export type DemoClient = ReturnType<typeof createDemoClient>;

/** Re-exported for the seeded-row helpers that need the raw table arrays. */
export type { Row, TableName };
