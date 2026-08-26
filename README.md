# ATC IT Graduates' Curriculum Questionnaire — Web Portal

A Next.js application that puts the Arusha Technical College "Graduates' Questionnaire for
Review of Curriculum for Ordinary Diploma Programme in Information Technology" online:

- **Public respondents** fill the questionnaire (every section A–F, exactly as in the original
  Word document) and can view a **Global Analysis** dashboard of aggregated results.
- **Admins** unlock a hidden dashboard with a secret access code, and can download:
  - Any single response as a **Word document (.docx)** that recreates the original
    questionnaire layout — including both official logos (the national emblem and the ATC
    crest) — filled in with that respondent's answers.
  - Any single response as a matching **PDF** (converted from the exact same .docx, so the two
    always look identical).
  - **All** responses zipped as `.docx` files.
  - **All** responses zipped as `.pdf` files.
  - **All** responses as one **Excel workbook** (a summary sheet plus one detail sheet per
    rating table).
  - A **"full folder" ZIP** containing `docx/`, `pdf/`, and the Excel workbook together.

The admin area is not linked from anywhere in the interface. It only exists at a random path
you choose in `.env`, and any other URL 404s exactly like a page that was never built — so
regular visitors have no way to discover or guess it.

---

## 1. Prerequisites

Install these on the machine that will run the app:

| Requirement | Why | Check with |
|---|---|---|
| **Node.js 18.18+** (20 LTS recommended) | Runs Next.js | `node -v` |
| **npm** (comes with Node) | Installs dependencies | `npm -v` |
| **LibreOffice** | Converts generated `.docx` files to `.pdf` on demand | `soffice --version` |

Installing LibreOffice:
- **Ubuntu/Debian:** `sudo apt-get update && sudo apt-get install -y libreoffice`
- **macOS:** `brew install --cask libreoffice`
- **Windows:** download the installer from https://www.libreoffice.org/download/ and make sure
  the install folder (e.g. `C:\Program Files\LibreOffice\program`) is on your `PATH`, or set the
  `LIBREOFFICE_PATH`/`SOFFICE_PATH` behavior via the `libreoffice-convert` package if needed.

You do **not** need to install PostgreSQL/MySQL — the project ships with SQLite (a single local
file database), which needs no separate server. You can switch to Postgres/MySQL later if you
outgrow it (see §7).

---

## 2. Install & configure

```bash
# 1. Unzip the project and enter it
cd atc-it-graduate-questionnaire

# 2. Install dependencies (this also runs `prisma generate` automatically)
npm install

# 3. Create your local environment file
cp .env.example .env

# 4. Generate admin credentials (access code + hidden route)
#    This writes a compliant admin code (starts with a letter, contains digits,
#    max 8 chars) and route into `.env`, and prints them. In dev the app also
#    auto-generates these on first run if they are missing, and prints them on
#    startup — see the "ADMIN ACCESS" banner in the server console.
npm run setup
```

Now open `.env` and set three things:

```ini
DATABASE_URL="file:./dev.db"

# The secret code an admin types in to unlock the dashboard.
ADMIN_ACCESS_CODE="choose-a-long-random-code-here"

# The URL path where the admin login secretly lives, e.g. https://yoursite.com/<this>
# Pick something random and unguessable — NOT "admin" or "login".
ADMIN_ROUTE_SECRET="gatekeeper-7f2c91"

# Used to cryptographically sign the admin session cookie.
# Generate one with:
#   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
ADMIN_SESSION_SECRET="paste-a-generated-random-hex-string-here"

ADMIN_SESSION_HOURS=8
```

**Keep `.env` out of version control and off any public server directory listing** — it's
already covered by `.gitignore`.

---

## 3. Set up the database

This creates `dev.db` (a SQLite file) with the tables the app needs:

```bash
npm run db:push
```

Re-run this any time you change `prisma/schema.prisma`.

---

## 4. Run it

**Development mode** (auto-reloads on file changes):

```bash
npm run dev
```

Visit `http://localhost:3000`.

**Production mode:**

```bash
npm run build
npm run start
```

By default it serves on port 3000 (`PORT=8080 npm run start` to change it).

---

## 5. Using the app

| Who | URL | What they can do |
|---|---|---|
| Anyone | `/` | Landing page with links to the form and analysis |
| Anyone | `/fill` | Fill and submit the questionnaire. Respondents can **Save draft** to store progress in the browser and **Load** it later on the same device |
| Anyone | `/analysis` | View charts of aggregated results across all responses |
| Admin only | `/<ADMIN_ROUTE_SECRET>` | Enter the access code to log in |
| Admin only | `/<ADMIN_ROUTE_SECRET>/dashboard` | View every response, download individually or in bulk, log out |

