"use client";

import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { availablePlans } from "@/lib/plans";
import toast from "react-hot-toast";

type SubscribeResponse = {
  url: string;
};

type SubscribeError = {
  error: string;
};

const subscribeToPlan = async ({
  planType,
}: {
  planType: string;
}): Promise<SubscribeResponse> => {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ planType }),
  });

  if (!res.ok) {
    const errorData: SubscribeError = await res.json();
    throw new Error(errorData.error || "Something went wrong.");
  }

  return res.json();
};

export default function SubscribePage() {
  const { user } = useUser();
  const router = useRouter();
  const userId = user?.id;

  const mutation = useMutation<SubscribeResponse, Error, { planType: string }>({
    mutationFn: async ({ planType }) => {
      if (!userId) {
        throw new Error("User not signed in.");
      }
      return subscribeToPlan({ planType });
    },
    onMutate: () => {
      toast.loading("Processing your subscription...", { id: "subscribe" });
    },
    onSuccess: (data) => {
      toast.success("Redirecting to checkout!", { id: "subscribe" });
      window.location.href = data.url;
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong.", {
        id: "subscribe",
      });
    },
  });

  const handleSubscribe = (planType: string) => {
    if (!userId) {
      router.push("/sign-up");
      return;
    }
    mutation.mutate({ planType });
  };

  return (
    <div className="-mx-4 -mt-4 min-h-[calc(100vh-4rem)] bg-[#F5F5F7] px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mx-auto max-w-2xl text-center">
          <div className="mb-5 flex justify-center">
            <Image
              src="/brand/logo-mark.svg"
              alt=""
              width={40}
              height={40}
              className="rounded-[10px]"
            />
          </div>
          <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-[#86868B]">
            Pricing
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-[#1D1D1F] sm:text-5xl">
            Simple plans. Clear meals.
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-[#6E6E73]">
            Start weekly, or go monthly or yearly when you’re ready. Cancel
            anytime.
          </p>
        </header>

        <div className="relative mx-auto mt-10 h-40 max-w-3xl overflow-hidden rounded-[28px] ring-1 ring-black/[0.04] sm:h-52">
          <Image
            src="/brand/hero-food.png"
            alt="Healthy weekly meals"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F5F5F7]/40 to-transparent" />
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {availablePlans.map((plan) => {
            const popular = Boolean(plan.isPopular);
            return (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-[28px] p-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 transition hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(0,0,0,0.07)] ${
                  popular
                    ? "bg-[#1D1D1F] text-white ring-black"
                    : "bg-white text-[#1D1D1F] ring-black/[0.04]"
                }`}
              >
                {popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#34C759] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white">
                    Most popular
                  </span>
                )}

                <div className="flex-1">
                  <h3 className="font-display text-xl font-semibold tracking-tight">
                    {plan.name}
                  </h3>
                  <p className="mt-4 flex items-baseline gap-1">
                    <span className="font-display text-5xl font-semibold tracking-tight">
                      ${plan.amount}
                    </span>
                    <span
                      className={`text-[15px] ${
                        popular ? "text-white/55" : "text-[#86868B]"
                      }`}
                    >
                      /{plan.interval}
                    </span>
                  </p>
                  <p
                    className={`mt-5 text-[15px] leading-relaxed ${
                      popular ? "text-white/65" : "text-[#6E6E73]"
                    }`}
                  >
                    {plan.description}
                  </p>

                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <span
                          className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                            popular
                              ? "bg-[#34C759] text-white"
                              : "bg-[#EFF8F1] text-[#1B7A3F]"
                          }`}
                        >
                          ✓
                        </span>
                        <span
                          className={`text-[14px] leading-snug ${
                            popular ? "text-white/85" : "text-[#1D1D1F]"
                          }`}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleSubscribe(plan.interval)}
                  disabled={mutation.isPending}
                  className={`mt-8 w-full rounded-full py-3.5 text-[15px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-55 ${
                    popular
                      ? "bg-white text-[#1D1D1F] hover:bg-[#F5F5F7]"
                      : "bg-[#1D1D1F] text-white hover:bg-black"
                  }`}
                >
                  {mutation.isPending
                    ? "Please wait…"
                    : `Subscribe ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
