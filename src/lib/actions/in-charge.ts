"use server";

import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const SESSION_COOKIE = "in_charge_session";

export type InChargeSession = {
  staff_id: string;
  name: string;
  role: string;
  session_token: string;
  expires_at: string;
};

export type Device = {
  id: string;
  name: string;
  type: "ps5" | "vr" | "sim";
  zone: string | null;
  display_order: number;
  max_persons: number;
  image_url: string | null;
  description: string | null;
  is_active: boolean;
};

export type AvailabilityItem = {
  device_id: string;
  name: string;
  type: string;
  status: "free" | "booked";
  price_per_hour: number;
};

export type TimelineItem = {
  hour: number;
  status: "free" | "booked" | "held";
  booking_id: string | null;
};

export type BookingRow = {
  id: string;
  booking_code: string;
  customer_id: string;
  source: string;
  status: string;
  start_at: string;
  end_at: string;
  hours: number;
  total_amount: number;
  customer_name: string | null;
  customer_mobile: string;
  customer_village: string | null;
  device_id?: string;
};

export type CancelResult = {
  ok: boolean;
  booking_id: string;
  status: string;
  refund_eligible: boolean;
  refund_id: string | null;
  error?: string;
};

async function getSessionCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function getSession(): Promise<InChargeSession | null> {
  const token = await getSessionCookie();
  if (!token) return null;

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("staff_sessions")
    .select("staff_id, token, expires_at")
    .eq("token", token)
    .single();

  if (error || !data) return null;
  if (new Date(data.expires_at) < new Date()) return null;

  const { data: staff, error: staffError } = await supabase
    .from("staff")
    .select("id, name, role")
    .eq("id", data.staff_id)
    .single();

  if (staffError || !staff) return null;

  return {
    staff_id: staff.id,
    name: staff.name,
    role: staff.role,
    session_token: token,
    expires_at: data.expires_at,
  };
}

export async function loginInCharge(pin: string): Promise<{
  ok: boolean;
  session?: InChargeSession;
  error?: string;
}> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("staff_login", { p_pin: pin });

  if (error || !data) {
    return { ok: false, error: error?.message ?? "PIN not recognised" };
  }

  const result = data as InChargeSession;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, result.session_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(result.expires_at),
  });

  return { ok: true, session: result };
}

export async function logoutInCharge(): Promise<{ ok: boolean }> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return { ok: true };
}

export async function getDevices(): Promise<Device[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("devices")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Device[];
}

export async function getFloorStatus(
  date: string,
  start: string,
  hours: number
): Promise<AvailabilityItem[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("get_availability", {
    p_date: date,
    p_start: start,
    p_hours: hours,
  });

  if (error) throw error;
  return (data ?? []) as AvailabilityItem[];
}

export async function getDeviceDayTimeline(
  deviceId: string,
  date: string
): Promise<TimelineItem[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("get_device_day_timeline", {
    p_device_id: deviceId,
    p_date: date,
  });

  if (error) throw error;
  return (data ?? []) as TimelineItem[];
}

export async function getStationBookings(
  deviceId: string,
  date: string
): Promise<BookingRow[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      customers (name, mobile, village)
    `
    )
    .eq("status", "confirmed")
    .gte("start_at", `${date}T00:00:00+05:30`)
    .lt("start_at", `${date}T23:59:59+05:30`)
    .order("start_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as BookingRow[];
}

export type CreateWalkInInput = {
  mobile: string;
  name?: string | null;
  village?: string | null;
  device_id: string;
  persons: number;
  hours: number;
  start: string;
};

export async function createWalkInBooking(
  input: CreateWalkInInput,
  staffId: string
): Promise<{ ok: boolean; booking_code?: string; error?: string }> {
  const supabase = await createServerSupabaseClient();

  const { data: hold, error: holdError } = await supabase.rpc("create_hold", {
    p_mobile: input.mobile,
    p_name: input.name ?? null,
    p_village: input.village ?? null,
    p_items: [{ device_id: input.device_id, persons: input.persons, hours: input.hours }],
    p_start: input.start,
    p_hours: input.hours,
    p_source: "walk-in",
  });

  if (holdError) throw holdError;
  const holdResult = hold as any;
  if (holdResult.error) {
    return { ok: false, error: holdResult.message };
  }

  const { data: confirm, error: confirmError } = await supabase.rpc(
    "confirm_booking",
    { p_booking_id: holdResult.booking_id, p_payment_id: "walk-in-cash" }
  );

  if (confirmError) throw confirmError;
  const confirmResult = confirm as any;
  if (confirmResult.error) {
    return { ok: false, error: confirmResult.error };
  }

  return { ok: true, booking_code: holdResult.booking_code };
}

export async function cancelBooking(
  bookingId: string,
  staffId: string,
  reason: string | null
): Promise<CancelResult> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("cancel_booking", {
    p_booking_id: bookingId,
    p_actor_id: staffId,
    p_actor_type: "staff",
    p_reason: reason,
  });

  if (error) throw error;
  const result = data as any;
  if (result.error) {
    return { ok: false, booking_id: bookingId, status: "cancelled", refund_eligible: false, refund_id: null, error: result.error };
  }

  return {
    ok: true,
    booking_id: result.booking_id,
    status: result.status,
    refund_eligible: result.refund_eligible,
    refund_id: result.refund_id,
  };
}

export type FoodIncomeInput = {
  income_date: string;
  amount: number;
  source: string;
  payment_mode: string | null;
  notes: string | null;
};

export async function enterFoodIncome(
  input: FoodIncomeInput,
  staffId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("enter_food_income", {
    p_staff_id: staffId,
    p_income_date: input.income_date,
    p_amount: input.amount,
    p_source: input.source,
    p_payment_mode: input.payment_mode,
    p_notes: input.notes,
  });

  if (error) throw error;
  const result = data as any;
  if (result.error) {
    return { ok: false, error: result.error };
  }
  return { ok: true };
}

export type AttendanceInput = {
  attendance_date: string;
  status: "present" | "absent" | "leave" | "lop" | "half_day";
  check_in: string | null;
  check_out: string | null;
  hours_worked: number | null;
  notes: string | null;
};

export async function markAttendance(
  input: AttendanceInput,
  staffId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("mark_staff_attendance", {
    p_staff_id: staffId,
    p_attendance_date: input.attendance_date,
    p_status: input.status,
    p_check_in: input.check_in,
    p_check_out: input.check_out,
    p_hours_worked: input.hours_worked,
    p_notes: input.notes,
    p_marked_by_staff_id: staffId,
  });

  if (error) throw error;
  const result = data as any;
  if (result.error) {
    return { ok: false, error: result.error };
  }
  return { ok: true };
}

export async function getCancelledBookings(
  from: string,
  to: string
): Promise<BookingRow[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      customers (name, mobile, village)
    `
    )
    .eq("status", "cancelled")
    .gte("start_at", `${from}T00:00:00+05:30`)
    .lte("start_at", `${to}T23:59:59+05:30`)
    .order("start_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as BookingRow[];
}

export async function getBookingsList(
  from: string,
  to: string,
  status?: string,
  source?: string
): Promise<BookingRow[]> {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("bookings")
    .select(
      `
      *,
      customers (name, mobile, village)
    `
    )
    .gte("start_at", `${from}T00:00:00+05:30`)
    .lte("start_at", `${to}T23:59:59+05:30`)
    .order("start_at", { ascending: true });

  if (status) query = query.eq("status", status);
  if (source) query = query.eq("source", source);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as BookingRow[];
}

export async function getVillages(): Promise<{ id: string; name: string }[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("villages")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as { id: string; name: string }[];
}
