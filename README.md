# AI Meal Plan SaaS

A full-stack SaaS demo for generating personalized weekly meal plans with AI, user authentication, and Stripe subscriptions.

## Features

- **Clerk authentication** — sign up, sign in, profile sync
- **Stripe subscriptions** — weekly, monthly, and yearly plans with webhook activation
- **AI meal plans** — OpenRouter-powered weekly plans on a calendar view
- **Profile dashboard** — subscription status and account info

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | Clerk |
| Database | PostgreSQL + Prisma |
| Payments | Stripe |
| AI | OpenRouter |
| Data fetching | TanStack React Query |

## Local Development

1. Clone and install:

   ```bash
   git clone <your-repo-url>
   cd nextjs-meal-plan-saas
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

3. Fill in `.env.local` with keys from [Clerk](https://clerk.com), [Stripe](https://stripe.com), [OpenRouter](https://openrouter.ai), and a PostgreSQL provider ([Neon](https://neon.tech) works well).

4. Run database migrations:

   ```bash
   npx prisma migrate deploy
   ```

5. Start the dev server:

   ```bash
   npm run dev
   ```

6. (Optional) Forward Stripe webhooks locally:

   ```bash
   npm run stripe:listen
   ```

Visit [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push the repo to GitHub.
2. Import the project in [Vercel](https://vercel.com/new).
3. Add all variables from `.env.example` in the Vercel project settings.
4. Set `NEXT_PUBLIC_BASE_URL` to your production URL (e.g. `https://your-app.vercel.app`).
5. Deploy. Vercel runs `prisma generate` via `postinstall` automatically.

### Post-deploy checklist

- [ ] Run `npx prisma migrate deploy` against your production database
- [ ] Add Stripe webhook endpoint: `https://your-app.vercel.app/api/webhook`
- [ ] Subscribe to events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- [ ] Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET` in Vercel

## User Flow

```
Landing → Sign Up → Subscribe (Stripe Checkout) → Webhook activates profile
       → Meal Plan (AI generation) → Calendar view
```

## Project Structure

```
app/
  api/
    checkout/          # Stripe checkout session
    create-profile/    # Sync Clerk user to DB
    generate-mealplan/ # AI meal plan generation
    profile/           # User profile + subscription status
    webhook/           # Stripe webhook handler
  mealplan/            # Meal plan dashboard
  profile/             # User profile page
  subscribe/           # Pricing page
components/            # UI components
lib/                   # AI, Stripe, Prisma, plans
prisma/                # Database schema + migrations
```

## License

MIT
