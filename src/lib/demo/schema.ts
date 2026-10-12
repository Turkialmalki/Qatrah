// Table metadata for the in-memory demo backend.
//
// The app was written against PostgREST-shaped queries, so the demo client
// reproduces that shape rather than rewriting every page. This module supplies
// the two things the query engine cannot infer on its own: how embedded
// relations join, and what defaults a freshly inserted row gets.

export type Row = Record<string, unknown>;

export const TABLES = [
  "profiles",
  "provider_profiles",
  "halls",
  "services",
  "events",
  "event_requirements",
  "conference_details",
  "design_concepts",
  "matches",
  "bookings",
  "payments",
  "execution_tasks",
  "quality_checks",
  "evaluations",
  "settlements",
  "knowledge_base",
] as const;

export type TableName = (typeof TABLES)[number];

export interface Relation {
  /** Column on the parent row holding the target's primary key. */
  localKey: string;
  target: TableName;
  /** Column on the target to match against; defaults to its primary key. */
  targetKey?: string;
  /** "many" walks the foreign key backwards and returns an array. */
  cardinality: "one" | "many";
}

/**
 * Embedded relations, keyed by parent table then by the name used inside a
 * select string — e.g. `bookings.select("*, events(title)")`.
 */
export const RELATIONS: Partial<Record<TableName, Record<string, Relation>>> = {
  provider_profiles: {
    profiles: { localKey: "id", target: "profiles", cardinality: "one" },
  },
  halls: {
    provider_profiles: { localKey: "provider_id", target: "provider_profiles", cardinality: "one" },
  },
  services: {
    provider_profiles: { localKey: "provider_id", target: "provider_profiles", cardinality: "one" },
  },
  events: {
    profiles: { localKey: "client_id", target: "profiles", cardinality: "one" },
  },
  design_concepts: {
    events: { localKey: "event_id", target: "events", cardinality: "one" },
    provider_profiles: { localKey: "provider_id", target: "provider_profiles", cardinality: "one" },
  },
  matches: {
    events: { localKey: "event_id", target: "events", cardinality: "one" },
    provider_profiles: { localKey: "provider_id", target: "provider_profiles", cardinality: "one" },
    services: { localKey: "service_id", target: "services", cardinality: "one" },
    halls: { localKey: "hall_id", target: "halls", cardinality: "one" },
  },
  bookings: {
    events: { localKey: "event_id", target: "events", cardinality: "one" },
    provider_profiles: { localKey: "provider_id", target: "provider_profiles", cardinality: "one" },
    profiles: { localKey: "client_id", target: "profiles", cardinality: "one" },
    // Reverse: quality_checks.booking_id points back at the booking.
    quality_checks: { localKey: "id", target: "quality_checks", targetKey: "booking_id", cardinality: "many" },
    payments: { localKey: "id", target: "payments", targetKey: "booking_id", cardinality: "many" },
  },
  execution_tasks: {
    events: { localKey: "event_id", target: "events", cardinality: "one" },
  },
  evaluations: {
    profiles: { localKey: "client_id", target: "profiles", cardinality: "one" },
    provider_profiles: { localKey: "provider_id", target: "provider_profiles", cardinality: "one" },
  },
  settlements: {
    provider_profiles: { localKey: "provider_id", target: "provider_profiles", cardinality: "one" },
  },
  quality_checks: {
    profiles: { localKey: "reviewed_by", target: "profiles", cardinality: "one" },
  },
};

/** Tables whose primary key is something other than `id`. */
export const PRIMARY_KEYS: Partial<Record<TableName, string>> = {
  conference_details: "event_id",
};

export function primaryKey(table: TableName): string {
  return PRIMARY_KEYS[table] ?? "id";
}

/**
 * Column defaults applied on insert, mirroring `supabase/schema.sql`. Only
 * columns the app reads back are listed — the rest come from the insert itself.
 */
export const DEFAULTS: Partial<Record<TableName, Row>> = {
  profiles: { phone: null, avatar_url: null, city: "الرياض", role: "client" },
  provider_profiles: {
    bio: null,
    status: "pending",
    commercial_registration: null,
    years_experience: 0,
    quality_score: 0,
    fair_price_index: 1,
    response_rate: 100,
    completed_jobs: 0,
    base_city: "الرياض",
    categories: [],
  },
  halls: {
    city: "الرياض",
    address: null,
    capacity_min: 0,
    amenities: [],
    images: [],
    is_active: true,
  },
  services: {
    description: null,
    unit: "package",
    min_price: null,
    max_price: null,
    package_key: null,
    inclusions: [],
    images: [],
    is_active: true,
  },
  events: {
    event_type: "wedding",
    city: "الرياض",
    guest_count: 100,
    event_date: null,
    status: "draft",
    notes: null,
  },
  event_requirements: { priority: 3, allocated_budget: null, notes: null },
  conference_details: {
    organizer_entity: null,
    days_count: 1,
    sessions_count: 0,
    speakers_count: 0,
    needs_av: true,
    needs_translation: false,
    needs_booths: false,
    booths_count: 0,
    needs_registration: true,
    needs_security: false,
    needs_transport: false,
    agenda_notes: null,
  },
  design_concepts: {
    provider_id: null,
    palette: [],
    style: null,
    images: [],
    estimated_cost: null,
    is_selected: false,
  },
  matches: {
    requirement_id: null,
    hall_id: null,
    service_id: null,
    match_score: 0,
    score_breakdown: {},
    status: "proposed",
    quoted_price: null,
    fair_price_delta: null,
  },
  bookings: { status: "pending_payment" },
  payments: { status: "pending", method: "card", paid_at: null },
  execution_tasks: {
    booking_id: null,
    category: null,
    due_date: null,
    status: "todo",
    owner_provider_id: null,
    sort_order: 0,
  },
  quality_checks: { checklist: [], status: "pending", reviewed_by: null, notes: null },
  evaluations: { comment: null },
  settlements: { commission_rate: 0.1, status: "pending" },
  knowledge_base: { tags: [], published: true, created_by: null },
};
