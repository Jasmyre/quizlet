import {
  ArrowDownToLine,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CloudUpload,
  FilePlus2,
  Gauge,
  Layers3,
  Link2,
  QrCode,
  Share2,
  Smartphone,
  Sparkles,
  WifiOff,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Feature {
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}

interface Step {
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  step: number;
  title: string;
}

const FEATURES: Feature[] = [
  {
    title: "Flashcards",
    description: "Build clean, memorable cards in seconds.",
    icon: Layers3,
  },
  {
    title: "Smart Quizzes",
    description: "Turn decks into adaptive quiz sessions.",
    icon: Sparkles,
  },
  {
    title: "Import Files",
    description: "Upload notes, PDFs, or docs and start fast.",
    icon: CloudUpload,
  },
  {
    title: "Social Sharing",
    description: "Share decks with classmates and study groups.",
    icon: Share2,
  },
  {
    title: "Progress Tracking",
    description: "See streaks, accuracy, and weak spots clearly.",
    icon: BarChart3,
  },
];

const STEPS: Step[] = [
  {
    step: 1,
    title: "Create or Import",
    description: "Add your content or upload notes in seconds.",
    icon: FilePlus2,
  },
  {
    step: 2,
    title: "Make Flashcards",
    description: "We help you turn your content into cards.",
    icon: Layers3,
  },
  {
    step: 3,
    title: "Take a Quiz",
    description: "Test yourself and get instant feedback.",
    icon: Sparkles,
  },
  {
    step: 4,
    title: "Track Progress",
    description: "See your stats and focus on what matters.",
    icon: Gauge,
  },
  {
    step: 5,
    title: "Share & Learn",
    description: "Share with others and learn together.",
    icon: Link2,
  },
];

const STATS = [
  { value: "50K+", label: "users" },
  { value: "200K+", label: "reviewers" },
  { value: "10M+", label: "cards" },
] as const;

const TRUST_BADGES = ["Works offline", "Fast", "Free"] as const;

const PWA_BENEFITS = [
  "Works offline",
  "Fast & lightweight",
  "Feels like native app",
] as const;

const INSTALL_HINTS = [
  "Tap browser share",
  "Select Add to Home Screen",
  "Tap Add and start studying",
] as const;

const FeatureCard = ({ feature }: { feature: Feature }) => {
  const Icon = feature.icon;

  return (
    <Card className="rounded-2xl border border-border/70 bg-card/95 shadow-sm">
      <CardContent className="space-y-3 p-5 text-center">
        <div className="mx-auto inline-flex rounded-xl border border-primary/15 bg-primary/5 p-2.5 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="font-semibold text-base text-foreground">
          {feature.title}
        </h3>
        <p className="text-muted-foreground text-sm">{feature.description}</p>
      </CardContent>
    </Card>
  );
};

const TrustBadge = ({ label }: { label: string }) => (
  <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/90 px-3 py-1.5 text-slate-600 text-xs">
    <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
    <span>{label}</span>
  </div>
);

const StatItem = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1">
    <p className="font-semibold text-3xl text-white tracking-tight">{value}</p>
    <p className="text-blue-100/80 text-sm">{label}</p>
  </div>
);

const StepItem = ({ step }: { step: Step }) => {
  const Icon = step.icon;
  return (
    <div className="relative flex flex-col items-center text-center">
      <div className="z-10 mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-primary/20 bg-blue-100 font-semibold text-primary text-xs dark:bg-blue-100">
        {step.step}
      </div>
      <div className="w-full max-w-44 rounded-2xl border border-border/70 bg-card px-4 py-4 shadow-xs">
        <div className="mx-auto mb-2 inline-flex rounded-lg bg-muted p-2 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <p className="font-semibold text-sm">{step.title}</p>
        <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
          {step.description}
        </p>
      </div>
    </div>
  );
};

const StepConnector = () => (
  <div className="pointer-events-none absolute top-4 right-0 left-1/2 hidden border-blue-200 border-t border-dashed sm:block" />
);

const StepItemWrap = ({ isLast, step }: { isLast: boolean; step: Step }) => (
  <div className="relative">
    {isLast ? null : <StepConnector />}
    <StepItem step={step} />
  </div>
);

const InstallHintItem = ({ hint, index }: { hint: string; index: number }) => (
  <li className="flex items-center gap-3 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white/90">
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[11px]">
      {index + 1}
    </span>
    {hint}
  </li>
);

