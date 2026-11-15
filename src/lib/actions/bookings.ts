"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

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

export async function getAvailability(
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

export type CreateHoldInput = {
  mobile: string;
  name?: string | null;
  village?: string | null;
  items: { device_id: string; persons: number; hours: number }[];
  start: string;
  hours: number;
  source: "online" | "walk-in" | "phone";
};

export type CreateHoldResult =
  | {
      ok: true;
      booking_id: string;
      booking_code: string;
      hold_expires_at: string;
      total_amount: number;
    }
  | {
      ok: false;
      error: "constraint_violation";
      message: string;
      taken_device: string | null;
    };

export async function createHold(input: CreateHoldInput): Promise<CreateHoldResult> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("create_hold", {
    p_mobile: input.mobile,
    p_name: input.name ?? null,
    p_village: input.village ?? null,
    p_items: input.items,
    p_start: input.start,
    p_hours: input.hours,
    p_source: input.source,
  });

  if (error) throw error;

  const result = data as any;
  if (result.error) {
    return {
      ok: false,
      error: result.error as "constraint_violation",
      message: result.message,
      taken_device: result.taken_device,
    };
  }

  return {
    ok: true,
    booking_id: result.booking_id,
    booking_code: result.booking_code,
    hold_expires_at: result.hold_expires_at,
    total_amount: result.total_amount,
  };
}

export async function confirmBooking(
  bookingId: string,
  paymentId: string
): Promise<
  | { ok: boolean; booking_id: string; status: string }
  | { ok: false; error: string }
> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("confirm_booking", {
    p_booking_id: bookingId,
    p_payment_id: paymentId,
  });

  if (error) throw error;

  const result = data as any;
  if (result.error) {
    return { ok: false, error: result.error };
  }

  return { ok: true, booking_id: result.booking_id, status: result.status };
}

export async function cancelBooking(
  bookingId: string,
  actorId: string | null,
  actorType: "customer" | "staff",
  reason: string | null
): Promise<
  | {
      ok: boolean;
      booking_id: string;
      status: string;
      refund_eligible: boolean;
      refund_id: string | null;
    }
  | { ok: false; error: string }
> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("cancel_booking", {
    p_booking_id: bookingId,
    p_actor_id: actorId,
    p_actor_type: actorType,
    p_reason: reason,
  });

  if (error) throw error;

  const result = data as any;
  if (result.error) {
    return { ok: false, error: result.error };
  }

  return {
    ok: true,
    booking_id: result.booking_id,
    status: result.status,
    refund_eligible: result.refund_eligible,
    refund_id: result.refund_id,
  };
}

export async function lookupBooking(
  bookingCode: string,
  mobile: string
): Promise<{ ok: boolean; data?: any; error?: string }> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("lookup_booking", {
    p_booking_code: bookingCode,
    p_mobile: mobile,
  });

  if (error) throw error;

  const result = data as any;
  if (result.error) {
    return { ok: false, error: result.error };
  }

  return { ok: true, data: result };
}

export async function getSetting(key: string): Promise<string | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", key)
    .single();

  if (error) return null;
  return data?.value ?? null;
}
