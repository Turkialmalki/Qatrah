"use server";

import { createClient } from "@/lib/db/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { optimizeBudget, type BudgetItemInput } from "@/lib/engines/budget";
import { scoreHall, scoreService } from "@/lib/engines/matching";
import { computeFairPrice } from "@/lib/engines/pricing";
import { generateExecutionPlan } from "@/lib/engines/planning";
import { trackForEventType } from "@/lib/utils";
import type {
  EventRow,
  EventType,
  Hall,
  ProviderCategory,
  ProviderProfile,
  ServiceItem,
} from "@/lib/types/database";

export interface FormState {
  error?: string;
}

interface CreatedEvent {
  id: string;
  error?: string;
}

/**
 * Shared core for both creation flows: validates the common fields, inserts
 * the event, then runs the budget optimization engine (module 9) to split the
 * budget across the chosen categories by priority.
 */
async function createEventWithRequirements(formData: FormData): Promise<CreatedEvent> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { id: "", error: "الرجاء تسجيل الدخول" };

  const title = String(formData.get("title") ?? "").trim();
  const event_type = String(formData.get("event_type") ?? "wedding") as EventType;
  const city = String(formData.get("city") ?? "الرياض");
  const guest_count = Number(formData.get("guest_count") ?? 100);
  const event_date = String(formData.get("event_date") ?? "") || null;
  const total_budget = Number(formData.get("total_budget") ?? 0);
  const categories = (formData.getAll("categories") as string[]).filter(Boolean);

  if (!title || total_budget <= 0 || categories.length === 0) {
    return { id: "", error: "الرجاء تعبئة جميع الحقول واختيار خدمة واحدة على الأقل" };
  }

  const { data: event, error } = await supabase
    .from("events")
    .insert({
      client_id: user.id,
      title,
      event_type,
      city,
      guest_count,
      event_date,
      total_budget,
      status: "planning",
      notes: String(formData.get("notes") ?? "") || null,
    })
    .select()
    .single();

  if (error || !event) return { id: "", error: "حدث خطأ أثناء إنشاء المناسبة" };

  const priorities: Record<string, number> = {};
  categories.forEach((c) => {
    priorities[c] = Number(formData.get(`priority_${c}`) ?? 3);
  });
  const items: BudgetItemInput[] = categories.map((c) => ({
    category: c as ProviderCategory,
    priority: priorities[c],
  }));
  const allocations = optimizeBudget(total_budget, items);

  await supabase.from("event_requirements").insert(
    allocations.map((a) => ({
      event_id: event.id,
      category: a.category,
      priority: priorities[a.category],
      allocated_budget: a.amount,
    }))
  );

  return { id: event.id as string };
}

/** الأفراح والمناسبات الاجتماعية — weddings, graduations, birthdays. */
export async function createEventAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const created = await createEventWithRequirements(formData);
  if (created.error) return { error: created.error };
  redirect(`/dashboard/client/events/${created.id}`);
}

/**
 * الفعاليات والمؤتمرات — conferences, exhibitions, forums and corporate
 * events. Same core as a social occasion plus a `conference_details` row for
 * the agenda, sessions, booths and logistics this track needs.
 */
export async function createConferenceEventAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const created = await createEventWithRequirements(formData);
  if (created.error) return { error: created.error };

  const supabase = await createClient();
  const categories = (formData.getAll("categories") as string[]).filter(Boolean);

  await supabase.from("conference_details").insert({
    event_id: created.id,
    organizer_entity: String(formData.get("organizer_entity") ?? "") || null,
    days_count: Math.max(1, Number(formData.get("days_count") ?? 1)),
    sessions_count: Math.max(0, Number(formData.get("sessions_count") ?? 0)),
    speakers_count: Math.max(0, Number(formData.get("speakers_count") ?? 0)),
    // The logistics flags follow the categories the organizer actually chose,
    // so the two never drift apart.
    needs_av: categories.includes("av"),
    needs_translation: categories.includes("translation"),
    needs_booths: categories.includes("booths"),
    booths_count: categories.includes("booths") ? Math.max(0, Number(formData.get("booths_count") ?? 0)) : 0,
    needs_security: categories.includes("security"),
    needs_transport: categories.includes("transport"),
    needs_registration: formData.get("needs_registration") === "on",
    agenda_notes: String(formData.get("agenda_notes") ?? "") || null,
  });

  // The event and its budget split already exist, so send the organizer to it
  // either way — a missing details row only costs them the conference panel.
  redirect(`/dashboard/client/events/${created.id}`);
}

