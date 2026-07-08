export interface DailyMealPlan {
  breakfast?: string;
  lunch?: string;
  dinner?: string;
  snacks?: string;
}

export interface WeeklyMealPlan {
  [day: string]: DailyMealPlan;
}

export interface MealPlanInput {
  dietType: string;
  calories: number;
  allergies: string;
  cuisine: string;
  snacks: boolean;
  days?: number;
}

type RawMeal =
  | string
  | {
      name?: string;
      description?: string;
      calories?: number | string;
      title?: string;
    }
  | null
  | undefined;

type RawDailyMealPlan = {
  breakfast?: RawMeal;
  lunch?: RawMeal;
  dinner?: RawMeal;
  snacks?: RawMeal;
};

type RawWeeklyMealPlan = {
  [day: string]: RawDailyMealPlan;
};

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function formatMealText(meal: RawMeal): string {
  if (!meal) return "";
  if (typeof meal === "string") return meal.trim();

  const name = meal.name || meal.title || "";
  const description = meal.description || "";
  const calories =
    meal.calories !== undefined && meal.calories !== null
      ? `${meal.calories} kcal`
      : "";

  return [name, description, calories].filter(Boolean).join(" — ");
}

export function normalizeWeeklyMealPlan(
  mealPlan: RawWeeklyMealPlan
): WeeklyMealPlan {
  const normalized: WeeklyMealPlan = {};

  for (const [day, daily] of Object.entries(mealPlan || {})) {
    if (!daily || typeof daily !== "object") continue;

    normalized[day] = {
      breakfast: formatMealText(daily.breakfast) || undefined,
      lunch: formatMealText(daily.lunch) || undefined,
      dinner: formatMealText(daily.dinner) || undefined,
      snacks: formatMealText(daily.snacks) || undefined,
    };
  }

  return normalized;
}

function buildPrompt(input: MealPlanInput): string {
  const days = input.days ?? 7;
  const snackLine = input.snacks
    ? 'Include a "snacks" string field for each day.'
    : 'Do not include a "snacks" field.';

  return `You are a professional nutritionist. Create a ${days}-day meal plan as JSON only.

Requirements:
- Diet type: ${input.dietType}
- Daily calorie target: ${input.calories}
- Allergies/restrictions: ${input.allergies || "None"}
- Preferred cuisine: ${input.cuisine || "No preference"}
- ${snackLine}

Write all meal names and descriptions in English.
IMPORTANT: breakfast, lunch, dinner, and snacks MUST be plain strings (not objects).
Return ONLY valid JSON in this exact shape (no markdown, no explanation):
{
  "mealPlan": {
    "Sunday": { "breakfast": "Oatmeal with berries", "lunch": "...", "dinner": "..." },
    "Monday": { "breakfast": "...", "lunch": "...", "dinner": "..." }
  }
}

Use these day names: ${DAYS.slice(0, days).join(", ")}.
Keep each meal string concise (under 60 characters).
Do not use quotation marks inside meal names. Use plain ASCII apostrophes only if needed.
Ensure the JSON is complete and valid.`;
}

function extractJsonObject(content: string): string {
  const withoutFences = content
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  const start = withoutFences.indexOf("{");
  const end = withoutFences.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI response did not include a JSON object.");
  }

  return withoutFences.slice(start, end + 1);
}

function parseMealPlanResponse(content: string): WeeklyMealPlan {
  const jsonText = extractJsonObject(content);

  let parsed: { mealPlan?: RawWeeklyMealPlan };
  try {
    parsed = JSON.parse(jsonText) as { mealPlan?: RawWeeklyMealPlan };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid JSON from AI.";
    throw new Error(
      `Could not parse meal plan JSON (${message}). Please try generating again.`
    );
  }

  if (!parsed.mealPlan || typeof parsed.mealPlan !== "object") {
    throw new Error("AI response missing mealPlan object.");
  }

  return normalizeWeeklyMealPlan(parsed.mealPlan);
}

export async function generateMealPlan(
  input: MealPlanInput
): Promise<WeeklyMealPlan> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }

  const model =
    process.env.OPENROUTER_MODEL ?? "google/gemini-2.5-flash";

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
      "X-Title": "AI Meal Plans",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: buildPrompt(input) }],
      temperature: 0.4,
      max_tokens: 2500,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${errorText}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("No content returned from AI.");
  }

  return parseMealPlanResponse(content);
}
