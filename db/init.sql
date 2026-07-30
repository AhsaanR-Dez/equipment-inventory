CREATE TABLE IF NOT EXISTS equipment (
  id            SERIAL PRIMARY KEY,
  asset_tag     TEXT NOT NULL UNIQUE,
  hostname      TEXT NOT NULL,
  model         TEXT NOT NULL,
  rack_label    TEXT NOT NULL,
  rack_unit     INTEGER NOT NULL CHECK (rack_unit BETWEEN 1 AND 42),
  status        TEXT NOT NULL CHECK (status IN ('active', 'maintenance', 'decommissioned')),
  installed_at  DATE NOT NULL,
  UNIQUE (rack_label, rack_unit)
);

CREATE INDEX IF NOT EXISTS equipment_rack_label_idx ON equipment (rack_label);
CREATE INDEX IF NOT EXISTS equipment_status_idx ON equipment (status);
