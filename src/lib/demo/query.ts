// A small PostgREST-shaped query builder over the in-memory store.
//
// The app's pages and server actions were written against Supabase's client
// API. Reproducing that surface here means demo mode needed no changes to any
// page — only the module they import `createClient` from.
//
// Supported, because that is all the app uses:
//   .select(cols) with one level of embedded relations and `!inner`
//   .eq / .neq / .in, including dotted filters on an embedded relation
//   .order (repeatable) / .limit / .single / .maybeSingle
//   .insert (optionally .select().single()) / .update / .delete

import { DEFAULTS, RELATIONS, primaryKey, type Row, type TableName } from "@/lib/demo/schema";
import { newId, table } from "@/lib/demo/store";

export interface QueryError {
  message: string;
}

/** Shape returned when a query can match many rows. */
export interface ManyResult {
  // `any` keeps the call sites' `as Row[]` casts working and still gives
  // .map/.reduce callbacks their parameter types.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[] | null;
  error: QueryError | null;
  count: number | null;
}

/** Shape returned by .single() / .maybeSingle() and by mutations. */
export interface OneResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  error: QueryError | null;
  count: number | null;
}

export interface CountOptions {
  count?: "exact" | "planned" | "estimated";
  /** Return only the count, no rows. */
  head?: boolean;
}

type Filter = { op: "eq" | "neq" | "in"; column: string; value: unknown };
type Order = { column: string; ascending: boolean };

interface SelectToken {
  name: string;
  /** Present when the token was `name(...)`. */
  inner?: string[];
  forceInner?: boolean;
}

/** Splits a select string on top-level commas, respecting parentheses. */
function splitTopLevel(input: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of input) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      parts.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) parts.push(current);
  return parts.map((p) => p.trim()).filter(Boolean);
}

function parseSelect(select: string): SelectToken[] {
  return splitTopLevel(select).map((token) => {
    const open = token.indexOf("(");
    if (open === -1) return { name: token };

    let name = token.slice(0, open).trim();
    const forceInner = name.endsWith("!inner");
    if (forceInner) name = name.slice(0, -"!inner".length);

    const innerRaw = token.slice(open + 1, token.lastIndexOf(")"));
    return { name, inner: splitTopLevel(innerRaw), forceInner };
  });
}

function project(row: Row, columns: string[]): Row {
  if (columns.includes("*")) return { ...row };
  const out: Row = {};
  for (const c of columns) out[c] = row[c];
  return out;
}

function compare(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b);
  return String(a).localeCompare(String(b));
}

/** Reads `provider_profiles.status` style paths off a row with embeds attached. */
function readPath(row: Row, path: string): unknown {
  if (!path.includes(".")) return row[path];
  const [head, ...rest] = path.split(".");
  const target = row[head];
  const obj = Array.isArray(target) ? target[0] : target;
  if (obj == null || typeof obj !== "object") return undefined;
  return readPath(obj as Row, rest.join("."));
}

function matchesFilter(row: Row, f: Filter): boolean {
  const actual = readPath(row, f.column);
  if (f.op === "eq") return actual === f.value;
  if (f.op === "neq") return actual !== f.value;
  return Array.isArray(f.value) && (f.value as unknown[]).includes(actual);
}

class SelectBuilder implements PromiseLike<ManyResult> {
  private filters: Filter[] = [];
  private orders: Order[] = [];
  private limitCount: number | null = null;
  private mode: "many" | "single" | "maybeSingle" = "many";

  constructor(
    private tableName: TableName,
    private select: string,
    private options: CountOptions = {}
  ) {}

  eq(column: string, value: unknown) {
    this.filters.push({ op: "eq", column, value });
    return this;
  }
  neq(column: string, value: unknown) {
    this.filters.push({ op: "neq", column, value });
    return this;
  }
  in(column: string, values: unknown[]) {
    this.filters.push({ op: "in", column, value: values });
    return this;
  }
  order(column: string, opts?: { ascending?: boolean }) {
    this.orders.push({ column, ascending: opts?.ascending ?? true });
    return this;
  }
  limit(count: number) {
    this.limitCount = count;
    return this;
  }
  single(): PromiseLike<OneResult> {
    this.mode = "single";
    return this as unknown as PromiseLike<OneResult>;
  }
  maybeSingle(): PromiseLike<OneResult> {
    this.mode = "maybeSingle";
    return this as unknown as PromiseLike<OneResult>;
  }

