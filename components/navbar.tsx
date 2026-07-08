"use client";

import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, SignOutButton, useUser } from "@clerk/nextjs";

export default function NavBar() {
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    return (
      <nav className="fixed inset-x-0 top-0 z-50 h-14 border-b border-black/[0.04] bg-white/70 backdrop-blur-xl" />
    );
  }

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-black/[0.04] bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 transition hover:opacity-70"
        >
          <Image
            src="/brand/logo-mark.svg"
            alt=""
            width={28}
            height={28}
            className="rounded-[7px]"
          />
          <span className="font-display text-[17px] font-semibold tracking-tight text-[#1D1D1F]">
            MealPlan AI
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <SignedIn>
            <Link
              href="/mealplan"
              className="rounded-full px-3 py-1.5 text-[13px] font-medium text-[#6E6E73] transition hover:bg-black/[0.04] hover:text-[#1D1D1F]"
            >
              Meal plan
            </Link>
            <Link
              href="/profile"
              className="rounded-full p-1 transition hover:bg-black/[0.04]"
            >
              {user?.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full ring-1 ring-black/[0.08]"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-[#E5E5EA]" />
              )}
            </Link>
            <SignOutButton>
              <button className="ml-1 rounded-full bg-[#1D1D1F] px-3.5 py-1.5 text-[13px] font-semibold text-white transition hover:bg-black">
                Sign out
              </button>
            </SignOutButton>
          </SignedIn>

          <SignedOut>
            <Link
              href="/"
              className="rounded-full px-3 py-1.5 text-[13px] font-medium text-[#6E6E73] transition hover:bg-black/[0.04] hover:text-[#1D1D1F]"
            >
              Home
            </Link>
            <Link
              href="/subscribe"
              className="rounded-full px-3 py-1.5 text-[13px] font-medium text-[#6E6E73] transition hover:bg-black/[0.04] hover:text-[#1D1D1F]"
            >
              Subscribe
            </Link>
            <Link
              href="/sign-in"
              className="rounded-full px-3 py-1.5 text-[13px] font-medium text-[#6E6E73] transition hover:bg-black/[0.04] hover:text-[#1D1D1F]"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-full bg-[#1D1D1F] px-3.5 py-1.5 text-[13px] font-semibold text-white transition hover:bg-black"
            >
              Sign up
            </Link>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
}
