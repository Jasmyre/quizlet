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

type Flashcard = FlashcardSetDetail["flashcards"][number];

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
  const hasDraggedRef = useRef(false);
  const activeCard = flashcards[activeIndex];
  const progressLabel = `${activeIndex + 1} / ${flashcards.length}`;
  const isDragging = dragStartX !== null;

  if (!activeCard) {
    return null;
  }

  const showCard = (nextIndex: number): void => {
    setActiveIndex((nextIndex + flashcards.length) % flashcards.length);
    setIsFlipped(false);
    setDragOffset(0);
    setDragStartX(null);
  };

  const showPreviousCard = (): void => {
    showCard(activeIndex - 1);
  };

  const showNextCard = (): void => {
    showCard(activeIndex + 1);
  };

  const handlePointerDown = (
    event: React.PointerEvent<HTMLButtonElement>
  ): void => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragStartX(event.clientX);
    setDragOffset(0);
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

    event.currentTarget.releasePointerCapture(event.pointerId);

    if (dragOffset <= -SWIPE_THRESHOLD) {
      showNextCard();
      return;
    }

    if (dragOffset >= SWIPE_THRESHOLD) {
      showPreviousCard();
      return;
    }

    setDragStartX(null);
    setDragOffset(0);
  };

  const handleCardClick = (): void => {
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }

    setIsFlipped((currentValue) => !currentValue);
  };

  return (
    <section className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <RotateCcwIcon className="size-4" />
          <span>Tap the card to flip</span>
        </div>
        <span className="font-medium text-muted-foreground text-sm tabular-nums">
          {progressLabel}
        </span>
      </div>

      <div className="flex min-w-0 items-center gap-3">
        <Button
          aria-label="Show previous flashcard"
          className="hidden sm:inline-flex"
          onClick={showPreviousCard}
          size="icon-lg"
          type="button"
          variant="outline"
        >
          <ChevronLeftIcon />
        </Button>

        <div className="min-w-0 flex-1 [perspective:1200px]">
          <button
            aria-label={
              isFlipped
                ? "Show the flashcard term"
                : "Show the flashcard definition"
            }
            className={cn(
              "group relative grid min-h-[20rem] w-full touch-pan-y select-none place-items-center rounded-xl border bg-card p-0 text-left shadow-sm outline-none transition-[box-shadow,transform] duration-200 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:min-h-[26rem]",
              isDragging ? "cursor-grabbing" : "cursor-pointer",
              "hover:shadow-md"
            )}
            onClick={handleCardClick}
            onPointerCancel={handlePointerEnd}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            style={{
              transform: `translateX(${dragOffset}px) rotate(${dragOffset / 24}deg)`,
              transitionDuration: isDragging ? "0ms" : undefined,
            }}
            type="button"
          >
            <div
              className={cn(
                "relative size-full min-h-[20rem] transition-transform duration-500 [transform-style:preserve-3d] sm:min-h-[26rem]",
                isFlipped ? "[transform:rotateY(180deg)]" : ""
              )}
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
          onClick={showNextCard}
          size="icon-lg"
          type="button"
          variant="outline"
        >
          <ChevronRightIcon />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:hidden">
        <Button onClick={showPreviousCard} type="button" variant="outline">
          <ChevronLeftIcon data-icon="inline-start" />
          Previous
        </Button>
        <Button onClick={showNextCard} type="button" variant="outline">
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
      className={cn(
        "absolute inset-0 flex flex-col justify-between gap-6 rounded-xl p-6 [backface-visibility:hidden] sm:p-8",
        visibleSide === "back" ? "[transform:rotateY(180deg)]" : ""
      )}
    >
      <CardHeader className="px-0">
        <CardDescription>{eyebrow}</CardDescription>
      </CardHeader>
      <CardContent className="grid flex-1 place-items-center px-0 text-center">
        <CardTitle className="max-w-3xl text-balance text-2xl leading-tight sm:text-4xl">
          {text}
        </CardTitle>
      </CardContent>
      <p className="text-center text-muted-foreground text-sm">
        Click to {visibleSide === "front" ? "show definition" : "show term"}
      </p>
    </div>
  );
}
