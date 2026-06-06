"use client";

import { ChevronLeftIcon, ChevronRightIcon, RotateCcwIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { flashcardSetVisibilityLabels } from "@/lib/flashcard-set-visibility";
import { cn } from "@/lib/utils";
import type { FlashcardSetDetail } from "@/schemas/flashcard-set-detail-schema";

const SWIPE_THRESHOLD = 96;
const DRAG_CLICK_THRESHOLD = 8;
const SWIPE_ANIMATION_DURATION_MS = 300;
const EXIT_ROTATION_DEGREES = 16;

const deckDepthLevels = [
  {
    opacity: 1,
    transform: "translateY(0) scale(1)",
    zIndex: 2,
  },
  {
    opacity: 0.82,
    transform: "translateY(10px) scale(0.96)",
    zIndex: 1,
  },
  {
    opacity: 0.56,
    transform: "translateY(20px) scale(0.92)",
    zIndex: 0,
  },
  {
    opacity: 0.34,
    transform: "translateY(30px) scale(0.88)",
    zIndex: -1,
  },
] as const;

const deckDepthCards = [
  {
    idleLevel: 1,
    promotedLevel: 0,
  },
  {
    idleLevel: 2,
    promotedLevel: 1,
  },
  {
    idleLevel: 3,
    promotedLevel: 2,
  },
] as const satisfies {
  idleLevel: 1 | 2 | 3;
  promotedLevel: 0 | 1 | 2;
}[];

type Flashcard = FlashcardSetDetail["flashcards"][number];
type SwipePhase = "idle" | "returning" | "exiting";
type SwipeDirection = -1 | 1;

export function FlashcardSetContent({
  flashcardSet,
}: {
  flashcardSet: FlashcardSetDetail;
}) {
  const cardCount = flashcardSet.flashcards.length;

  return (
    <div className="flex w-full min-w-0 flex-col gap-8 px-4 pb-10">
      <section className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-sm">
            <span>{flashcardSetVisibilityLabels[flashcardSet.visibility]}</span>
            <span aria-hidden="true">·</span>
            <span>{cardCount} cards</span>
            <span aria-hidden="true">·</span>
            <span>by {flashcardSet.user.username}</span>
          </div>
          <h1 className="text-balance font-heading font-semibold text-3xl tracking-normal">
            {flashcardSet.title}
          </h1>
          {flashcardSet.description ? (
            <p className="max-w-3xl text-muted-foreground">
              {flashcardSet.description}
            </p>
          ) : null}
        </div>
      </section>

      {cardCount > 0 ? (
        <FlashcardStudyViewer flashcards={flashcardSet.flashcards} />
      ) : (
        <Card>
          <CardContent className="flex min-h-48 flex-col items-center justify-center gap-2 text-center">
            <h2 className="font-heading font-semibold text-lg">
              No flashcards yet
            </h2>
            <p className="text-muted-foreground">
              This set is ready, but it does not have any cards to study.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function FlashcardStudyViewer({ flashcards }: { flashcards: Flashcard[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [swipePhase, setSwipePhase] = useState<SwipePhase>("idle");
  const [exitDirection, setExitDirection] = useState<SwipeDirection | null>(
    null
  );
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const hasDraggedRef = useRef(false);
  const activeCard = flashcards[activeIndex];
  const progressLabel = `${activeIndex + 1} / ${flashcards.length}`;
  const isDragging = dragStartX !== null;
  const isExiting = swipePhase === "exiting";

  if (!activeCard) {
    return null;
  }

  const wrapCardIndex = (nextIndex: number): number =>
    (nextIndex + flashcards.length) % flashcards.length;

  const getTargetIndexForExit = (direction: SwipeDirection): number =>
    wrapCardIndex(activeIndex - direction);

  const startCardExit = (direction: SwipeDirection): void => {
    if (isExiting) {
      return;
    }

    setTargetIndex(getTargetIndexForExit(direction));
    setExitDirection(direction);
    setDragStartX(null);
    setSwipePhase("exiting");
  };

  const showPreviousCard = (): void => {
    startCardExit(1);
  };

  const showNextCard = (): void => {
    startCardExit(-1);
  };

  const handlePointerDown = (
    event: React.PointerEvent<HTMLButtonElement>
  ): void => {
    if (isExiting) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    setDragStartX(event.clientX);
    setDragOffset(0);
    setSwipePhase("idle");
    hasDraggedRef.current = false;
  };

  const handlePointerMove = (
    event: React.PointerEvent<HTMLButtonElement>
  ): void => {
    if (dragStartX === null) {
      return;
    }

    const nextOffset = event.clientX - dragStartX;
    setDragOffset(nextOffset);

    if (Math.abs(nextOffset) > DRAG_CLICK_THRESHOLD) {
      hasDraggedRef.current = true;
    }
  };

  const handlePointerEnd = (
    event: React.PointerEvent<HTMLButtonElement>
  ): void => {
    if (dragStartX === null) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (dragOffset <= -SWIPE_THRESHOLD) {
      startCardExit(-1);
      return;
    }

    if (dragOffset >= SWIPE_THRESHOLD) {
      startCardExit(1);
      return;
    }

    setDragStartX(null);
    setDragOffset(0);
    setSwipePhase(dragOffset === 0 ? "idle" : "returning");
  };

  const handleCardClick = (): void => {
    if (isExiting) {
      return;
    }

    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }

    setIsFlipped((currentValue) => !currentValue);
  };

  const handleCardTransitionEnd = (
    event: React.TransitionEvent<HTMLButtonElement>
  ): void => {
    if (
      event.propertyName !== "transform" ||
      event.currentTarget !== event.target
    ) {
      return;
    }

    if (swipePhase === "returning") {
      setSwipePhase("idle");
      return;
    }

    if (swipePhase !== "exiting" || targetIndex === null) {
      return;
    }

    setActiveIndex(targetIndex);
    setIsFlipped(false);
    setDragOffset(0);
    setDragStartX(null);
    setExitDirection(null);
    setTargetIndex(null);
    setSwipePhase("idle");
    hasDraggedRef.current = false;
  };

  const activeCardTransform =
    swipePhase === "exiting" && exitDirection !== null
      ? `translateX(calc(${exitDirection * 100}% + ${
          exitDirection * 8
        }rem)) rotate(${exitDirection * EXIT_ROTATION_DEGREES}deg)`
      : `translateX(${dragOffset}px) rotate(${dragOffset / 24}deg)`;

  const transitionDuration = isDragging
    ? "0ms"
    : swipePhase === "idle"
      ? "0ms"
      : `${SWIPE_ANIMATION_DURATION_MS}ms`;

  const previewDirection =
    exitDirection ??
    (dragOffset <= -DRAG_CLICK_THRESHOLD
      ? -1
      : dragOffset >= DRAG_CLICK_THRESHOLD
        ? 1
        : null);
  const previewCard =
    flashcards[
      previewDirection === null
        ? wrapCardIndex(activeIndex + 1)
        : getTargetIndexForExit(previewDirection)
    ];
  const depthTransitionDuration = isExiting
    ? `${SWIPE_ANIMATION_DURATION_MS}ms`
    : "0ms";

  return (
    <section className="flex min-w-0 flex-col gap-4 overflow-x-clip px-1 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <RotateCcwIcon className="size-4" />
          <span>Tap the card to flip</span>
        </div>
        <span className="font-medium text-muted-foreground text-sm tabular-nums">
          {progressLabel}
        </span>
      </div>

      <div className="flex min-w-0 items-center gap-3 overflow-x-clip py-2">
        <Button
          aria-label="Show previous flashcard"
          className="hidden sm:inline-flex"
          disabled={isExiting}
          onClick={showPreviousCard}
          size="icon-lg"
          type="button"
          variant="outline"
        >
          <ChevronLeftIcon />
        </Button>

        <div
          className="relative h-[20rem] min-w-0 flex-1 overflow-visible sm:h-[28rem]"
          style={{ perspective: "1000px" }}
        >
          {deckDepthCards.map((depthCard, index) => {
            const level =
              deckDepthLevels[
                isExiting ? depthCard.promotedLevel : depthCard.idleLevel
              ];

            return (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl border bg-card shadow-sm transition-[opacity,transform] ease-out"
                key={`${depthCard.idleLevel}-${depthCard.promotedLevel}`}
                style={{
                  opacity: level.opacity,
                  transform: level.transform,
                  transitionDuration: depthTransitionDuration,
                  zIndex: level.zIndex,
                }}
              >
                {index === 0 && previewCard ? (
                  <div
                    className="relative size-full rounded-xl"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <FlashcardFace
                      eyebrow="Term"
                      text={previewCard.term}
                      visibleSide="front"
                    />
                  </div>
                ) : (
                  <div
                    className={cn(
                      "absolute inset-x-6 h-px rounded-full bg-border/70",
                      index === 1 ? "top-6" : "top-5"
                    )}
                  />
                )}
              </div>
            );
          })}
          <button
            aria-label={
              isFlipped
                ? "Show the flashcard term"
                : "Show the flashcard definition"
            }
            className={cn(
              "group absolute inset-0 grid touch-pan-y select-none place-items-center rounded-xl border bg-card p-0 text-left shadow-sm outline-none transition-[box-shadow,transform] ease-out focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              isDragging ? "cursor-grabbing" : "cursor-pointer",
              "hover:shadow-md"
            )}
            onClick={handleCardClick}
            onPointerCancel={handlePointerEnd}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onTransitionEnd={handleCardTransitionEnd}
            style={{
              transform: activeCardTransform,
              transitionDuration,
              zIndex: 3,
            }}
            type="button"
          >
            <div
              className="relative size-full rounded-xl transition-transform duration-500 ease-out"
              style={{
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                transformStyle: "preserve-3d",
              }}
            >
              <FlashcardFace
                eyebrow="Term"
                text={activeCard.term}
                visibleSide="front"
              />
              <FlashcardFace
                eyebrow="Definition"
                text={activeCard.definition}
                visibleSide="back"
              />
            </div>
          </button>
        </div>

        <Button
          aria-label="Show next flashcard"
          className="hidden sm:inline-flex"
          disabled={isExiting}
          onClick={showNextCard}
          size="icon-lg"
          type="button"
          variant="outline"
        >
          <ChevronRightIcon />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:hidden">
        <Button
          disabled={isExiting}
          onClick={showPreviousCard}
          type="button"
          variant="outline"
        >
          <ChevronLeftIcon data-icon="inline-start" />
          Previous
        </Button>
        <Button
          disabled={isExiting}
          onClick={showNextCard}
          type="button"
          variant="outline"
        >
          Next
          <ChevronRightIcon data-icon="inline-end" />
        </Button>
      </div>
    </section>
  );
}

function FlashcardFace({
  eyebrow,
  text,
  visibleSide,
}: {
  eyebrow: string;
  text: string;
  visibleSide: "front" | "back";
}) {
  return (
    <div
      className="absolute inset-0 flex overflow-hidden rounded-xl bg-card p-6 text-card-foreground sm:p-8"
      style={{
        backfaceVisibility: "hidden",
        transform: visibleSide === "back" ? "rotateY(180deg)" : "rotateY(0deg)",
      }}
    >
      <div className="flex size-full flex-col justify-between gap-6">
        <CardHeader className="px-0">
          <CardDescription>{eyebrow}</CardDescription>
        </CardHeader>
        <CardContent className="grid min-h-0 flex-1 place-items-center overflow-y-auto px-0 text-center">
          <CardTitle className="max-w-3xl text-balance text-2xl leading-tight sm:text-4xl">
            {text}
          </CardTitle>
        </CardContent>
        <p className="text-center text-muted-foreground text-sm">
          Click to {visibleSide === "front" ? "show definition" : "show term"}
        </p>
      </div>
    </div>
  );
}
