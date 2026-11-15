-- Migration 0001: Initial schema for Frost x Flame Gaming Cafe booking platform
-- Run against each Supabase environment (dev/staging/prod)
-- Apply BEFORE 0002_booking_engine_functions.sql

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Devices
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ps5', 'vr', 'sim')),
  zone TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  max_persons INTEGER NOT NULL DEFAULT 2,
  image_url TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Pricing rules (server-side source of truth, owner-editable)
CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_type TEXT NOT NULL CHECK (device_type IN ('ps5', 'vr', 'sim')),
  persons INTEGER NOT NULL CHECK (persons >= 1),
  price_per_hour INTEGER NOT NULL CHECK (price_per_hour >= 0),
  day_type TEXT,
  time_window TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Settings (key/value store for configurable business rules)
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Customers (no login; mobile is unique identifier)
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile TEXT NOT NULL UNIQUE,
  name TEXT,
  village TEXT,
  no_show_count INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Villages (for suggestion chips and deduplication)
CREATE TABLE villages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Staff (PIN login, roles) — created before tables that reference it
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'staff')),
  pin_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Staff sessions (auth session tokens)
CREATE TABLE staff_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES customers(id),
  source TEXT NOT NULL CHECK (source IN ('online', 'walk-in', 'phone')),
  status TEXT NOT NULL CHECK (status IN ('held', 'confirmed', 'checked_in', 'completed', 'cancelled', 'no_show', 'expired')),
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  hours INTEGER NOT NULL CHECK (hours >= 1),
  total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
  hold_expires_at TIMESTAMPTZ,
  created_by_staff_id UUID REFERENCES staff(id),
  checked_in_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES staff(id),
  cancel_reason TEXT,
  refund_eligible BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Booking items (per-device line items within a booking)
CREATE TABLE booking_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES devices(id),
  persons INTEGER NOT NULL CHECK (persons >= 1),
  hours INTEGER NOT NULL CHECK (hours >= 1),
  rate INTEGER NOT NULL CHECK (rate >= 0),
  amount INTEGER NOT NULL CHECK (amount >= 0)
);

-- 11. Device occupancy — the single source of truth for availability
CREATE TABLE device_occupancy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES devices(id),
  during TSTZRANGE NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('booking', 'block')),
  booking_item_id UUID REFERENCES booking_items(id),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_device_occupancy_device ON device_occupancy(device_id);
CREATE INDEX idx_device_occupancy_during ON device_occupancy USING GIST(during);

ALTER TABLE device_occupancy
  ADD CONSTRAINT device_occupancy_no_overlap
  EXCLUDE USING gist (device_id WITH =, during WITH &&);

-- 12. Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  provider TEXT,
  method TEXT,
  app_used TEXT CHECK (app_used IN ('GPay', 'PhonePe', 'Paytm', 'other', NULL)),
  amount INTEGER NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending',
  provider_reference TEXT,
  paid_at TIMESTAMPTZ,
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Refunds
CREATE TABLE refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  payment_id UUID REFERENCES payments(id),
  amount INTEGER NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'rejected')) DEFAULT 'pending',
  refund_to_number TEXT,
  refund_app TEXT,
  refund_reference TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ,
  paid_by_staff_id UUID REFERENCES staff(id),
  reason TEXT
);

-- 14. Waitlist
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES devices(id),
  device_type TEXT CHECK (device_type IN ('ps5', 'vr', 'sim')),
  desired_start TIMESTAMPTZ NOT NULL,
  desired_end TIMESTAMPTZ NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  status TEXT NOT NULL CHECK (status IN ('waiting', 'notified', 'converted', 'expired')) DEFAULT 'waiting',
  token TEXT NOT NULL UNIQUE,
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. Audit log — append-only
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  at TIMESTAMPTZ NOT NULL DEFAULT now(),
  staff_id UUID REFERENCES staff(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  before JSONB,
  after JSONB,
  reason TEXT
);

