import { supabase } from "../lib/supabase";
import type { QuestionPerformance } from "../types/quiz";

type QuestionAttempt = {
  question_id: number;
  is_correct: boolean;
  earned_points: number;
  maximum_points: number;
};

export type NewQuestionAttempt = {
  questionId: number;
  category: string;
  mode: "practice" | "exam";
  isCorrect: boolean;
  earnedPoints: number;
  maximumPoints: number;
};

export async function loadQuestionPerformance(): Promise<QuestionPerformance[]> {
  const { data, error } = await supabase
    .from("question_attempts")
    .select("question_id, is_correct, earned_points, maximum_points")
    .order("answered_at", { ascending: true });
  if (error) throw error;

  const totals = new Map<number, QuestionPerformance>();
  for (const attempt of (data ?? []) as QuestionAttempt[]) {
    const current = totals.get(attempt.question_id) ?? {
      questionId: attempt.question_id,
      attempts: 0,
      correctAttempts: 0,
      earnedPoints: 0,
      maximumPoints: 0,
      correctStreak: 0,
      lastWasCorrect: false,
    };
    current.attempts += 1;
    current.correctAttempts += attempt.is_correct ? 1 : 0;
    current.earnedPoints += attempt.earned_points;
    current.maximumPoints += attempt.maximum_points;
    current.correctStreak = attempt.is_correct ? current.correctStreak + 1 : 0;
    current.lastWasCorrect = attempt.is_correct;
    totals.set(attempt.question_id, current);
  }
  return [...totals.values()];
}

export async function saveQuestionAttempts(userId: string, attempts: NewQuestionAttempt[]) {
  if (!attempts.length) return;
  const { error } = await supabase.from("question_attempts").insert(
    attempts.map((attempt) => ({
      user_id: userId,
      question_id: attempt.questionId,
      category: attempt.category,
      mode: attempt.mode,
      is_correct: attempt.isCorrect,
      earned_points: attempt.earnedPoints,
      maximum_points: attempt.maximumPoints,
    })),
  );
  if (error) throw error;
}
