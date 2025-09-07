# 🎵 Bioflow

_A modern, musician-first Link-in-Bio platform. Built as both a **portfolio showcase** and a **scalable SaaS**._

---

## ✨ About the Project

**Bioflow** is my take on the classic “Linktree” concept — but redesigned for **musicians, creators, and indie brands**.

Unlike generic link-in-bio tools, Bioflow emphasizes:

- 🎶 **Creator-friendly design** — Inspired by music platforms like Spotify, but rebranded with my **violet/magenta identity**
- ⚡ **Speed** — Built on **Next.js 15 App Router** + **Edge-ready redirects** for instant link resolution
- 🔐 **Security** — Row Level Security (RLS) on Supabase ensures that every user’s data is fully isolated
- 📊 **Analytics** — Link click tracking, rollups, and per-link dashboards
- 🎨 **Customization** — Dark/light mode, per-artist theming, branded colors
- 💳 **Monetization** — Subscription plans, feature gating, and billing via Stripe or Lemon Squeezy

This project doubles as:

1. **My portfolio piece** (to demonstrate SaaS-grade architecture, design systems, and full-stack delivery).
2. **A real product** that can grow into a SaaS offering for creators.

---

## 🚀 Features

### MVP (current focus)

- 🔗 Public bio pages (`/[handle]`) with:
  - Profile image, bio, username
  - Vertical stack of links (pill-style buttons with icons/badges)
- ↪️ Smart redirects (`/r/[id]`) with:
  - Fast resolution
  - Click tracking (IP, UA, referrer, country)
- 🛠 Admin dashboard (`/admin`) for CRUD:
  - Create/update/delete links
  - Reorder links with drag-and-drop
- 🎨 Theming:
  - Global dark/light tokens
  - Per-artist accent colors (violet/magenta by default)

### SaaS Roadmap

- 👥 Multi-tenant Auth (Supabase Auth)
- 🔐 RLS policies for secure data isolation
- 💳 Billing:
  - Free vs Pro plans
  - Feature gating (custom domain, advanced analytics, theming)
- 📈 Analytics Dashboard:
  - Daily rollups
  - Device/referrer breakdowns
- 🖼 Dynamic OG images (`/[handle]/opengraph-image`)
- 📱 PWA support (install on home screen)
- 🛡 Moderation & anti-spam protections

---

## 🛠 Tech Stack

### Frontend

- **[Next.js 15](https://nextjs.org/)** — App Router, Server Components, server actions
- **[Tailwind CSS v4](https://tailwindcss.com/)** — utility-first styling
- **[Custom design tokens](./app/globals.css)** — OKLCH color system, shadcn-style theme mapping
- **[shadcn/ui](https://ui.shadcn.com/)** primitives — for accessible base components
- **[Recharts](https://recharts.org/)** — client-side analytics charts (planned)

### Backend

- **[Supabase](https://supabase.com/)** — Postgres + Auth + Storage + Realtime
- **[Drizzle ORM](https://orm.drizzle.team/)** — typed schema & migrations
- **Edge Functions** (via Next.js Route Handlers) — for fast redirects & cron jobs

### Dev & Infra

- **[Vercel](https://vercel.com/)** — hosting, Edge Middleware, serverless cron jobs
- **[Resend](https://resend.com/)** — transactional email
- **[Stripe](https://stripe.com/)** — billing integration
- **[Sentry](https://sentry.io/)** (planned) — error monitoring

---

## 📂 Project Structure

```plaintext
app/
  (public)/[handle]/page.tsx   # public artist bio page
  r/[id]/route.ts              # redirect + click logging
  admin/page.tsx               # admin dashboard
  api/billing/webhook/route.ts # billing webhook
  api/cron/rollup/route.ts     # daily analytics rollup

components/
  LinkCard.tsx                 # pill-style button for links
  ThemeToggle.tsx              # dark/light mode toggle

db/
  schema/                      # Drizzle table schemas (artists, links, clicks, subscriptions, etc.)
  migrations/                  # auto-generated SQL migrations

lib/
  data.ts                      # RSC-safe DB fetchers
  analytics.ts                 # click logging helpers
  auth.ts                      # Supabase SSR auth utilities

scripts/
  seed.ts                      # seed sample data for development
```

---

## ⚙️ Setup & Development

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/bioflow.git
cd bioflow
bun install
```

### 2. Env vars

Create `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000

SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SEED_OWNER_ID=uuid-from-supabase-auth-users

RESEND_API_KEY=your-resend-key
STRIPE_SECRET_KEY=your-stripe-key
```

### 3. Generate & run migrations

```bash
bun drizzle-kit generate
bun drizzle-kit push
```

### 4. Seed dev data

```bash
bun tsx scripts/seed.ts
```

### 5. Start dev server

```bash
bun dev
```

---

## 🔒 Security Principles

- Never expose `SUPABASE_SERVICE_ROLE_KEY` client-side (server actions only).
- All Supabase tables use **RLS**.
- Click logs anonymize IP (hashing optional).
- CSP headers prevent inline script injection.

---

## 📈 SaaS Pricing (planned)

- **Free**: up to 10 links, basic analytics (7-day total)
- **Pro**: unlimited links, advanced analytics, theming, custom domain
- **Team**: org memberships, role-based access, priority support

---

## 🧭 Roadmap

- [x] MVP static UI
- [x] Supabase schema & server fetchers
- [x] Redirects + click logging
- [ ] Admin CRUD
- [ ] Auth + RLS
- [ ] Billing
- [ ] Analytics dashboard
- [ ] SEO & dynamic OG
- [ ] Per-artist theming
- [ ] Moderation & abuse prevention
- [ ] Mobile PWA

---

## 🧑‍💻 About Me

Hi, I’m **Dugg** — a freelance web developer passionate about SaaS, web design, and scalable systems.

I built Bioflow to:

- Prove that I can deliver **production-grade SaaS** end-to-end
- Explore the intersection of **music, web, and entrepreneurship**
- Show potential clients & employers that I don’t just code — I build **products that scale**

If you like this project, reach out at [LinkedIn](https://linkedin.com/in/devdugg) or [X/Twitter](https://x.com/DevDugg).

---

## 🤝 Contributing

This is primarily my portfolio project, but if you want to contribute:

1. Fork repo
2. Create feature branch
3. PR with detailed description

---

## 📜 License

This project is licensed under the **Bioflow License (Custom, Non-Commercial)**.

- Personal, educational, and portfolio use is permitted.
- Commercial use (including SaaS hosting, resale, or derivative commercial works) is prohibited without a separate commercial license agreement.

The full license terms can be found in [LICENSE.md](./LICENSE.md).  
For commercial licensing inquiries, please contact [your email or website].