-- 16. Notifications (in-app + push)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 0,
  booking_id UUID REFERENCES bookings(id),
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  acknowledged_by UUID REFERENCES staff(id),
  acknowledged_at TIMESTAMPTZ
);

-- 17. Push subscriptions (web push for admin app)
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 18. Message log (WhatsApp/SMS)
CREATE TABLE message_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'sms')),
  to_number TEXT NOT NULL,
  template TEXT,
  status TEXT NOT NULL,
  provider_message_id TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 19. Row-Level Security
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_occupancy ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_sessions ENABLE ROW LEVEL SECURITY;

-- Customers: public read via functions only — no direct table access
CREATE POLICY customers_public_no_direct ON customers FOR ALL USING (false);

-- Staff: no direct table access; auth via function
CREATE POLICY staff_public_no_direct ON staff FOR ALL USING (false);

-- Audit log: insert-only, no selects via RLS (service role handles it)
CREATE POLICY audit_log_insert_only ON audit_log FOR INSERT WITH CHECK (true);
CREATE POLICY audit_log_no_select ON audit_log FOR SELECT USING (false);
CREATE POLICY audit_log_no_update ON audit_log FOR UPDATE USING (false);
CREATE POLICY audit_log_no_delete ON audit_log FOR DELETE USING (false);

-- All other tables: no direct client access; public functions mediate
CREATE POLICY no_direct_devices ON devices FOR ALL USING (false);
CREATE POLICY no_direct_pricing ON pricing_rules FOR ALL USING (false);
CREATE POLICY no_direct_settings ON settings FOR ALL USING (false);
CREATE POLICY no_direct_villages ON villages FOR ALL USING (false);
CREATE POLICY no_direct_bookings ON bookings FOR ALL USING (false);
CREATE POLICY no_direct_booking_items ON booking_items FOR ALL USING (false);
CREATE POLICY no_direct_occupancy ON device_occupancy FOR ALL USING (false);
CREATE POLICY no_direct_payments ON payments FOR ALL USING (false);
CREATE POLICY no_direct_refunds ON refunds FOR ALL USING (false);
CREATE POLICY no_direct_waitlist ON waitlist FOR ALL USING (false);
CREATE POLICY no_direct_notifications ON notifications FOR ALL USING (false);
CREATE POLICY no_direct_push_subs ON push_subscriptions FOR ALL USING (false);
CREATE POLICY no_direct_message_log ON message_log FOR ALL USING (false);
CREATE POLICY no_direct_staff_sessions ON staff_sessions FOR ALL USING (false);

-- 20. Audit trigger: block UPDATE/DELETE on audit_log
CREATE OR REPLACE FUNCTION block_audit_log_mutation()
RETURNS EVENT_TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is append-only';
END;
$$ LANGUAGE plpgsql;

-- 21. Realtime trigger function on device_occupancy change
CREATE OR REPLACE FUNCTION notify_occupancy_change()
RETURNS TRIGGER AS $$
DECLARE
  payload JSONB;
  channel TEXT;
BEGIN
  payload := jsonb_build_object(
    'table', 'device_occupancy',
    'action', TG_OP,
    'device_id', COALESCE(NEW.device_id, OLD.device_id),
    'during_start', COALESCE(
      CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN lower(NEW.during)::text ELSE lower(OLD.during)::text END,
      NULL
    ),
    'during_end', COALESCE(
      CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN upper(NEW.during)::text ELSE upper(OLD.during)::text END,
      NULL
    ),
    'kind', COALESCE(NEW.kind, OLD.kind)
  );

  channel := 'device_occupancy:' || COALESCE(NEW.device_id, OLD.device_id)::text;

  PERFORM pg_notify(channel, payload::text);

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_occupancy_change
AFTER INSERT OR UPDATE OR DELETE ON device_occupancy
FOR EACH ROW EXECUTE FUNCTION notify_occupancy_change();

-- 22. Enable Realtime publication (Supabase Realtime)
ALTER PUBLICATION supabase_realtime ADD TABLE device_occupancy;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
