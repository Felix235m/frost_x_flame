-- Migration 0002: Booking engine functions and triggers
-- Depends on: 0001_initial_schema.sql

-- Helper: generate booking code like #FNF-8924
CREATE OR REPLACE FUNCTION generate_booking_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
BEGIN
  LOOP
    code := '#FNF-' || LPAD((floor(random() * 9000) + 1000)::TEXT, 4, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM bookings WHERE booking_code = code);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Helper: get price per hour for a device type + persons from pricing_rules
CREATE OR REPLACE FUNCTION get_price_per_hour(p_device_type TEXT, p_persons INTEGER)
RETURNS INTEGER AS $$
DECLARE
  price INTEGER;
BEGIN
  SELECT price_per_hour INTO price
  FROM pricing_rules
  WHERE device_type = p_device_type
    AND persons = p_persons
    AND is_active = true
  ORDER BY (day_type IS NULL) DESC, price_per_hour
  LIMIT 1;

  IF price IS NULL THEN
    -- Fallback: any active rule for that device type
    SELECT price_per_hour INTO price
    FROM pricing_rules
    WHERE device_type = p_device_type
      AND is_active = true
    ORDER BY (day_type IS NULL) DESC
    LIMIT 1;
  END IF;

  RETURN COALESCE(price, 0);
END;
$$ LANGUAGE plpgsql;

-- Helper: remove expired holds
CREATE OR REPLACE FUNCTION remove_expired_holds()
RETURNS VOID AS $$
BEGIN
  DELETE FROM device_occupancy
  WHERE kind = 'booking'
    AND during && tstzrange(
      (SELECT now()),
      (SELECT now() + interval '1 minute')
    )
    AND EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = device_occupancy.booking_item_id::text::uuid
        OR b.id IN (
          SELECT bi.booking_id FROM booking_items bi WHERE bi.id = device_occupancy.booking_item_id
        )
        AND b.status = 'held'
        AND b.hold_expires_at < now()
    );

  UPDATE bookings
  SET status = 'expired'
  WHERE status = 'held'
    AND hold_expires_at < now();

  DELETE FROM device_occupancy o
  USING bookings b
  WHERE o.kind = 'booking'
    AND o.booking_item_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM booking_items bi
      WHERE bi.id = o.booking_item_id AND bi.booking_id = b.id
    )
    AND b.status = 'expired';
END;
$$ LANGUAGE plpgsql;

-- Public function: get_availability(date, start, hours)
-- Returns each device as free/booked for the whole duration.
CREATE OR REPLACE FUNCTION get_availability(
  p_date TEXT,
  p_start TEXT,
  p_hours INTEGER
)
RETURNS TABLE (
  device_id UUID,
  name TEXT,
  type TEXT,
  status TEXT,
  price_per_hour INTEGER
) AS $$
DECLARE
  v_start TIMESTAMPTZ;
  v_end TIMESTAMPTZ;
BEGIN
  v_start := (p_date || ' ' || p_start)::TIMESTAMPTZ AT TIME ZONE 'Asia/Kolkata' AT TIME ZONE 'UTC';
  v_end := v_start + (p_hours || ' hours')::INTERVAL;

  RETURN QUERY
  SELECT
    d.id AS device_id,
    d.name,
    d.type,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM device_occupancy o
        WHERE o.device_id = d.id
          AND o.during && tstzrange(v_start, v_end)
      ) THEN 'booked'::TEXT
      ELSE 'free'::TEXT
    END AS status,
    COALESCE(get_price_per_hour(d.type, 2), 0) AS price_per_hour
  FROM devices d
  WHERE d.is_active = true
  ORDER BY d.display_order;
END;
$$ LANGUAGE plpgsql;

-- Public function: get_device_day_timeline(device, date)
-- Returns hourly states for the zoom view.
CREATE OR REPLACE FUNCTION get_device_day_timeline(
  p_device_id UUID,
  p_date TEXT
)
RETURNS TABLE (
  hour INTEGER,
  status TEXT,
  booking_id UUID
) AS $$
DECLARE
  v_day_start TIMESTAMPTZ;
  v_day_end TIMESTAMPTZ;
  v_open_from INTEGER;
  v_open_to INTEGER;
