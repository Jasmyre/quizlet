import "@/styles/globals.css";

import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { env } from "@/env";
import { cn } from "@/lib/utils";
import { TRPCReactProvider } from "@/trpc/react";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const BASE_URL = env.BASE_URL ?? "http://localhost:3000";

const GOOGLE_SITE_VERIFICATION =
  env.GOOGLE_SITE_VERIFICATION ??
  "err:Environment_'GOOGLE_SITE_VERIFICATION'_Variable_Is_Not_Defined";

const SITE_NAME = "Quizlet";
const DEFAULT_TITLE = `Jazmyre | ${SITE_NAME}`;
const DEFAULT_DESCRIPTION =
  "Create and share flashcards with ease using Quizlet, the ultimate study tool.";
const DEFAULT_OG_IMAGE = "/thumbnail.png";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  applicationName: SITE_NAME,
  keywords: [
    "quizlet",
    "quizlet alternative",
    "quizlet clone",
    "quizlet app",
    "quizlet flashcards",
    "jazmyre quizlet",
    "jazmyre learning platform",
    "jazmyre flashcards",
    "jazmyre study app",
    "jazmyre quiz app",
    "jazmyre reviewer app",
    "online flashcards",
    "study flashcards",
    "flashcard app",
    "study app for students",
    "online quiz platform",
    "quiz maker online",
    "exam reviewer app",
    "learning platform",
    "study tools online",
    "ai flashcard generator",
    "create flashcards online",
    "multiple choice quiz maker",
    "spaced repetition app",
    "practice test generator",
    "interactive learning platform",
    "student productivity app",
    "exam preparation app",
    "best app for studying exams",
    "online reviewer for quizzes",
    "free online flashcard maker",
    "best quizlet alternative",
    "ai quiz generator",
    "ai study assistant",
    "generate flashcards from notes",
    "online reviewer app for students",
    "study smarter app",
    "memorization app",
    "self review platform",
    "student learning tools",
    "digital flashcards",
    "smart study platform",
  ],
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: new URL(BASE_URL),
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} preview image`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  other: {
    "google-site-verification": GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      className={cn(geist.variable, "font-sans", inter.variable)}
      lang="en"
      suppressHydrationWarning
    >
      <body className="bg-background">
        <TRPCReactProvider>
          <SessionProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              disableTransitionOnChange
              enableSystem
            >
              <TooltipProvider>
                {/* <NavigationBar
                  enableBlock
                  enableCrumbs={false}
                  navItems={navItems}
                  pageItems={pageItems}
                  title="Quizlet"
                /> */}
                {children}
              </TooltipProvider>
            </ThemeProvider>
          </SessionProvider>
        </TRPCReactProvider>
        <Analytics />
      </body>
    </html>
  );
}
