// Depends on the page search params and produces the config consumed by the client test engine.
import type { PromptMode, QuestionType, TestConfig } from "./types";

const availableQuestionTypes = [
  "true_false",
  "multiple_choice",
  "matching",
  "written",
] as const satisfies QuestionType[];

export function parseTestConfig(
  searchParams: Record<string, string | string[] | undefined>
): TestConfig {
  const questionCount = clampToPositiveInteger(
    getParam(searchParams, "questions") ?? "",
    12
  );
  const selectedQuestionTypes = parseSelectedQuestionTypes(searchParams);

  return {
    allowBackNavigation: getBoolean(searchParams, "allowBackNavigation"),
    instantResponse: getBoolean(searchParams, "instantResponse"),
    promptMode: parsePromptMode(getParam(searchParams, "promptMode")),
    questionCount,
    selectedQuestionTypes:
      selectedQuestionTypes.length > 0
        ? selectedQuestionTypes
        : [...availableQuestionTypes],
  };
}

function parseSelectedQuestionTypes(
  searchParams: Record<string, string | string[] | undefined>
): QuestionType[] {
  const questionParams = getParamValues(searchParams, "question");
  const selectedFromQuestionParams = questionParams
    .flatMap((value) => value.split(","))
    .map((value) => parseQuestionType(value.trim()))
    .filter((value): value is QuestionType => value !== null);

  if (selectedFromQuestionParams.length > 0) {
    return Array.from(new Set(selectedFromQuestionParams));
  }

  const selectedFromLegacyFlags = availableQuestionTypes.filter((type) =>
    getBoolean(searchParams, typeToParamKey(type))
  );

  if (selectedFromLegacyFlags.length > 0) {
    return selectedFromLegacyFlags;
  }

  return [...availableQuestionTypes];
}

function parsePromptMode(value: string | undefined): PromptMode {
  if (value === "term" || value === "definition" || value === "both") {
    return value;
  }

  return "both";
}

function typeToParamKey(type: QuestionType): string {
  switch (type) {
    case "true_false":
      return "trueFalse";
    case "multiple_choice":
      return "multipleChoice";
    case "matching":
      return "matching";
    case "written":
      return "written";
    default:
      return "written";
  }
}

function getParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const value = searchParams[key];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function getParamValues(
  searchParams: Record<string, string | string[] | undefined>,
  key: string
): string[] {
  const value = searchParams[key];

  if (Array.isArray(value)) {
    return value;
  }

  return value === undefined ? [] : [value];
}

function parseQuestionType(value: string): QuestionType | null {
  switch (value) {
    case "true_false":
    case "trueFalse":
      return "true_false";
    case "multiple_choice":
    case "multipleChoice":
      return "multiple_choice";
    case "matching":
      return "matching";
    case "written":
      return "written";
    default:
      return null;
  }
}

function getBoolean(
  searchParams: Record<string, string | string[] | undefined>,
  key: string
): boolean {
  return getParam(searchParams, key) === "true";
}

function clampToPositiveInteger(value: string, fallback: number): number {
  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue) || parsedValue <= 0) {
    return fallback;
  }

  return Math.min(parsedValue, 18);
}
