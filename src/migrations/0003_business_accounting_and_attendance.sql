-- Migration 0003: Business accounting, food income, expenses, staff attendance, wages/LOP
-- Depends on: 0001_initial_schema.sql, 0002_booking_engine_functions.sql
-- Apply AFTER 0002

-- 1. Staff shifts (track who is on duty)
CREATE TABLE staff_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  device_token TEXT
);

CREATE INDEX idx_staff_shifts_staff ON staff_shifts(staff_id);
CREATE INDEX idx_staff_shifts_active ON staff_shifts(is_active) WHERE is_active = true;

-- 2. Food income (entered by in-charge)
CREATE TABLE food_income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff(id),
  income_date DATE NOT NULL,
  amount INTEGER NOT NULL CHECK (amount >= 0),
  source TEXT NOT NULL DEFAULT 'food_court',
  payment_mode TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_food_income_date ON food_income(income_date);
CREATE INDEX idx_food_income_staff ON food_income(staff_id);

-- 3. Expense categories
CREATE TABLE expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Expenses with edit tracking (entered by admin or in-charge)
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff(id),
  category_id UUID REFERENCES expense_categories(id),
  expense_date DATE NOT NULL,
  amount INTEGER NOT NULL CHECK (amount >= 0),
  description TEXT,
  receipt_url TEXT,
  updated_by_staff_id UUID REFERENCES staff(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_staff ON expenses(staff_id);

-- 5. Expense edit history (audit trail for amount changes)
CREATE TABLE expense_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  old_amount INTEGER NOT NULL,
  new_amount INTEGER NOT NULL,
  edited_by_staff_id UUID NOT NULL REFERENCES staff(id),
  edited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reason TEXT
);

CREATE INDEX idx_expense_edits_expense ON expense_edits(expense_id);

-- Seed default expense categories
INSERT INTO expense_categories (name) VALUES
  ('Rent'), ('Electricity'), ('Staff Salary'), ('Maintenance'), ('Internet'), ('Other');

-- 6. Staff attendance sheet
CREATE TABLE staff_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff(id),
  attendance_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'leave', 'lop', 'half_day')),
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  hours_worked NUMERIC(4,2),
  notes TEXT,
  marked_by_staff_id UUID REFERENCES staff(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(staff_id, attendance_date)
);

CREATE INDEX idx_staff_attendance_staff ON staff_attendance(staff_id);
CREATE INDEX idx_staff_attendance_date ON staff_attendance(attendance_date);

-- 7. Staff wage rules (fixed / daily / hourly)
CREATE TABLE staff_wage_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff(id),
  wage_type TEXT NOT NULL CHECK (wage_type IN ('fixed', 'daily', 'hourly')),
  fixed_amount INTEGER,
  daily_rate INTEGER,
  hourly_rate INTEGER,
  effective_from DATE NOT NULL,
  effective_to DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_staff_wage_rules_staff ON staff_wage_rules(staff_id);

