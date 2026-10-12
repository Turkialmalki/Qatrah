import { buildSeed, type DemoUser } from "@/lib/demo/seed";
import type { Row, TableName } from "@/lib/demo/schema";

/**
 * The in-memory store behind demo mode.
 *
 * Held on `globalThis` so it survives module re-evaluation during development
 * and is shared by every request served by one server instance. It is *not*
 * shared between instances and does not outlive a restart or a redeploy — in
 * demo mode that is the accepted trade-off for having no database at all.
 */
export interface DemoStore {
  tables: Record<TableName, Row[]>;
  users: DemoUser[];
  /** Images uploaded during the session, served by /api/demo-image/[id]. */
  images: Map<string, { contentType: string; bytes: Buffer }>;
  seededAt: number;
}

const GLOBAL_KEY = "__qatrahDemoStore__";

type GlobalWithStore = typeof globalThis & { [GLOBAL_KEY]?: DemoStore };

export function store(): DemoStore {
  const g = globalThis as GlobalWithStore;

  if (!g[GLOBAL_KEY]) {
    const seed = buildSeed();
    g[GLOBAL_KEY] = {
      tables: seed.tables,
      users: seed.users,
      images: new Map(),
      seededAt: Date.now(),
    };
  }

  return g[GLOBAL_KEY];
}

export function table(name: TableName): Row[] {
  const t = store().tables[name];
  if (!t) throw new Error(`Unknown table: ${name}`);
  return t;
}

/** Discards every in-session change and re-seeds. */
export function resetStore(): DemoStore {
  const g = globalThis as GlobalWithStore;
  delete g[GLOBAL_KEY];
  return store();
}

export function newId(prefix = "row"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
