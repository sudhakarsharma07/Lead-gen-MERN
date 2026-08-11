# Prospect Ledger — MERN Lead-Gen CRM

A MERN app for running the UK/EU property-management lead-generation brief:
build a 300-company prospect database, track outreach through the pipeline
(Not contacted → Contacted → Replied → Booked → Declined), watch progress
against the weekly targets, and maintain a permanent suppression list.

## Stack
- **MongoDB** + **Mongoose** — data
- **Express** — REST API (`/backend`)
- **React** (Vite) — UI (`/frontend`), no UI framework, hand-written CSS design system

## Structure
```
leadgen-crm/
  backend/
    models/        Prospect.js, Suppression.js
    routes/         prospects.js, suppression.js, stats.js
    server.js
    seed.js         optional sample data
  frontend/
    src/
      components/   StatsPanel, ProspectTable, ProspectDrawer, PipelineStrip, SuppressionPanel
      App.jsx, api.js, index.css
```

## Run it

### 1. Backend
```bash
cd backend
cp .env.example .env      # edit MONGO_URI if not using local Mongo
npm install
npm run seed               # optional: adds 3 sample prospects
npm run dev                 # or: npm start
```
API runs on `http://localhost:5000`.

### 2. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
App runs on `http://localhost:5173`.

You need a MongoDB instance reachable at `MONGO_URI` (local `mongod`, or a free
Atlas cluster — swap the connection string in `backend/.env`).

## What's implemented
- **Prospect ledger**: every column from the brief's data table (company,
  units, employees, contact, job title, LinkedIn, verified email, phone,
  current software, signal, source, status, dates, notes), plus
  `messageVersion` and `weekAdded` so you can report by message and by week
  like the brief asks.
- **Pipeline strip**: a per-row visual of where each prospect sits in the
  outreach sequence.
- **Stats dashboard**: actual vs. target for prospects added / contacts made
  / interviews booked, both totals and week-by-week (Section 7 of the brief).
- **Outreach sequence tracker** (Section 6): each prospect has a Day 1 → Day
  3 → Day 6 → Day 12 sequence with a start date. The drawer shows what's due
  next and flags it overdue; the ledger table badges overdue rows.
- **Follow-up cap enforced server-side**: Day 6 and Day 12 count as the
  brief's "maximum 2 follow-ups" — the API refuses to advance the sequence
  past that, so you can't quietly over-contact someone.
- **Germany cold-email block**: saving a prospect with country "Germany" and
  channel "Email" is rejected by the API (§7 UWG), both on save and when
  advancing the sequence — matches "Do not cold-email German prospects."
- **Message templates** (Section 6): a Templates tab to draft the 3 message
  versions per channel/step, with a live word counter enforcing the
  under-90-words rule and a flag if the text mentions a product, demo, or
  price.
- **Outreach performance report** (Section 8.3): a Reports tab showing sent
  / replied / booked and reply/booking rate, broken down by message version
  and by job title — using the aggregation the API already computed.
- **Suppression list**: "Mark declined + suppress" on any record adds their
  email to a permanent opt-out list and blocks re-adding that email later —
  enforces "honour opt-outs permanently."
- **Compliance fields**: legitimate interest assessment note per prospect,
  plus a consent nudge for sole traders / unincorporated partnerships (UK
  GDPR/PECR).

## What's not included (by design, not oversight)
- No email-sending or LinkedIn automation — the brief's own compliance
  section says outreach should stay manual/judgement-based. This app tracks
  and gates the work; it doesn't send the messages.
- No auth/login layer — add one before deploying this anywhere outside a
  local machine, since it holds contact PII.
- Couldn't run a live MongoDB instance in the environment this was built in
  (no local `mongod`, network restricted to package registries), so the API
  is verified by syntax-check + code review, not a live end-to-end run.
  Test it against your own Mongo before relying on it.
