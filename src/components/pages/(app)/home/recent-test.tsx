"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RecentTest {
  id: string;
  setTitle: string;
}

const recentTests = [
  {
    id: "globalization-ethics-test",
    setTitle:
      "Globalization, Ethics, and Generational Perspectives in Social Sciences",
  },
  {
    id: "rotc-prefinal-test",
    setTitle: "rotc prefinal",
  },
  {
    id: "biology-cell-structure-test",
    setTitle: "Biology: Cell Structure and Function",
  },
] satisfies RecentTest[];

const scrollEdgeTolerance = 18;
const scrollStateSettleDelay = 350;

export function RecentTestSlider() {
  const sliderRef = useRef<HTMLUListElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const getSliderMetrics = useCallback(() => {
    const slider = sliderRef.current;

    if (!slider) {
      return null;
    }

    const firstCard = slider.firstElementChild;

    if (!(firstCard instanceof HTMLElement)) {
      return null;
    }

    const cardWidth = firstCard.offsetWidth;
    const gap = Number.parseFloat(getComputedStyle(slider).columnGap) || 0;
    const itemWidth = cardWidth + gap;

    const currentScrollLeft = Math.max(0, slider.scrollLeft);

    const nextIndex = Math.round(currentScrollLeft / itemWidth);

    const activeCardIndex = Math.max(
      0,
      Math.min(nextIndex, recentTests.length - 1)
    );

    const maxScrollLeft = Math.max(0, slider.scrollWidth - slider.clientWidth);

    return {
      activeCardIndex,
      currentScrollLeft,
      maxScrollLeft,
      slider,
    };
  }, []);

  const updateSliderState = useCallback(() => {
    const metrics = getSliderMetrics();

    if (!metrics) {
      return;
    }

    const { activeCardIndex, currentScrollLeft, maxScrollLeft } = metrics;

    const isAtStart = currentScrollLeft <= scrollEdgeTolerance;

    const isAtEnd = currentScrollLeft >= maxScrollLeft - scrollEdgeTolerance;

    setActiveIndex(activeCardIndex);
    setCanScrollLeft(!isAtStart);
    setCanScrollRight(!isAtEnd);
  }, [getSliderMetrics]);

  const scrollToTest = (index: number) => {
    const slider = sliderRef.current;

    const targetIndex = Math.max(0, Math.min(index, recentTests.length - 1));

    const target = slider?.children.item(targetIndex);

    if (!(slider && target instanceof HTMLElement)) {
      return;
    }

    const firstCard = slider.firstElementChild;

    if (!(firstCard instanceof HTMLElement)) {
      return;
    }

    slider.scrollTo({
      behavior: "smooth",
      left: target.offsetLeft - firstCard.offsetLeft,
    });

    setActiveIndex(targetIndex);

    window.requestAnimationFrame(updateSliderState);

    window.setTimeout(updateSliderState, scrollStateSettleDelay);
  };

  const scrollNext = () => {
    const metrics = getSliderMetrics();

    if (!metrics) {
      return;
    }

    scrollToTest(metrics.activeCardIndex + 1);
  };

  const scrollPrevious = () => {
    const metrics = getSliderMetrics();

    if (!metrics) {
      return;
    }

    scrollToTest(metrics.activeCardIndex - 1);
  };

  useEffect(() => {
    const slider = sliderRef.current;

    if (!slider) {
      return;
    }

    updateSliderState();

    slider.addEventListener("scroll", updateSliderState, {
      passive: true,
    });

    window.addEventListener("resize", updateSliderState);

    return () => {
      slider.removeEventListener("scroll", updateSliderState);

      window.removeEventListener("resize", updateSliderState);
    };
  }, [updateSliderState]);

  return (
    <section className="flex flex-col gap-4 px-4 pb-8">
      <h2 className="font-heading font-semibold text-2xl tracking-tight">
        Jump back in
      </h2>

      <div className="relative px-4">
        {canScrollLeft && (
          <Button
            aria-label="Scroll to previous tests"
            className="absolute top-1/2 left-0 z-20 -translate-y-1/2 rounded-full shadow-md active:not-aria-[haspopup]:-translate-y-1/2 max-sm:hidden"
            onClick={scrollPrevious}
            size="icon-lg"
            type="button"
            variant="secondary"
          >
            <ChevronLeftIcon />
          </Button>
        )}

        <ul
          aria-label="Recent tests"
          className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          ref={sliderRef}
        >
          {recentTests.map((test) => (
            <li
              className="min-h-44 w-[min(40rem,calc(100vw-2rem))] shrink-0 snap-start sm:w-[min(40rem,calc(100vw-8rem))]"
              key={test.id}
            >
              <article className="relative flex h-full min-h-44 overflow-hidden rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
                <div className="relative z-10 flex max-w-md flex-col items-start justify-between gap-7">
                  <h3 className="line-clamp-2 font-heading font-semibold text-xl leading-snug">
                    {test.setTitle}
                  </h3>

                  <Button className="rounded-full px-5" size="lg" type="button">
                    Start another test
                  </Button>
                </div>

                <StudyArt />
              </article>
            </li>
          ))}
        </ul>

        {canScrollRight && (
          <Button
            aria-label="Scroll to next tests"
            className="absolute top-1/2 right-0 z-20 -translate-y-1/2 rounded-full shadow-md active:not-aria-[haspopup]:-translate-y-1/2 max-sm:hidden"
            onClick={scrollNext}
            size="icon-lg"
            type="button"
            variant="secondary"
          >
            <ChevronRightIcon />
          </Button>
        )}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-4 bg-linear-to-r from-transparent to-background" />
      </div>

      <div className="flex justify-center gap-2" role="presentation">
        {recentTests.map((test, index) => (
          <button
            aria-label={`Show ${test.setTitle}`}
            className={cn(
              "size-2 rounded-full bg-muted transition-colors",
              activeIndex === index && "bg-primary"
            )}
            key={test.id}
            onClick={() => scrollToTest(index)}
            type="button"
          />
        ))}
      </div>
    </section>
  );
}

function StudyArt() {
  return (
    <div
      aria-hidden="true"
      className="absolute right-6 bottom-0 hidden h-32 w-64 overflow-hidden rounded-t-xl bg-accent sm:block"
    >
      <div className="absolute inset-y-0 right-0 w-24 bg-primary/20" />

      <div className="absolute top-6 left-8 h-20 w-28 rounded-md border bg-card p-3 shadow-sm">
        <div className="mb-2 h-1.5 w-9 rounded-full bg-muted" />
        <div className="mb-2 h-1.5 w-8 rounded-full bg-muted" />
        <div className="h-2.5 rounded-full bg-muted" />
      </div>

      <div className="absolute top-5 right-6 h-16 w-24 rounded-md border bg-card p-3 shadow-sm">
        <div className="mb-2 h-1.5 w-9 rounded-full bg-muted" />
        <div className="mb-1 h-1.5 w-7 rounded-full bg-muted" />
      </div>

      <div className="absolute right-16 bottom-0 h-9 w-28 rounded-t-md border bg-card shadow-sm" />

      <div className="absolute right-10 bottom-0 h-12 w-24 rounded-t-md border bg-card shadow-sm" />
    </div>
  );
}
