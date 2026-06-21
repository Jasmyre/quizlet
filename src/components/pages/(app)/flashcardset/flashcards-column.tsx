import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { FlashcardSetDetail } from "@/schemas/flashcard-set-detail-schema";

type Flashcard = FlashcardSetDetail["flashcards"][number];

export function FlashcardsColumn({ flashcards }: { flashcards: Flashcard[] }) {
  return (
    <div className="flex min-w-0 flex-col gap-8 px-4 pb-10">
      {flashcards.map((flashcard, index) => (
        <Card className="min-w-0 overflow-hidden" key={flashcard.id}>
          <CardHeader className="space-y-2 pb-3">
            <CardDescription>Card {index + 1} · Term</CardDescription>
            <CardTitle className="text-balance text-xl leading-snug">
              {flashcard.term}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-5">
            <div className="rounded-lg bg-muted/40 p-4">
              <p className="font-medium text-muted-foreground text-sm">
                Definition
              </p>
              <p className="mt-1 whitespace-pre-wrap leading-relaxed">
                {flashcard.definition}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
