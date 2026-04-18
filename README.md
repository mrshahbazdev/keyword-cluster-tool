# ClusterForge — AI Keyword Cluster Generator

Turn one keyword into a full SEO topic cluster in minutes.

ClusterForge is a Laravel 11 + React/Inertia app that takes a single **topic** and a **website** and produces a complete, publish-ready content cluster:

- **5 subtopics** (long-tail keywords) for your main topic
- **10 user-intent questions** per subtopic (50 total)
- **AI-written answers** for every question
- **1 pillar page** + **5 cluster pages** — markdown, ready to publish

All content is generated with **Google Gemini**. Progress updates live via status polling while a queued job runs the 5-step pipeline in the background.

---

## Screenshots

_(Add screenshots here after first run — the app ships with a redesigned landing page, split-screen auth, and card-based project dashboard.)_

- `/` — marketing landing page with hero + features
- `/login`, `/register` — split-screen auth with branding panel
- `/projects` — project grid with live status pills
- `/projects/{id}` — pillar + 5 cluster pages with Q&A, markdown preview, download

---

## Features

| | |
|---|---|
| **Full topic cluster pipeline** | 5 subtopics → 10 Qs each → answers → 5 cluster pages → 1 pillar page |
| **Live progress** | Frontend polls every 3 s; progress bar updates through each generation step |
| **AI-powered** | Google Gemini (configurable model — defaults to `gemini-flash-latest`) |
| **Markdown export** | Download every page as a `.md` file — CMS / static-site ready |
| **Auth + ownership** | Laravel Breeze (Inertia + React). Users can only see their own projects |
| **Queued generation** | Database-driven queue, resumable on failure, error state surfaced in UI |
| **Modern UI** | Tailwind CSS, split-screen auth, card dashboard, gradient accents |

---

## Tech Stack

- **Framework:** Laravel 11
- **Frontend:** React + Inertia.js + Tailwind CSS
- **Auth:** Laravel Breeze (Inertia + React)
- **AI:** Google Gemini (`generativelanguage.googleapis.com/v1beta`)
- **Queue:** Database driver (`jobs` table)
- **Database:** SQLite by default (swap to MySQL/Postgres in `.env`)
- **Testing:** PHPUnit (31 passing tests)

---

## Pipeline

The `GenerateProjectJob` orchestrates 5 steps, each persisting its output before moving on so partial progress survives failures:

```
┌─────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ 5 subtopics │ → │ 10 questions │ → │  AI answers  │ → │ 5 cluster    │ → │ 1 pillar     │
│   + LTKs    │   │ per subtopic │   │   (x50)      │   │    pages     │   │    page      │
└─────────────┘   └──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘
```

Status flow:
`pending` → `generating_subtopics` → `generating_questions` → `generating_answers` → `generating_pages` → `completed`
(or `failed` with a stored error message).

---

## Quick Start

