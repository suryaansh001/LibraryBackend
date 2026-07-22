=============================================================
PROJECT: Study Library SaaS — Backend API
AGENT INSTRUCTIONS: Read this entire prompt before writing
a single line of code. This is a production-grade SaaS
backend. Every decision must prioritize security,
performance, correctness, and maintainability.
Do not take shortcuts. Do not skip phases.
=============================================================

================================================================
SECTION 1: PROJECT OVERVIEW
================================================================

You are building the backend API for a multi-tenant SaaS
platform called "LibraryOS".

This platform is a Business Management System for Study
Libraries / Reading Rooms / Co-working Libraries.

Library owners pay a monthly subscription to use this
software. It helps them manage students, attendance,
memberships, seats, payments, and daily operations.

This is NOT a traditional library book management system.
It is an operational management platform.

The primary modules are:
- Multi-tenant authentication (JWT)
- Student Management
- QR-based Attendance (check-in / check-out)
- Live Occupancy Tracking
- Seat Management
- Membership Management
- Payment Recording
- Expense Tracking
- Dashboard Analytics
- CSV Import / Export
- WebSocket real-time updates for managers
- Staff / User Management
- Library Settings

================================================================
SECTION 2: IMPLEMENTATION RULE — HIGHEST PRIORITY
================================================================

Do NOT generate the entire backend in a single pass.

Complete one phase at a time.

After every phase:
- Ensure the project compiles successfully with zero errors.
- Ensure there are no TypeScript errors.
- Ensure all tests written for that phase pass.
- Explain important architectural decisions made.
- Do not proceed to the next phase until the current phase
  is complete, compiles, and is internally consistent.

Never generate placeholder implementations.
Never generate stub functions with TODO comments.
Never skip phases.
Never generate a phase partially and move on.

If a phase has a dependency on a future phase,
resolve it with a well-typed interface, not a stub.

================================================================
SECTION 3: TECH STACK — NON-NEGOTIABLE
================================================================

Runtime:         Node.js 20+ (LTS)
Language:        TypeScript (strict mode, zero "any" types)
Framework:       Fastify v4
ORM:             Drizzle ORM (drizzle-orm + drizzle-kit)
Database:        PostgreSQL 15+
Validation:      Zod (single source of truth for all types)
Auth:            Custom JWT (jsonwebtoken with RS256)
                 Refresh tokens stored hashed in DB
Password:        bcrypt (12 rounds)
QR Security:     HMAC-SHA256 signed tokens (Node crypto module)
File Uploads:    AWS S3 presigned URLs (no files on server)
WebSockets:      @fastify/websocket
Real-time DB:    PostgreSQL LISTEN/NOTIFY (dedicated pg client)
Job Scheduling:  node-cron
Rate Limiting:   @fastify/rate-limit
CORS:            @fastify/cors
Helmet:          @fastify/helmet
Multipart:       @fastify/multipart (CSV import only)
Logging:         Pino (built into Fastify, structured JSON logs)
API Docs:        @fastify/swagger + @fastify/swagger-ui
                 (auto-generated from Zod schemas, dev only)
Environment:     dotenv + Zod validation at startup
Testing:         Vitest + Supertest
Connection Pool: pg (node-postgres), PgBouncer-compatible config

Do NOT use: Prisma, Express, Redis, Socket.io clusters,
TypeORM, Mongoose, Passport.js, NextAuth, GraphQL,
Sequelize, or any MongoDB library.

================================================================
SECTION 4: ARCHITECTURE RULES — LAYER RESPONSIBILITIES
================================================================

Enforce strict separation of concerns.
Every layer has one job. Never mix responsibilities.

ROUTES LAYER:
- Parse and validate the incoming request using Zod schemas
- Call the appropriate service method
- Return the response using standard response util
- No business logic
- No direct database access
- No try/catch for business errors (let error handler catch)

SERVICES LAYER:
- Contains all business logic
- Coordinates calls to one or more repositories
- Manages database transactions
- Maps repository models to DTOs before returning
- Calls audit log service
- Never accesses the database directly (only via repositories)
- Never accesses req/res objects

REPOSITORIES LAYER:
- Database access only
- Executes SQL queries via Drizzle ORM
- Returns typed database row objects
- No business logic
- No validation
- No logging
- No transactions (transactions are started by services)
- Never calls other repositories
- Never calls services
- Never calls external APIs

UTILITIES LAYER:
- Pure helper functions only
- No side effects unless explicitly named (e.g., generateQrToken)
- No database access
- No external calls
- Reusable across modules

RESPONSE MAPPING CHAIN (strictly enforced):

  Database Entity (Drizzle row)
        ↓
  Repository Model (typed return from repository)
        ↓
  Service (business logic applied)
        ↓
  DTO Mapper (entity → DTO function)
        ↓
  API Response (via response util)

Never return raw ORM objects from any route.
Never expose internal database field names in responses.

================================================================
SECTION 5: CONFIGURATION RULE
================================================================

Only src/config/env.ts may access process.env directly.

Every other module must import the validated config object:
  import { config } from '@/config/env'

Never write process.env.ANYTHING outside of env.ts.

env.ts must:
- Parse all environment variables with Zod at startup
- Throw a descriptive error if any required var is missing
- Export a single typed, immutable config object
- Never be mocked in tests — use test env files instead

================================================================
SECTION 6: PROJECT FOLDER STRUCTURE
================================================================

Create this EXACT folder structure:

src/
├── app.ts
├── server.ts
├── config/
│   ├── env.ts                      ← ONLY file that reads process.env
│   ├── database.ts
│   └── constants.ts
├── modules/
│   ├── auth/
│   │   ├── auth.routes.ts
│   │   ├── auth.service.ts
│   │   ├── auth.repository.ts
│   │   ├── auth.schema.ts
│   │   └── auth.test.ts
│   ├── students/
│   │   ├── students.routes.ts
│   │   ├── students.service.ts
│   │   ├── students.repository.ts
│   │   ├── students.schema.ts
│   │   └── students.test.ts
│   ├── attendance/
│   │   ├── attendance.routes.ts
│   │   ├── attendance.service.ts
│   │   ├── attendance.repository.ts
│   │   ├── attendance.schema.ts
│   │   └── attendance.test.ts
│   ├── memberships/
│   │   ├── memberships.routes.ts
│   │   ├── memberships.service.ts
│   │   ├── memberships.repository.ts
│   │   └── memberships.schema.ts
│   ├── membership-plans/
│   │   ├── plans.routes.ts
│   │   ├── plans.service.ts
│   │   ├── plans.repository.ts
│   │   └── plans.schema.ts
│   ├── seats/
│   │   ├── seats.routes.ts
│   │   ├── seats.service.ts
│   │   ├── seats.repository.ts
│   │   └── seats.schema.ts
│   ├── payments/
│   │   ├── payments.routes.ts
│   │   ├── payments.service.ts
│   │   ├── payments.repository.ts
│   │   └── payments.schema.ts
│   ├── expenses/
│   │   ├── expenses.routes.ts
│   │   ├── expenses.service.ts
│   │   ├── expenses.repository.ts
│   │   └── expenses.schema.ts
│   ├── dashboard/
│   │   ├── dashboard.routes.ts
│   │   ├── dashboard.service.ts
│   │   └── dashboard.schema.ts
│   ├── occupancy/
│   │   ├── occupancy.routes.ts
│   │   ├── occupancy.service.ts
│   │   └── occupancy.websocket.ts
│   ├── settings/
│   │   ├── settings.routes.ts
│   │   ├── settings.service.ts
│   │   ├── settings.repository.ts
│   │   └── settings.schema.ts
│   ├── users/
│   │   ├── users.routes.ts
│   │   ├── users.service.ts
│   │   ├── users.repository.ts
│   │   └── users.schema.ts
│   ├── storage/
│   │   ├── storage.routes.ts
│   │   └── storage.service.ts
│   └── csv/
│       ├── csv.routes.ts
│       ├── csv.import.service.ts
│       └── csv.export.service.ts
├── shared/
│   ├── middleware/
│   │   ├── authenticate.ts
│   │   ├── authorize.ts
│   │   ├── tenant.ts
│   │   └── request-id.ts           ← assigns X-Request-ID to every request
│   ├── plugins/
│   │   ├── db.plugin.ts
│   │   ├── auth.plugin.ts
│   │   ├── swagger.plugin.ts       ← OpenAPI docs, dev only
│   │   └── realtime.plugin.ts
│   ├── dto/                        ← DTO definitions and mappers
│   │   ├── student.dto.ts
│   │   ├── attendance.dto.ts
│   │   ├── payment.dto.ts
│   │   ├── membership.dto.ts
│   │   ├── seat.dto.ts
│   │   ├── dashboard.dto.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── qr-token.util.ts
│   │   ├── pagination.util.ts
│   │   ├── date.util.ts
│   │   ├── csv.util.ts
│   │   └── response.util.ts
│   ├── errors/
│   │   ├── app-error.ts
│   │   ├── error-codes.ts
│   │   └── error-handler.ts
│   └── types/
│       ├── fastify.d.ts
│       └── common.types.ts
├── jobs/
│   ├── forgot-checkout.job.ts
│   └── membership-expiry.job.ts
└── db/
    ├── schema/
    │   ├── index.ts
    │   ├── libraries.ts
    │   ├── users.ts
    │   ├── students.ts
    │   ├── seats.ts
    │   ├── membership-plans.ts
    │   ├── memberships.ts
    │   ├── attendance-sessions.ts
    │   ├── payments.ts
    │   ├── expenses.ts
    │   ├── library-occupancy.ts
    │   ├── refresh-tokens.ts
    │   └── audit-logs.ts
    └── migrations/

