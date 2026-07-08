"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatMealText } from "@/lib/ai";

interface DailyMealPlan {
  breakfast?: string | { name?: string; description?: string; calories?: number };
  lunch?: string | { name?: string; description?: string; calories?: number };
  dinner?: string | { name?: string; description?: string; calories?: number };
  snacks?: string | { name?: string; description?: string; calories?: number };
}

interface WeeklyMealPlan {
  [day: string]: DailyMealPlan;
}

interface MealPlanPreferences {
  dietType: string;
  calories: number;
  allergies: string;
  cuisine: string;
  snacks: boolean;
}

interface SavedMealPlanResponse {
  id?: string;
  mealPlan: WeeklyMealPlan | null;
  preferences?: MealPlanPreferences;
  createdAt?: string;
  error?: string;
}

interface MealPlanInput {
  dietType: string;
  calories: number;
  allergies: string;
  cuisine: string;
  snacks: boolean;
  days?: number;
}

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const MEAL_META = [
  {
    key: "breakfast" as const,
    label: "Breakfast",
    emoji: "☕️",
    tint: "bg-[#FFF8EF] text-[#9A6700]",
  },
  {
    key: "lunch" as const,
    label: "Lunch",
    emoji: "🥗",
    tint: "bg-[#EFF8F1] text-[#1B7A3F]",
  },
  {
    key: "dinner" as const,
    label: "Dinner",
    emoji: "🍽",
    tint: "bg-[#EFF4FF] text-[#2B5BD7]",
  },
  {
    key: "snacks" as const,
    label: "Snacks",
    emoji: "🍎",
    tint: "bg-[#FBF0F5] text-[#B01E65]",
  },
];

const inputClassName =
  "mt-2 w-full rounded-2xl border-0 bg-[#F5F5F7] px-4 py-3.5 text-[15px] text-[#1D1D1F] outline-none ring-1 ring-black/[0.04] transition placeholder:text-[#86868B] focus:bg-white focus:ring-2 focus:ring-[#34C759]/40";

async function fetchSavedMealPlan(): Promise<SavedMealPlanResponse> {
  const response = await fetch("/api/mealplan");
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to load meal plan.");
  }
  return response.json();
}

