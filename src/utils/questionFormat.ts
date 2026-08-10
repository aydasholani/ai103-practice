import type { Question, QuestionFormat } from "../types/quiz";

export function matchesQuestionFormat(question: Question, format: QuestionFormat) {
  if (format === "all") return true;
  if (format === "case_study") return Boolean(question.caseStudy);
  if (format === "solution_set") return Boolean(question.examGroup);
  return question.type === format;
}