export async function runMatchingAction(eventId: string) {
  const supabase = await createClient();

  const { data: event } = await supabase.from("events").select("*").eq("id", eventId).single();
  const { data: requirements } = await supabase.from("event_requirements").select("*").eq("event_id", eventId);
  if (!event || !requirements) return;

  await supabase.from("matches").delete().eq("event_id", eventId);

  for (const req of requirements) {
    if (req.category === "hall") {
      const { data: halls } = await supabase
        .from("halls")
        .select("*, provider_profiles!inner(*)")
        .eq("city", (event as EventRow).city)
        .eq("is_active", true)
        .eq("provider_profiles.status", "approved");

      const candidates = ((halls ?? []) as (Hall & { provider_profiles: ProviderProfile })[]).map((h) =>
        scoreHall(event as EventRow, h, h.provider_profiles, req.allocated_budget ?? 0)
      );
      const top = candidates.sort((a, b) => b.score - a.score).slice(0, 5);

      for (const c of top) {
        const marketSamples = ((halls ?? []) as Hall[]).map((h) => ({ price: h.base_price }));
        const fair = computeFairPrice(c.price, marketSamples);
        await supabase.from("matches").insert({
          event_id: eventId,
          requirement_id: req.id,
          provider_id: c.providerId,
          hall_id: c.hallId,
          match_score: c.score,
          score_breakdown: c.breakdown,
          quoted_price: c.price,
          fair_price_delta: fair.deltaPct,
          status: "proposed",
        });
      }
    } else {
      // Matching keys on the service's own category, so a provider who offers
      // several categories is considered for each of them independently.
      const { data: services } = await supabase
        .from("services")
        .select("*, provider_profiles!inner(*)")
        .eq("category", req.category)
        .eq("is_active", true)
        .eq("provider_profiles.status", "approved");

      const candidates = ((services ?? []) as (ServiceItem & { provider_profiles: ProviderProfile })[]).map((s) =>
        scoreService(event as EventRow, s, s.provider_profiles, req.allocated_budget ?? 0)
      );
      const top = candidates.sort((a, b) => b.score - a.score).slice(0, 5);

      for (const c of top) {
        const marketSamples = ((services ?? []) as ServiceItem[]).map((s) => ({ price: s.base_price }));
        const fair = computeFairPrice(c.price, marketSamples);
        await supabase.from("matches").insert({
          event_id: eventId,
          requirement_id: req.id,
          provider_id: c.providerId,
          service_id: c.serviceId,
          match_score: c.score,
          score_breakdown: c.breakdown,
          quoted_price: c.price,
          fair_price_delta: fair.deltaPct,
          status: "proposed",
        });
      }
    }
  }

  await supabase.from("events").update({ status: "matched" }).eq("id", eventId);
  revalidatePath(`/dashboard/client/events/${eventId}`);
}

export async function acceptMatchAction(eventId: string, matchId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: match } = await supabase.from("matches").select("*").eq("id", matchId).single();
  if (!match) return;

  await supabase.from("matches").update({ status: "accepted" }).eq("id", matchId);

  await supabase.from("bookings").insert({
    event_id: eventId,
    match_id: matchId,
    provider_id: match.provider_id,
    client_id: user.id,
    amount: match.quoted_price,
    status: "pending_payment",
  });

  revalidatePath(`/dashboard/client/events/${eventId}`);
}

