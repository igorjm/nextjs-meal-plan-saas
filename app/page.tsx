"use client";

import Image from "next/image";
import Link from "next/link";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

interface SavedMealPlanResponse {
  mealPlan: Record<string, unknown> | null;
  preferences?: {
    dietType: string;
    calories: number;
  };
  createdAt?: string;
}

async function fetchSavedMealPlan(): Promise<SavedMealPlanResponse> {
  const res = await fetch("/api/mealplan");
  if (!res.ok) {
    throw new Error("Failed to load meal plan.");
  }
  return res.json();
}

const STEPS = [
  {
    step: "01",
    title: "Create your account",
    description: "Sign up in seconds and sync your profile securely.",
  },
  {
    step: "02",
    title: "Set your preferences",
    description: "Diet, calories, allergies, and cuisine — all in one place.",
  },
  {
    step: "03",
    title: "Cook your week",
    description: "Get a clear day-by-day plan saved to your account.",
  },
];

export default function HomePage() {
  const { isSignedIn, user, isLoaded } = useUser();

  const savedQuery = useQuery({
    queryKey: ["mealplan"],
    queryFn: fetchSavedMealPlan,
    enabled: Boolean(isSignedIn),
  });

  const hasPlan = Boolean(savedQuery.data?.mealPlan);
  const firstName = user?.firstName || user?.username || "there";

  return (
    <div className="-mx-4 -mt-4 min-h-[calc(100vh-4rem)] overflow-hidden bg-[#F5F5F7] sm:-mx-6 lg:-mx-8">
      {/* Full-bleed hero */}
      <section className="relative isolate min-h-[78vh] overflow-hidden">
        <Image
          src="/brand/hero-food.png"
          alt="Fresh healthy meals prepared for the week"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#F5F5F7] via-[#F5F5F7]/88 to-[#F5F5F7]/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F5F5F7] via-transparent to-[#F5F5F7]/40" />

        <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-center px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8 lg:pb-28">
          <div className="animate-[fadeUp_0.5s_ease-out] flex items-center gap-2.5">
            <Image
              src="/brand/logo-mark.svg"
              alt=""
              width={28}
              height={28}
              className="rounded-lg"
            />
            <p className="font-display text-[13px] font-semibold uppercase tracking-[0.18em] text-[#1B7A3F]">
              MealPlan AI
            </p>
          </div>

          <SignedOut>
            <h1 className="animate-[fadeUp_0.55s_ease-out] mt-5 max-w-2xl font-display text-5xl font-semibold tracking-tight text-[#1D1D1F] sm:text-6xl lg:text-7xl">
              Eat well.
              <br />
              Plan less.
            </h1>
            <p className="animate-[fadeUp_0.6s_ease-out] mt-5 max-w-md text-[17px] leading-relaxed text-[#6E6E73] sm:text-[19px]">
              Personalized weekly meals from your preferences — clear, saved,
              and ready when you are.
            </p>
            <div className="animate-[fadeUp_0.65s_ease-out] mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/sign-up"
                className="rounded-full bg-[#1D1D1F] px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-black"
              >
                Get started
              </Link>
              <Link
                href="/subscribe"
                className="rounded-full bg-white/80 px-6 py-3.5 text-[15px] font-semibold text-[#1D1D1F] ring-1 ring-black/[0.06] backdrop-blur transition hover:bg-white"
              >
                View plans
              </Link>
            </div>
          </SignedOut>

          <SignedIn>
            <h1 className="animate-[fadeUp_0.55s_ease-out] mt-5 max-w-2xl font-display text-5xl font-semibold tracking-tight text-[#1D1D1F] sm:text-6xl lg:text-7xl">
              Welcome back,
              <br />
              {isLoaded ? firstName : "…"}.
            </h1>
            <p className="animate-[fadeUp_0.6s_ease-out] mt-5 max-w-md text-[17px] leading-relaxed text-[#6E6E73] sm:text-[19px]">
              {savedQuery.isLoading
                ? "Loading your kitchen…"
                : hasPlan
                  ? `Your ${savedQuery.data?.preferences?.dietType ?? "weekly"} plan is saved and ready.`
                  : "You’re in. Generate your first weekly meal plan whenever you’re ready."}
            </p>
            <div className="animate-[fadeUp_0.65s_ease-out] mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/mealplan"
                className="rounded-full bg-[#1D1D1F] px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-black"
              >
                {hasPlan ? "Open meal plan" : "Generate meal plan"}
              </Link>
              <Link
                href="/profile"
                className="rounded-full bg-white/80 px-6 py-3.5 text-[15px] font-semibold text-[#1D1D1F] ring-1 ring-black/[0.06] backdrop-blur transition hover:bg-white"
              >
                Profile
              </Link>
            </div>
          </SignedIn>
        </div>
      </section>

      <SignedIn>
        <section className="relative mx-auto -mt-8 max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatusCard
              label="Meal plan"
              value={
                savedQuery.isLoading
                  ? "…"
                  : hasPlan
                    ? "Saved"
                    : "Not created"
              }
              hint={
                hasPlan && savedQuery.data?.createdAt
                  ? `Updated ${new Date(savedQuery.data.createdAt).toLocaleDateString()}`
                  : "Generate from preferences"
              }
              href="/mealplan"
            />
            <StatusCard
              label="Calories"
              value={
                savedQuery.data?.preferences?.calories
                  ? `${savedQuery.data.preferences.calories}`
                  : "—"
              }
              hint="Daily goal from last plan"
              href="/mealplan"
            />
            <StatusCard
              label="Account"
              value="Profile"
              hint="Subscription & details"
              href="/profile"
            />
          </div>
        </section>
      </SignedIn>

      <section
        id="how-it-works"
        className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
      >
        <div className="max-w-2xl">
          <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-[#86868B]">
            How it works
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#1D1D1F] sm:text-4xl">
            Three calm steps to a better week of eating.
          </h2>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {STEPS.map((item) => (
            <article
              key={item.step}
              className="rounded-[28px] bg-white p-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04] transition hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(0,0,0,0.06)]"
            >
              <span className="font-display text-[13px] font-semibold tracking-[0.12em] text-[#34C759]">
                {item.step}
              </span>
              <h3 className="mt-4 font-display text-xl font-semibold tracking-tight text-[#1D1D1F]">
                {item.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#6E6E73]">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
        <div className="relative overflow-hidden rounded-[32px] bg-[#1D1D1F] px-8 py-14 text-center sm:px-12">
          <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-[#34C759]/25 blur-3xl" />
          <div className="absolute -right-8 bottom-0 h-40 w-40 rounded-full bg-[#5AC8FA]/20 blur-3xl" />
          <div className="relative">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Ready when you are.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-white/65">
              Build a week of meals that match your life — then come back to it
              anytime.
            </p>
            <div className="mt-8">
              <SignedOut>
                <Link
                  href="/sign-up"
                  className="inline-flex rounded-full bg-white px-6 py-3.5 text-[15px] font-semibold text-[#1D1D1F] transition hover:bg-[#F5F5F7]"
                >
                  Start free
                </Link>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/mealplan"
                  className="inline-flex rounded-full bg-white px-6 py-3.5 text-[15px] font-semibold text-[#1D1D1F] transition hover:bg-[#F5F5F7]"
                >
                  Go to meal plan
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatusCard({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string;
  hint: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-[24px] bg-white/90 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.04] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(0,0,0,0.07)]"
    >
      <p className="text-[12px] font-medium uppercase tracking-[0.1em] text-[#86868B]">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#1D1D1F]">
        {value}
      </p>
      <p className="mt-1 text-[13px] text-[#6E6E73]">{hint}</p>
    </Link>
  );
}