export default function LandingPage() {
  return (
    <main className="bg-linear-to-b from-background via-muted/25 to-background px-4 py-5 md:px-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 rounded-3xl border border-border/60 bg-background/80 p-3 shadow-lg backdrop-blur-sm md:p-5">
        <section className="light relative overflow-hidden rounded-3xl border border-blue-200 bg-linear-to-br from-blue-100 via-white to-blue-200/60 p-5 text-slate-900 shadow-sm md:p-8">
          <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-blue-300/40 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-blue-200/35 blur-3xl" />
          <div className="absolute inset-0 bg-white/30" />

          <div className="relative grid gap-7 md:grid-cols-[1.05fr_0.95fr] md:items-center">
            <div className="space-y-5">
              <p className="inline-flex items-center gap-2 rounded-full border border-blue-300 bg-white/90 px-3 py-1 text-blue-700 text-xs">
                <Smartphone className="h-3.5 w-3.5" />
                PWA-first study platform
              </p>
              <div className="space-y-3">
                <h1 className="font-semibold text-4xl text-slate-900 leading-tight tracking-tight md:text-5xl">
                  Study Smarter.
                  <span className="block text-blue-600">
                    For Free, Forever.
                  </span>
                </h1>
                <p className="max-w-xl text-base text-slate-600 md:text-lg">
                  Create flashcards, take smart quizzes, and learn anywhere. No
                  paywalls. Built mobile-first so it feels native from day one.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="h-10 rounded-x" size="lg">
                  <Link href="#">
                    <ArrowDownToLine className="h-4 w-4" />
                    Install App (PWA)
                  </Link>
                </Button>
                <Button
                  asChild
                  className="h-10 rounded-xl border border-blue-200 bg-white px-5 text-slate-800 shadow-xs hover:bg-blue-50"
                  size="lg"
                  variant="outline"
                >
                  <Link href="#">
                    Start in Browser
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRUST_BADGES.map((badge) => (
                  <TrustBadge key={badge} label={badge} />
                ))}
              </div>
            </div>

            <div className="relative flex justify-center md:justify-end">
              <div className="relative w-full max-w-[320px] rounded-4xl border border-blue-200 bg-white p-2 shadow-xl">
                <div className="absolute top-8 -left-8 h-28 w-28 rounded-full bg-blue-200/50 blur-2xl" />
                <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white">
                  <Image
                    alt="Study app mobile preview with flashcards and quiz interface"
                    className="h-auto w-full object-cover"
                    height={880}
                    priority
                    src="/assets/prototype.png"
                    width={620}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-border/60 bg-background p-4 md:p-6">
          <div className="space-y-1 text-center">
            <h2 className="font-semibold text-2xl tracking-tight">
              Everything you need to learn better
            </h2>
            <p className="text-muted-foreground text-sm">
              Compact tools for focused, consistent study sessions.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {FEATURES.map((feature) => (
              <FeatureCard feature={feature} key={feature.title} />
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-linear-to-br from-[#031742] via-[#042463] to-[#05318a] p-4 text-white shadow-lg md:p-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="grid gap-4 sm:grid-cols-3">
              {STATS.map((stat) => (
                <StatItem
                  key={stat.label}
                  label={stat.label}
                  value={stat.value}
                />
              ))}
            </div>
            <Card className="rounded-2xl border-white/20 bg-white/8 text-white shadow-lg backdrop-blur-sm">
              <CardContent className="space-y-3 p-5">
                <p className="text-blue-100 text-sm leading-relaxed">
                  “I switched from paid tools and never looked back. Fast,
                  simple, and perfect on mobile.”
                </p>
                <div>
                  <p className="font-medium text-sm">Sara J.</p>
                  <p className="text-blue-100/80 text-xs">University student</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-border/60 bg-background p-4 md:p-6">
          <div className="text-center">
            <h2 className="font-semibold text-2xl tracking-tight">
              How it works
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-5">
            {STEPS.map((step, index) => (
              <StepItemWrap
                isLast={index === STEPS.length - 1}
                key={step.step}
                step={step}
              />
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-linear-to-r from-primary via-blue-600 to-blue-500 p-4 text-white shadow-xl md:p-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
            <div className="space-y-4">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs">
                <WifiOff className="h-3.5 w-3.5" />
                PWA install ready
              </p>
              <div className="space-y-2">
                <h2 className="font-semibold text-3xl leading-tight tracking-tight">
                  Install the App. Study Anywhere.
                </h2>
                <p className="max-w-lg text-blue-100">
                  Add it to your home screen for an offline-friendly,
                  native-feel study experience on iOS and Android.
                </p>
              </div>
              <ul className="grid gap-2 sm:grid-cols-3">
                {PWA_BENEFITS.map((benefit) => (
                  <li
                    className="rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-sm"
                    key={benefit}
                  >
                    {benefit}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  asChild
                  className="h-10 rounded-xl bg-white px-5 font-semibold text-blue-700 hover:bg-blue-50"
                  size="lg"
                >
                  <Link href="#">
                    <ArrowDownToLine className="h-4 w-4" />
                    Install Now
                  </Link>
                </Button>
                <div className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-blue-50 text-sm">
                  <QrCode className="h-4 w-4" />
                  Scan for install guide
                </div>
              </div>
            </div>
            <div className="grid gap-3 self-end">
              <Card className="rounded-2xl border-white/25 bg-white/10 text-white shadow-md backdrop-blur-sm">
                <CardContent className="space-y-3 p-4">
                  <p className="font-medium text-sm">
                    Install in 3 simple steps
                  </p>
                  <ol className="space-y-2">
                    {INSTALL_HINTS.map((hint, index) => (
                      <InstallHintItem hint={hint} index={index} key={hint} />
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
