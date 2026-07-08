import Image from "next/image";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="-mx-4 -mt-4 flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-[#F5F5F7] px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2.5">
        <Image
          src="/brand/logo-mark.svg"
          alt="MealPlan AI"
          width={36}
          height={36}
          className="rounded-[9px]"
        />
        <span className="font-display text-lg font-semibold tracking-tight text-[#1D1D1F]">
          MealPlan AI
        </span>
      </Link>
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.06)]",
          },
        }}
        forceRedirectUrl="/mealplan"
        signUpUrl="/sign-up"
      />
    </div>
  );
}
