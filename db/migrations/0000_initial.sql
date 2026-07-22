CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  CREATE TYPE library_subscription_plan AS ENUM ('trial', 'starter', 'professional', 'enterprise');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE library_subscription_status AS ENUM ('active', 'past_due', 'cancelled', 'trialing');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('owner', 'staff', 'receptionist', 'student');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE membership_plan_type AS ENUM ('monthly', 'hourly');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE seat_type AS ENUM ('fixed', 'flexible');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE seat_status AS ENUM ('available', 'occupied', 'maintenance');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE student_status AS ENUM ('active', 'suspended', 'expired', 'inactive');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE membership_status AS ENUM ('active', 'expired', 'suspended', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE membership_type AS ENUM ('monthly', 'hourly');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE attendance_check_in_method AS ENUM ('qr', 'manual');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE attendance_check_out_method AS ENUM ('qr', 'manual', 'auto', 'forgot');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('cash', 'upi', 'card', 'online');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('paid', 'pending', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE expense_category AS ENUM ('rent', 'electricity', 'internet', 'salary', 'maintenance', 'miscellaneous');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS libraries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL,
  slug varchar(100) NOT NULL,
  owner_email varchar(255) NOT NULL,
  logo_url text,
  capacity integer NOT NULL DEFAULT 100,
  opening_time time NOT NULL DEFAULT '06:00',
  closing_time time NOT NULL DEFAULT '22:00',
  default_hourly_rate numeric(10,2),
  address text,
  phone varchar(20),
  subscription_plan library_subscription_plan NOT NULL DEFAULT 'trial',
  subscription_status library_subscription_status NOT NULL DEFAULT 'trialing',
  trial_ends_at timestamptz,
  subscription_ends_at timestamptz,
  razorpay_customer_id varchar(100),
  razorpay_subscription_id varchar(100),
  timezone varchar(50) NOT NULL DEFAULT 'Asia/Kolkata',
  custom_field_schema jsonb NOT NULL DEFAULT '{}'::jsonb,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_libraries_slug_unique ON libraries (slug);
CREATE INDEX IF NOT EXISTS idx_libraries_subscription_status ON libraries (subscription_status);
CREATE INDEX IF NOT EXISTS idx_libraries_is_active ON libraries (is_active);

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id uuid NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  phone varchar(20),
  password_hash text NOT NULL,
  role user_role NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_library_email_unique ON users (library_id, email);
CREATE INDEX IF NOT EXISTS idx_users_library_id ON users (library_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

CREATE TABLE IF NOT EXISTS membership_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id uuid NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
  name varchar(100) NOT NULL,
  type membership_plan_type NOT NULL,
  price numeric(10,2) NOT NULL,
  duration_days integer,
  hours_included numeric(8,2),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_membership_plans_library_active ON membership_plans (library_id, is_active);
CREATE INDEX IF NOT EXISTS idx_membership_plans_library_type ON membership_plans (library_id, type);

CREATE TABLE IF NOT EXISTS seats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id uuid NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
  seat_number varchar(20) NOT NULL,
  section varchar(50),
  type seat_type NOT NULL,
  status seat_status NOT NULL DEFAULT 'available',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_seats_library_seat_number_unique ON seats (library_id, seat_number);
CREATE INDEX IF NOT EXISTS idx_seats_library_status ON seats (library_id, status);
CREATE INDEX IF NOT EXISTS idx_seats_library_type ON seats (library_id, type);

CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id uuid NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  phone varchar(20) NOT NULL,
  email varchar(255),
  photo_url text,
  status student_status NOT NULL DEFAULT 'active',
  seat_id uuid REFERENCES seats(id) ON DELETE SET NULL,
  qr_token varchar(128) NOT NULL,
  custom_fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_students_qr_token_unique ON students (qr_token);
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_library_phone_unique ON students (library_id, phone) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_students_library_status ON students (library_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_students_library_phone ON students (library_id, phone) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_students_library_created_at ON students (library_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_students_seat_id ON students (seat_id) WHERE seat_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_students_custom_fields ON students USING GIN (custom_fields);
CREATE INDEX IF NOT EXISTS idx_students_name_trgm ON students USING GIN (name gin_trgm_ops) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id uuid NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES membership_plans(id) ON DELETE SET NULL,
  type membership_type NOT NULL,
  status membership_status NOT NULL DEFAULT 'active',
  start_date date NOT NULL,
  end_date date,
  hours_total numeric(8,2),
  hours_used numeric(8,2) NOT NULL DEFAULT 0,
  hours_remaining numeric(8,2),
  is_current boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_memberships_one_active ON memberships (student_id) WHERE is_current = true;
CREATE INDEX IF NOT EXISTS idx_memberships_library_student_current ON memberships (library_id, student_id, is_current);
CREATE INDEX IF NOT EXISTS idx_memberships_library_status ON memberships (library_id, status);
CREATE INDEX IF NOT EXISTS idx_memberships_active_end_date ON memberships (end_date) WHERE status = 'active';

CREATE TABLE IF NOT EXISTS attendance_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id uuid NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  membership_id uuid REFERENCES memberships(id) ON DELETE SET NULL,
  check_in_at timestamptz NOT NULL DEFAULT now(),
  check_out_at timestamptz,
  duration_minutes integer,
  check_in_method attendance_check_in_method NOT NULL,
  check_out_method attendance_check_out_method,
  check_in_by uuid REFERENCES users(id) ON DELETE SET NULL,
  check_out_by uuid REFERENCES users(id) ON DELETE SET NULL,
  is_manual_correction boolean NOT NULL DEFAULT false,
  correction_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_one_open_session ON attendance_sessions (student_id) WHERE check_out_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_attendance_library_check_in_at ON attendance_sessions (library_id, check_in_at DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_library_student_check_in_at ON attendance_sessions (library_id, student_id, check_in_at DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_open ON attendance_sessions (library_id) WHERE check_out_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_attendance_library_check_in_range ON attendance_sessions (library_id, check_in_at);

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id uuid NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  membership_id uuid REFERENCES memberships(id) ON DELETE SET NULL,
  amount numeric(10,2) NOT NULL,
  method payment_method NOT NULL,
  status payment_status NOT NULL DEFAULT 'paid',
  reference_number varchar(100),
  payment_date date NOT NULL,
  due_date date,
  notes text,
  recorded_by uuid REFERENCES users(id) ON DELETE SET NULL,
  razorpay_order_id varchar(100),
  razorpay_payment_id varchar(100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_library_payment_date ON payments (library_id, payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_payments_library_student ON payments (library_id, student_id);
CREATE INDEX IF NOT EXISTS idx_payments_library_status ON payments (library_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_pending_due_date ON payments (library_id, due_date) WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id uuid NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
  category expense_category NOT NULL,
  amount numeric(10,2) NOT NULL,
  description text,
  expense_date date NOT NULL,
  recorded_by uuid REFERENCES users(id) ON DELETE SET NULL,
  receipt_url text,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expenses_library_expense_date ON expenses (library_id, expense_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_expenses_library_category ON expenses (library_id, category) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS library_occupancy (
  library_id uuid PRIMARY KEY REFERENCES libraries(id) ON DELETE CASCADE,
  current_count integer NOT NULL DEFAULT 0,
  capacity integer NOT NULL DEFAULT 100,
  last_updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  library_id uuid NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  device_info text,
  ip_address text,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash_unique ON refresh_tokens (token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_revoked ON refresh_tokens (user_id, revoked_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens (expires_at);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id uuid NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  request_id varchar(64) NOT NULL,
  action varchar(100) NOT NULL,
  entity_type varchar(50),
  entity_id uuid,
  old_value jsonb,
  new_value jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_library_created_at ON audit_logs (library_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_library_entity ON audit_logs (library_id, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_library_user ON audit_logs (library_id, user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_request_id ON audit_logs (request_id);

CREATE OR REPLACE FUNCTION notify_attendance_change()
RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify(
    'attendance_update',
    json_build_object(
      'library_id', COALESCE(NEW.library_id, OLD.library_id)::text,
      'event_type', TG_OP,
      'student_id', COALESCE(NEW.student_id, OLD.student_id)::text,
      'session_id', COALESCE(NEW.id, OLD.id)::text,
      'ts', extract(epoch from now())
    )::text
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS attendance_realtime_trigger ON attendance_sessions;
CREATE TRIGGER attendance_realtime_trigger
AFTER INSERT OR UPDATE OF check_out_at
ON attendance_sessions
FOR EACH ROW
EXECUTE FUNCTION notify_attendance_change();