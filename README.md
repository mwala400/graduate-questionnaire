# ATC IT Curriculum Review Questionnaires — Web Portal

A Next.js application that puts all four of Arusha Technical College's curriculum-review
questionnaires online, as **one system with four separate shareable links**:

| Type | Shareable link | Based on |
|---|---|---|
| Graduates | `/fill/graduate` | `IT_Graduate_Questionnaire.docx` |
| Society | `/fill/society` | `IT_Society_Questionnaire.docx` |
| Employers | `/fill/employer` | `IT_Employer_Questionnaire.docx` |
| Professionals | `/fill/professional` | `IT_Professional_Questionnaire.docx` |

Share whichever link fits each audience — graduates get the graduate link, employers get the
employer link, and so on. Everyone fills only their own form.

- **Public respondents** fill their questionnaire and, right after submitting, can download a
  copy of their own answers (.docx or .pdf) to keep for their records.
- **Everyone** can view a **Global Analysis** dashboard, with a tab to switch between the four
  questionnaire types.
- **Admins** unlock one dashboard (also with a type switcher) with a secret access code, and can
  download, per type or all four at once:
  - Any single response as a **Word document (.docx)** that recreates the original questionnaire
    layout for that type — including both official logos.
  - The same response as a matching **PDF**.
  - **All** responses of one type zipped as `.docx`, or as `.pdf`.
  - **All** responses of one type as one **Excel workbook**.
  - A **"full folder" ZIP** (docx + pdf + Excel) for one type.
  - **One ZIP with all four types**, each in its own subfolder.

The admin area is not linked from anywhere in the interface. It only exists at a random path
you (or the app, automatically) choose, and any other URL 404s exactly like a page that was
never built.

**Runs anywhere, including Vercel:** document generation uses pure JavaScript libraries
(`docx` and `pdf-lib`) — no LibreOffice, no native binaries, no filesystem writes at runtime —
so it works unmodified on serverless hosts. The database is Postgres (any free-tier hosted
Postgres works), because Vercel's filesystem does not persist a local SQLite file between
requests.

---

## 1. Prerequisites

| Requirement | Why | Check with |
|---|---|---|
| **Node.js 18.18+** (20 LTS recommended) | Runs Next.js | `node -v` |
| **npm** | Installs dependencies | `npm -v` |
| **A Postgres database** | Stores responses | see §3 |

That's it — no LibreOffice, no other system packages needed.

---

## 2. Install

```bash
cd atc-it-curriculum-questionnaires
npm install
cp .env.example .env
```

---

## 3. Get a Postgres database (free options)

Any of these work — pick one and copy its connection string:

- **Neon** (neon.tech) — free tier, integrates directly with Vercel's dashboard too.
- **Supabase** (supabase.com) — free tier.
- **Vercel Postgres** — from your Vercel project's **Storage** tab, if you're already on Vercel.

Paste the connection string into `.env`:

```ini
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
```

Then create the table:

```bash
npm run db:push
```

---

## 4. Admin access — zero-config by default

You do **not** have to invent an admin code yourself. Leave `ADMIN_ACCESS_CODE` and
`ADMIN_ROUTE_SECRET` blank in `.env` and just run the app (§5) — on startup it will:

1. Generate both values in the required format (a letter followed by digits, 8 characters
   total — e.g. `K3948271`).
2. **Print them in the terminal every time the app starts**, so you always know your current
   admin login path and code.
3. Save them to `.env.local` so they stay the same across restarts (until you delete that
   file or set your own values in `.env`).

Example of what you'll see on startup:

```
──────────────────────────────────────────────
 ADMIN ACCESS (auto-generated just now)
   Login path : /K3948271
   Access code: A2938471
──────────────────────────────────────────────
```

Your admin dashboard is then at `http://localhost:3000/K3948271`.

**For Vercel**, this auto-generation only helps locally — Vercel's filesystem is read-only, so
values can't be auto-saved there. Generate them once ahead of your first deploy:

```bash
npm run generate:admin
```

Copy the two printed values into Vercel's **Project Settings → Environment Variables**
(along with `DATABASE_URL` and a value for `ADMIN_SESSION_SECRET` — the generator script only
prints the two access values; `ADMIN_SESSION_SECRET` can be any long random string, e.g. from
`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`).