Root files:
├── .github/
│   └── workflows/
│       └── ci.yml                  ← GitHub Actions CI pipeline
├── drizzle.config.ts
├── .env.example
├── .env.test                       ← test environment vars
├── tsconfig.json
├── .eslintrc.json
├── package.json
└── vitest.config.ts

================================================================
SECTION 7: DTO LAYER
================================================================

Location: src/shared/dto/

Every module must define a DTO and a mapper function.
Never return raw database entities from routes.

STUDENT DTO (src/shared/dto/student.dto.ts):

StudentResponseDTO {
  id: string
  name: string
  phone: string
  email: string | null
  photoUrl: string | null
  status: 'active' | 'suspended' | 'expired' | 'inactive'
  seatNumber: string | null
  membershipType: 'monthly' | 'hourly' | null
  membershipStatus: 'active' | 'expired' | 'suspended' | null
  membershipEndDate: string | null
  hoursRemaining: number | null
  customFields: Record<string, unknown>
  createdAt: string
}

StudentListItemDTO {
  id: string
  name: string
  phone: string
  status: string
  seatNumber: string | null
  membershipType: string | null
  membershipStatus: string | null
}

ATTENDANCE DTO (src/shared/dto/attendance.dto.ts):

AttendanceSessionDTO {
  id: string
  studentId: string
  studentName: string
  seatNumber: string | null
  checkInAt: string
  checkOutAt: string | null
  durationMinutes: number | null
  checkInMethod: 'qr' | 'manual'
  checkOutMethod: 'qr' | 'manual' | 'auto' | 'forgot' | null
  isManualCorrection: boolean
}

CheckInResponseDTO {
  sessionId: string
  studentName: string
  seatNumber: string | null
  membershipType: string
  checkInAt: string
  currentOccupancy: number
}

PAYMENT DTO (src/shared/dto/payment.dto.ts):

PaymentResponseDTO {
  id: string
  studentId: string
  studentName: string
  amount: number
  method: string
  status: string
  referenceNumber: string | null
  paymentDate: string
  dueDate: string | null
  notes: string | null
  recordedByName: string | null
}

DASHBOARD DTO (src/shared/dto/dashboard.dto.ts):

DashboardResponseDTO {
  currentOccupancy: number
  capacity: number
  todayCheckins: number
  monthlyRevenue: number
  pendingFeesCount: number
  pendingFeesAmount: number
  activeStudents: number
  revenue30d: Array<{ date: string; amount: number }>
  attendance30d: Array<{ date: string; count: number }>
  recentActivity: Array<{ action: string; entityType: string; createdAt: string }>
  partialFailures: string[]            ← list any queries that failed gracefully
}

MAPPING RULE:
Each DTO file exports a mapper function:
  export function toStudentDTO(entity: StudentEntity, ...extras): StudentResponseDTO

Mapper functions are pure functions with no side effects.

ZOD RULE:
Use z.infer<typeof Schema> everywhere.
Never manually duplicate interfaces that mirror a Zod schema.
Zod schemas are the single source of truth for all types.
Derive TypeScript types from schemas, not the other way around.

================================================================
SECTION 8: DATABASE SCHEMA
================================================================

Implement ALL tables using Drizzle ORM schema definitions.
Use pgTable from drizzle-orm/pg-core.

UUID RULE:
Prefer UUID v7 for all primary keys if your pg version and
Drizzle version support it (better index locality in Postgres
B-tree indexes due to monotonically increasing values).
If UUID v7 is not available, use UUID v4 with gen_random_uuid().
Never use sequential integer IDs for tenant-facing resources.

All timestamps: timestamptz.
Include ALL indexes specified below.

------------------------------------------------------------
TABLE 1: libraries
------------------------------------------------------------

id                      uuid PK default gen_random_uuid()
name                    varchar(255) NOT NULL
slug                    varchar(100) UNIQUE NOT NULL
owner_email             varchar(255) NOT NULL
logo_url                text
capacity                integer NOT NULL default 100
opening_time            time NOT NULL default '06:00'
closing_time            time NOT NULL default '22:00'
default_hourly_rate     numeric(10,2)
address                 text
phone                   varchar(20)
subscription_plan       enum('trial','starter','professional','enterprise') default 'trial'
subscription_status     enum('active','past_due','cancelled','trialing') default 'trialing'
trial_ends_at           timestamptz
subscription_ends_at    timestamptz
razorpay_customer_id    varchar(100)        ← NULL in V1, reserved for future
razorpay_subscription_id varchar(100)       ← NULL in V1, reserved for future
timezone                varchar(50) default 'Asia/Kolkata'
custom_field_schema     jsonb default '{}'
settings                jsonb default '{}'
is_active               boolean default true
created_at              timestamptz default now()
updated_at              timestamptz default now()

INDEXES:
- UNIQUE on slug
- INDEX on subscription_status
- INDEX on is_active

------------------------------------------------------------
TABLE 2: users
------------------------------------------------------------

id              uuid PK
library_id      uuid FK → libraries(id) ON DELETE CASCADE
name            varchar(255) NOT NULL
email           varchar(255) NOT NULL
phone           varchar(20)
password_hash   text NOT NULL
role            enum('owner','staff','receptionist') NOT NULL

FUTURE AUTH NOTE:
Reserve a 'student' role in this enum even though it will
not be used in V1. The enum should be:
enum('owner','staff','receptionist','student')
This avoids a breaking migration when student auth is added.
Do NOT implement student authentication now.
Do NOT add student login routes now.
Simply ensure the role enum accommodates it.

is_active       boolean default true
last_login_at   timestamptz
created_at      timestamptz default now()
updated_at      timestamptz default now()

INDEXES:
- UNIQUE on (library_id, email)
- INDEX on library_id
- INDEX on role

------------------------------------------------------------
TABLE 3: membership_plans
------------------------------------------------------------

id              uuid PK
library_id      uuid FK → libraries(id) ON DELETE CASCADE
name            varchar(100) NOT NULL
type            enum('monthly','hourly') NOT NULL
price           numeric(10,2) NOT NULL
duration_days   integer
hours_included  numeric(8,2)
is_active       boolean default true
created_at      timestamptz default now()
updated_at      timestamptz default now()

