-- Shift extensions: add presentation and night-shift flags

-- Columns for color, description, night flag, and ordering
ALTER TABLE shifts
  ADD COLUMN IF NOT EXISTS color_code VARCHAR(20),
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS is_night_shift BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

-- Optional: ensure non-negative sort_order
ALTER TABLE shifts
  ADD CONSTRAINT IF NOT EXISTS shifts_sort_order_nonnegative CHECK (sort_order >= 0);

-- Helpful index for listing by facility and order
CREATE INDEX IF NOT EXISTS idx_shifts_facility_order ON shifts(facility_id, sort_order);


