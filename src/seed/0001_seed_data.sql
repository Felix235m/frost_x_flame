-- Seed data: 6 devices, default pricing rules, settings, owner + staff profiles
-- Depends on: 0001_initial_schema.sql, 0002_booking_engine_functions.sql

-- Devices (from floor plan: 3 PS5 top row, VR zone top-right VR 1+VR 2, racing sim below right)
INSERT INTO devices (name, type, zone, display_order, max_persons, image_url, description, is_active) VALUES
  ('Station 1', 'ps5', 'Stage North', 1, 4, '/images/devices/ps1.png', 'PlayStation 5 Pro • 65" OLED 120Hz', true),
  ('Station 2', 'ps5', 'Stage North', 2, 4, '/images/devices/ps2.png', 'PlayStation 5 Pro • 65" OLED 120Hz', true),
  ('Station 3', 'ps5', 'Stage North', 3, 4, '/images/devices/ps3.png', 'PlayStation 5 Pro • 65" OLED 120Hz', true),
  ('VR 1', 'vr', 'VR Zone Arena', 4, 2, '/images/devices/vr1.png', 'VR Arena Pod • Omni Mat • Sony Pulse 3D', true),
  ('VR 2', 'vr', 'VR Zone Arena', 5, 2, '/images/devices/vr2.png', 'VR Arena Pod • Omni Mat • Sony Pulse 3D', true),
  ('Racing Simulator', 'sim', 'Sim Zone', 6, 2, '/images/devices/sim.png', 'Fanatec Direct Drive • Ultra Force Motion Rig', true);

-- Pricing rules (placeholder — owner to confirm before launch)
-- PS5: 1P ₹150, 2P ₹250, 3P ₹300, 4P ₹400
INSERT INTO pricing_rules (device_type, persons, price_per_hour, is_active) VALUES
  ('ps5', 1, 150, true),
  ('ps5', 2, 250, true),
  ('ps5', 3, 300, true),
  ('ps5', 4, 400, true),
  ('vr', 1, 300, true),
  ('vr', 2, 300, true),
  ('sim', 1, 350, true),
  ('sim', 2, 350, true);

-- Settings (configurable via admin UI)
INSERT INTO settings (key, value) VALUES
  ('opening_hour_from', '12'),
  ('opening_hour_to', '25'),
  ('hold_minutes', '10'),
  ('refund_cutoff_hours', '2'),
  ('max_advance_days', '7'),
  ('max_hours_per_booking', '3'),
  ('no_show_grace_minutes', '15'),
  ('maintenance_mode', 'false'),
  ('refund_fee_percent', '0');

-- Owner + staff PIN profiles (PINs hashed with bcrypt/crypt)
-- Default PINs: owner 1234, staff 4321 (to be changed on first login)
INSERT INTO staff (name, role, pin_hash, is_active) VALUES
  ('Owner', 'owner', crypt('1234', gen_salt('bf')), true),
  ('In-Charge', 'staff', crypt('4321', gen_salt('bf')), true),
  ('Staff A', 'staff', crypt('0000', gen_salt('bf')), true);

-- Seed villages (Goa area around Navelim)
INSERT INTO villages (name, normalized_name) VALUES
  ('Navelim', 'navelim'),
  ('Margao', 'margao'),
  ('Benaulim', 'benaulim'),
  ('Fatorda', 'fatorda'),
  ('Chinchinim', 'chinchinim'),
  ('Salcete', 'salcete');
