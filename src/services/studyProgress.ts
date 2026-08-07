import { supabase } from "../lib/supabase";
import type { Answers, Confidence, StudyProgress } from "../types/quiz";

type ProgressRow = {
  question_id: number;
  last_answers: Answers;
  was_correct: boolean;
  confidence: Confidence | null;
  review_step: number;
  next_review_at: string | null;
  updated_at: string;
};

const fromRow = (row: ProgressRow): StudyProgress => ({
  questionId: row.question_id,
  lastAnswers: row.last_answers ?? {},
  wasCorrect: row.was_correct,
  confidence: row.confidence,
  reviewStep: row.review_step,
  nextReviewAt: row.next_review_at,
  updatedAt: row.updated_at,
});

export async function loadStudyProgress(): Promise<StudyProgress[]> {
  const { data, error } = await supabase.from("study_progress").select("*");
  if (error) throw error;
  return ((data ?? []) as ProgressRow[]).map(fromRow);
}

export async function saveStudyProgress(
  userId: string,
  questionId: number,
  answers: Answers,
  wasCorrect: boolean,
  confidence: Confidence | null,
  previousStep = 0,
) {
  const reviewStep = wasCorrect && confidence === "confident" ? 0 : Math.min(previousStep + 1, 3);
  const delays = [0, 1, 3, 7];
  const nextReviewAt = reviewStep
    ? new Date(Date.now() + delays[reviewStep] * 86_400_000).toISOString()
    : null;
  const { data, error } = await supabase.from("study_progress").upsert({
    user_id: userId,
    question_id: questionId,
    last_answers: answers,
    was_correct: wasCorrect,
    confidence,
    review_step: reviewStep,
    next_review_at: nextReviewAt,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id,question_id" }).select().single();
  if (error) throw error;
  return fromRow(data as ProgressRow);
}