INDEXES:
- INDEX on (library_id, is_active)
- INDEX on (library_id, type)

------------------------------------------------------------
TABLE 4: seats
------------------------------------------------------------

id              uuid PK
library_id      uuid FK → libraries(id) ON DELETE CASCADE
seat_number     varchar(20) NOT NULL
section         varchar(50)
type            enum('fixed','flexible') NOT NULL
status          enum('available','occupied','maintenance') default 'available'
created_at      timestamptz default now()
updated_at      timestamptz default now()

DATABASE CONSTRAINTS:
- UNIQUE on (library_id, seat_number)
  ← Enforced at DB level, not just application level

INDEXES:
- UNIQUE on (library_id, seat_number)
- INDEX on (library_id, status)
- INDEX on (library_id, type)

------------------------------------------------------------
TABLE 5: students
------------------------------------------------------------

id              uuid PK default gen_random_uuid()
library_id      uuid FK → libraries(id) ON DELETE CASCADE
name            varchar(255) NOT NULL
phone           varchar(20) NOT NULL
email           varchar(255)
photo_url       text
status          enum('active','suspended','expired','inactive') default 'active'
seat_id         uuid FK → seats(id) ON DELETE SET NULL (nullable)
qr_token        varchar(128) UNIQUE NOT NULL
custom_fields   jsonb default '{}'
notes           text
created_by      uuid FK → users(id) ON DELETE SET NULL (nullable)
deleted_at      timestamptz DEFAULT NULL        ← SOFT DELETE SUPPORT

SOFT DELETE RULE:
Students must NEVER be permanently deleted.
Use soft delete: set deleted_at = NOW() on "delete".
All queries MUST include: WHERE deleted_at IS NULL
unless the query is explicitly fetching deleted students.
Audit logs for deleted students must be preserved.

created_at      timestamptz default now()
updated_at      timestamptz default now()

DATABASE CONSTRAINTS:
- UNIQUE on qr_token (enforced at DB level)
- UNIQUE on (library_id, phone) WHERE deleted_at IS NULL
  ← Partial unique index allows re-use of phone after soft delete

INDEXES:
- UNIQUE on qr_token
- INDEX on (library_id, status) WHERE deleted_at IS NULL
- INDEX on (library_id, phone) WHERE deleted_at IS NULL
- INDEX on (library_id, created_at DESC) WHERE deleted_at IS NULL
- INDEX on seat_id WHERE seat_id IS NOT NULL AND deleted_at IS NULL
- GIN INDEX on custom_fields
- GIN TRIGRAM INDEX on name (pg_trgm):
  CREATE INDEX idx_students_name_trgm ON students
  USING GIN (name gin_trgm_ops) WHERE deleted_at IS NULL

------------------------------------------------------------
TABLE 6: memberships
------------------------------------------------------------

id                  uuid PK
library_id          uuid FK → libraries(id) ON DELETE CASCADE
student_id          uuid FK → students(id) ON DELETE CASCADE
plan_id             uuid FK → membership_plans(id) ON DELETE SET NULL
type                enum('monthly','hourly') NOT NULL
status              enum('active','expired','suspended','cancelled') default 'active'
start_date          date NOT NULL
end_date            date
hours_total         numeric(8,2)
hours_used          numeric(8,2) default 0
hours_remaining     numeric(8,2)
is_current          boolean default true
created_by          uuid FK → users(id) ON DELETE SET NULL
created_at          timestamptz default now()
updated_at          timestamptz default now()

DATABASE CONSTRAINTS:
- UNIQUE PARTIAL INDEX on (student_id) WHERE is_current = true
  ← Enforces one active membership per student at the DB level
  ← Application logic alone is not sufficient
  CREATE UNIQUE INDEX idx_memberships_one_active
  ON memberships(student_id) WHERE is_current = true

INDEXES:
- UNIQUE PARTIAL: (student_id) WHERE is_current = true
- INDEX on (library_id, student_id, is_current)
- INDEX on (library_id, status)
- PARTIAL INDEX on end_date WHERE status = 'active'

------------------------------------------------------------
TABLE 7: attendance_sessions
------------------------------------------------------------

id                      uuid PK
library_id              uuid FK → libraries(id) ON DELETE CASCADE
student_id              uuid FK → students(id) ON DELETE CASCADE
membership_id           uuid FK → memberships(id) ON DELETE SET NULL
check_in_at             timestamptz NOT NULL default now()
check_out_at            timestamptz
duration_minutes        integer
check_in_method         enum('qr','manual') NOT NULL
check_out_method        enum('qr','manual','auto','forgot')
check_in_by             uuid FK → users(id) ON DELETE SET NULL
check_out_by            uuid FK → users(id) ON DELETE SET NULL
is_manual_correction    boolean default false
correction_reason       text
created_at              timestamptz default now()
updated_at              timestamptz default now()

DATABASE CONSTRAINTS:
- UNIQUE PARTIAL INDEX: (student_id) WHERE check_out_at IS NULL
  ← THE MOST IMPORTANT CONSTRAINT IN THE ENTIRE SYSTEM
  ← Prevents duplicate active sessions at the database level
  ← Application-level checks alone are NOT sufficient
  CREATE UNIQUE INDEX idx_attendance_one_open_session
  ON attendance_sessions(student_id) WHERE check_out_at IS NULL

INDEXES:
- UNIQUE PARTIAL: (student_id) WHERE check_out_at IS NULL  ← CRITICAL
- INDEX on (library_id, check_in_at DESC)
- INDEX on (library_id, student_id, check_in_at DESC)
- PARTIAL INDEX on (library_id) WHERE check_out_at IS NULL
  ← for fast live occupancy COUNT
  CREATE INDEX idx_attendance_open ON attendance_sessions(library_id)
  WHERE check_out_at IS NULL
- INDEX on (library_id, check_in_at) for date-range reports

------------------------------------------------------------
TABLE 8: payments
------------------------------------------------------------

id                      uuid PK
library_id              uuid FK → libraries(id) ON DELETE CASCADE
student_id              uuid FK → students(id) ON DELETE CASCADE
membership_id           uuid FK → memberships(id) ON DELETE SET NULL
amount                  numeric(10,2) NOT NULL
method                  enum('cash','upi','card','online') NOT NULL
status                  enum('paid','pending','refunded') default 'paid'
reference_number        varchar(100)
payment_date            date NOT NULL
due_date                date
notes                   text
recorded_by             uuid FK → users(id) ON DELETE SET NULL
razorpay_order_id       varchar(100)    ← NULL in V1, reserved
razorpay_payment_id     varchar(100)    ← NULL in V1, reserved
created_at              timestamptz default now()
updated_at              timestamptz default now()

INDEXES:
- INDEX on (library_id, payment_date DESC)
- INDEX on (library_id, student_id)
- INDEX on (library_id, status)
- PARTIAL INDEX on (library_id, due_date) WHERE status = 'pending'

------------------------------------------------------------
TABLE 9: expenses
------------------------------------------------------------

id              uuid PK
library_id      uuid FK → libraries(id) ON DELETE CASCADE
category        enum('rent','electricity','internet','salary',
                      'maintenance','miscellaneous')
amount          numeric(10,2) NOT NULL
description     text
expense_date    date NOT NULL
recorded_by     uuid FK → users(id) ON DELETE SET NULL
receipt_url     text
deleted_at      timestamptz DEFAULT NULL     ← soft delete
created_at      timestamptz default now()
updated_at      timestamptz default now()

INDEXES:
- INDEX on (library_id, expense_date DESC) WHERE deleted_at IS NULL
- INDEX on (library_id, category) WHERE deleted_at IS NULL

------------------------------------------------------------
TABLE 10: library_occupancy
------------------------------------------------------------