### Requirements
- PHP 8.2+
- Composer 2+
- Node.js 18+ and npm
- A [Google AI Studio](https://aistudio.google.com/app/apikey) API key (free tier works)

### 1. Clone & install

```bash
git clone https://github.com/mrshahbazdev/keyword-cluster-tool.git
cd keyword-cluster-tool

composer install
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
php artisan key:generate
```

Open `.env` and set at minimum:

```env
APP_URL=http://localhost:8000

# SQLite (default — no server required)
DB_CONNECTION=sqlite

# Queue driver — database works out of the box
QUEUE_CONNECTION=database

# Google Gemini
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-flash-latest
```

### 3. Create the database

```bash
touch database/database.sqlite
php artisan migrate
```

### 4. Build frontend assets

```bash
npm run build
# or `npm run dev` for HMR during development
```

### 5. Start the services

In one terminal — dev server:

```bash
php artisan serve
```

In a second terminal — queue worker (required for generation):

```bash
php artisan queue:work --tries=1
```

Visit <http://localhost:8000>, register an account, and create your first cluster.

---

## Usage

1. Go to **Projects → New cluster**
2. Enter your **topic** (e.g. `content marketing for SaaS`)
3. Enter your **website** — either a URL (`example.com`) or a short description of the audience
4. Click **Generate cluster**
5. Watch the progress bar tick through each step (typically 1–3 minutes with Gemini Flash)
6. Once complete, browse the pillar page and 5 cluster tabs. Toggle **Preview / View markdown**, or click **Download .md** on any page

---

## Configuration

All Gemini settings live under `config/services.php` → `gemini`:

| Env var | Default | Description |
|---|---|---|
| `GEMINI_API_KEY` | _(none)_ | Your API key from Google AI Studio |
| `GEMINI_MODEL` | `gemini-2.0-flash` | Any Gemini model available to your key |
| `GEMINI_BASE_URL` | `https://generativelanguage.googleapis.com/v1beta` | Override if using a proxy |
| `GEMINI_TIMEOUT` | `120` | HTTP timeout in seconds |

> **Tip:** The free tier sometimes rate-limits `gemini-2.0-flash`. If you see 429 errors, try `gemini-flash-latest` or `gemini-2.5-flash`.

---

## Project Structure

```
app/
├── Http/
│   ├── Controllers/ProjectController.php   # index / create / store / show / status / retry / destroy / export
│   └── Requests/StoreProjectRequest.php
├── Jobs/
│   └── GenerateProjectJob.php              # orchestrates the 5-step pipeline
├── Models/
│   ├── Project.php                         # topic, website, status, pillar_* columns
│   ├── Subtopic.php                        # title, long_tail_keyword, cluster_* columns
│   └── Question.php                        # question + answer
└── Services/
    ├── GeminiService.php                   # thin HTTP wrapper + generateText / generateJson helpers
    └── KeywordClusterGenerator.php         # 5-step pipeline (subtopics → questions → answers → cluster → pillar)

resources/js/
├── Layouts/
│   ├── AuthenticatedLayout.jsx
│   └── GuestLayout.jsx                     # split-screen auth layout
└── Pages/
    ├── Welcome.jsx                         # landing page
    ├── Auth/                               # Login / Register / etc.
    └── Projects/
        ├── Index.jsx                       # card grid dashboard
        ├── Create.jsx                      # new cluster form
        └── Show.jsx                        # pillar + 5 cluster tabs with markdown

database/migrations/
├── ..._create_projects_table.php
├── ..._create_subtopics_table.php
└── ..._create_questions_table.php

tests/Feature/ProjectTest.php               # 6 feature tests covering auth, ownership, job dispatch, status, pipeline
```

---

## Testing

```bash
# PHP unit + feature tests (31 passing)
php artisan test

# Frontend type/lint checks
npm run lint     # if configured
./vendor/bin/pint --test   # Laravel Pint (PSR-12)
```

The test suite includes a mocked Gemini service (`FakeGemini`) so tests run offline and don't burn API quota.

---

## Routes

| Method | URI | Name |
|---|---|---|
| GET | `/projects` | `projects.index` |
| GET | `/projects/create` | `projects.create` |
| POST | `/projects` | `projects.store` |
| GET | `/projects/{project}` | `projects.show` |
| GET | `/projects/{project}/status` | `projects.status` (JSON for polling) |
| POST | `/projects/{project}/retry` | `projects.retry` |
| DELETE | `/projects/{project}` | `projects.destroy` |
| GET | `/projects/{project}/export/pillar` | `projects.export.pillar` |
| GET | `/projects/{project}/export/cluster/{subtopic}` | `projects.export.cluster` |

All routes are protected by `auth` middleware and scoped to the current user.

---

## Roadmap / Ideas

- [ ] In-place editing of generated content
- [ ] Direct publish to WordPress / Ghost / Notion
- [ ] Competitor SERP analysis to guide subtopic picks
- [ ] Multi-language support
- [ ] Bulk project import from CSV
- [ ] Export a whole project as a zipped markdown folder

PRs welcome.

---

## License

MIT — see [`LICENSE`](LICENSE) if included, otherwise default Laravel MIT terms apply.

---

Built with [Laravel](https://laravel.com), [Inertia.js](https://inertiajs.com), [React](https://react.dev), [Tailwind CSS](https://tailwindcss.com), and [Google Gemini](https://ai.google.dev).
