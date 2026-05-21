"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeftRight,
  Globe2,
  Image,
  Import,
  Keyboard,
  LockKeyhole,
  Menu,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { type KeyboardEvent, useRef, useState, useTransition } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import type * as z from "zod";
import { createFlashcardSet } from "@/actions/create-flashcard-set";
import { FormError, FormSuccess } from "@/components/form-notice";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { createFlashcardSetSchema } from "@/schemas/flashcard-set-schema";

type CreateFlashcardSetValues = z.infer<typeof createFlashcardSetSchema>;
type CreateFlashcardSetIntent = CreateFlashcardSetValues["intent"];

const defaultCards: CreateFlashcardSetValues["cards"] = [
  {
    term: "Globalization",
    definition:
      "the erosion of national boundaries and the reduced significance of national governments; moving from a world with borders to a world without borders",
  },
  {
    term: "Internationalization",
    definition:
      "cross-border relations between countries involving trade, finance, and communication that create international interdependence",
  },
];

const iconButtonClassName =
  "rounded-full bg-secondary text-secondary-foreground hover:bg-accent";

export const CreateFlashcardSetForm = () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);
  const termInputRefs = useRef<Record<number, HTMLTextAreaElement | null>>({});
  const definitionInputRefs = useRef<
    Record<number, HTMLTextAreaElement | null>
  >({});

  const form = useForm<CreateFlashcardSetValues>({
    resolver: zodResolver(createFlashcardSetSchema),
    defaultValues: {
      title: "",
      description: "",
      visibility: "public",
      intent: "create",
      cards: defaultCards,
    },
  });

  const { fields, append, insert, remove } = useFieldArray({
    control: form.control,
    name: "cards",
  });

  const onSubmit = (values: CreateFlashcardSetValues): void => {
    setSuccess("");
    setError("");

    startTransition(async () => {
      const data = await createFlashcardSet(values);

      setSuccess(data?.success);
      setError(data?.error);
    });
  };

  const handleSubmitIntent = (intent: CreateFlashcardSetIntent): void => {
    form.setValue("intent", intent, { shouldValidate: true });
  };

  const handleAddCard = (): void => {
    const nextIndex = fields.length;

    append({ term: "", definition: "" });
    window.requestAnimationFrame(() => {
      termInputRefs.current[nextIndex]?.focus();
    });
  };

  const handleAddCardBelow = (index: number): void => {
    const nextIndex = index + 1;

    insert(nextIndex, { term: "", definition: "" });
    window.requestAnimationFrame(() => {
      termInputRefs.current[nextIndex]?.focus();
    });
  };

  const handleCardFieldKeyDown = (
    event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
    side: "term" | "definition"
  ): void => {
    if (event.ctrlKey && event.shiftKey && event.key === "ArrowDown") {
      event.preventDefault();
      handleAddCardBelow(index);
      return;
    }

    if (event.key !== "Tab" || event.shiftKey) {
      return;
    }

    event.preventDefault();

    if (side === "term") {
      definitionInputRefs.current[index]?.focus();
      return;
    }

    const nextTermInput = termInputRefs.current[index + 1];

    if (nextTermInput) {
      nextTermInput.focus();
      return;
    }

    handleAddCardBelow(index);
  };

  const canRemoveCards = fields.length > 2 && !isPending;

  return (
    <form
      className="min-h-[calc(100vh-4rem)] px-4 pb-10 sm:px-6 lg:px-8"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldSet className="mx-auto w-full max-w-7xl gap-8">
        <div className="flex flex-col gap-4 pt-4">
          <div className="gap- flex flex-row justify-between">
            <h1 className="font-bold text-2xl text-slate-50">
              Create a new flashcard set
            </h1>
            <div className="hidden flex-wrap gap-3 md:flex">
              <Button
                className="rounded-full px-6"
                disabled={isPending}
                onClick={() => handleSubmitIntent("create")}
                type="submit"
                variant={"outline"}
              >
                Create
              </Button>
              <Button
                className="rounded-full px-6"
                disabled={isPending}
                onClick={() => handleSubmitIntent("practice")}
                type="submit"
              >
                Create and practice
              </Button>
            </div>
          </div>

          <div className="flex">
            <Button
              className="rounded-full px-4"
              disabled={isPending}
              type="button"
              variant="secondary"
            >
              <Globe2 data-icon="inline-start" />
              Public
            </Button>
          </div>
        </div>

        <FieldGroup className="gap-5">
          <Controller
            control={form.control}
            name="title"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="sr-only">Title</FieldLabel>
                <InputGroup className="border-0 px-2 py-6">
                  <InputGroupInput
                    {...field}
                    aria-invalid={fieldState.invalid}
                    disabled={isPending}
                    placeholder="Title"
                  />
                </InputGroup>
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="sr-only">Description</FieldLabel>
                <InputGroup className="border-0 px-2 py-2">
                  <InputGroupTextarea
                    {...field}
                    aria-invalid={fieldState.invalid}
                    disabled={isPending}
                    placeholder="Add a description..."
                    rows={4}
                  />
                </InputGroup>
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>

        <div className="flex flex-row flex-wrap justify-between gap-4">
          <div className="flex flex-row gap-2">
            <Button className="rounded-full" type="button" variant="secondary">
              <Import data-icon="inline-start" />
              Import
            </Button>
            <Button className="rounded-full" type="button" variant="secondary">
              <Plus data-icon="inline-start" />
              Add diagram
              <LockKeyhole data-icon="inline-end" />
            </Button>
          </div>

          <div className="fle-row flex items-center gap-2">
            <Button
              aria-label="Search cards"
              className={iconButtonClassName}
              disabled={isPending}
              size="icon"
              title="Search"
              type="button"
              variant="ghost"
            >
              <Search />
            </Button>
            <Button
              aria-label="Swap term and definition"
              className={iconButtonClassName}
              disabled={isPending}
              size="icon"
              title="Flip terms and definitions"
              type="button"
              variant="ghost"
            >
              <ArrowLeftRight />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label="Keyboard shortcuts"
                  className={iconButtonClassName}
                  disabled={isPending}
                  size="icon"
                  title="Keyboard shortcuts"
                  type="button"
                  variant="ghost"
                >
                  <Keyboard />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="p-0">
                <DropdownMenuGroup>
                  <DropdownMenuItem className="flex justify-between gap-6 rounded-none p-4">
                    <div className="text-center">
                      <p className="font-bold">Add card</p>
                      <p className="text-muted-foreground text-xs">
                        inserts below the current card
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Kbd>Ctrl</Kbd>
                      <span>+</span>
                      <Kbd>Shift</Kbd>
                      <span>+</span>
                      <Kbd>↓</Kbd>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="m-0" />
                  <DropdownMenuItem className="flex justify-between gap-6 rounded-none p-4">
                    <p className="text-center font-bold">Next side or card</p>
                    <Kbd>Tab</Kbd>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              aria-label="Clear all cards"
              className={iconButtonClassName}
              disabled={isPending}
              size="icon"
              title="Clear all cards"
              type="button"
              variant="ghost"
            >
              <Trash2 />
            </Button>
          </div>
        </div>

        <FieldGroup className="gap-6">
          {fields.map((card, index) => (
            <section
              className="rounded-lg bg-card p-6 text-card-foreground shadow-sm"
              key={card.id}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-bold text-card-foreground">
                  {index + 1}
                </span>
                <div className="flex items-center gap-3">
                  <Button
                    aria-label={`Reorder card ${index + 1}`}
                    disabled={isPending}
                    size="icon"
                    tabIndex={-1}
                    type="button"
                    variant="ghost"
                  >
                    <Menu />
                  </Button>
                  <Button
                    aria-label={`Remove card ${index + 1}`}
                    disabled={!canRemoveCards}
                    onClick={() => remove(index)}
                    size="icon"
                    tabIndex={-1}
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-6">
                <div className="flex flex-col gap-4 md:flex-row">
                  <Controller
                    control={form.control}
                    name={`cards.${index}.term`}
                    render={({ field, fieldState }) => (
                      <Field
                        className="min-w-0 flex-1"
                        data-invalid={fieldState.invalid}
                      >
                        <InputGroup className="border-0 px-2 py-2">
                          <InputGroupTextarea
                            {...field}
                            aria-invalid={fieldState.invalid}
                            disabled={isPending}
                            onKeyDown={(event) =>
                              handleCardFieldKeyDown(event, index, "term")
                            }
                            placeholder="Term"
                            ref={(input) => {
                              field.ref(input);
                              termInputRefs.current[index] = input;
                            }}
                            rows={2}
                          />
                        </InputGroup>
                        <FieldLabel className="font-bold text-muted-foreground text-xs uppercase">
                          Term
                        </FieldLabel>
                        {fieldState.error && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    control={form.control}
                    name={`cards.${index}.definition`}
                    render={({ field, fieldState }) => (
                      <Field
                        className="min-w-0 flex-1"
                        data-invalid={fieldState.invalid}
                      >
                        <InputGroup className="border-0 px-2 py-2">
                          <InputGroupTextarea
                            {...field}
                            aria-invalid={fieldState.invalid}
                            disabled={isPending}
                            onKeyDown={(event) =>
                              handleCardFieldKeyDown(event, index, "definition")
                            }
                            placeholder="Definition"
                            ref={(input) => {
                              field.ref(input);
                              definitionInputRefs.current[index] = input;
                            }}
                            rows={2}
                          />
                        </InputGroup>
                        <FieldLabel className="font-bold text-muted-foreground text-xs uppercase">
                          Definition
                        </FieldLabel>
                        {fieldState.error && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                <div className="">
                  <Button
                    className="w-full border-dashed bg-transparent lg:aspect-square"
                    disabled
                    type="button"
                    variant="outline"
                  >
                    <Image data-icon="inline-start" />
                    Image
                  </Button>
                </div>
              </div>
            </section>
          ))}
        </FieldGroup>

        <div className="flex flex-col gap-4">
          <Button
            className="rounded-lg py-6"
            disabled={isPending}
            onClick={handleAddCard}
            type="button"
            variant="secondary"
          >
            <Plus data-icon="inline-start" />
            Add card
          </Button>

          <FormError message={error} />
          <FormSuccess message={success} />
        </div>
      </FieldSet>
    </form>
  );
};
