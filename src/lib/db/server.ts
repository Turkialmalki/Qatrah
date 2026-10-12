// Entry point for data access.
//
// Demo mode: there is no external database. `createClient()` returns an
// in-memory client that reproduces the Supabase query surface the app was
// written against, so pages and server actions are unchanged — see
// `src/lib/demo/` for the store, the query engine and the seeded dataset.
//
// Data lives for the lifetime of the server instance: seeded rows are always
// present, and anything written during a session is lost on restart.

import { createDemoClient, type DemoClient } from "@/lib/demo/client";

export async function createClient(): Promise<DemoClient> {
  return createDemoClient();
}

export type { DemoClient };
