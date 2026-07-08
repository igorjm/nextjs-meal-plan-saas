import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeWeeklyMealPlan } from "@/lib/ai";

export async function GET() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: clerkUser.id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const saved = await prisma.mealPlan.findFirst({
      where: { profileId: profile.id },
      orderBy: { createdAt: "desc" },
    });

    if (!saved) {
      return NextResponse.json({ mealPlan: null });
    }

    return NextResponse.json({
      id: saved.id,
      mealPlan: normalizeWeeklyMealPlan(
        saved.planData as Parameters<typeof normalizeWeeklyMealPlan>[0]
      ),
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
    console.error("Fetch meal plan error:", error);
    return NextResponse.json(
      { error: "Failed to fetch meal plan." },
      { status: 500 }
    );
  }
}
