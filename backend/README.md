# Finance Tracker Backend

This is my backend for the internship assessment. The goal was to build a clean and practical finance API with proper auth, role-based access, and dashboard-level reporting.

I focused on keeping the code readable and modular so it is easy to explain.

## What this backend does

- User registration and login with JWT
- Role-based access control: viewer, analyst, admin
- Transaction create/read/update/delete flow
- Soft delete for transactions
- Dashboard APIs for summary, category-wise totals, monthly trends, and recent activity
- Admin panel APIs for user role/status management

## Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT for auth
- bcrypt for password hashing
- express-validator for request validation
- express-rate-limit for auth endpoint protection

## Project structure

text
backend/
  server.js
  src/
    app.js
    config/
      db.js
    controllers/
    services/
    model/
    routes/
    middleware/
    validator/
    seed/
      adminSeeder.js


How requests move in this project:

`route -> auth middleware -> role middleware -> validator -> controller -> service -> model`

This keeps controllers thin and puts most logic in services.

## Data models

### User

Main fields:

- name
- email (unique)
- password (hashed)
- role (`viewer | analyst | admin`)
- isActive

Notes:

- Password is hashed in a pre-save hook.
- API responses return a safe object (password excluded).

### Transaction

Main fields:

- amount
- type (`income | expense`)
- category
- date
- notes
- createdBy (User reference)
- isDeleted, deletedAt (soft delete)

Notes:

- Query middleware excludes soft-deleted records for find operations.
- There is an instance method `softDelete()` used by delete API.

## Auth and RBAC

### Authentication

Protected routes use `protect` middleware.

Token can come from:

- `Authorization: Bearer <token>`
- `token` cookie

Middleware behavior:

- verify token
- fetch user
- reject inactive users
- attach `req.user`

### Authorization

`authorize(...roles)` middleware controls access per route.

Role usage in this project:

- admin: full access
- analyst: reporting + transaction read access
- viewer: limited read access

## API modules

Base URL (local): `http://localhost:3000`

### 1. Auth routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### 2. User routes (admin only)

- `GET /api/users`
- `GET /api/users/:id`
- `PATCH /api/users/:id/role`
- `PATCH /api/users/:id/status`
- `DELETE /api/users/:id`

### 3. Transaction routes

- `GET /api/transactions/:id` (viewer/analyst/admin)
- `GET /api/transactions` (analyst/admin)
- `GET /api/transactions/:id` (analyst/admin)
- `POST /api/transactions` (admin)
- `PUT /api/transactions/:id` (admin)
- `DELETE /api/transactions/:id` (admin, soft delete)

Supported list filters:

- `type`
- `category`
- `startDate`
- `endDate`
- `page`
- `limit`

### 4. Dashboard routes

- `GET /api/dashboard/summary`
- `GET /api/dashboard/category-wise`
- `GET /api/dashboard/monthly-trends`
- `GET /api/dashboard/recent-activity`

Access:

- summary + recent activity: viewer/analyst/admin
- category-wise + monthly trends: analyst/admin

## Validation rules implemented

- Unknown fields are blocked in key payloads.
- Register password has minimum strength checks.
- Transaction category must match transaction type.
- Date range and pagination query checks are added.
- Admin self-protection checks:
  - cannot change own role
  - cannot deactivate own account
  - cannot delete own account

## Environment variables

Create `.env` in root:

env
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
JWT_SECRET=<your_secret>
JWT_EXPIRES_IN=7d
NODE_ENV=development


## Run locally

bash
npm install
npm run dev


Seed default users:

bash
npm run seed:admin


## Seeded credentials (for quick testing)

- Admin: admin@finance.com / Admin@1234
- Analyst: analyst@finance.com / Analyst@1234
- Viewer: viewer@finance.com / Viewer@1234

## Sample payloads

Register:

json
{
  "name": "Rahul",
  "email": "rahul@example.com",
  "password": "Password1"
}

Create transaction:

json
{
  "amount": 12000,
  "type": "income",
  "category": "salary",
  "date": "2026-04-01",
  "notes": "Monthly salary"
}