library_id          uuid PK FK → libraries(id) ON DELETE CASCADE
current_count       integer NOT NULL default 0
capacity            integer NOT NULL default 100
last_updated_at     timestamptz default now()

IMPORTANT — OCCUPANCY IS A CACHE:
library_occupancy is ONLY a cached counter for performance.
The source of truth is ALWAYS attendance_sessions.
  COUNT(*) FROM attendance_sessions
  WHERE library_id = $1 AND check_out_at IS NULL

If the counter and the true count ever diverge,
attendance_sessions always wins.
The reconciliation job (runs every 5 minutes) restores consistency.
Business decisions must never depend solely on this counter.
Use the true COUNT query for any critical operation.

------------------------------------------------------------
TABLE 11: refresh_tokens
------------------------------------------------------------

id              uuid PK
user_id         uuid FK → users(id) ON DELETE CASCADE
library_id      uuid FK → libraries(id) ON DELETE CASCADE
token_hash      text UNIQUE NOT NULL    ← SHA-256 hash only
expires_at      timestamptz NOT NULL
device_info     text
ip_address      text
revoked_at      timestamptz
created_at      timestamptz default now()

INDEXES:
- UNIQUE on token_hash
- INDEX on (user_id, revoked_at)
- INDEX on expires_at    ← for cleanup job

------------------------------------------------------------
TABLE 12: audit_logs
------------------------------------------------------------

id              uuid PK
library_id      uuid FK → libraries(id) ON DELETE CASCADE
user_id         uuid FK → users(id) ON DELETE SET NULL
request_id      varchar(64)              ← X-Request-ID for tracing
action          varchar(100) NOT NULL
entity_type     varchar(50)
entity_id       uuid
old_value       jsonb
new_value       jsonb
ip_address      text
created_at      timestamptz default now()

IMMUTABILITY RULE:
audit_logs is append-only.
Never UPDATE or DELETE rows in this table under any circumstances.
The repository must not expose update or delete methods.
The service layer must enforce this.

INDEXES:
- INDEX on (library_id, created_at DESC)
- INDEX on (library_id, entity_type, entity_id)
- INDEX on (library_id, user_id)
- INDEX on request_id    ← for tracing a full request's actions

------------------------------------------------------------
POSTGRES TRIGGER — REAL-TIME NOTIFICATIONS
------------------------------------------------------------

