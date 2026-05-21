import { Cards01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Card, CardContent } from "@/components/ui/card";
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
          <Card
            className="cursor-pointer border-0 bg-transparent py-2 text-foreground shadow-none ring-0 hover:bg-muted"
            key={set.id}
          >
            <CardContent className="flex items-center gap-4 px-0">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <HugeiconsIcon
                  className={cn(
                    "size-5",
                    set.kind === "cards" ? "text-cyan-400" : "text-fuchsia-400"
                  )}
                  icon={Cards01Icon}
                  strokeWidth={2}
                />
              </div>
              <div className="min-w-0">
                <h2 className="truncate font-semibold text-sm leading-5">
                  {set.title}
                </h2>
                <p className="font-semibold text-muted-foreground text-sm leading-5">
                  {set.kind === "cards"
                    ? `${set.termCount} cards`
                    : "Study guide"}{" "}
                  <span aria-hidden="true">·</span> by {set.author}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