Example: if you set `ADMIN_ROUTE_SECRET=gatekeeper-7f2c91`, the admin login is at
`http://localhost:3000/gatekeeper-7f2c91`. Any other made-up path (e.g. `/admin`, `/login`,
`/gatekeeper-7f2c92`) returns a normal 404.

The admin access code and the hidden route are generated by `npm run setup` (and printed in the
terminal). There is also a small **"Staff / Admin login"** link in the footer of every page, so you
don't have to remember the secret URL.

### How to log in as admin (step by step)

1. Open the admin page. Either click **"Staff / Admin login"** in the page footer, or go directly
   to `http://localhost:3000/<ADMIN_ROUTE_SECRET>` on your machine (e.g. `/nr9zpeo0`), or
   `https://<your-domain>/<ADMIN_ROUTE_SECRET>` on the live site.
2. You'll see a **"Restricted Access"** box. Type the **access code** (e.g. `wlj347a7`) and click
   **Unlock**.
3. You're in the admin dashboard, where you can view and download every response.

> The **route** (the hidden URL, e.g. `/nr9zpeo0`) and the **access code** (what you type, e.g.
> `wlj347a7`) are two different things. Do **not** paste the code into the browser address bar —
> that gives a 404. The code is only typed into the login box.

Where do the code and route come from? Run `npm run setup` — it writes a compliant code (starts
with a letter, contains digits, max 8 characters) and route into `.env` and prints both. They are
also printed in the server console under the **ADMIN ACCESS** banner whenever you run `npm run dev`
(or in the Vercel runtime logs). If you ever forget them, just run `npm run setup` again to
regenerate them (and copy the new values into your Vercel environment variables — see §11).

The admin session is stored in a signed, `httpOnly` cookie, so it can't be read or forged from
client-side JavaScript. It expires automatically after `ADMIN_SESSION_HOURS` hours, or
immediately via the **Log out** button on the dashboard.

---

## 6. How document generation works

- The questionnaire's structure (all sections, skill lists, certification lists, etc.) lives in
  one place, `lib/schema.ts`, so the form, the database, and the generated documents can never
  drift out of sync.
- `lib/docxTemplate.ts` rebuilds the original Word layout in code using the `docx` library —
  same header table with both logos, same section headings, same rating tables — and marks the
  boxes/ratings that respondent actually chose.
- `lib/pdf.ts` converts that exact generated `.docx` to PDF via LibreOffice, so the `.docx` and
  `.pdf` downloads for a response are always visually identical.
- `lib/excel.ts` builds the Excel workbook (`exceljs`) used for the "other format" export.
- Bulk ZIP downloads are streamed with `archiver` so nothing is fully buffered in memory for
  very large response sets beyond what's needed.

If you ever need to tweak wording, colors, or table widths, everything is plain TypeScript in
`lib/docxTemplate.ts` — no XML hacking required.

---

## 7. Project structure

```
app/
  page.tsx                       Landing page
  fill/page.tsx                  The questionnaire form
  fill/RatingMatrix.tsx          Reusable 3-column rating table component
  analysis/page.tsx              Public global analysis dashboard (charts)
  [...slug]/page.tsx             Hidden admin router (login / dashboard / 404 for everything else)
  [...slug]/AdminLogin.tsx       Admin login form
  [...slug]/AdminDashboard.tsx   Admin dashboard UI
  api/responses/route.ts         POST: submit a response (public) · GET: list all (admin only)
  api/analysis/route.ts          GET: aggregated analytics (public)
  api/admin/login/route.ts       POST: verify code, set session cookie
  api/admin/logout/route.ts      POST: clear session cookie
  api/admin/download/[id]/docx   GET: one response as .docx (admin only)
  api/admin/download/[id]/pdf    GET: one response as .pdf (admin only)
  api/admin/download/all/docx-zip    GET: all responses as .docx, zipped
  api/admin/download/all/pdf-zip     GET: all responses as .pdf, zipped
  api/admin/download/all/excel       GET: all responses as one .xlsx
  api/admin/download/all/full-zip    GET: docx/ + pdf/ + xlsx, all zipped together
lib/
  schema.ts        All question/option lists + TypeScript types (single source of truth)
  db.ts            Prisma client singleton
  auth.ts          Admin code verification + signed session tokens
  requireAdmin.ts  Route guard used by every admin API route
  serialize.ts     Converts between the flat DB row and the nested form payload
  docxTemplate.ts  Rebuilds the original questionnaire as a .docx for one response
  pdf.ts           Converts a generated .docx buffer to PDF via LibreOffice
  excel.ts         Builds the multi-sheet Excel export
  analytics.ts     Aggregates all responses for the public analysis page
prisma/schema.prisma  Database schema (SQLite by default)
public/logos/         The two official logos extracted from the original document
scripts/test-docx.ts  Standalone script to generate a sample .docx without the DB (see below)
```