BEGIN
  -- Default opening hours from settings (12 PM to 1 AM)
  SELECT COALESCE((value)::INTEGER, 12) INTO v_open_from FROM settings WHERE key = 'opening_hour_from';
  SELECT COALESCE((value)::INTEGER, 25) INTO v_open_to FROM settings WHERE key = 'opening_hour_to';

  v_day_start := (p_date || ' ' || v_open_from || ':00')::TIMESTAMPTZ AT TIME ZONE 'Asia/Kolkata' AT TIME ZONE 'UTC';
  v_day_end := (p_date || ' ' || v_open_to || ':00')::TIMESTAMPTZ AT TIME ZONE 'Asia/Kolkata' AT TIME ZONE 'UTC';

  RETURN QUERY
  SELECT
    h AS hour,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM device_occupancy o
        WHERE o.device_id = p_device_id
          AND o.during && tstzrange(v_day_start + (h || ' hours')::INTERVAL, v_day_start + ((h + 1) || ' hours')::INTERVAL)
      ) THEN 'booked'::TEXT
      ELSE 'free'::TEXT
    END AS status,
    NULL::UUID AS booking_id
  FROM generate_series(0, v_open_to - v_open_from - 1) AS h;
END;
$$ LANGUAGE plpgsql;

-- Public function: create_hold(customer, items, start, hours, source)
-- Transaction: remove expired holds, upsert customer, compute price server-side,
-- insert held booking + occupancy rows; rollback + return which device was taken.
CREATE OR REPLACE FUNCTION create_hold(
  p_mobile TEXT,
  p_name TEXT,
  p_village TEXT,
  p_items JSONB,
  p_start TEXT,
  p_hours INTEGER,
  p_source TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_customer_id UUID;
  v_booking_id UUID;
  v_booking_code TEXT;
  v_start TIMESTAMPTZ;
  v_end TIMESTAMPTZ;
  v_hold_minutes INTEGER;
  v_hold_expires_at TIMESTAMPTZ;
  v_total INTEGER := 0;
  v_taken_device TEXT;
  v_item RECORD;
  v_price INTEGER;
  v_device_type TEXT;
  v_max_persons INTEGER;
BEGIN
  -- 1. Remove expired holds first
  PERFORM remove_expired_holds();

  -- 2. Parse times
  v_start := (p_start)::TIMESTAMPTZ AT TIME ZONE 'Asia/Kolkata' AT TIME ZONE 'UTC';
  v_end := v_start + (p_hours || ' hours')::INTERVAL;

  -- 3. Hold duration from settings
  SELECT COALESCE((value)::INTEGER, 10) INTO v_hold_minutes FROM settings WHERE key = 'hold_minutes';
  v_hold_expires_at := now() + (v_hold_minutes || ' minutes')::INTERVAL;

  -- 4. Upsert customer
  SELECT id INTO v_customer_id FROM customers WHERE mobile = p_mobile;
  IF v_customer_id IS NULL THEN
    INSERT INTO customers (mobile, name, village)
    VALUES (p_mobile, p_name, p_village)
    RETURNING id INTO v_customer_id;
  ELSE
    UPDATE customers
    SET name = COALESCE(p_name, name),
        village = COALESCE(p_village, village),
        updated_at = now()
    WHERE id = v_customer_id;
  END IF;

  -- 5. Create booking in held status
  v_booking_code := generate_booking_code();
  INSERT INTO bookings (booking_code, customer_id, source, status, start_at, end_at, hours, total_amount, hold_expires_at)
  VALUES (v_booking_code, v_customer_id, p_source, 'held', v_start, v_end, p_hours, 0, v_hold_expires_at)
  RETURNING id INTO v_booking_id;

  -- 6. Insert occupancy rows per device (all-or-nothing via exclusion constraint)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) AS item
  LOOP
    SELECT type, max_persons INTO v_device_type, v_max_persons
    FROM devices WHERE id = (v_item->>'device_id')::UUID;

    -- Validate persons <= max_persons
    IF (v_item->>'persons')::INTEGER > v_max_persons THEN
      RAISE EXCEPTION 'Device % exceeds max persons', v_item->>'device_id';
    END IF;

    -- Compute price per hour for this device + persons
    v_price := get_price_per_hour(v_device_type, (v_item->>'persons')::INTEGER);
    v_total := v_total + (v_price * p_hours);

    -- Insert booking item
    INSERT INTO booking_items (booking_id, device_id, persons, hours, rate, amount)
    VALUES (v_booking_id, (v_item->>'device_id')::UUID, (v_item->>'persons')::INTEGER, p_hours, v_price, v_price * p_hours);

    -- Insert occupancy row (this is where the exclusion constraint enforces no double-booking)
    INSERT INTO device_occupancy (device_id, during, kind, booking_item_id, reason)
    SELECT
      (v_item->>'device_id')::UUID,
      tstzrange(v_start, v_end),
      'booking',
      bi.id,
      'Hold: ' || v_booking_code
    FROM booking_items bi
    WHERE bi.booking_id = v_booking_id AND bi.device_id = (v_item->>'device_id')::UUID;
  END LOOP;