-- 8. Payroll records
CREATE TABLE payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff(id),
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  total_days INTEGER,
  present_days INTEGER,
  absent_days INTEGER,
  leave_days INTEGER,
  lop_days INTEGER,
  fixed_amount INTEGER,
  lop_deduction INTEGER,
  net_pay INTEGER,
  status TEXT NOT NULL DEFAULT 'draft',
  paid_at TIMESTAMPTZ,
  paid_by_staff_id UUID REFERENCES staff(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payroll_staff ON payroll(staff_id);
CREATE INDEX idx_payroll_period ON payroll(pay_period_start, pay_period_end);

-- 9. Extend push_subscriptions for mobile device info
ALTER TABLE push_subscriptions
  ADD COLUMN IF NOT EXISTS device_platform TEXT CHECK (device_platform IN ('ios', 'android', 'web')),
  ADD COLUMN IF NOT EXISTS device_model TEXT,
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

-- 10. Row-Level Security
ALTER TABLE staff_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_wage_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;

CREATE POLICY no_direct_staff_shifts ON staff_shifts FOR ALL USING (false);
CREATE POLICY no_direct_food_income ON food_income FOR ALL USING (false);
CREATE POLICY no_direct_expense_categories ON expense_categories FOR ALL USING (false);
CREATE POLICY no_direct_expenses ON expenses FOR ALL USING (false);
CREATE POLICY no_direct_expense_edits ON expense_edits FOR ALL USING (false);
CREATE POLICY no_direct_staff_attendance ON staff_attendance FOR ALL USING (false);
CREATE POLICY no_direct_staff_wage_rules ON staff_wage_rules FOR ALL USING (false);
CREATE POLICY no_direct_payroll ON payroll FOR ALL USING (false);

-- 11. Public function: enter_food_income (in-charge enters daily food court income)
CREATE OR REPLACE FUNCTION enter_food_income(
  p_staff_id UUID,
  p_income_date DATE,
  p_amount INTEGER,
  p_source TEXT,
  p_payment_mode TEXT,
  p_notes TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO food_income (staff_id, income_date, amount, source, payment_mode, notes)
  VALUES (p_staff_id, p_income_date, p_amount, p_source, p_payment_mode, p_notes)
  RETURNING id INTO v_id;

  INSERT INTO audit_log (staff_id, action, entity_type, entity_id, after, reason)
  VALUES (p_staff_id, 'enter_food_income', 'food_income', v_id,
          jsonb_build_object('income_date', p_income_date, 'amount', p_amount, 'source', p_source),
          'Food income entered');

  RETURN jsonb_build_object('id', v_id, 'status', 'ok');
END;
$$ LANGUAGE plpgsql;

-- 12. Public function: enter_expense (admin or in-charge enters shop expense)
CREATE OR REPLACE FUNCTION enter_expense(
  p_staff_id UUID,
  p_category_id UUID,
  p_expense_date DATE,
  p_amount INTEGER,
  p_description TEXT,
  p_receipt_url TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO expenses (staff_id, category_id, expense_date, amount, description, receipt_url, updated_by_staff_id)
  VALUES (p_staff_id, p_category_id, p_expense_date, p_amount, p_description, p_receipt_url, p_staff_id)
  RETURNING id INTO v_id;

  INSERT INTO audit_log (staff_id, action, entity_type, entity_id, after, reason)
  VALUES (p_staff_id, 'enter_expense', 'expense', v_id,
          jsonb_build_object('expense_date', p_expense_date, 'amount', p_amount, 'category_id', p_category_id),
          'Expense entered');

  RETURN jsonb_build_object('id', v_id, 'status', 'ok');
END;
$$ LANGUAGE plpgsql;

-- 13. Public function: edit_expense (edit amount with audit trail; admin only)
CREATE OR REPLACE FUNCTION edit_expense(
  p_expense_id UUID,
  p_new_amount INTEGER,
  p_edited_by_staff_id UUID,
  p_reason TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_old_amount INTEGER;
BEGIN
  SELECT amount INTO v_old_amount FROM expenses WHERE id = p_expense_id;

  IF v_old_amount IS NULL THEN
    RETURN jsonb_build_object('error', 'expense_not_found');
  END IF;

  INSERT INTO expense_edits (expense_id, old_amount, new_amount, edited_by_staff_id, reason)
  VALUES (p_expense_id, v_old_amount, p_new_amount, p_edited_by_staff_id, p_reason);

  UPDATE expenses
  SET amount = p_new_amount,
      updated_by_staff_id = p_edited_by_staff_id,
      updated_at = now()
  WHERE id = p_expense_id;

  INSERT INTO audit_log (staff_id, action, entity_type, entity_id, before, after, reason)
  VALUES (p_edited_by_staff_id, 'edit_expense', 'expense', p_expense_id,
          jsonb_build_object('amount', v_old_amount),
          jsonb_build_object('amount', p_new_amount),
          p_reason);

  RETURN jsonb_build_object('id', p_expense_id, 'status', 'updated', 'old_amount', v_old_amount, 'new_amount', p_new_amount);
END;
$$ LANGUAGE plpgsql;

-- 14. Public function: get_expense_log (expense entry log with editor info)
CREATE OR REPLACE FUNCTION get_expense_log(p_from DATE, p_to DATE)
RETURNS TABLE (
  expense_id UUID,
  expense_date DATE,
  category_name TEXT,
  amount INTEGER,
  description TEXT,
  entered_by_staff TEXT,
  edited_by_staff TEXT,
  last_edited_at TIMESTAMPTZ,
  edit_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id AS expense_id,
    e.expense_date,
    ec.name AS category_name,
    e.amount,
    e.description,
    enterer.name AS entered_by_staff,
    editor.name AS edited_by_staff,
    e.updated_at AS last_edited_at,
    COALESCE(ed.edit_count, 0) AS edit_count
  FROM expenses e
  JOIN expense_categories ec ON e.category_id = ec.id
  JOIN staff enterer ON e.staff_id = enterer.id
  LEFT JOIN staff editor ON e.updated_by_staff_id = editor.id
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS edit_count FROM expense_edits WHERE expense_id = e.id
  ) ed ON true
  WHERE e.expense_date >= p_from AND e.expense_date <= p_to
  ORDER BY e.expense_date DESC, e.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 15. Public function: get_daily_revenue_summary (day-wise revenue: bookings + food income)
CREATE OR REPLACE FUNCTION get_daily_revenue_summary(p_date DATE)
RETURNS TABLE (
  business_date DATE,
  booking_revenue INTEGER,
  food_income INTEGER,
  total_revenue INTEGER,
  booking_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p_date AS business_date,
    COALESCE((
      SELECT SUM(b.total_amount)
      FROM bookings b
      WHERE b.start_at::DATE = p_date
        AND b.status IN ('confirmed', 'checked_in', 'completed')
    ), 0) AS booking_revenue,
    COALESCE((
      SELECT SUM(f.amount)
      FROM food_income f
      WHERE f.income_date = p_date
    ), 0) AS food_income,
    COALESCE((
      SELECT SUM(b.total_amount)
      FROM bookings b
      WHERE b.start_at::DATE = p_date
        AND b.status IN ('confirmed', 'checked_in', 'completed')
    ), 0) +
    COALESCE((
      SELECT SUM(f.amount)
      FROM food_income f
      WHERE f.income_date = p_date
    ), 0) AS total_revenue,
    COALESCE((
      SELECT COUNT(*)
      FROM bookings b
      WHERE b.start_at::DATE = p_date
        AND b.status IN ('confirmed', 'checked_in', 'completed')
    ), 0) AS booking_count;
END;
$$ LANGUAGE plpgsql;

-- 16. Public function: get_monthly_revenue_summary (month-wise revenue)
CREATE OR REPLACE FUNCTION get_monthly_revenue_summary(p_year INTEGER, p_month INTEGER)
RETURNS TABLE (
  business_date DATE,
  booking_revenue INTEGER,
  food_income INTEGER,
  total_revenue INTEGER,
  booking_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d::DATE AS business_date,
    COALESCE(br.revenue, 0) AS booking_revenue,
    COALESCE(fi.income, 0) AS food_income,
    COALESCE(br.revenue, 0) + COALESCE(fi.income, 0) AS total_revenue,
    COALESCE(br.cnt, 0) AS booking_count
  FROM generate_series(
    make_date(p_year, p_month, 1),
    (make_date(p_year, p_month, 1) + interval '1 month - 1 day')::DATE,
    interval '1 day'
  ) AS d
  LEFT JOIN LATERAL (
    SELECT SUM(b.total_amount) AS revenue, COUNT(*) AS cnt
    FROM bookings b
    WHERE b.start_at::DATE = d
      AND b.status IN ('confirmed', 'checked_in', 'completed')
  ) br ON true
  LEFT JOIN LATERAL (
    SELECT SUM(f.amount) AS income
    FROM food_income f
    WHERE f.income_date = d
  ) fi ON true
  ORDER BY d;
END;
$$ LANGUAGE plpgsql;

-- 17. Public function: get_station_performance (per-station utilization & revenue)
CREATE OR REPLACE FUNCTION get_station_performance(p_from DATE, p_to DATE)
RETURNS TABLE (
  device_id UUID,
  station_name TEXT,
  station_type TEXT,
  zone TEXT,
  booked_hours INTEGER,
  revenue INTEGER,
  booking_count INTEGER,
  utilization_pct NUMERIC
) AS $$
DECLARE
  v_open_from INTEGER;
  v_open_to INTEGER;
BEGIN
  SELECT COALESCE((value)::INTEGER, 12) INTO v_open_from FROM settings WHERE key = 'opening_hour_from';
  SELECT COALESCE((value)::INTEGER, 25) INTO v_open_to FROM settings WHERE key = 'opening_hour_to';

  RETURN QUERY
  SELECT
    d.id AS device_id,
    d.name AS station_name,
    d.type AS station_type,
    d.zone AS zone,
    COALESCE(SUM(bi.hours), 0) AS booked_hours,
    COALESCE(SUM(bi.amount), 0) AS revenue,
    COALESCE(COUNT(DISTINCT b.id), 0) AS booking_count,
    CASE
      WHEN (v_open_to - v_open_from) > 0 THEN
        ROUND((COALESCE(SUM(bi.hours), 0)::NUMERIC /
          ((v_open_to - v_open_from) * (p_to - p_from + 1)) * 100), 2)
      ELSE 0
    END AS utilization_pct
  FROM devices d
  LEFT JOIN booking_items bi ON bi.device_id = d.id
  LEFT JOIN bookings b ON bi.booking_id = b.id
    AND b.start_at::DATE >= p_from AND b.start_at::DATE <= p_to
    AND b.status IN ('confirmed', 'checked_in', 'completed')
  WHERE d.is_active = true
  GROUP BY d.id, d.name, d.type, d.zone
  ORDER BY d.display_order;
END;
$$ LANGUAGE plpgsql;

-- 18. Public function: get_village_analytics (village-wise customers & revenue)
CREATE OR REPLACE FUNCTION get_village_analytics(p_from DATE, p_to DATE)
RETURNS TABLE (
  village TEXT,
  customer_count INTEGER,
  booking_count INTEGER,
  revenue INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.village AS village,
    COUNT(DISTINCT c.id) AS customer_count,
    COUNT(b.id) AS booking_count,
    COALESCE(SUM(b.total_amount), 0) AS revenue
  FROM customers c
  LEFT JOIN bookings b ON b.customer_id = c.id
    AND b.start_at::DATE >= p_from AND b.start_at::DATE <= p_to
    AND b.status IN ('confirmed', 'checked_in', 'completed')
  GROUP BY c.village
  ORDER BY revenue DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- 19. Public function: mark_staff_attendance (mark daily attendance)
CREATE OR REPLACE FUNCTION mark_staff_attendance(
  p_staff_id UUID,
  p_attendance_date DATE,
  p_status TEXT,
  p_check_in TIMESTAMPTZ,
  p_check_out TIMESTAMPTZ,
  p_hours_worked NUMERIC,
  p_notes TEXT,
  p_marked_by_staff_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO staff_attendance (staff_id, attendance_date, status, check_in, check_out, hours_worked, notes, marked_by_staff_id)
  VALUES (p_staff_id, p_attendance_date, p_status, p_check_in, p_check_out, p_hours_worked, p_notes, p_marked_by_staff_id)
  ON CONFLICT (staff_id, attendance_date) DO UPDATE
    SET status = EXCLUDED.status,
        check_in = EXCLUDED.check_in,
        check_out = EXCLUDED.check_out,
        hours_worked = EXCLUDED.hours_worked,
        notes = EXCLUDED.notes,
        marked_by_staff_id = EXCLUDED.marked_by_staff_id,
        updated_at = now()
  RETURNING id INTO v_id;

  INSERT INTO audit_log (staff_id, action, entity_type, entity_id, after, reason)
  VALUES (p_marked_by_staff_id, 'mark_staff_attendance', 'staff_attendance', v_id,
          jsonb_build_object('staff_id', p_staff_id, 'date', p_attendance_date, 'status', p_status),
          'Attendance marked');

  RETURN jsonb_build_object('id', v_id, 'status', 'ok');
END;
$$ LANGUAGE plpgsql;

-- 20. Public function: get_attendance_sheet (attendance for staff or all staff in date range)
CREATE OR REPLACE FUNCTION get_attendance_sheet(p_staff_id UUID, p_from DATE, p_to DATE)
RETURNS TABLE (
  attendance_id UUID,
  staff_id UUID,
  staff_name TEXT,
  attendance_date DATE,
  status TEXT,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  hours_worked NUMERIC,
  marked_by_staff TEXT,
  notes TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sa.id AS attendance_id,
    sa.staff_id,
    s.name AS staff_name,
    sa.attendance_date,
    sa.status,
    sa.check_in,
    sa.check_out,
    sa.hours_worked,
    marker.name AS marked_by_staff,
    sa.notes
  FROM staff_attendance sa
  JOIN staff s ON sa.staff_id = s.id
  LEFT JOIN staff marker ON sa.marked_by_staff_id = marker.id
  WHERE (p_staff_id IS NULL OR sa.staff_id = p_staff_id)
    AND sa.attendance_date >= p_from AND sa.attendance_date <= p_to
  ORDER BY sa.attendance_date, s.name;
END;
$$ LANGUAGE plpgsql;

-- 21. Public function: calculate_payroll (wages based on attendance with LOP)
CREATE OR REPLACE FUNCTION calculate_payroll(
  p_staff_id UUID,
  p_period_start DATE,
  p_period_end DATE,
  p_calculated_by_staff_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_wage_type TEXT;
  v_fixed_amount INTEGER;
  v_daily_rate INTEGER;
  v_hourly_rate INTEGER;
  v_present_days INTEGER;
  v_absent_days INTEGER;
  v_leave_days INTEGER;
  v_lop_days INTEGER;
  v_total_days INTEGER;
  v_lop_deduction INTEGER := 0;
  v_net_pay INTEGER;
  v_payroll_id UUID;
  v_total_hours NUMERIC := 0;
BEGIN
  -- Get active wage rule
  SELECT wage_type, fixed_amount, daily_rate, hourly_rate
  INTO v_wage_type, v_fixed_amount, v_daily_rate, v_hourly_rate
  FROM staff_wage_rules
  WHERE staff_id = p_staff_id
    AND is_active = true
    AND effective_from <= p_period_end
    AND (effective_to IS NULL OR effective_to >= p_period_start)
  ORDER BY effective_from DESC
  LIMIT 1;

  -- Count attendance by status
  SELECT COUNT(*),
         COUNT(*) FILTER (WHERE status = 'present'),
         COUNT(*) FILTER (WHERE status = 'absent'),
         COUNT(*) FILTER (WHERE status = 'leave'),
         COUNT(*) FILTER (WHERE status = 'lop')
  INTO v_total_days, v_present_days, v_absent_days, v_leave_days, v_lop_days
  FROM staff_attendance
  WHERE staff_id = p_staff_id
    AND attendance_date >= p_period_start
    AND attendance_date <= p_period_end;

  -- Sum hours for hourly wage
  SELECT COALESCE(SUM(hours_worked), 0) INTO v_total_hours
  FROM staff_attendance
  WHERE staff_id = p_staff_id
    AND attendance_date >= p_period_start
    AND attendance_date <= p_period_end;

  -- Calculate LOP deduction
  IF v_wage_type = 'daily' AND v_daily_rate IS NOT NULL THEN
    v_lop_deduction := v_lop_days * v_daily_rate;
  ELSIF v_wage_type = 'fixed' AND v_fixed_amount IS NOT NULL AND v_total_days > 0 THEN
    v_lop_deduction := (v_fixed_amount / v_total_days) * v_lop_days;
  END IF;

  -- Calculate net pay
  IF v_wage_type = 'fixed' AND v_fixed_amount IS NOT NULL THEN
    v_net_pay := v_fixed_amount - v_lop_deduction;
  ELSIF v_wage_type = 'daily' AND v_daily_rate IS NOT NULL THEN
    v_net_pay := v_present_days * v_daily_rate - v_lop_deduction;
  ELSIF v_wage_type = 'hourly' AND v_hourly_rate IS NOT NULL THEN
    v_net_pay := (v_total_hours::INTEGER * v_hourly_rate) - v_lop_deduction;
  ELSE
    v_net_pay := 0;
  END IF;

  -- Upsert payroll record
  INSERT INTO payroll (staff_id, pay_period_start, pay_period_end, total_days,
                       present_days, absent_days, leave_days, lop_days,
                       fixed_amount, lop_deduction, net_pay, status)
  VALUES (p_staff_id, p_period_start, p_period_end, v_total_days,
          v_present_days, v_absent_days, v_leave_days, v_lop_days,
          v_fixed_amount, v_lop_deduction, v_net_pay, 'draft')
  ON CONFLICT (staff_id, pay_period_start, pay_period_end) DO UPDATE
    SET total_days = EXCLUDED.total_days,
        present_days = EXCLUDED.present_days,
        absent_days = EXCLUDED.absent_days,
        leave_days = EXCLUDED.leave_days,
        lop_days = EXCLUDED.lop_days,
        fixed_amount = EXCLUDED.fixed_amount,
        lop_deduction = EXCLUDED.lop_deduction,
        net_pay = EXCLUDED.net_pay,
        updated_at = now()
  RETURNING id INTO v_payroll_id;

  INSERT INTO audit_log (staff_id, action, entity_type, entity_id, after, reason)
  VALUES (p_calculated_by_staff_id, 'calculate_payroll', 'payroll', v_payroll_id,
          jsonb_build_object('net_pay', v_net_pay, 'lop_days', v_lop_days, 'lop_deduction', v_lop_deduction),
          'Payroll calculated');

  RETURN jsonb_build_object(
    'id', v_payroll_id,
    'staff_id', p_staff_id,
    'period_start', p_period_start,
    'period_end', p_period_end,
    'total_days', v_total_days,
    'present_days', v_present_days,
    'absent_days', v_absent_days,
    'leave_days', v_leave_days,
    'lop_days', v_lop_days,
    'lop_deduction', v_lop_deduction,
    'net_pay', v_net_pay,
    'status', 'draft'
  );
END;
$$ LANGUAGE plpgsql;

-- 22. Public function: get_payroll_summary (payroll list for admin)
CREATE OR REPLACE FUNCTION get_payroll_summary(p_from DATE, p_to DATE)
RETURNS TABLE (
  payroll_id UUID,
  staff_id UUID,
  staff_name TEXT,
  staff_role TEXT,
  period_start DATE,
  period_end DATE,
  total_days INTEGER,
  present_days INTEGER,
  absent_days INTEGER,
  leave_days INTEGER,
  lop_days INTEGER,
  fixed_amount INTEGER,
  lop_deduction INTEGER,
  net_pay INTEGER,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id AS payroll_id,
    p.staff_id,
    s.name AS staff_name,
    s.role AS staff_role,
    p.pay_period_start AS period_start,
    p.pay_period_end AS period_end,
    p.total_days,
    p.present_days,
    p.absent_days,
    p.leave_days,
    p.lop_days,
    p.fixed_amount,
    p.lop_deduction,
    p.net_pay,
    p.status
  FROM payroll p
  JOIN staff s ON p.staff_id = s.id
  WHERE p.pay_period_start >= p_from AND p.pay_period_end <= p_to
  ORDER BY p.pay_period_start, s.name;
END;
$$ LANGUAGE plpgsql;

-- 23. pg_cron: expire_holds every minute (optional, uncomment to enable)
-- SELECT cron.schedule('expire_holds', '* * * * *', 'SELECT remove_expired_holds();');