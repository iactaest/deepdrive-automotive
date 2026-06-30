# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Full dev environment (all services concurrently):**
```bash
composer run dev
# Starts: php artisan serve, queue:listen, pail (log viewer), npm run dev (Vite HMR)
```

**First-time setup:**
```bash
composer run setup
```

**Frontend only:**
```bash
npm run dev       # Vite dev server with HMR
npm run build     # tsc && vite build
```

**Tests:**
```bash
composer run test
php artisan test --filter=TestName   # Single test
```

**Code style:**
```bash
./vendor/bin/pint
```

**Database:**
```bash
php artisan migrate
php artisan migrate:fresh --seed    # Clean slate; safest due to many addColumn migrations
php artisan db:seed --class=EntiSeeder
php artisan db:seed --class=CriteriMatchSeeder
```

## Architecture

**DeepDrive** is a grant-finder SaaS for Italian public entities. Stack: Laravel 13 + Inertia.js + React 18 (TypeScript) + Tailwind CSS 3. Default DB is SQLite.

### User Roles

`users.tipo_utente` distinguishes four roles: `impresa`, `ente`, `associazione`, `professionista`. Only the `ente` role is fully implemented. After registration, `User::getDashboardRoute()` routes each type to its own layout and dashboard page. `EnteController::index()` redirects to the profile wizard if `profilo_completo` is false.

### Backend structure

- `app/Http/Controllers/` — controllers return `Inertia::render()` for pages or JSON for AJAX
  - `ProfiloEnteController` — 6-step onboarding wizard for ente users
  - `BandiController` — grant search with filter + DeepSeek API fallback when DB is empty
  - `BandiListaController` — paginated grant list with pre-computed match scores
  - `AssistenteController` — AI chat stub (mock response; `openai-php/laravel` is installed but integration is pending)
- `app/Models/` — key models:
  - `BandoImportato` — grants from external sources; `extra_data` JSON column stores raw API payload
  - `BandiMatch` — stores compatibility scores (0–100) with `punti_forza`/`punti_debolezza` as JSON strings
  - `CriteriMatch` — per-ente weighted match criteria
  - `Ente` — entity registry (table: `enti`); separate from `ProfiloEnte` (wizard profile)
- `app/Console/Commands/` — Artisan sync commands:
  - `bandi:sync-regione-sicilia` — CKAN open data portal (CSV/JSON)
  - `bandi:sync-eu-funding` — EU Funding & Tenders API (SEDIA, public key)
  - `bandi:sync-open-coesione` — OpenCoesione API
  - `bandi:calculate-matches` — scores all enti against all bandi (typology 25%, territory 20%, sectors 25%, budget 15%, EU experience 10%, deadline 5%)

### Frontend structure

- `resources/js/Pages/` — Inertia page components by role:
  - `Ente/` — dashboard, ProfiloWizard, ProfiloShow/Edit, ListaBandi/Index, ListaBandi/Dettaglio
  - `Bandi/` — RicercaEnte (grant search with filters)
  - `Auth/` — Breeze auth pages
- `resources/js/Layouts/` — per-role layouts: `LayoutEnte`, `LayoutImpresa`, `LayoutAssociazione`, `LayoutProfessionista`, plus `AuthenticatedLayout` (generic)
- TypeScript path alias: `@/*` → `resources/js/*`
- `HandleInertiaRequests::share()` injects `auth.user` as a global Inertia prop

### Data flow

1. Controller queries Eloquent → `Inertia::render('Page', ['prop' => $data])`
2. React page receives props typed in `resources/js/types/`
3. Forms use Inertia's `useForm` hook; AJAX endpoints (e.g. `/bandi/cerca`) return raw JSON

### Grant matching pipeline

```
External APIs (EU, Regione Sicilia, OpenCoesione)
  → bandi:sync-* commands → bandi_importati table
  → bandi:calculate-matches → bandi_match table
  → BandiListaController → Ente/ListaBandi/Index.tsx
```

`BandiController::cerca()` also has an inline scoring method (`calcolaPunteggioMatch`) with a simpler 70-base algorithm for live search results.

### Required `.env` keys not in `.env.example`

```dotenv
OPENAI_API_KEY=       # openai-php/laravel (AssistenteController)
DEEPSEEK_API_KEY=     # BandiController fallback search
DEEPSEEK_API_URL=     # e.g. https://api.deepseek.com/v1/chat/completions
```

### Codebase notes

- The codebase is in Italian: routes, comments, variable names, and UI strings.
- Several `ProfiloEnte` array fields (e.g. `categorie_interesse`, `livelli_interesse`) are stored as JSON strings and decoded manually with `json_decode()` in controllers rather than via Eloquent `$casts`.
- PHPUnit tests use SQLite in-memory (`DB_CONNECTION=sqlite`, `DB_DATABASE=:memory:` in `phpunit.xml`).
- There are 30+ migration files including many addColumn and fix migrations from iterative development; prefer `migrate:fresh` over `migrate` in local dev.
