-- ANDALORE CMMS - Schema (multi-tenant: toda tabela de negocio tem company_id)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS companies (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  tax_id      text UNIQUE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name          text NOT NULL,
  email         text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role          text NOT NULL CHECK (role IN ('ADMIN','MANAGER','PLANNER','TECHNICIAN','REQUESTER','VIEWER')),
  active        boolean NOT NULL DEFAULT true,
  hourly_rate   numeric NOT NULL DEFAULT 0 CHECK (hourly_rate >= 0),
  specialty     text NOT NULL DEFAULT '',
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id         bigserial PRIMARY KEY,
  company_id uuid NOT NULL,
  user_id    uuid,
  action     text NOT NULL,
  entity     text NOT NULL,
  entity_id  text,
  detail     jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assets (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  tag           text NOT NULL,
  name          text NOT NULL,
  category      text NOT NULL DEFAULT '',
  parent_id     uuid REFERENCES assets(id) ON DELETE SET NULL,
  plant         text NOT NULL DEFAULT '',
  area          text NOT NULL DEFAULT '',
  line          text NOT NULL DEFAULT '',
  criticality   text NOT NULL DEFAULT 'B' CHECK (criticality IN ('A','B','C')),
  status        text NOT NULL DEFAULT 'OPERATIONAL'
                CHECK (status IN ('OPERATIONAL','IN_MAINTENANCE','STANDBY','QUARANTINE','DECOMMISSIONED')),
  manufacturer  text NOT NULL DEFAULT '',
  model         text NOT NULL DEFAULT '',
  serial_number text NOT NULL DEFAULT '',
  install_date  date,
  power_kw      numeric NOT NULL DEFAULT 0,
  voltage_v     numeric NOT NULL DEFAULT 0,
  warranty_expiry date,
  specs         jsonb NOT NULL DEFAULT '{}',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, tag)
);
CREATE INDEX IF NOT EXISTS idx_assets_company ON assets(company_id);

CREATE TABLE IF NOT EXISTS inventory_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  code        text NOT NULL,
  name        text NOT NULL,
  category    text NOT NULL DEFAULT '',
  bin_location text NOT NULL DEFAULT '',
  current_stock numeric NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
  reserved_stock numeric NOT NULL DEFAULT 0 CHECK (reserved_stock >= 0),
  min_stock   numeric NOT NULL DEFAULT 0,
  max_stock   numeric NOT NULL DEFAULT 0,
  reorder_point numeric NOT NULL DEFAULT 0,
  unit_price  numeric NOT NULL DEFAULT 0,
  unit        text NOT NULL DEFAULT 'UN',
  supplier    text NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, code)
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id          bigserial PRIMARY KEY,
  company_id  uuid NOT NULL,
  item_id     uuid NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  kind        text NOT NULL CHECK (kind IN ('IN','OUT','ADJUST','RESERVE','RELEASE')),
  quantity    numeric NOT NULL,
  work_order_id uuid,
  user_id     uuid,
  note        text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS work_orders (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  seq         integer NOT NULL,
  code        text NOT NULL,
  title       text NOT NULL,
  description text NOT NULL DEFAULT '',
  asset_id    uuid REFERENCES assets(id) ON DELETE SET NULL,
  type        text NOT NULL CHECK (type IN ('CORRECTIVE','PREVENTIVE','PREDICTIVE','EMERGENCY','IMPROVEMENT')),
  priority    text NOT NULL CHECK (priority IN ('CRITICAL','HIGH','MEDIUM','LOW')),
  status      text NOT NULL DEFAULT 'REQUESTED'
              CHECK (status IN ('REQUESTED','TRIAGED','SCHEDULED','IN_PROGRESS','WAITING_PARTS','WAITING_VALIDATION','COMPLETED','CANCELLED')),
  requested_by uuid REFERENCES users(id),
  assigned_to uuid REFERENCES users(id),
  scheduled_date date,
  deadline_date  date,
  estimated_hours numeric NOT NULL DEFAULT 0,
  real_hours  numeric NOT NULL DEFAULT 0,
  cost_labor  numeric NOT NULL DEFAULT 0,
  cost_materials numeric NOT NULL DEFAULT 0,
  failure_mode text,
  root_cause  text,
  solution    text,
  checklist   jsonb NOT NULL DEFAULT '[]',
  requires_loto boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, seq)
);
CREATE INDEX IF NOT EXISTS idx_wo_company_status ON work_orders(company_id, status);

CREATE TABLE IF NOT EXISTS work_order_parts (
  id            bigserial PRIMARY KEY,
  work_order_id uuid NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  item_id       uuid NOT NULL REFERENCES inventory_items(id),
  quantity      numeric NOT NULL CHECK (quantity > 0),
  unit_price    numeric NOT NULL DEFAULT 0
);
