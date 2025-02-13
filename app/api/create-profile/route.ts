import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser)
      return NextResponse.json(
        { error: "User not found in Clerk" },
        { status: 404 }
      );

    const email = clerkUser?.emailAddresses[0].emailAddress;
    if (!email)
      return NextResponse.json(
        { error: "User does not hava an email address" },
        { status: 400 }
      );

    const existingProfile = await prisma.profile.findUnique({
      where: { userId: clerkUser.id },
    });
    if (existingProfile)
      return NextResponse.json({ error: "Profile already exists" });

    await prisma.profile.create({
      data: {
        userId: clerkUser.id,
        email,
        subscriptionTier: null,
        stripeSubscriptionId: null,
        subscriptionActive: false,
      },
    });

    return NextResponse.json(
      { message: "Profile created successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Error" + error },
      { status: 500 }
    );
  }
}
