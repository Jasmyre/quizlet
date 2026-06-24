"use client";

import {
  BookOpenIcon,
  ChevronDownIcon,
  FileCheckIcon,
  LayersIcon,
  LightbulbIcon,
  type LucideProps,
  TargetIcon,
  ZapIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type ComponentType, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { FlashcardSetDetail } from "@/schemas/flashcard-set-detail-schema";

type AnswerWith = "term" | "definition" | "both";

interface ActionButton {
  icon: ComponentType<LucideProps>;
  isWorking: boolean;
  label: "Flashcards" | "Learn" | "Blocks" | "Blast" | "Match" | "Test";
}

const actionButtons = [
  {
    icon: FileCheckIcon,
    isWorking: true,
    label: "Test",
  },
  {
    icon: BookOpenIcon,
    isWorking: false,
    label: "Flashcards",
  },
  {
    icon: LightbulbIcon,
    isWorking: false,
    label: "Learn",
  },
  {
    icon: LayersIcon,
    isWorking: false,
    label: "Blocks",
  },
  {
    icon: ZapIcon,
    isWorking: false,
    label: "Blast",
  },
  {
    icon: TargetIcon,
    isWorking: false,
    label: "Match",
  },
] as const satisfies ActionButton[];

const answerWithLabels: Record<AnswerWith, string> = {
  both: "Both",
  definition: "Definition",
  term: "Term",
};

export function FlashcardSetActions({
  flashcardSet,
}: {
  flashcardSet: FlashcardSetDetail;
}) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [answerWith, setAnswerWith] = useState<AnswerWith>("term");
  const [instantResponse, setInstantResponse] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [isMultipleChoice, setIsMultipleChoice] = useState(true);
  const [isWritten, setIsWritten] = useState(false);
  const [questionCount, setQuestionCount] = useState(
    flashcardSet.flashcards.length.toString()
  );
  const [isTrueFalse, setIsTrueFalse] = useState(false);

  const maxQuestions = flashcardSet.flashcards.length;
  const parsedQuestionCount = Number.parseInt(questionCount, 10);
  const canStartTest = maxQuestions > 0;

  const handleStartTest = () => {
    if (!canStartTest) {
      return;
    }

    const searchParams = new URLSearchParams();
    searchParams.set("questions", parsedQuestionCount.toString());
    searchParams.set("promptMode", answerWith);
    searchParams.set("instantResponse", instantResponse.toString());

    if (isTrueFalse) {
      searchParams.append("question", "true_false");
    }

    if (isMultipleChoice) {
      searchParams.append("question", "multiple_choice");
    }

    if (isMatching) {
      searchParams.append("question", "matching");
    }

    if (isWritten) {
      searchParams.append("question", "written");
    }

    router.push(
      `/flashcardset/test/${encodeURIComponent(flashcardSet.id)}?${searchParams.toString()}`
    );
  };

  return (
    <section className="flex min-w-0 flex-col gap-3 px-4 pb-10">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-3">
        {actionButtons.map((action) => {
          const Icon = action.icon;

          if (!action.isWorking) {
            return (
              <Button
                aria-label={`${action.label} coming soon`}
                disabled
                key={action.label}
                title="Coming soon"
                type="button"
                variant="outline"
              >
                <Icon />
                <span>{action.label}</span>
              </Button>
            );
          }

          return (
            <Dialog
              key={action.label}
              onOpenChange={setIsDialogOpen}
              open={isDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  disabled={maxQuestions === 0}
                  type="button"
                  variant="outline"
                >
                  <Icon />
                  <span>{action.label}</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>Set up your test</DialogTitle>
                  <DialogDescription>
                    Choose how many questions to include and which question
                    types to use.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-5">
                  <div className="grid gap-4 sm:grid-cols-1">
                    <div className="grid grid-cols-2 gap-2">
                      <Label htmlFor="test-question-count">
                        Number of questions
                      </Label>
                      <div>
                        <Input
                          aria-describedby="test-question-count-help"
                          disabled={maxQuestions === 0}
                          id="test-question-count"
                          max={maxQuestions}
                          min={1}
                          onChange={(event) =>
                            setQuestionCount(event.target.value)
                          }
                          step={1}
                          type="number"
                          value={questionCount}
                        />
                        <p
                          className="text-muted-foreground text-xs"
                          id="test-question-count-help"
                        >
                          Maximum {maxQuestions}{" "}
                          {maxQuestions === 1 ? "question" : "questions"}.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Label htmlFor="test-answer-with">Answer with</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            className="justify-between"
                            id="test-answer-with"
                            type="button"
                            variant="outline"
                          >
                            {answerWithLabels[answerWith]}
                            <ChevronDownIcon data-icon="inline-end" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="min-w-48">
                          <DropdownMenuRadioGroup
                            onValueChange={(value) =>
                              setAnswerWith(value as AnswerWith)
                            }
                            value={answerWith}
                          >
                            <DropdownMenuRadioItem value="term">
                              Term
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="definition">
                              Definition
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="both">
                              Both
                            </DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-3">
                    <h3 className="font-medium">Question types</h3>
                    <div className="grid gap-3">
                      <CheckboxField
                        checked={isTrueFalse}
                        id="test-true-false"
                        label="True/False"
                        onChange={setIsTrueFalse}
                      />
                      <CheckboxField
                        checked={isMultipleChoice}
                        id="test-multiple-choice"
                        label="Multiple choice"
                        onChange={setIsMultipleChoice}
                      />
                      <CheckboxField
                        checked={isMatching}
                        id="test-matching"
                        label="Matching"
                        onChange={setIsMatching}
                      />
                      <CheckboxField
                        checked={isWritten}
                        id="test-written"
                        label="Written"
                        onChange={setIsWritten}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-3">
                  <h3 className="font-medium">Other options</h3>
                  <div className="grid gap-3">
                    <CheckboxField
                      checked={instantResponse}
                      id="test-instant-response"
                      label="Instant response"
                      onChange={setInstantResponse}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    onClick={() => setIsDialogOpen(false)}
                    type="button"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={!canStartTest}
                    onClick={handleStartTest}
                    type="button"
                  >
                    Start test
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          );
        })}
      </div>
    </section>
  );
}

function CheckboxField({
  checked,
  id,
  label,
  onChange,
}: {
  checked: boolean;
  id: string;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors has-checked:border-ring has-[:checked]:bg-muted/40"
      htmlFor={id}
    >
      <Checkbox
        checked={checked}
        id={id}
        onCheckedChange={(checkedState) => {
          onChange(checkedState === true);
        }}
      />
      <span className="font-medium text-sm">{label}</span>
    </label>
  );
}
