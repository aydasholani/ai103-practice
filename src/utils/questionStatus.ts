import type { QuestionPerformance, QuestionStatus } from "../types/quiz";

export const MASTERY_STREAK = 3;
export const MINIMUM_ACCURACY = 0.7;

export function questionAccuracy(performance?: QuestionPerformance) {
  if (!performance?.maximumPoints) return null;
  return performance.earnedPoints / performance.maximumPoints;
}

export function getQuestionStatus(performance?: QuestionPerformance): QuestionStatus {
  if (!performance?.attempts) return "new";
  const accuracy = questionAccuracy(performance) ?? 0;
  if (performance.correctStreak >= MASTERY_STREAK && accuracy >= MINIMUM_ACCURACY) return "mastered";
  return "needs_practice";
}
