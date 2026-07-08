import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import CreateProfileOnSignIn from "@/components/create-profile";
import { ClerkProvider } from "@clerk/nextjs";
import { ReactQueryClientProvider } from "@/components/react-query-client-provider";
import { Toaster } from "react-hot-toast";

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MealPlan AI",
    template: "%s · MealPlan AI",
  },
  description: "Personalized weekly meal plans with AI",
  icons: {
    icon: [
      { url: "/brand/logo-mark.svg", type: "image/svg+xml" },
      { url: "/brand/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/brand/icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/brand/logo-mark.svg",
  },
  openGraph: {
    title: "MealPlan AI",
    description: "Personalized weekly meal plans with AI",
    images: [
      {
        url: "/brand/hero-food.png",
        width: 1200,
        height: 630,
        alt: "Fresh healthy meal prep",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MealPlan AI",
    description: "Personalized weekly meal plans with AI",
    images: ["/brand/hero-food.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] antialiased">
        <ReactQueryClientProvider>
          <ClerkProvider>
            <CreateProfileOnSignIn />
            <Navbar />
            <Toaster
              position="top-right"
              toastOptions={{ style: { borderRadius: 16 } }}
            />
            <main className="mx-auto min-h-screen max-w-6xl px-4 pb-10 pt-20 sm:px-6 lg:px-8">
              {children}
            </main>
          </ClerkProvider>
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}