Include in a dedicated migration file:

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION notify_attendance_change()
RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify(
    'attendance_update',
    json_build_object(
      'library_id',  COALESCE(NEW.library_id, OLD.library_id)::text,
      'event_type',  TG_OP,
      'student_id',  COALESCE(NEW.student_id, OLD.student_id)::text,
      'session_id',  COALESCE(NEW.id, OLD.id)::text,
      'ts',          extract(epoch from now())
    )::text
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER attendance_realtime_trigger
AFTER INSERT OR UPDATE OF check_out_at
ON attendance_sessions
FOR EACH ROW
EXECUTE FUNCTION notify_attendance_change();

DATABASE CONSTRAINTS RULE:
Prefer enforcing business rules at the database level
whenever practical. Do not rely solely on application logic.
The following must be enforced at the DB level:
  • One active membership per student (partial unique index)
  • One active attendance session per student (partial unique index)
  • Unique seat numbers per library (unique constraint)
  • Unique email per library (unique constraint)
  • Unique phone per library (partial unique index, excluding deleted)
Application-level checks give friendly error messages.
DB constraints are the true enforcement layer.

================================================================
SECTION 9: ENVIRONMENT VARIABLES
================================================================

Required environment variables (validated in env.ts with Zod):

DATABASE_URL
JWT_PRIVATE_KEY          ← RS256 PEM private key
JWT_PUBLIC_KEY           ← RS256 PEM public key
JWT_ACCESS_EXPIRES_IN    ← e.g. "15m"
JWT_REFRESH_EXPIRES_IN   ← e.g. "30d"
QR_HMAC_SECRET           ← 64-char random hex string
AWS_REGION
AWS_S3_BUCKET
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
S3_PRESIGN_EXPIRES_IN    ← seconds, e.g. 300
PORT                     ← e.g. 3000
NODE_ENV                 ← "development" | "production" | "test"
CORS_ORIGINS             ← comma-separated allowed origins
LOG_LEVEL                ← "info" | "debug" | "warn" | "error"
MAX_REQUEST_BODY_SIZE    ← e.g. "10mb"
API_VERSION              ← e.g. "v1" (used for route prefix)

================================================================
SECTION 10: API VERSIONING
================================================================

The API version prefix must be configurable.
Do NOT hardcode /api/v1 in route files.

The version is read from config.API_VERSION.
Mount all routes through a Fastify plugin that sets the prefix:

  fastify.register(routes, { prefix: `/api/${config.API_VERSION}` })

Future API versions (v2) must be addable without modifying
any existing route files. New version = new plugin registration.

Route files themselves are version-agnostic.
They only define paths relative to their module.
The version prefix is applied at registration time only.

================================================================
SECTION 11: REQUEST ID
================================================================

Every HTTP request must receive a unique Request ID.

Implementation (src/shared/middleware/request-id.ts):
- On each request, generate: crypto.randomUUID()
- Attach to request object: request.requestId
- Set response header: X-Request-ID: <uuid>
- Include in every Pino log entry: { requestId: '...' }
- Store in audit_logs.request_id for full traceability
- If the incoming request already has X-Request-ID header,
  use it (allows tracing across frontend → backend)

Augment FastifyRequest in fastify.d.ts:
  interface FastifyRequest {
    requestId: string
    user: AuthenticatedUser
    libraryId: string
  }

================================================================
SECTION 12: AUTHENTICATION
================================================================

JWT with RS256 (asymmetric). NOT HS256.

ACCESS TOKEN:
{
  sub: user.id,
  library_id: library.id,
  role: 'owner' | 'staff' | 'receptionist',
  email: user.email,
  exp: now + 15 minutes
}

REFRESH TOKEN:
- Generate: crypto.randomBytes(64).toString('hex')
- Store: SHA-256 hash in refresh_tokens table
- Send: httpOnly + Secure + SameSite=Strict cookie

LOGIN FLOW:
1. Validate with Zod
2. Fetch user by email + library context
3. Check library.subscription_status !== 'cancelled'
4. bcrypt.compare(password, hash) — 12 rounds
5. Generate access_token (RS256)
6. Generate refresh_token, hash it, store in DB
7. Set refresh token in httpOnly cookie
8. Return access_token + UserResponseDTO + LibraryResponseDTO

REFRESH FLOW:
1. Read refresh token from httpOnly cookie
2. Hash it, look up in DB
3. Check not revoked, not expired
4. Generate new access_token
5. Rotate refresh token (generate new, revoke old in same transaction)

LOGOUT:
1. Read refresh token from cookie
2. Set revoked_at = now()
3. Clear cookie
4. Return 200

STUDENT AUTHENTICATION (FUTURE — DO NOT IMPLEMENT NOW):
The auth module must be designed so a 'student' role can be
introduced in a future phase without rewriting the system.
The users table already has 'student' in the role enum.
The JWT structure already supports any role value.
When student auth is added later:
  - Add student login route
  - Students get a restricted JWT with role='student'
  - A new authorize middleware guard 'studentOnly' is added
  - No existing routes or middleware need to change

================================================================
SECTION 13: MULTI-TENANCY
================================================================

library_id comes ONLY from the verified JWT.
Never trust library_id from request body or URL params.
Always use request.libraryId (set by authenticate middleware).

Every repository query includes:
  WHERE library_id = $libraryId

Integration test requirement:
Staff from Library A must be UNABLE to read Library B data
even if they know Library B's student IDs.
This test must exist and must pass before Phase 3 proceeds.

================================================================
SECTION 14: QR TOKEN SYSTEM
================================================================

File: src/shared/utils/qr-token.util.ts

Static HMAC-SHA256 signed token. Generated once at student creation.

TOKEN GENERATION:
  payload = `${studentId}.${libraryId}.${Date.now()}`
  signature = HMAC-SHA256(payload, config.QR_HMAC_SECRET)
  token = base64url(payload) + '.' + signature

TOKEN VERIFICATION:
  - Split into payload + signature
  - Recompute expected HMAC
  - Compare using crypto.timingSafeEqual()
    ← MANDATORY: Never use === for HMAC comparison (timing attack)
  - If valid: decode and return { studentId, libraryId }
  - If invalid: return null (never throw)

SECURITY:
  - Verify libraryId in token matches libraryId in staff JWT
  - Suspended students get 403 even with valid QR
  - Expired membership students get 403 with clear message
  - Invalid tokens always return same error (no oracle)

================================================================
SECTION 15: ATTENDANCE SERVICE — CRITICAL PATH
================================================================

File: src/modules/attendance/attendance.service.ts

This is the most critical module. Its public API and behavior
must remain stable. Avoid unnecessary refactoring.
Prioritize correctness over abstraction.

QR CHECK-IN (must complete in < 200ms end-to-end):

Step 1: Verify QR token (timingSafeEqual comparison)
  - Invalid → throw AppError 400 INVALID_QR_TOKEN
  - Library mismatch → throw AppError 403 QR_LIBRARY_MISMATCH

Step 2: Fetch student by qr_token + library_id (single index lookup)
  - Not found → 404
  - Suspended → 403 STUDENT_SUSPENDED
  - Inactive → 403 STUDENT_INACTIVE
  - Deleted → 404 (treat same as not found)

Step 3: Application-layer duplicate check
  SELECT id, check_in_at FROM attendance_sessions
  WHERE student_id = $1 AND check_out_at IS NULL
  - Found → 409 STUDENT_ALREADY_CHECKED_IN (include check_in_at)

Step 4: Validate active membership
  SELECT id, type, status, end_date, hours_remaining
  FROM memberships
  WHERE student_id = $1 AND is_current = true
  - Not found → 403 NO_ACTIVE_MEMBERSHIP
  - Monthly expired → 403 MEMBERSHIP_EXPIRED
  - Hourly no hours → 403 NO_HOURS_REMAINING

Step 5: Database transaction (SHORT — DB operations only)
  BEGIN;
    INSERT INTO attendance_sessions (...) VALUES (...)
    ← Catch unique constraint violation → 409 (race condition handled)
    UPDATE library_occupancy
    SET current_count = current_count + 1, last_updated_at = NOW()
    WHERE library_id = $libraryId
  COMMIT;

TRANSACTION RULES — STRICTLY ENFORCED:
  ← Never log inside a transaction
  ← Never broadcast WebSocket inside a transaction
  ← Never call S3 inside a transaction
  ← Never call external HTTP inside a transaction
  ← Transactions contain ONLY database operations
  ← Keep transactions as short as possible

Step 6: Post-transaction (outside transaction, sequential):
  - Write audit log (fire-and-forget: setImmediate)
  - Audit log failure must NOT fail the check-in response
  - Broadcast WebSocket notification (fire-and-forget)

Step 7: Map to CheckInResponseDTO and return

QR CHECK-OUT:

Step 1-2: Same QR verification and student fetch

Step 3: Find open session
  SELECT id, check_in_at, membership_id
  FROM attendance_sessions
  WHERE student_id = $1 AND check_out_at IS NULL
  - Not found → 409 STUDENT_NOT_CHECKED_IN

Step 4: Calculate duration
  duration_minutes = Math.round((Date.now() - check_in_at) / 60000)

Step 5: Transaction (DB operations only):
  BEGIN;
    UPDATE attendance_sessions
    SET check_out_at = NOW(),
        duration_minutes = $duration,
        check_out_method = 'qr',
        updated_at = NOW()
    WHERE id = $sessionId AND check_out_at IS NULL
    ← Optimistic lock: WHERE check_out_at IS NULL
    ← 0 rows affected = race condition → rollback → 409

    IF hourly membership:
      UPDATE memberships
      SET hours_used = hours_used + ($duration / 60.0),
          hours_remaining = GREATEST(0, hours_remaining - ($duration / 60.0))
      WHERE id = $membershipId

    UPDATE library_occupancy
    SET current_count = GREATEST(0, current_count - 1),
        last_updated_at = NOW()
    WHERE library_id = $libraryId
  COMMIT;

Step 6: Post-transaction:
  - Write audit log (fire-and-forget)
  - Broadcast WebSocket (fire-and-forget)

MANUAL CORRECTION:
  - Owner role only
  - correction_reason required (minimum 10 characters)
  - Recalculate duration_minutes
  - If hourly: recalculate hours_used and hours_remaining
  - Audit log is AWAITED (not fire-and-forget) for manual corrections
  - Write old_value and new_value to audit_logs

================================================================
SECTION 16: STUDENT SEARCH
================================================================

Search priority order (implement in this exact order):

1. Phone Number (highest priority)
   - Exact match first: WHERE phone = $search
   - Prefix match: WHERE phone LIKE $search%
   - Optimized with: INDEX on (library_id, phone)

2. Exact Name Match
   - WHERE LOWER(name) = LOWER($search)

3. Fuzzy Name (pg_trgm similarity)
   - WHERE name % $search
   - Uses GIN trigram index
   - Only executed if no results from steps 1 and 2

Phone searches must always be tried first.
If the search term looks like a phone number (digits only
or starts with +), skip name search entirely.

Support filters:
- search (name OR phone, priority as above)
- status (active, suspended, expired, inactive)
- membership_type (monthly, hourly)
- seat_id
- include_deleted (boolean, owner only)
- page + limit (default 20, max 100)

Fetch membership + seat in a single JOIN query.
Never run N+1 queries.
Never return password_hash or deleted_at in any response.

================================================================
SECTION 17: LIVE OCCUPANCY + WEBSOCKET
================================================================

Two audiences. Two strategies.

AUDIENCE 1 — Student Mobile App (REST):
GET /api/v1/seats/live
- Poll every 30-60 seconds
- Returns anonymized data (no student names, no student IDs)
- Response:
  {
    currentCount: number,
    capacity: number,
    availableFlexible: number,
    seats: Array<{ seatNumber: string, status: 'occupied'|'available'|'reserved' }>
  }

AUDIENCE 2 — Manager Dashboard (WebSocket):
WS /ws/occupancy?token=<access_token>

Connection:
1. Verify JWT from query param (WebSocket cannot set headers)
2. Invalid JWT → close with code 4401
3. On connect: send immediate SNAPSHOT of current state
4. Join internal room by library_id

PostgreSQL LISTEN/NOTIFY:
File: src/shared/plugins/realtime.plugin.ts

- ONE dedicated pg.Client (NOT from pool) for LISTEN
  ← CRITICAL: Pool connections cannot LISTEN
  ← This connection must stay open indefinitely
- LISTEN 'attendance_update'
- On notification:
  1. Parse payload (library_id, event_type, student_id)
  2. Fetch fresh count from library_occupancy table
  3. Fetch student name + seat if INSERT event
  4. Broadcast to all WebSocket clients for that library_id

Manager WebSocket events:
{
  type: 'OCCUPANCY_UPDATE',
  data: {
    currentCount: number,
    capacity: number,
    available: number,
    event: 'CHECK_IN' | 'CHECK_OUT',
    student: { name: string, seat: string | null, membershipType: string },
    timestamp: string
  }
}

Student app WebSocket events (future):
{
  type: 'SEAT_MAP_UPDATE',
  data: {
    currentCount: number,
    capacity: number,
    seats: Array<{ seatNumber: string, status: string }>
    ← No student names or IDs (privacy)
  }
}

OCCUPANCY RECONCILIATION:
Add to the cron job (every 5 minutes):
  UPDATE library_occupancy lo
  SET current_count = (
    SELECT COUNT(*) FROM attendance_sessions a
    WHERE a.library_id = lo.library_id
      AND a.check_out_at IS NULL
  ),
  last_updated_at = NOW();

================================================================
SECTION 18: DASHBOARD SERVICE
================================================================

File: src/modules/dashboard/dashboard.service.ts

RESILIENCE RULE:
Dashboard must tolerate partial failures.
If one analytics query fails:
  - Log the failure with requestId
  - Return remaining data with null for the failed metric
  - Include the failed metric name in partialFailures[]
  - Only return HTTP 500 if current_occupancy query fails
    (that is the only truly critical dashboard query)

Execute ALL queries in PARALLEL:
const results = await Promise.allSettled([
  getCurrentOccupancy(libraryId),        ← CRITICAL (fail = 500)
  getTodayCheckins(libraryId),
  getMonthlyRevenue(libraryId),
  getPendingFees(libraryId),
  getActiveStudents(libraryId),
  getRevenue30Days(libraryId),
  getAttendance30Days(libraryId),
  getRecentActivity(libraryId)
])

Use Promise.allSettled (not Promise.all) so one failure
does not cancel all other queries.

Map results to DashboardResponseDTO.
Log total query duration at 'debug' level.
Include requestId in all log entries.

================================================================
SECTION 19: CRON JOBS
================================================================

ALL scheduled jobs must be:
- Idempotent — running twice produces same result as running once
- Logged — start, end, count of affected rows, any errors
- Retry-safe — a failed partial run does not corrupt data
- Timeout-protected — set a maximum execution time
- Non-overlapping — if previous run is still in progress, skip

File: src/jobs/forgot-checkout.job.ts
Schedule: Every hour at :00

Query open sessions older than library's closing time + buffer:
  WHERE check_out_at IS NULL
    AND check_in_at < NOW() - INTERVAL '1 day'

Per session:
  check_out_at = date portion of check_in_at + library closing_time
  check_out_method = 'auto'
  duration_minutes = calculated normally
  If hourly: deduct hours
  Write audit_log (idempotent: check audit_log before writing)

File: src/jobs/membership-expiry.job.ts
Schedule: Daily at 00:05

Query:
  SELECT * FROM memberships
  WHERE type = 'monthly'
    AND status = 'active'
    AND end_date < CURRENT_DATE
    AND is_current = true

Per membership (process in batches of 50):
  UPDATE memberships SET status = 'expired', is_current = false
  UPDATE students SET status = 'expired'
    WHERE id = student_id AND status = 'active'
  Write audit_log

Idempotency: Use is_current = true in WHERE clause.
Already processed rows have is_current = false, so they
are naturally skipped on re-run.

================================================================
SECTION 20: API ROUTES
================================================================

API DESIGN RULES:
- Every endpoint returns the same response envelope shape
- Field names are camelCase in all responses (not snake_case)
- No internal database field names exposed to clients
- No unnecessary fields in responses
- Consistent error code strings across all endpoints
- Response shapes never change without an API version bump

Standard response envelope:
{
  success: boolean,
  data: unknown,
  meta?: { page: number, limit: number, total: number },
  message?: string,
  requestId: string    ← always included, from X-Request-ID
}

Error response:
{
  success: false,
  error: {
    code: string,      ← machine-readable, e.g. STUDENT_NOT_FOUND
    message: string,   ← human-readable
    details?: unknown  ← validation errors, field-level info
  },
  requestId: string
}

AUTH:
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
GET    /auth/me

STUDENTS: [all roles]
GET    /students              ?search, status, page, limit, include_deleted
POST   /students              [owner, staff]
GET    /students/:id
PUT    /students/:id          [owner, staff]
PATCH  /students/:id/status   [owner, staff]
DELETE /students/:id          [owner] ← soft delete only, sets deleted_at
POST   /students/:id/qr-regenerate  [owner]
GET    /students/:id/history  ?page, limit
GET    /students/:id/payments ?page, limit
GET    /students/:id/id-card  ← JSON data for ID card, not PDF

ATTENDANCE:
POST   /attendance/qr-checkin
POST   /attendance/qr-checkout
POST   /attendance/manual-checkin   [owner, staff]
POST   /attendance/manual-checkout  [owner, staff]
GET    /attendance            ?date, student_id, status, page, limit
GET    /attendance/live       ← currently checked-in students
PATCH  /attendance/:id/correct [owner]

MEMBERSHIPS:
GET    /students/:id/memberships
POST   /students/:id/memberships    [owner, staff]
PATCH  /memberships/:id/suspend     [owner]
PATCH  /memberships/:id/reactivate  [owner]

MEMBERSHIP PLANS:
GET    /membership-plans
POST   /membership-plans            [owner]
PUT    /membership-plans/:id        [owner]
PATCH  /membership-plans/:id/toggle [owner]

SEATS:
GET    /seats
GET    /seats/live                  ← anonymized, for student app
POST   /seats                       [owner]
PUT    /seats/:id                   [owner]
PATCH  /seats/:id/assign            [owner, staff]
PATCH  /seats/:id/status            [owner]

PAYMENTS:
POST   /payments                    [owner, staff]
GET    /payments                    ?from, to, student_id, status, page, limit
PUT    /payments/:id                [owner]
PATCH  /payments/:id/status         [owner]

EXPENSES:
POST   /expenses                    [owner]
GET    /expenses                    ?from, to, category, page, limit
PUT    /expenses/:id                [owner]
DELETE /expenses/:id                [owner] ← soft delete

DASHBOARD:
GET    /dashboard                   [owner, staff]

SETTINGS:
GET    /settings                    [owner]
PUT    /settings                    [owner]
GET    /settings/custom-fields      [owner]
PUT    /settings/custom-fields      [owner]

USERS:
GET    /users                       [owner]
POST   /users                       [owner]
PUT    /users/:id                   [owner]
PATCH  /users/:id/status            [owner]
DELETE /users/:id                   [owner] ← soft delete only

STORAGE:
POST   /storage/presign             [authenticated]

CSV:
POST   /import/students             [owner]
GET    /export/students             [owner]
GET    /export/attendance           [owner] ?from&to required
GET    /export/payments             [owner] ?from&to required

WEBSOCKET:
WS     /ws/occupancy?token=<access_token>

HEALTH:
GET    /health   ← no auth, { status:'ok', db:'ok', version:'v1' }

API DOCS:
GET    /api/docs  ← Swagger UI, development only
                  ← Return 404 in production

================================================================
SECTION 21: OPENAPI DOCUMENTATION
================================================================

File: src/shared/plugins/swagger.plugin.ts

Use @fastify/swagger + @fastify/swagger-ui.
Generate documentation automatically from Zod schemas.
Expose only in development (NODE_ENV === 'development').
Return 404 on all /api/docs routes in production.

Every route must include:
- summary (one line)
- description (what it does, who can call it)
- tags (module name: 'students', 'attendance', etc.)
- request body schema (from Zod)
- response schemas (from DTOs)
- error response examples

Zod-to-OpenAPI conversion: use zod-to-json-schema or
@asteasolutions/zod-to-openapi.

This is for frontend developer integration and internal testing.
Must be accurate — incorrect docs are worse than no docs.

================================================================
SECTION 22: SECURITY
================================================================

1. INPUT VALIDATION
   - Every request body validated with Zod (.strict() to strip unknowns)
   - All query params validated with Zod
   - All :id params validated as UUID format → 400 if invalid
   - Reject invalid UUIDs before any DB query (prevents 500 from pg)
   - Sanitize strings: trim(), max length enforced

2. SQL INJECTION
   - Only parameterized queries via Drizzle ORM
   - Never concatenate user input into SQL
   - Never use raw() with user-provided values

3. HMAC COMPARISON
   - ALWAYS use crypto.timingSafeEqual()
   - NEVER use === for comparing secrets or tokens

4. PASSWORD
   - bcrypt 12 rounds
   - Never log passwords
   - Never return password_hash in any response ever
   - Use Drizzle .omit({ passwordHash: true }) on all selects

5. AUTH TOKENS
   - RS256 JWT (not HS256)
   - Access token: Authorization Bearer header only
   - Refresh token: httpOnly + Secure + SameSite=Strict cookie
   - Refresh token rotation on every use
   - Refresh tokens hashed (SHA-256) before storage

6. RATE LIMITING
   - POST /auth/login: 5 requests / 15 min / IP
   - POST /attendance/qr-*: 30 requests / min / user
   - GET /export/*: 10 requests / hour / user
   - Default: 100 requests / min / IP
   - Return 429 with Retry-After header

7. CORS
   - Whitelist only CORS_ORIGINS from config
   - Never wildcard (*) in production

8. HEADERS (@fastify/helmet)
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - Strict-Transport-Security
   - Content-Security-Policy
   - X-XSS-Protection

9. FILE UPLOADS
   - Validate file_type before generating presign URL
   - Allowed: image/jpeg, image/png, image/webp, application/pdf
   - S3 key includes library_id (tenant namespace)
   - Never accept file bytes on the API server

10. ERROR RESPONSES
    - Never expose stack traces in production
    - Never expose raw Postgres error messages
    - Log full error internally, return generic message to client
    - Always include requestId in error responses

11. SUBSCRIPTION CHECK
    - Middleware checks library.subscription_status on every request
    - cancelled → 402 Payment Required
    - past_due → allow reads, block writes

12. BODY SIZE LIMITS
    - Default: 1MB
    - CSV import only: 5MB (configured per-route only)

================================================================
SECTION 23: LOGGING
================================================================

Use Pino (structured JSON in production, pino-pretty in dev).

EVERY log entry must include:
{
  level: string,
  time: string (ISO),
  requestId: string,     ← from X-Request-ID
  method?: string,
  url?: string,
  statusCode?: number,
  durationMs?: number,
  libraryId?: string,    ← ID only, never library name
  userId?: string        ← ID only
}

NEVER LOG ANY OF THE FOLLOWING:
- Passwords (plaintext or hash)
- JWT access tokens
- Refresh tokens (plaintext or hash)
- QR token payloads
- Student names
- Student phone numbers
- Student emails
- Any PII — log IDs only
- AWS credentials
- HMAC secrets

Log IDs, not names. Log event types, not content.

LOG LEVELS:
- error: unhandled exceptions, auth failures, DB errors
- warn: rate limit hits, validation failures, suspicious requests
- info: server start/stop, every request (method, url, status, duration)
- debug: query durations, cache behavior (development only)

PERFORMANCE LOGGING:
Log total query duration for:
- Dashboard (all parallel queries)
- QR scan (full flow duration)
- Student search (query + total)
Do NOT run EXPLAIN ANALYZE automatically in any request.
Use EXPLAIN ANALYZE manually during performance optimization sessions.

================================================================
SECTION 24: PERFORMANCE
================================================================

CONNECTION POOLING:
  max: 20 connections
  idleTimeoutMillis: 30000
  connectionTimeoutMillis: 2000
  statement_timeout: 5000 (kills stuck queries)

QUERY RULES:
  - QR scan full flow: < 200ms
  - Student search: < 200ms
  - Dashboard: < 1000ms
  - No N+1 queries (always JOIN or batch)
  - All list queries paginated

PARALLEL QUERIES:
  - Dashboard: Promise.allSettled() for all queries
  - Never await queries sequentially if they're independent

STREAMING:
  - CSV exports: stream responses, never load all rows into memory
  - Use cursor-based pagination in batches of 500 rows for exports

================================================================
SECTION 25: ERROR HANDLING
================================================================

src/shared/errors/error-codes.ts — define ALL error codes:

INVALID_CREDENTIALS, TOKEN_EXPIRED, TOKEN_INVALID,
REFRESH_TOKEN_INVALID, REFRESH_TOKEN_EXPIRED,
STUDENT_NOT_FOUND, STUDENT_SUSPENDED, STUDENT_INACTIVE,
STUDENT_ALREADY_CHECKED_IN, STUDENT_NOT_CHECKED_IN,
MEMBERSHIP_EXPIRED, NO_ACTIVE_MEMBERSHIP, NO_HOURS_REMAINING,
INVALID_QR_TOKEN, QR_LIBRARY_MISMATCH,
SEAT_OCCUPIED, SEAT_NOT_FOUND, SEAT_NUMBER_EXISTS,
DUPLICATE_PHONE, DUPLICATE_EMAIL,
SUBSCRIPTION_CANCELLED, SUBSCRIPTION_PAST_DUE,
INSUFFICIENT_PERMISSIONS, RESOURCE_NOT_FOUND,
VALIDATION_ERROR, INVALID_UUID,
INTERNAL_SERVER_ERROR, DATABASE_ERROR

Global error handler catches:
- AppError → structured error response
- ZodError → 400 with field-level details
- Postgres unique constraint violation → mapped AppError
- Postgres foreign key violation → mapped AppError
- All other errors → 500 with generic message, full error in logs

================================================================
SECTION 26: TESTING
================================================================

Minimum required tests — all must pass before deployment:

UNIT TESTS:
- QR token generation (produces valid token)
- QR token verification (valid token → correct studentId)
- QR token verification (tampered token → null)
- QR token verification (wrong library → null)
- HMAC comparison uses timingSafeEqual (verify no === used)
- DTO mappers (entity → correct DTO shape)
- Pagination util
- Date util (timezone handling)

INTEGRATION TESTS:
Authentication:
- Login success
- Login wrong password → 401
- Login non-existent user → 401 (same error, no oracle)
- Refresh token success
- Refresh token rotation (old token invalidated)
- Logout (token revoked)
- Expired access token → 401

Attendance (most critical):
- QR check-in happy path
- QR check-in suspended student → 403
- QR check-in expired membership → 403
- QR check-in no membership → 403
- QR check-in already checked in → 409
- QR check-out happy path
- QR check-out not checked in → 409
- Manual check-in [staff] success
- Manual check-in [receptionist] → check role requirements
- Manual correction with valid reason
- Manual correction without reason → 400

Concurrency (critical — these must actually test concurrency):
- 100 concurrent QR check-ins for same student
  → exactly 1 succeeds, 99 return 409
  ← Use Promise.all with 100 simultaneous requests
- Concurrent check-out race condition
  → exactly 1 succeeds
- Occupancy counter stays consistent after 50 concurrent operations

Membership:
- Membership expiry job → sets correct statuses
- Hourly membership hours deducted on checkout
- hours_remaining never goes below 0

Multi-tenant isolation:
- Staff from Library A cannot GET Library B's students
- Staff from Library A cannot check in Library B's student by ID
- QR token from Library A rejected at Library B's scan endpoint
- These tests MUST exist and MUST pass

Occupancy:
- Reconciliation job corrects a drifted counter
- Count after N check-ins equals N

CSV:
- Import 100 valid students → all imported
- Import with 3 invalid rows → report errors, import valid rows
- Export students → valid CSV with correct columns
- Export respects date range filters

================================================================
SECTION 27: CI/CD — GITHUB ACTIONS
================================================================

File: .github/workflows/ci.yml

Trigger: on pull_request and push to main

Jobs (run in this order):
1. install          → npm ci
2. type-check       → tsc --noEmit
3. lint             → eslint src --ext .ts
4. test             → vitest run
5. build            → tsc (ensure build succeeds)
6. migration-check  → drizzle-kit check (validate migration files)

All jobs must pass before merge is allowed.
No manual overrides.
Tests run against a real test PostgreSQL instance (use
GitHub Actions service containers for postgres:15).

Environment for tests: .env.test values passed as GitHub
Actions environment variables (stored as GitHub Secrets).

================================================================
SECTION 28: CODE QUALITY RULES
================================================================

READABILITY OVER CLEVERNESS:
- Prefer explicit code over implicit magic
- Avoid unnecessary abstractions
- Avoid generic helper functions unless used 3+ times
- Keep functions focused (one job per function)
- Prefer composition over inheritance
- No singleton patterns unless genuinely required
- Avoid deep nesting (max 3 levels)
- Use early returns to reduce nesting

TYPESCRIPT:
- strict mode, noUncheckedIndexedAccess: true
- Zero 'any' types — use 'unknown' with type narrowing
- Use z.infer<typeof Schema> — never duplicate Zod schemas as interfaces
- All function parameters and return types explicitly typed
- No type assertions (as Type) without a comment explaining why

NAMING:
- camelCase for variables, functions, properties
- PascalCase for types, interfaces, classes, DTOs
- SCREAMING_SNAKE_CASE for error codes and constants
- Prefix interfaces with no 'I' (use StudentDTO, not IStudentDTO)

FUNCTIONS:
- Max ~40 lines per function (guideline, not hard rule)
- Functions do one thing
- No functions with boolean flags that change behavior
  (split into two functions instead)

IMPORTS:
- Use path aliases: @/modules/..., @/shared/..., @/db/...
- No relative imports going more than 2 levels up: ../../

================================================================
SECTION 29: WHAT NOT TO BUILD
================================================================

Do NOT implement:
- Razorpay payment gateway (columns exist, no logic)
- GST or invoice PDF generation
- Email / SMS / WhatsApp notifications
- Student mobile app login (reserved, not implemented)
- Multi-branch support
- AI or analytics features
- Super admin panel
- Online seat booking
- EXPLAIN ANALYZE automatically in request logs

================================================================
SECTION 30: PACKAGES
================================================================

dependencies:
  fastify
  @fastify/cors
  @fastify/helmet
  @fastify/rate-limit
  @fastify/websocket
  @fastify/multipart
  @fastify/cookie
  @fastify/swagger
  @fastify/swagger-ui
  drizzle-orm
  pg
  @types/pg
  zod
  zod-to-json-schema
  jsonwebtoken
  @types/jsonwebtoken
  bcrypt
  @types/bcrypt
  @aws-sdk/client-s3
  @aws-sdk/s3-request-presigner
  node-cron
  @types/node-cron
  dotenv
  pino

devDependencies:
  drizzle-kit
  typescript
  @types/node
  tsx
  vitest
  supertest
  @types/supertest
  pino-pretty
  eslint
  @typescript-eslint/parser
  @typescript-eslint/eslint-plugin

scripts:
  "dev":           "tsx watch src/server.ts"
  "build":         "tsc"
  "start":         "node dist/server.js"
  "db:generate":   "drizzle-kit generate"
  "db:migrate":    "drizzle-kit migrate"
  "db:studio":     "drizzle-kit studio"
  "test":          "vitest run"
  "test:watch":    "vitest"
  "test:coverage": "vitest run --coverage"
  "lint":          "eslint src --ext .ts"
  "type-check":    "tsc --noEmit"

================================================================
SECTION 31: IMPLEMENTATION ORDER
================================================================

PHASE 1 — Foundation
1.  Project structure, tsconfig, package.json, .eslintrc
2.  env.ts (Zod env validation — fail fast on missing vars)
3.  database.ts (Drizzle + pg pool, PgBouncer-compatible)
4.  All Drizzle schema files (db/schema/)
5.  First migration (pg_trgm extension, uuid-ossp, all tables,
    all indexes, all constraints, Postgres trigger)
6.  Fastify app.ts with all plugins registered
7.  request-id middleware
8.  Error handler (AppError, Zod errors, Postgres errors)
9.  Response util (standard envelope)
10. Health check endpoint
STOP. Compile. Fix all TypeScript errors. Verify migration runs.

PHASE 2 — Authentication
11. Auth Zod schemas
12. Auth repository (findByEmail, createRefreshToken, revokeToken)
13. Auth service (login, refresh, logout)
14. Auth routes
15. Authenticate middleware (JWT verify)
16. Authorize middleware (role check)
17. Tenant middleware
18. Auth tests (all scenarios listed in Section 26)
STOP. Compile. Run auth tests. All must pass.

PHASE 3 — Core Student Module
19. Student schemas (Zod)
20. Student repository (CRUD, soft delete, search with pg_trgm)
21. Student DTOs and mappers
22. Student service
23. Student routes
24. Multi-tenant isolation tests (Library A vs Library B)
25. Student search tests
STOP. Compile. Run tests. Multi-tenant isolation tests must pass.

PHASE 4 — Seats, Plans, Memberships
26. Seat schema, repository, DTO, service, routes
27. Membership plan schema, repository, DTO, service, routes
28. Membership schema, repository, DTO, service, routes
STOP. Compile. Run tests.

PHASE 5 — Attendance (Most Critical Phase)
29. QR token util (generateQrToken, verifyQrToken)
30. QR token unit tests (tamper test, library mismatch test)
31. Attendance repository
32. Attendance DTO and mappers
33. Attendance service (check-in, check-out, manual, correction)
34. Attendance routes
35. Attendance integration tests (ALL scenarios in Section 26)
36. Concurrency tests (100 simultaneous check-ins)
STOP. Compile. ALL attendance tests must pass including concurrency.
Do not proceed if any attendance test fails.

PHASE 6 — Financial
37. Payment schema, repository, DTO, service, routes
38. Expense schema, repository, DTO, service, routes
39. Dashboard service (Promise.allSettled, resilient)
40. Dashboard DTO and routes
STOP. Compile. Test dashboard partial failure handling.

PHASE 7 — Real-time
41. Postgres NOTIFY trigger (already in migration from Phase 1)
42. realtime.plugin.ts (dedicated pg.Client LISTEN)
43. occupancy.websocket.ts (WebSocket handler)
44. Occupancy service
45. Seats live endpoint
46. Occupancy reconciliation in cron job
STOP. Compile. Test WebSocket connection and event delivery.

PHASE 8 — Utilities and Operations
47. S3 presigned URL service + routes
48. CSV export service (streaming)
49. CSV import service (validation, batch insert)
50. Settings service + routes
51. Users/staff management service + routes
52. forgot-checkout cron job
53. membership-expiry cron job
54. Cron job idempotency tests
STOP. Compile. Test CSV import with invalid rows.

PHASE 9 — Documentation and CI/CD
55. Swagger plugin (dev only, auto-generated from Zod schemas)
56. Review all Swagger docs for accuracy
57. GitHub Actions ci.yml
58. ESLint configuration and fix all lint errors
59. Final full test run (all tests across all phases)
60. Final TypeScript compile with zero errors
STOP. All tests pass. Zero TypeScript errors. Zero lint errors.
The backend is ready.

================================================================
SECTION 32: FINAL RULES
================================================================

1.  Compile after every phase. Never accumulate TypeScript errors.
2.  Never use 'any'. Use 'unknown' with type narrowing.
3.  Never access process.env outside env.ts.
4.  Never return raw DB entities from routes — always use DTOs.
5.  Never perform logging, WebSocket calls, or external requests
    inside database transactions.
6.  Never permanently delete students — always soft delete.
7.  Always use crypto.timingSafeEqual for HMAC comparisons.
8.  Always include requestId in logs and error responses.
9.  Always query with WHERE deleted_at IS NULL for students.
10. Treat library_occupancy as a cache — attendance_sessions is truth.
11. Dashboard must use Promise.allSettled — never fail completely.
12. Cron jobs must be idempotent — safe to run twice.
13. The attendance service is the most critical module.
    If attendance is broken, the product is broken.
    Test it exhaustively including race conditions.
14. Repositories never start transactions.
    Services coordinate transactions.
15. Zod schemas are the single source of truth for all types.
    Never duplicate them as manual TypeScript interfaces.

Begin with Phase 1.
Ask no clarifying questions.
Start writing production-quality code now.

=============================================================
END OF PROMPT
=============================================================