EXCEPTION WHEN OTHERS THEN
  -- Rollback happens automatically; identify which device was taken
  GET STACKED DIAGNOSTICS v_taken_device = PG_EXCEPTION_DETAIL;
  -- Return which device caused the conflict
  RETURN jsonb_build_object(
    'error', 'constraint_violation',
    'message', SQLERRM,
    'taken_device', v_taken_device
  );

  -- Update total amount on booking
  UPDATE bookings SET total_amount = v_total WHERE id = v_booking_id;

  RETURN jsonb_build_object(
    'booking_id', v_booking_id,
    'booking_code', v_booking_code,
    'hold_expires_at', v_hold_expires_at,
    'total_amount', v_total,
    'taken_device', NULL
  );
END;
$$ LANGUAGE plpgsql;

-- Public function: confirm_booking(booking, payment) -> held to confirmed
CREATE OR REPLACE FUNCTION confirm_booking(
  p_booking_id UUID,
  p_payment_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_status TEXT;
BEGIN
  UPDATE bookings
  SET status = 'confirmed'
  WHERE id = p_booking_id AND status = 'held'
  RETURNING status INTO v_status;

  IF v_status IS NULL THEN
    RETURN jsonb_build_object('error', 'booking_not_held_or_not_found');
  END IF;

  UPDATE payments
  SET status = 'paid', paid_at = now()
  WHERE id = p_payment_id;

  RETURN jsonb_build_object('booking_id', p_booking_id, 'status', 'confirmed');
END;
$$ LANGUAGE plpgsql;

-- Public function: cancel_booking(booking, actor, reason)
CREATE OR REPLACE FUNCTION cancel_booking(
  p_booking_id UUID,
  p_actor_id UUID,
  p_actor_type TEXT,
  p_reason TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_status TEXT;
  v_start_at TIMESTAMPTZ;
  v_refund_cutoff INTEGER;
  v_refund_eligible BOOLEAN := false;
  v_total_amount INTEGER;
  v_refund_id UUID;
  v_customer_mobile TEXT;
  v_customer_name TEXT;
BEGIN
  -- Lock the booking row
  SELECT status, start_at, total_amount INTO v_status, v_start_at, v_total_amount
  FROM bookings WHERE id = p_booking_id FOR UPDATE;

  IF v_status IS NULL THEN
    RETURN jsonb_build_object('error', 'booking_not_found');
  END IF;

  IF v_status IN ('cancelled', 'expired', 'no_show') THEN
    RETURN jsonb_build_object('error', 'booking_already_' || lower(v_status));
  END IF;

  -- Compute refund eligibility from cutoff setting
  SELECT COALESCE((value)::INTEGER, 2) INTO v_refund_cutoff FROM settings WHERE key = 'refund_cutoff_hours';

  v_refund_eligible := v_start_at > now() + (v_refund_cutoff || ' hours')::INTERVAL;

  -- Update booking
  UPDATE bookings
  SET status = 'cancelled',
      cancelled_at = now(),
      cancelled_by = p_actor_id,
      cancel_reason = p_reason,
      refund_eligible = v_refund_eligible,
      updated_at = now()
  WHERE id = p_booking_id;

  -- Free occupancy rows
  DELETE FROM device_occupancy o
  USING booking_items bi
  WHERE o.booking_item_id = bi.id
    AND bi.booking_id = p_booking_id
    AND o.kind = 'booking';

  -- Create refund record if eligible
  IF v_refund_eligible AND v_total_amount > 0 THEN
    INSERT INTO refunds (booking_id, amount, status, requested_at, reason)
    VALUES (p_booking_id, v_total_amount, 'pending', now(), 'Customer cancellation eligible for refund')
    RETURNING id INTO v_refund_id;
  END IF;

  -- Get customer for notification
  SELECT c.mobile, c.name INTO v_customer_mobile, v_customer_name
  FROM bookings b JOIN customers c ON b.customer_id = c.id
  WHERE b.id = p_booking_id;

  -- Audit entry
  INSERT INTO audit_log (staff_id, action, entity_type, entity_id, after, reason)
  VALUES (p_actor_id, 'cancel_booking', 'booking', p_booking_id,
          jsonb_build_object('status', 'cancelled', 'refund_eligible', v_refund_eligible), p_reason);

  -- Notification
  INSERT INTO notifications (type, priority, booking_id, payload)
  VALUES ('cancellation', 10, p_booking_id,
          jsonb_build_object('customer_mobile', v_customer_mobile, 'customer_name', v_customer_name, 'refund_eligible', v_refund_eligible));

  RETURN jsonb_build_object(
    'booking_id', p_booking_id,
    'status', 'cancelled',
    'refund_eligible', v_refund_eligible,
    'refund_id', v_refund_id
  );
END;
$$ LANGUAGE plpgsql;

-- Public function: lookup_booking(booking_code, mobile)
CREATE OR REPLACE FUNCTION lookup_booking(
  p_booking_code TEXT,
  p_mobile TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'booking_id', b.id,
    'booking_code', b.booking_code,
    'status', b.status,
    'start_at', b.start_at,
    'end_at', b.end_at,
    'total_amount', b.total_amount,
    'customer_name', c.name,
    'customer_mobile', c.mobile,
    'items', (
      SELECT jsonb_agg(jsonb_build_object(
        'device_name', d.name,
        'device_type', d.type,
        'persons', bi.persons,
        'hours', bi.hours,
        'amount', bi.amount
      ))
      FROM booking_items bi
      JOIN devices d ON bi.device_id = d.id
      WHERE bi.booking_id = b.id
    ),
    'refund_eligible', b.refund_eligible
  ) INTO v_result
  FROM bookings b
  JOIN customers c ON b.customer_id = c.id
  WHERE b.booking_code = p_booking_code AND c.mobile = p_mobile;

  IF v_result IS NULL THEN
    RETURN jsonb_build_object('error', 'booking_not_found');
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Staff login: verify PIN, return short-lived session
CREATE OR REPLACE FUNCTION staff_login(p_pin TEXT)
RETURNS JSONB AS $$
DECLARE
  v_staff staff%ROWTYPE;
  v_session_token TEXT;
  v_expires_at TIMESTAMPTZ;
BEGIN
  SELECT * INTO v_staff
  FROM staff
  WHERE id = (
    SELECT id FROM staff WHERE pin_hash = crypt(p_pin, pin_hash) AND is_active = true
    LIMIT 1
  );

  IF NOT FOUND THEN
    -- Increment failed attempts if staff exists by name lookup not possible; just reject
    RETURN jsonb_build_object('error', 'invalid_pin');
  END IF;

  -- Check lockout
  IF v_staff.locked_until IS NOT NULL AND v_staff.locked_until > now() THEN
    RETURN jsonb_build_object('error', 'account_locked', 'locked_until', v_staff.locked_out);
  END IF;

  -- Reset failed attempts on success
  UPDATE staff
  SET failed_attempts = 0,
      locked_until = NULL,
      last_login_at = now()
  WHERE id = v_staff.id;

  -- Generate session token
  v_session_token := encode(gen_random_bytes(32), 'hex');
  v_expires_at := now() + interval '8 hours';

  -- In a production setup, store session in a sessions table or JWT.
  -- Here we return the token; the Next.js app validates via a server-side check.

  RETURN jsonb_build_object(
    'staff_id', v_staff.id,
    'name', v_staff.name,
    'role', v_staff.role,
    'session_token', v_session_token,
    'expires_at', v_expires_at
  );
END;
$$ LANGUAGE plpgsql;

-- pg_cron: expire_holds every minute
-- (Requires pg_cron extension and superuser; scheduled via Supabase dashboard or SQL)
-- SELECT cron.schedule('expire_holds', '* * * * *', 'SELECT remove_expired_holds();');