export default function MealPlanDashboard() {
  const queryClient = useQueryClient();
  const [dietType, setDietType] = useState("");
  const [calories, setCalories] = useState(2000);
  const [allergies, setAllergies] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [snacks, setSnacks] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>(
    DAYS_OF_WEEK[new Date().getDay()]
  );
  const [prefsHydrated, setPrefsHydrated] = useState(false);

  const savedQuery = useQuery({
    queryKey: ["mealplan"],
    queryFn: fetchSavedMealPlan,
  });

  const mutation = useMutation<SavedMealPlanResponse, Error, MealPlanInput>({
    mutationFn: async (payload: MealPlanInput) => {
      const response = await fetch("/api/generate-mealplan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData: SavedMealPlanResponse = await response.json();
        throw new Error(errorData.error || "Failed to generate meal plan.");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["mealplan"], data);
      if (!data.mealPlan) return;
      const today = DAYS_OF_WEEK[new Date().getDay()];
      setSelectedDay(data.mealPlan[today] ? today : Object.keys(data.mealPlan)[0]);
    },
  });

  useEffect(() => {
    if (!savedQuery.data || prefsHydrated) return;

    const prefs = savedQuery.data.preferences;
    if (prefs) {
      setDietType(prefs.dietType);
      setCalories(prefs.calories);
      setAllergies(prefs.allergies);
      setCuisine(prefs.cuisine);
      setSnacks(prefs.snacks);
    }

    if (savedQuery.data.mealPlan) {
      const today = DAYS_OF_WEEK[new Date().getDay()];
      setSelectedDay(
        savedQuery.data.mealPlan[today]
          ? today
          : Object.keys(savedQuery.data.mealPlan)[0]
      );
    }

    setPrefsHydrated(true);
  }, [savedQuery.data, prefsHydrated]);

  const mealPlan = mutation.data?.mealPlan ?? savedQuery.data?.mealPlan ?? null;
  const createdAt = mutation.data?.createdAt ?? savedQuery.data?.createdAt;
  const displayCalories =
    mutation.data?.preferences?.calories ??
    savedQuery.data?.preferences?.calories ??
    calories;

  const orderedDays = useMemo(() => {
    if (!mealPlan) return [];
    return DAYS_OF_WEEK.filter((day) => Boolean(mealPlan[day]));
  }, [mealPlan]);

  const selectedPlan = mealPlan?.[selectedDay];
  const isLoadingSaved = savedQuery.isLoading && !mealPlan;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      dietType,
      calories,
      allergies,
      cuisine,
      snacks,
      days: 7,
    });
  };

  return (
    <div className="-mx-4 -mt-4 min-h-[calc(100vh-4rem)] bg-[#F5F5F7] px-4 pb-12 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 animate-[fadeUp_0.5s_ease-out]">
          <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-[#86868B]">
            Your week
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#1D1D1F] sm:text-4xl">
            Meal Plan
          </h1>
          <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-[#6E6E73]">
            Your latest plan is saved to your account. Generate again anytime to
            replace it.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="animate-[fadeUp_0.55s_ease-out] self-start rounded-[28px] bg-white/80 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04] backdrop-blur-xl lg:sticky lg:top-24">
            <div className="mb-6">
              <h2 className="font-display text-xl font-semibold tracking-tight text-[#1D1D1F]">
                Preferences
              </h2>
              <p className="mt-1 text-[13px] text-[#86868B]">
                {mealPlan
                  ? "Saved with your latest plan."
                  : "Used for the next generation."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Field label="Diet type" htmlFor="dietType">
                <input
                  id="dietType"
                  value={dietType}
                  onChange={(e) => setDietType(e.target.value)}
                  required
                  className={inputClassName}
                  placeholder="Vegetarian, keto, low carb…"
                />
              </Field>

              <Field label="Daily calories" htmlFor="calories">
                <input
                  id="calories"
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(Number(e.target.value))}
                  required
                  min={500}
                  max={5000}
                  className={inputClassName}
                  placeholder="2000"
                />
              </Field>

              <Field label="Allergies & restrictions" htmlFor="allergies">
                <input
                  id="allergies"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className={inputClassName}
                  placeholder="Dairy, nuts, gluten…"
                />
              </Field>

              <Field label="Cuisine" htmlFor="cuisine">
                <input
                  id="cuisine"
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  className={inputClassName}
                  placeholder="Brazilian, Italian, Mediterranean…"
                />
              </Field>

              <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-[#F5F5F7] px-4 py-3.5 ring-1 ring-black/[0.04]">
                <span className="text-[15px] text-[#1D1D1F]">Include snacks</span>
                <span className="relative inline-flex h-7 w-12 items-center">
                  <input
                    type="checkbox"
                    checked={snacks}
                    onChange={(e) => setSnacks(e.target.checked)}
                    className="peer sr-only"
                  />
                  <span className="absolute inset-0 rounded-full bg-[#E5E5EA] transition peer-checked:bg-[#34C759]" />
                  <span className="absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
                </span>
              </label>

              <button
                type="submit"
                disabled={mutation.isPending}
                className="group relative w-full overflow-hidden rounded-full bg-[#1D1D1F] px-5 py-3.5 text-[15px] font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-55"
              >
                <span className="relative z-10">
                  {mutation.isPending
                    ? "Generating your week…"
                    : mealPlan
                      ? "Regenerate meal plan"
                      : "Generate meal plan"}
                </span>
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition duration-700 group-hover:translate-x-full" />
              </button>
            </form>

            {mutation.isError && (
              <div className="mt-5 rounded-2xl bg-[#FFF2F2] px-4 py-3 text-[13px] leading-relaxed text-[#C41E3A] ring-1 ring-[#C41E3A]/10">
                <p>{mutation.error?.message || "Something went wrong."}</p>
                {mutation.error?.message?.includes("subscription") && (
                  <Link
                    href="/subscribe"
                    className="mt-2 inline-block font-medium text-[#1B7A3F] underline-offset-2 hover:underline"
                  >
                    View subscription plans
                  </Link>
                )}
              </div>
            )}
          </aside>

          <section className="animate-[fadeUp_0.65s_ease-out] min-w-0">
            {isLoadingSaved ? (
              <EmptyState isLoading label="Loading your saved plan…" />
            ) : !mealPlan ? (
              <EmptyState isLoading={mutation.isPending} />
            ) : (
              <div className="space-y-5">
                {createdAt && (
                  <p className="px-1 text-[13px] text-[#86868B]">
                    Saved {new Date(createdAt).toLocaleString()}
                  </p>
                )}

                <div className="rounded-[28px] bg-white/80 p-3 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04] backdrop-blur-xl sm:p-4">
                  <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {orderedDays.map((day) => {
                      const active = day === selectedDay;
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => setSelectedDay(day)}
                          className={`shrink-0 rounded-full px-4 py-2.5 text-[13px] font-semibold tracking-tight transition ${
                            active
                              ? "bg-[#1D1D1F] text-white shadow-sm"
                              : "bg-[#F5F5F7] text-[#6E6E73] hover:bg-[#EBEBEF] hover:text-[#1D1D1F]"
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-[28px] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04] sm:p-8">
                  <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[13px] font-medium text-[#86868B]">
                        Selected day
                      </p>
                      <h2 className="font-display text-3xl font-semibold tracking-tight text-[#1D1D1F]">
                        {selectedDay}
                      </h2>
                    </div>
                    <span className="rounded-full bg-[#EFF8F1] px-3 py-1.5 text-[12px] font-semibold text-[#1B7A3F]">
                      {displayCalories} kcal goal
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {MEAL_META.map((meal) => {
                      const value = formatMealText(selectedPlan?.[meal.key]);
                      if (!value) return null;
                      return (
                        <article
                          key={meal.key}
                          className="group rounded-[22px] bg-[#F5F5F7] p-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] hover:ring-1 hover:ring-black/[0.04]"
                        >
                          <div className="mb-3 flex items-center gap-2.5">
                            <span
                              className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm ${meal.tint}`}
                            >
                              {meal.emoji}
                            </span>
                            <h3 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#86868B]">
                              {meal.label}
                            </h3>
                          </div>
                          <p className="text-[15px] leading-relaxed text-[#1D1D1F]">
                            {value}
                          </p>
                        </article>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {orderedDays
                    .filter((day) => day !== selectedDay)
                    .map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setSelectedDay(day)}
                        className="rounded-[22px] bg-white/70 p-4 text-left shadow-[0_4px_18px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.04] transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_10px_28px_rgba(0,0,0,0.06)]"
                      >
                        <p className="text-[13px] font-semibold text-[#1D1D1F]">
                          {day}
                        </p>
                        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-[#6E6E73]">
                          {formatMealText(
                            mealPlan[day]?.lunch ||
                              mealPlan[day]?.dinner ||
                              mealPlan[day]?.breakfast
                          )}
                        </p>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-[13px] font-medium text-[#6E6E73]"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function EmptyState({
  isLoading,
  label,
}: {
  isLoading: boolean;
  label?: string;
}) {
  return (
    <div className="flex min-h-[480px] flex-col items-center justify-center rounded-[28px] bg-white/70 px-6 py-16 text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04] backdrop-blur-xl">
      <div className="mb-6 overflow-hidden rounded-[28px]">
        {isLoading ? (
          <div className="flex h-36 w-36 items-center justify-center bg-gradient-to-br from-[#34C759]/15 to-[#EFF8F1]">
            <span className="h-7 w-7 animate-spin rounded-full border-2 border-[#34C759]/30 border-t-[#34C759]" />
          </div>
        ) : (
          <Image
            src="/brand/empty-meals.png"
            alt=""
            width={160}
            height={160}
            className="h-40 w-40 object-cover"
          />
        )}
      </div>
      <h2 className="font-display text-2xl font-semibold tracking-tight text-[#1D1D1F]">
        {isLoading ? label || "Crafting your week" : "No plan yet"}
      </h2>
      <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-[#6E6E73]">
        {isLoading
          ? "This usually takes a few seconds. Hang tight."
          : "Fill in your preferences and generate a clean weekly plan. We’ll save it to your account."}
      </p>
    </div>
  );
}
