// Depends on the shared question shell, shadcn Card/Button primitives, and matching-answer state owned by the test engine.
"use client";

import { XIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type {
  MatchingAssignments,
  TestAnswer,
  TestFeedback,
  TestQuestion,
} from "../../_lib/types";
import { QuestionShell } from "../question-shell";

interface MatchingQuestionProps {
  feedback: TestFeedback | null;
  isDisabled: boolean;
  onChange: (value: TestAnswer) => void;
  question: Extract<TestQuestion, { type: "matching" }>;
  value: TestAnswer | undefined;
}

export function MatchingQuestion({
  feedback,
  isDisabled,
  onChange,
  question,
  value,
}: MatchingQuestionProps) {
  const [assignments, setAssignments] = useState<MatchingAssignments>(() =>
    getAssignments(value, question)
  );
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [activeAnswerId, setActiveAnswerId] = useState<string | null>(null);

  useEffect(() => {
    const nextAssignments = getAssignments(value, question);

    setAssignments((currentAssignments) =>
      areAssignmentsEqual(currentAssignments, nextAssignments)
        ? currentAssignments
        : nextAssignments
    );
    setActiveSlotId(null);
    setActiveAnswerId(null);
  }, [question, value]);

  const assignedAnswerIds = useMemo(
    () => new Set(Object.values(assignments)),
    [assignments]
  );

  const unassignedAnswers = useMemo(
    () =>
      question.answerBank.filter((answer) => !assignedAnswerIds.has(answer.id)),
    [assignedAnswerIds, question.answerBank]
  );

  const commitAssignment = (slotId: string, answerId: string): void => {
    setAssignments((currentAssignments) => {
      const nextAssignments = { ...currentAssignments };

      for (const [existingSlotId, existingAnswerId] of Object.entries(
        nextAssignments
      )) {
        if (existingAnswerId === answerId) {
          delete nextAssignments[existingSlotId];
        }
      }

      nextAssignments[slotId] = answerId;
      onChange(nextAssignments);

      return nextAssignments;
    });

    setActiveSlotId(null);
    setActiveAnswerId(null);
  };

  const handleSlotClick = (slotId: string): void => {
    if (isDisabled) {
      return;
    }

    if (assignments[slotId] !== undefined) {
      return;
    }

    if (activeAnswerId) {
      commitAssignment(slotId, activeAnswerId);
      return;
    }

    setActiveSlotId((currentActiveSlotId) =>
      currentActiveSlotId === slotId ? null : slotId
    );
    setActiveAnswerId(null);
  };

  const handleAnswerClick = (answerId: string): void => {
    if (isDisabled) {
      return;
    }

    if (activeSlotId) {
      commitAssignment(activeSlotId, answerId);
      return;
    }

    setActiveAnswerId((currentActiveAnswerId) =>
      currentActiveAnswerId === answerId ? null : answerId
    );
    setActiveSlotId(null);
  };

  const clearSlot = (slotId: string): void => {
    if (isDisabled) {
      return;
    }

    const answerId = assignments[slotId];

    if (answerId === undefined) {
      return;
    }

    setAssignments((currentAssignments) => {
      if (currentAssignments[slotId] === undefined) {
        return currentAssignments;
      }

      const nextAssignments = { ...currentAssignments };
      delete nextAssignments[slotId];
      onChange(nextAssignments);

      return nextAssignments;
    });

    setActiveSlotId((currentActiveSlotId) =>
      currentActiveSlotId === slotId ? null : currentActiveSlotId
    );
    setActiveAnswerId((currentActiveAnswerId) =>
      currentActiveAnswerId === answerId ? null : currentActiveAnswerId
    );
  };

  return (
    <QuestionShell feedback={feedback} title={question.headerText}>
      <div className="flex flex-col gap-6">
        <div className="grid gap-3">
          {question.slots.map((slot, index) => {
            const selectedAnswerId = assignments[slot.id];
            const selectedAnswer = question.answerBank.find(
              (answer) => answer.id === selectedAnswerId
            );
            const isActive =
              activeSlotId === slot.id && selectedAnswer === undefined;
            const isFilled = selectedAnswer !== undefined;

            return (
              <div
                className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]"
                key={slot.id}
              >
                <Card
                  className={cn(
                    "min-h-24 transition-colors",
                    isFilled && "border-primary/40 bg-primary/5 shadow-sm",
                    !isFilled &&
                      "border-dashed bg-background/60 hover:border-primary/50",
                    isActive &&
                      "border-primary bg-primary/5 ring-2 ring-primary",
                    isDisabled && "cursor-not-allowed opacity-70"
                  )}
                  onClick={() => handleSlotClick(slot.id)}
                  onKeyDown={(event) => {
                    if (isDisabled) {
                      return;
                    }

                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleSlotClick(slot.id);
                    }
                  }}
                  role="button"
                  tabIndex={isDisabled || isFilled ? -1 : 0}
                >
                  <CardContent className="flex min-h-24 items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
                        Slot {index + 1}
                      </p>
                      {selectedAnswer ? (
                        <p className="mt-1 font-medium text-sm leading-relaxed">
                          {selectedAnswer.text}
                        </p>
                      ) : (
                        <p className="mt-1 text-muted-foreground text-sm">
                          Empty slot
                        </p>
                      )}
                    </div>

                    {selectedAnswer ? (
                      <Button
                        aria-label={`Clear slot ${index + 1}`}
                        disabled={isDisabled}
                        onClick={(event) => {
                          event.stopPropagation();
                          clearSlot(slot.id);
                        }}
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <XIcon data-icon="inline" />
                      </Button>
                    ) : null}
                  </CardContent>
                </Card>

                <Card className="border-muted/60 bg-muted/20">
                  <CardContent className="flex min-h-24 items-center p-4">
                    <p className="text-card-foreground text-sm leading-relaxed">
                      {slot.promptText}
                    </p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border bg-background p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium">Answer bank</p>
              <p className="text-muted-foreground text-sm">
                Click a slot first or an answer first, then pair the other side.
              </p>
            </div>
            <p className="text-muted-foreground text-sm">
              {Object.keys(assignments).length} / {question.slots.length} placed
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {unassignedAnswers.map((answer) => {
              const isActive = activeAnswerId === answer.id;

              return (
                <Button
                  className={cn(
                    "rounded-full px-4",
                    isActive &&
                      "border-primary bg-primary/5 ring-2 ring-primary"
                  )}
                  disabled={isDisabled}
                  key={answer.id}
                  onClick={() => handleAnswerClick(answer.id)}
                  type="button"
                  variant="outline"
                >
                  {answer.text}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </QuestionShell>
  );
}

function getAssignments(
  value: TestAnswer | undefined,
  question: Extract<TestQuestion, { type: "matching" }>
): MatchingAssignments {
  if (typeof value !== "object" || value === null) {
    return {};
  }

  const nextAssignments: MatchingAssignments = {};

  for (const slot of question.slots) {
    const assignment = value[slot.id];

    if (typeof assignment === "string" && assignment.trim().length > 0) {
      nextAssignments[slot.id] = assignment;
    }
  }

  return nextAssignments;
}

function areAssignmentsEqual(
  currentAssignments: MatchingAssignments,
  nextAssignments: MatchingAssignments
): boolean {
  const currentEntries = Object.entries(currentAssignments).sort(
    ([left], [right]) => left.localeCompare(right)
  );
  const nextEntries = Object.entries(nextAssignments).sort(([left], [right]) =>
    left.localeCompare(right)
  );

  if (currentEntries.length !== nextEntries.length) {
    return false;
  }

  return currentEntries.every(([slotId, answerId], index) => {
    const nextEntry = nextEntries[index];

    return (
      nextEntry !== undefined &&
      nextEntry[0] === slotId &&
      nextEntry[1] === answerId
    );
  });
}
