// Hand-written types mirroring supabase/schema.sql.
// (Generate with `supabase gen types typescript` once the project is linked, and replace this file.)

export type UserRole = "client" | "provider" | "admin";
export type ProviderStatus = "pending" | "approved" | "rejected" | "suspended";
export type ProviderCategory =
  | "hall"
  | "catering"
  | "decor"
  | "photography"
  | "music"
  | "planning"
  | "other";
export type EventStatus =
  | "draft"
  | "planning"
  | "matched"
  | "confirmed"
  | "in_execution"
  | "completed"
  | "cancelled";
export type EventType = "wedding" | "engagement" | "graduation" | "corporate" | "birthday" | "other";
export type MatchStatus = "proposed" | "quoted" | "accepted" | "declined" | "expired";
export type BookingStatus = "pending_payment" | "paid" | "in_progress" | "completed" | "cancelled" | "disputed";
export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";
export type TaskStatus = "todo" | "in_progress" | "done" | "blocked";
export type QualityStatus = "pending" | "passed" | "flagged" | "failed";

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  city: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProviderProfile {
  id: string;
  business_name: string;
  category: ProviderCategory;
  bio: string | null;
  status: ProviderStatus;
  commercial_registration: string | null;
  years_experience: number;
  quality_score: number;
  fair_price_index: number;
  response_rate: number;
  completed_jobs: number;
  base_city: string;
  created_at: string;
}

export interface Hall {
  id: string;
  provider_id: string;
  name: string;
  city: string;
  address: string | null;
  capacity_min: number;
  capacity_max: number;
  base_price: number;
  amenities: string[];
  images: string[];
  is_active: boolean;
  created_at: string;
}

export interface ServiceItem {
  id: string;
  provider_id: string;
  category: ProviderCategory;
  title: string;
  description: string | null;
  unit: string;
  base_price: number;
  min_price: number | null;
  max_price: number | null;
  images: string[];
  is_active: boolean;
  created_at: string;
}

export interface EventRow {
  id: string;
  client_id: string;
  title: string;
  event_type: EventType;
  city: string;
  guest_count: number;
  event_date: string | null;
  total_budget: number;
  status: EventStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventRequirement {
  id: string;
  event_id: string;
  category: ProviderCategory;
  priority: number;
  allocated_budget: number | null;
  notes: string | null;
  created_at: string;
}

export interface DesignConcept {
  id: string;
  event_id: string;
  provider_id: string | null;
  title: string;
  palette: string[];
  style: string | null;
  images: string[];
  estimated_cost: number | null;
  is_selected: boolean;
  created_at: string;
}

export interface MatchRow {
  id: string;
  event_id: string;
  requirement_id: string | null;
  provider_id: string;
  hall_id: string | null;
  service_id: string | null;
  match_score: number;
  score_breakdown: Record<string, number>;
  status: MatchStatus;
  quoted_price: number | null;
  fair_price_delta: number | null;
  created_at: string;
}

export interface Booking {
  id: string;
  event_id: string;
  match_id: string;
  provider_id: string;
  client_id: string;
  amount: number;
  status: BookingStatus;
  created_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  status: PaymentStatus;
  method: string;
  paid_at: string | null;
  created_at: string;
}

export interface ExecutionTask {
  id: string;
  event_id: string;
  booking_id: string | null;
  title: string;
  category: ProviderCategory | null;
  due_date: string | null;
  status: TaskStatus;
  owner_provider_id: string | null;
  sort_order: number;
  created_at: string;
}

export interface QualityCheck {
  id: string;
  booking_id: string;
  checklist: { label: string; passed: boolean }[];
  status: QualityStatus;
  reviewed_by: string | null;
  notes: string | null;
  created_at: string;
}

export interface Evaluation {
  id: string;
  booking_id: string;
  client_id: string;
  provider_id: string;
  rating_quality: number;
  rating_price: number;
  rating_timeliness: number;
  comment: string | null;
  created_at: string;
}

export interface Settlement {
  id: string;
  booking_id: string;
  provider_id: string;
  gross_amount: number;
  commission_rate: number;
  commission_amount: number;
  net_payout: number;
  status: string;
  created_at: string;
}

export interface KnowledgeBaseArticle {
  id: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
  published: boolean;
  created_by: string | null;
  created_at: string;
}

// Minimal Database generic so @supabase/ssr type params are satisfiable.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any;
