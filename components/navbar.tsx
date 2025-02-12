"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { SignedIn, SignedOut, SignOutButton, useUser } from "@clerk/nextjs";

function Navbar() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) return <p>Loading...</p>;

  return (
    <nav>
      {""}
      <div>
        <Link href="/">
          <Image src="/logo.png" width={60} height={60} alt="Logo" />
        </Link>
      </div>
      <div>
        <SignedIn>
          <Link href=""> MealPlan</Link>
          {user?.imageUrl ? (
            <Link href="/profile">
              <Image
                src={user.imageUrl}
                width={40}
                height={40}
                alt="Profile Picture"
              />
            </Link>
          ) : (
            <div></div>
          )}
          <SignOutButton>
            <button>Sign Out</button>
          </SignOutButton>
        </SignedIn>
        <SignedOut></SignedOut>
      </div>
    </nav>
  );
}

export default Navbar;