### Switching from SQLite to Postgres/MySQL later

Change the `datasource` block in `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql" // or "mysql"
  url      = env("DATABASE_URL")
}
```

Update `DATABASE_URL` in `.env` accordingly, then run `npm run db:push` again.

---

## 8. Sanity-checking the document generator

You can generate a sample filled document without touching the database or the web server:

```bash
npx tsx scripts/test-docx.ts
```

This writes `test-output.docx` using made-up sample answers, so you can open it (or convert it
with `soffice --headless --convert-to pdf test-output.docx`) and confirm the logos and layout
look right on your machine before going live.

---

## 9. Troubleshooting

- **"PDF conversion failed. Is LibreOffice installed and on PATH?"** — install LibreOffice (see
  §1) and make sure the `soffice` command works from a terminal. Restart the Next.js server
  after installing.
- **`prisma generate` fails to download an engine binary** — this happens if the machine (or a
  sandboxed CI runner) can't reach `binaries.prisma.sh`. On a normal machine with internet
  access this resolves itself; behind a strict corporate firewall, allow that domain or see
  Prisma's docs on `PRISMA_ENGINES_MIRROR`.
- **Admin login always says "Incorrect code"** — double-check `ADMIN_ACCESS_CODE` in `.env` has
  no trailing spaces, and that you restarted the server after editing `.env`.
- **Forgot the admin path** — it's whatever you set `ADMIN_ROUTE_SECRET` to in `.env`; open that
  file to check or change it (then restart the server).

---

## 10. Security notes

- Change `ADMIN_ACCESS_CODE`, `ADMIN_ROUTE_SECRET`, and `ADMIN_SESSION_SECRET` from the sample
  values before deploying anywhere reachable by the public.
- Serve the site over **HTTPS** in production — the session cookie is marked `secure` whenever
  `NODE_ENV=production`, which requires HTTPS to actually be sent by the browser.
- The admin code is compared using a constant-time check to resist timing attacks, and the
  session cookie is `httpOnly` (invisible to page JavaScript) and signed (can't be forged
  without `ADMIN_SESSION_SECRET`).
- Consider putting the whole app behind a firewall/VPN if respondents should only be able to
  reach it from a specific network.

---

## 11. Deploying to Vercel (and pushing to GitHub)

The app is a standard Next.js project and deploys to Vercel. Two things differ from local
development:

### 11.1 Database — switch SQLite → PostgreSQL

Vercel's serverless filesystem is **ephemeral and read-only at runtime**, so a local SQLite file
(`dev.db`) will not persist between requests. Use a hosted Postgres database instead (Neon,
Supabase, or Vercel Postgres — any gives you a `DATABASE_URL` connection string).

1. Create a Postgres database and copy its connection string.
2. In `prisma/schema.prisma`, change the datasource provider:

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. In your Vercel project **Environment Variables**, set:
   - `DATABASE_URL` → your Postgres connection string
   - `ADMIN_ACCESS_CODE`, `ADMIN_ROUTE_SECRET`, `ADMIN_SESSION_SECRET`,
     `ADMIN_SESSION_HOURS` → same as your local `.env` (generate fresh, secret values)
4. The `vercel-build` script (`prisma generate && prisma db push && next build`) creates the
   tables automatically on every deploy, so there is no separate migrate step.

> Local development still uses SQLite: keep `provider = "sqlite"` in `schema.prisma` and
> `DATABASE_URL="file:./dev.db"` in `.env`, then run `npm run db:push` once.

### 11.2 PDF export limitation on Vercel

The **Word (.docx)**, **Excel (.xlsx)**, and bulk **.docx-zip** downloads are pure-JS and work on
Vercel. The **PDF** and **full-zip** downloads rely on LibreOffice (`soffice`), which is not
available in Vercel's runtime — those two endpoints return a clear error instead of crashing. If
you need PDFs on Vercel, either:

- host on a VPS / Docker image with LibreOffice installed, or
- replace `lib/pdf.ts` with a serverless PDF renderer (e.g. a headless-Chromium/Puppeteer
  approach), or
- only offer the `.docx` download (visually identical) to respondents.

### 11.3 Push to GitHub and deploy

```bash
# from the project root
git init
git add .
git commit -m "ATC IT graduate questionnaire portal"
git remote add origin https://github.com/mwala400/graduate-questionnaire

git branch -M main
git push -u origin main
```

Then in Vercel: **New Project → Import Git Repository**, pick the repo, and Deploy. Vercel
detects Next.js, runs `vercel-build`, and goes live. Set the environment variables above before
the first deploy (or redeploy after adding them).