---

## 5. Run it

**Development:**

```bash
npm run dev
```

Visit `http://localhost:3000`.

**Production (locally):**

```bash
npm run build
npm run start
```

---

## 6. Deploying to Vercel

1. Push this project to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
2. In Vercel, **Add New Project** → import that GitHub repo.
3. Before the first deploy, add these **Environment Variables** in Vercel's project settings:
   - `DATABASE_URL` — your Postgres connection string (§3)
   - `ADMIN_ACCESS_CODE` and `ADMIN_ROUTE_SECRET` — from `npm run generate:admin` (§4)
   - `ADMIN_SESSION_SECRET` — a long random string (§4)
   - `ADMIN_SESSION_HOURS` — e.g. `8`
4. Deploy. Vercel runs `npm install` (which runs `prisma generate` via `postinstall`)
   automatically.
5. Make sure the database schema exists before/after your first deploy — run once from your
   own machine, pointed at the same `DATABASE_URL`:
   ```bash
   npm run db:push
   ```
6. Share the four `/fill/<type>` links, and use `/<ADMIN_ROUTE_SECRET>` for the admin dashboard.

Every subsequent `git push` to your connected branch redeploys automatically.

---

## 7. Using the app

| Who | URL | What they can do |
|---|---|---|
| Anyone | `/` | Landing page with links to all four questionnaires and analysis |
| Anyone | `/fill/graduate` | Graduates fill their questionnaire |
| Anyone | `/fill/society` | Society respondents fill theirs |
| Anyone | `/fill/employer` | Employers fill theirs |
| Anyone | `/fill/professional` | Professionals fill theirs |
| Anyone | `/analysis` | Charts of aggregated results, switchable by type |
| Admin only | `/<ADMIN_ROUTE_SECRET>` | Enter the access code to log in |
| Admin only | `/<ADMIN_ROUTE_SECRET>/dashboard` | Switch between types, view responses, download, log out |

After submitting, a respondent sees **"Download my response (.docx / .pdf)"** — this uses a
private link tied to their own submission's unguessable ID, so they can keep a copy without
needing an account.

---

## 8. How the multi-type engine works

Instead of writing four almost-identical form/docx/pdf/excel implementations, each
questionnaire is described **once**, declaratively, as an ordered list of "blocks"
(`lib/questionnaires/definitions.ts`, built from the vocabulary in `lib/questionnaires/blocks.ts`):
personal-detail fields, single/multi-choice checklists, 3-level rating matrices, free-text
boxes, the weighting table, a simple tick-list (used for the Professional questionnaire's
Alumni Linkage table), and the respondent-details footer.

Four generic engines each walk that same block list and know how to render every block type:

- `components/QuestionnaireForm.tsx` — the on-screen form
- `lib/docBuilder.ts` — the `.docx` generator (using the `docx` library)
- `lib/pdfBuilder.ts` — the `.pdf` generator (using `pdf-lib`, no LibreOffice needed)
- `lib/excelBuilder.ts` — the Excel export
- `lib/analyticsBuilder.ts` — the Global Analysis charts

Adding a fifth questionnaire type later means adding one new block list to
`lib/questionnaires/definitions.ts` — no new form, no new document code.

All four types share one Prisma table (`prisma/schema.prisma`): each row has a `type` column
and a `data` column holding that type's answers as JSON, validated against its block list on
the way in and out (`lib/questionnaires/payload.ts`).

---

## 9. Project structure

