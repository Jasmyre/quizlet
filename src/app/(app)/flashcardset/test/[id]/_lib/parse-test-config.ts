import type { AnswerWith, QuestionType, TestConfig } from "./types";

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
  const answerWith = parseAnswerWith(getParam(searchParams, "answerWith"));
  const selectedQuestionTypes = availableQuestionTypes.filter((type) =>
    getBoolean(searchParams, typeToParamKey(type))
  );

  return {
    questionCount,
    selectedQuestionTypes:
      selectedQuestionTypes.length > 0
        ? selectedQuestionTypes
        : [...availableQuestionTypes],
    instantResponse: getBoolean(searchParams, "instantResponse"),
    allowBackNavigation: getBoolean(searchParams, "allowBackNavigation"),
    answerWith,
  };
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

function parseAnswerWith(value: string | undefined): AnswerWith {
  return value === "term" ? "term" : "definition";
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
