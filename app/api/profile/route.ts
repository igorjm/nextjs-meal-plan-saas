import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: clerkUser.id },
      select: {
        email: true,
        subscriptionActive: true,
        subscriptionTier: true,
        createdAt: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...profile,
      name:
        clerkUser.fullName ??
        clerkUser.username ??
        clerkUser.firstName ??
        "User",
      imageUrl: clerkUser.imageUrl,
    });
  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile." },
      { status: 500 }
    );
  }
}