```
app/
  page.tsx                         Landing page (links to all 4 questionnaires + analysis)
  fill/[type]/page.tsx              Shareable fill page for one type (graduate/society/employer/professional)
  analysis/page.tsx                 Public analysis dashboard with a type switcher
  [...slug]/page.tsx                Hidden admin router (login / dashboard / 404 for everything else)
  [...slug]/AdminLogin.tsx          Admin login form
  [...slug]/AdminDashboard.tsx      Admin dashboard with type tabs + all download options
  api/responses/route.ts            POST: submit (any type, public) - GET: list (admin, ?type=)
  api/responses/[id]/docx|pdf       Public self-service: respondent's own receipt download
  api/analysis/route.ts             GET: aggregated analytics for one type (?type=)
  api/admin/login|logout/route.ts   Admin session endpoints
  api/admin/download/[type]/[id]/docx|pdf         One response, one type (admin only)
  api/admin/download/[type]/all/docx-zip|pdf-zip|excel|full-zip   Bulk, one type (admin only)
  api/admin/download/everything-zip/route.ts      Bulk, ALL types in one ZIP (admin only)
components/
  QuestionnaireForm.tsx              Generic block-driven form renderer
lib/
  questionnaires/
    blocks.ts                       The block vocabulary (types)
    definitions.ts                  The four questionnaire definitions (block lists)
    shared-options.ts                Option lists reused across types
    payload.ts                      Empty-payload + validation + JSON row <-> payload helpers
  docBuilder.ts                     Generic .docx generator
  pdfBuilder.ts                     Generic .pdf generator (pdf-lib)
  excelBuilder.ts                   Generic Excel generator
  analyticsBuilder.ts                Generic analytics aggregator
  db.ts                             Prisma client singleton
  auth.ts                           Admin code verification + signed session tokens
  requireAdmin.ts                   Route guard used by every admin API route
  adminCredentials.ts                Auto-generates/prints admin credentials at startup
instrumentation.ts                   Runs adminCredentials at server startup (dev, start, and each Vercel cold start)
prisma/schema.prisma                 One `Response` table (type + JSON data) for all 4 types
public/logos/                        The two official logos, reused across all generated documents
scripts/
  generate-admin-credentials.js      Standalone generator for pre-deploy (Vercel) use
```

---

## 10. Sanity-checking document generation

Generate a sample filled document for every type, without touching the database:

```bash
npx tsx scripts/test-all-types.ts
```

This writes `test-<type>.docx` and `test-<type>.pdf` for each of the four types using sample
answers, so you can open them and confirm the logos and layout look right before going live.

---

## 11. Troubleshooting

- **"Failed to save response"** — almost always means `DATABASE_URL` isn't reachable or
  `npm run db:push` hasn't been run yet against it. Re-check §3, then re-run `npm run db:push`.
- **`prisma generate` fails to download an engine binary** — the machine can't reach
  `binaries.prisma.sh` (e.g. behind a strict firewall or in a sandboxed CI runner). Normal
  internet access resolves this.
- **Admin login always says "Incorrect code"** — check the terminal output at startup (§4) for
  the current code, and make sure you restarted the server after editing `.env`.
- **Forgot the admin path** — check the startup console output, or open `.env.local`
  (local dev) / your Vercel environment variables (production).
- **Deployed to Vercel but admin credentials keep changing** — you must set
  `ADMIN_ACCESS_CODE` and `ADMIN_ROUTE_SECRET` explicitly in Vercel's dashboard (§4/§6);
  auto-generation only persists on a writable local filesystem.

---

## 12. Security notes

- Change the auto-generated `ADMIN_ACCESS_CODE`/`ADMIN_ROUTE_SECRET` any time you suspect
  they've leaked — just delete `.env.local` (locally) or update Vercel's environment variables
  and redeploy.
- Serve the site over **HTTPS** in production (Vercel does this by default) — the session
  cookie is marked `secure` whenever `NODE_ENV=production`.
- The admin code is compared using a constant-time check to resist timing attacks; the session
  cookie is `httpOnly` (invisible to page JavaScript) and signed.
- Self-service receipt links (`/api/responses/<id>/docx|pdf`) rely on the response ID being
  unguessable (a cuid) — there is no endpoint that lists or enumerates other people's IDs.

---

## 13. Deleting responses (admin only)

The admin dashboard lets you remove data:
- **Single response** — a *Delete* button per row (asks for confirmation).
- **All responses of one type** — *Delete all {Type} responses* (asks for the admin access code).
- **Everything, all types** — *Delete EVERYTHING (all types)* (asks for the admin access code).

Bulk deletions are irreversible and require the admin access code as a second factor. Single
deletes need only the logged-in admin session.
