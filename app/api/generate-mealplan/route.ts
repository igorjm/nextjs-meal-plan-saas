import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { generateMealPlan, MealPlanInput } from "@/lib/ai";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: clerkUser.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found. Please sign in again." },
        { status: 404 }
      );
    }

    if (!profile.subscriptionActive) {
      return NextResponse.json(
        {
          error:
            "An active subscription is required. Please subscribe to generate meal plans.",
        },
        { status: 403 }
      );
    }

    const body = (await request.json()) as MealPlanInput;

    if (!body.dietType || !body.calories) {
      return NextResponse.json(
        { error: "Diet type and calories are required." },
        { status: 400 }
      );
    }

    const mealPlan = await generateMealPlan(body);

    const saved = await prisma.mealPlan.create({
      data: {
        profileId: profile.id,
        dietType: body.dietType,
        calories: body.calories,
        allergies: body.allergies || null,
        cuisine: body.cuisine || null,
        snacks: Boolean(body.snacks),
        planData: mealPlan,
      },
    });

    return NextResponse.json({
      id: saved.id,
      mealPlan,
      preferences: {
        dietType: saved.dietType,
        calories: saved.calories,
        allergies: saved.allergies ?? "",
        cuisine: saved.cuisine ?? "",
        snacks: saved.snacks,
      },
      createdAt: saved.createdAt,
    });
  } catch (error) {
    console.error("Generate meal plan error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate meal plan.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