export async function payBookingAction(eventId: string, bookingId: string) {
  const supabase = await createClient();

  const { data: booking } = await supabase.from("bookings").select("*").eq("id", bookingId).single();
  if (!booking) return;

  await supabase.from("payments").insert({ booking_id: bookingId, amount: booking.amount, status: "paid", paid_at: new Date().toISOString() });
  await supabase.from("bookings").update({ status: "paid" }).eq("id", bookingId);

  const commission_rate = 0.1;
  const commission_amount = Math.round(booking.amount * commission_rate);
  await supabase.from("settlements").insert({
    booking_id: bookingId,
    provider_id: booking.provider_id,
    gross_amount: booking.amount,
    commission_rate,
    commission_amount,
    net_payout: booking.amount - commission_amount,
  });

  // Once all bookings for the event are paid, generate the execution plan (module 11)
  const { data: event } = await supabase.from("events").select("*").eq("id", eventId).single();
  const { data: bookings } = await supabase.from("bookings").select("*").eq("event_id", eventId);

  const allPaid = (bookings ?? []).every((b) => b.status === "paid" || b.status === "in_progress" || b.status === "completed");
  if (event && allPaid && (event as EventRow).event_date) {
    // Derive the booked categories from what was actually booked — the hall or
    // the service itself — rather than from the provider's primary category,
    // since one provider may serve several categories.
    const { data: acceptedMatches } = await supabase
      .from("matches")
      .select("hall_id, service_id, services(category)")
      .eq("event_id", eventId)
      .eq("status", "accepted");

    // An embedded one-to-one row comes back as an object or a single-element
    // array depending on how the relationship is inferred — accept both.
    type EmbeddedService = { category: ProviderCategory } | { category: ProviderCategory }[] | null;
    const serviceCategory = (s: EmbeddedService): ProviderCategory | undefined =>
      Array.isArray(s) ? s[0]?.category : (s?.category ?? undefined);

    const categories = Array.from(
      new Set(
        ((acceptedMatches ?? []) as unknown as { hall_id: string | null; services: EmbeddedService }[])
          .map((m) => (m.hall_id ? ("hall" as ProviderCategory) : serviceCategory(m.services)))
          .filter(Boolean) as ProviderCategory[]
      )
    );

    const plan = generateExecutionPlan(
      (event as EventRow).event_date as string,
      categories,
      trackForEventType((event as EventRow).event_type)
    );
    const existingTasks = await supabase.from("execution_tasks").select("id").eq("event_id", eventId);
    if (!existingTasks.data || existingTasks.data.length === 0) {
      await supabase.from("execution_tasks").insert(
        plan.map((t, i) => ({ event_id: eventId, title: t.title, category: t.category, due_date: t.dueDate, sort_order: i }))
      );
    }
    await supabase.from("events").update({ status: "confirmed" }).eq("id", eventId);
  }

  revalidatePath(`/dashboard/client/events/${eventId}`);
  revalidatePath("/dashboard/client/payments");
}

export async function submitEvaluationAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const booking_id = String(formData.get("booking_id"));
  const provider_id = String(formData.get("provider_id"));
  const event_id = String(formData.get("event_id"));

  await supabase.from("evaluations").insert({
    booking_id,
    client_id: user.id,
    provider_id,
    rating_quality: Number(formData.get("rating_quality")),
    rating_price: Number(formData.get("rating_price")),
    rating_timeliness: Number(formData.get("rating_timeliness")),
    comment: String(formData.get("comment") ?? ""),
  });

  await supabase.from("bookings").update({ status: "completed" }).eq("id", booking_id);

  revalidatePath(`/dashboard/client/events/${event_id}`);
}

/** Client-side task tracking (module 10) — tick off execution steps. */
export async function updateEventTaskStatusAction(eventId: string, taskId: string, status: string) {
  const supabase = await createClient();
  await supabase.from("execution_tasks").update({ status }).eq("id", taskId);
  revalidatePath(`/dashboard/client/events/${eventId}/execution`);
  revalidatePath(`/dashboard/client/events/${eventId}`);
}
