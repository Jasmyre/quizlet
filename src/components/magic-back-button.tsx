"use client";

import { Slot } from "@radix-ui/react-slot";
import type { VariantProps } from "class-variance-authority";
import { useRouter } from "next/navigation";
import { usePageTrackerStore } from "react-page-tracker";
import {
  getCurrentHostname,
  getCurrentOrigin,
  navigateTo,
} from "@/lib/magic-back-button";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";

const hostnameFromUrl = (url?: string) => {
  try {
    if (!url) {
      return "";
    }
    // use getCurrentOrigin() so tests (and server) behave the same way
    return new URL(url, getCurrentOrigin() || undefined).hostname;
  } catch {
    return "";
  }
};

export type MagicBackButtonProps = {
  backLink?: string;
  fallbackPath?: string;
  className?: string;
  ariaLabel?: string;
  asChild?: boolean;
  children?: React.ReactNode;
  disabled?: boolean;
} & VariantProps<typeof buttonVariants>;

export function MagicBackButton({
  backLink,
  fallbackPath,
  className,
  disabled = false,
  ariaLabel = "Go back",
  asChild = false,
  children,
  variant = "outline",
  size = "sm",
}: MagicBackButtonProps) {
  const router = useRouter();

  const trackerStore = usePageTrackerStore((s) => s);
  const referrerFromTracker: string = trackerStore?.referrer ?? "";

  const handleClick = () => {
    // 1) explicit backlink -> go there
    if (backLink) {
      try {
        const candidate = new URL(backLink, getCurrentOrigin());
        if (candidate.origin === getCurrentOrigin()) {
          router.push(candidate.pathname + candidate.search + candidate.hash);
        } else {
          // use navigateTo helper instead of direct window.location.assign
          navigateTo(candidate.toString());
        }
      } catch {
        router.push(backLink);
      }
      return;
    }

    // 2) determine previous url from multiple sources
    const refFromTracker = referrerFromTracker;
    const refFromDocument =
      typeof document === "undefined" ? "" : document.referrer;
    const refFromSession =
      typeof sessionStorage === "undefined"
        ? ""
        : (sessionStorage.getItem("prevPath") ?? "");

    const lastUrl = refFromTracker || refFromDocument || refFromSession || "";
    const lastHostname = hostnameFromUrl(lastUrl);
    const currentHostname = getCurrentHostname();

    if (lastHostname && lastHostname === currentHostname) {
      router.back();
      return;
    }

    // Otherwise redirect to fallback (default '/')
    const fallback = fallbackPath ?? "/";
    try {
      // USE getCurrentOrigin() as base here too
      const maybeUrl = new URL(fallback, getCurrentOrigin());
      if (maybeUrl.origin === getCurrentOrigin()) {
        router.push(maybeUrl.pathname + maybeUrl.search + maybeUrl.hash);
      } else {
        // use navigateTo here too
        navigateTo(maybeUrl.toString());
      }
    } catch {
      router.push(fallback);
    }
  };

  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      aria-label={ariaLabel}
      className={cn(buttonVariants({ variant, size, className }))}
      data-slot="button"
      disabled={disabled}
      onClick={handleClick}
      type={Comp === "button" ? "button" : undefined}
    >
      <svg
        aria-hidden="true"
        fill="none"
        focusable="false"
        height="18"
        viewBox="0 0 24 24"
        width="18"
      >
        <path
          d="M15 6L9 12l6 6"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
      <span className="hidden sm:inline">{children ?? "Back"}</span>
    </Comp>
  );
}

export default MagicBackButton;
