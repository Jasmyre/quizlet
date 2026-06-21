import { Cards01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { LibraryItemCard } from "@/components/pages/(app)/shared/library-item-card";
import { cn } from "@/lib/utils";

interface FlashcardSet {
  author: string;
  id: string;
  kind: "cards" | "study-guide";
  termCount: number;
  title: string;
}

const recentFlashcardSets = [
  {
    author: "you",
    id: "essential-rope-knots-cards",
    kind: "cards",
    termCount: 20,
    title: "Essential Rope Knots for Camping and Climbing: Outdoor Skills",
  },
  {
    author: "you",
    id: "essential-rope-knots-guide",
    kind: "study-guide",
    termCount: 20,
    title: "Essential Rope Knots for Camping and Climbing: Outdoor Skills",
  },
  {
    author: "you",
    id: "globalization-ethics-cards",
    kind: "cards",
    termCount: 22,
    title: "Globalization, Ethics, and Generational Perspectives",
  },
  {
    author: "you",
    id: "globalization-ethics-guide",
    kind: "study-guide",
    termCount: 22,
    title: "Globalization, Ethics, and Generational Perspectives",
  },
  {
    author: "you",
    id: "generational-perspectives-cards",
    kind: "cards",
    termCount: 27,
    title: "Globalization, Ethics, and Generational Perspectives",
  },
  {
    author: "you",
    id: "generational-perspectives-guide",
    kind: "study-guide",
    termCount: 27,
    title: "Globalization, Ethics, and Generational Perspectives",
  },
] satisfies FlashcardSet[];

export function Recents() {
  return (
    <section className="flex flex-col gap-4 px-4 pb-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading font-semibold text-2xl tracking-tight">
          Recent sets
        </h1>
        <p className="text-muted-foreground text-sm">
          Pick up where you left off with your latest flashcard sets.
        </p>
      </div>

      <div className="grid gap-x-4 gap-y-5 lg:grid-cols-2">
        {recentFlashcardSets.map((set) => (
          <LibraryItemCard
            icon={
              <HugeiconsIcon
                className={cn(
                  "size-5",
                  set.kind === "cards" ? "text-cyan-400" : "text-fuchsia-400"
                )}
                icon={Cards01Icon}
                strokeWidth={2}
              />
            }
            itemId={set.id}
            itemType="flashcardset"
            key={set.id}
            metadata={
              <>
                {set.kind === "cards"
                  ? `${set.termCount} cards`
                  : "Study guide"}{" "}
                <span aria-hidden="true">·</span> by {set.author}
              </>
            }
            title={set.title}
          />
        ))}
      </div>
    </section>
  );
}