  private run(): ManyResult | OneResult {
    const tokens = parseSelect(this.select);
    const relations = RELATIONS[this.tableName] ?? {};
    const scalarColumns = tokens.filter((t) => !t.inner).map((t) => t.name);
    const embeds = tokens.filter((t) => t.inner);

    // Attach embedded rows first so dotted filters can see them.
    let rows: Row[] = table(this.tableName).map((row) => {
      const withEmbeds: Row = { ...row };
      for (const e of embeds) {
        const rel = relations[e.name];
        if (!rel) {
          withEmbeds[e.name] = null;
          continue;
        }
        const targetRows = table(rel.target);
        const targetKey = rel.targetKey ?? primaryKey(rel.target);
        const localValue = row[rel.localKey];

        if (rel.cardinality === "many") {
          withEmbeds[e.name] = targetRows
            .filter((t) => t[targetKey] === localValue)
            .map((t) => project(t, e.inner!));
        } else {
          const found = localValue == null ? undefined : targetRows.find((t) => t[targetKey] === localValue);
          withEmbeds[e.name] = found ? project(found, e.inner!) : null;
        }
      }
      return withEmbeds;
    });

    // `!inner` drops parents with no match, the way an inner join would.
    for (const e of embeds) {
      if (!e.forceInner) continue;
      rows = rows.filter((r) => {
        const v = r[e.name];
        return Array.isArray(v) ? v.length > 0 : v != null;
      });
    }

    for (const f of this.filters) rows = rows.filter((r) => matchesFilter(r, f));

    if (this.orders.length > 0) {
      rows = [...rows].sort((a, b) => {
        for (const o of this.orders) {
          const d = compare(readPath(a, o.column), readPath(b, o.column));
          if (d !== 0) return o.ascending ? d : -d;
        }
        return 0;
      });
    }

    // The count reflects the filters but not the limit, as PostgREST's does.
    const count = this.options.count ? rows.length : null;

    if (this.limitCount != null) rows = rows.slice(0, this.limitCount);

    if (this.options.head) return { data: null, error: null, count };

    const shaped = rows.map((r) => {
      const out = project(r, scalarColumns.length > 0 ? scalarColumns : ["*"]);
      for (const e of embeds) out[e.name] = r[e.name];
      return out;
    });

    if (this.mode === "single") {
      if (shaped.length !== 1) {
        return { data: null, error: { message: "Results contain 0 rows, expected 1" }, count };
      }
      return { data: shaped[0], error: null, count };
    }
    if (this.mode === "maybeSingle") {
      return { data: shaped[0] ?? null, error: null, count };
    }
    return { data: shaped, error: null, count };
  }

  then<R1 = ManyResult, R2 = never>(
    onfulfilled?: ((value: ManyResult) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null
  ): PromiseLike<R1 | R2> {
    try {
      return Promise.resolve(this.run() as ManyResult).then(onfulfilled, onrejected);
    } catch (e) {
      return Promise.resolve({ data: null, error: { message: String(e) }, count: null }).then(onfulfilled, onrejected);
    }
  }
}

class MutationBuilder implements PromiseLike<OneResult> {
  private filters: Filter[] = [];
  private wantsSelect = false;
  private mode: "many" | "single" | "maybeSingle" = "many";

  constructor(
    private tableName: TableName,
    private action: "insert" | "update" | "delete",
    private values: Row[] = []
  ) {}

  eq(column: string, value: unknown) {
    this.filters.push({ op: "eq", column, value });
    return this;
  }
  neq(column: string, value: unknown) {
    this.filters.push({ op: "neq", column, value });
    return this;
  }
  in(column: string, values: unknown[]) {
    this.filters.push({ op: "in", column, value: values });
    return this;
  }
  select() {
    this.wantsSelect = true;
    return this;
  }
  single() {
    this.wantsSelect = true;
    this.mode = "single";
    return this;
  }
  maybeSingle() {
    this.wantsSelect = true;
    this.mode = "maybeSingle";
    return this;
  }

  private run(): OneResult {
    const rows = table(this.tableName);
    const pk = primaryKey(this.tableName);
    const defaults = DEFAULTS[this.tableName] ?? {};
    let affected: Row[] = [];

    if (this.action === "insert") {
      for (const v of this.values) {
        const row: Row = {
          ...structuredClone(defaults),
          ...v,
          created_at: v.created_at ?? new Date().toISOString(),
        };
        if (row[pk] == null) row[pk] = newId(this.tableName.slice(0, 3));
        if ("updated_at" in defaults || this.tableName === "events") {
          row.updated_at = row.updated_at ?? row.created_at;
        }
        rows.push(row);
        affected.push(row);
      }
    } else {
      const targets = rows.filter((r) => this.filters.every((f) => matchesFilter(r, f)));
      if (this.action === "update") {
        for (const r of targets) {
          Object.assign(r, this.values[0]);
          if ("updated_at" in r) r.updated_at = new Date().toISOString();
        }
        affected = targets;
      } else {
        for (const r of targets) {
          const i = rows.indexOf(r);
          if (i >= 0) rows.splice(i, 1);
        }
        affected = targets;
      }
    }

    const count = affected.length;
    if (!this.wantsSelect) return { data: null, error: null, count };

    const shaped = affected.map((r) => ({ ...r }));
    if (this.mode === "single") {
      if (shaped.length !== 1) {
        return { data: null, error: { message: "Results contain 0 rows, expected 1" }, count };
      }
      return { data: shaped[0], error: null, count };
    }
    if (this.mode === "maybeSingle") return { data: shaped[0] ?? null, error: null, count };
    return { data: shaped, error: null, count };
  }

  then<R1 = OneResult, R2 = never>(
    onfulfilled?: ((value: OneResult) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null
  ): PromiseLike<R1 | R2> {
    try {
      return Promise.resolve(this.run()).then(onfulfilled, onrejected);
    } catch (e) {
      return Promise.resolve({ data: null, error: { message: String(e) }, count: null }).then(onfulfilled, onrejected);
    }
  }
}

export function fromTable(name: TableName) {
  return {
    select: (columns = "*", options?: CountOptions) => new SelectBuilder(name, columns, options ?? {}),
    insert: (values: Row | Row[]) => new MutationBuilder(name, "insert", Array.isArray(values) ? values : [values]),
    update: (values: Row) => new MutationBuilder(name, "update", [values]),
    delete: () => new MutationBuilder(name, "delete"),
  };
}
