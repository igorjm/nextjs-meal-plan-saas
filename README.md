# MealPlan AI

Full-stack SaaS portfolio project that turns dietary preferences into a saved weekly meal plan.

Built with **Next.js 15**, **Clerk**, **Stripe**, **Prisma/Neon**, and **OpenRouter**.

---

## Features

- **Clerk auth** — sign up, sign in, and profile sync to Postgres
- **Stripe subscriptions** — weekly / monthly / yearly plans with webhook activation
- **AI meal plans** — OpenRouter generates a 7-day plan from diet, calories, allergies, and cuisine
- **Persisted plans** — latest plan is saved per user and loaded on return
- **Day-by-day UI** — Apple-inspired meal plan dashboard (no cramped calendar tiles)
- **Profile page** — subscription status and account details

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| UI | Tailwind CSS |
| Auth | Clerk |
| Database | PostgreSQL (Neon) + Prisma |
| Payments | Stripe Checkout + webhooks |
| AI | OpenRouter |
| Data fetching | TanStack React Query |
| Hosting | Vercel |

## Demo flow

```
Landing → Sign up → Subscribe (Stripe) → Webhook activates subscription
       → Generate meal plan (AI) → Saved plan on /mealplan
```

## Local development

```bash
git clone https://github.com/igorjm/nextjs-meal-plan-saas.git
cd nextjs-meal-plan-saas
npm install
cp .env.example .env
```

Fill `.env` (see [Environment variables](#environment-variables)), then:

```bash
npx prisma migrate deploy
npm run dev
```

Optional local Stripe webhooks:

```bash
npm run stripe:listen
```

App: [http://localhost:3000](http://localhost:3000)

## Environment variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `DATABASE_URL` | Neon / Postgres connection string |
| `STRIPE_SECRET_KEY` | Stripe secret (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (`whsec_...`) |
| `STRIPE_PRICE_WEEKLY` | Stripe **Price** ID (`price_...`) |
| `STRIPE_PRICE_MONTHLY` | Stripe **Price** ID |
| `STRIPE_PRICE_YEARLY` | Stripe **Price** ID |
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `OPENROUTER_MODEL` | e.g. `google/gemini-2.5-flash` |
| `NEXT_PUBLIC_BASE_URL` | App URL (`http://localhost:3000` locally) |

## Deploy to Vercel

1. Import this repo in [Vercel](https://vercel.com/new).
2. Add all variables from the table above.
3. Set `NEXT_PUBLIC_BASE_URL` to your production URL.
4. Deploy (`postinstall` runs `prisma generate`).
5. Run `npx prisma migrate deploy` against production `DATABASE_URL`.
6. Create a Stripe webhook at `https://your-app.vercel.app/api/webhook` for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
7. Put that endpoint’s signing secret in `STRIPE_WEBHOOK_SECRET`.

## Project structure

```
app/
  api/
    checkout/            # Stripe Checkout session
    create-profile/      # Sync Clerk user → Profile
    generate-mealplan/   # AI generation + save
    mealplan/            # Load latest saved plan
    profile/             # Profile + subscription status
    webhook/             # Stripe webhooks
  mealplan/              # Meal plan dashboard
  profile/               # Account page
  subscribe/             # Pricing
  sign-in/ / sign-up/    # Clerk auth
components/              # UI
lib/                     # AI, Stripe, Prisma, plans
prisma/                  # Schema + migrations
public/brand/            # Favicon, hero, empty-state art
```

## License

MIT
