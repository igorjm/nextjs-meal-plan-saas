"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

interface ProfileData {
  name: string;
  email: string;
  imageUrl: string;
  subscriptionActive: boolean;
  subscriptionTier: string | null;
  createdAt: string;
}

async function fetchProfile(): Promise<ProfileData> {
  const res = await fetch("/api/profile");
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to load profile.");
  }
  return res.json();
}

export default function ProfilePage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center text-[15px] text-[#86868B]">
        Loading profile…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center text-[15px] text-[#C41E3A]">
        {error?.message || "Could not load profile."}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <header className="mb-8">
        <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-[#86868B]">
          Account
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#1D1D1F] sm:text-4xl">
          Your Profile
        </h1>
      </header>

      <div className="rounded-[28px] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04] sm:p-8">
        <div className="flex items-center gap-4">
          {data.imageUrl ? (
            <Image
              src={data.imageUrl}
              alt={data.name}
              width={64}
              height={64}
              className="rounded-full ring-1 ring-black/[0.08]"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-[#E5E5EA]" />
          )}
          <div>
            <p className="font-display text-xl font-semibold tracking-tight text-[#1D1D1F]">
              {data.name}
            </p>
            <p className="text-[15px] text-[#6E6E73]">{data.email}</p>
          </div>
        </div>

        <div className="mt-8 border-t border-black/[0.06] pt-6">
          <h2 className="text-[13px] font-medium uppercase tracking-[0.08em] text-[#86868B]">
            Subscription
          </h2>
          {data.subscriptionActive ? (
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#34C759]" />
              <span className="text-[15px] font-medium text-[#1B7A3F]">
                Active — {data.subscriptionTier ?? "Premium"} plan
              </span>
            </div>
          ) : (
            <div className="mt-3 space-y-4">
              <p className="text-[15px] text-[#6E6E73]">No active subscription.</p>
              <Link
                href="/subscribe"
                className="inline-flex rounded-full bg-[#1D1D1F] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-black"
              >
                View plans
              </Link>
            </div>
          )}
        </div>

        <div className="mt-8 border-t border-black/[0.06] pt-4 text-[13px] text-[#86868B]">
          Member since {new Date(data.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
