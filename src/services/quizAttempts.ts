import type { HistoryItem } from "../types/quiz";
import { supabase } from "../lib/supabase";

type QuizAttemptRow = {
  completed_at: string;
  score: number;
  total: number;
  label: string;
};

export async function loadQuizHistory(): Promise<HistoryItem[]> {
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("completed_at, score, total, label")
    .order("completed_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  return ((data ?? []) as QuizAttemptRow[]).map((attempt) => ({
    date: attempt.completed_at,
    score: attempt.score,
    total: attempt.total,
    label: attempt.label,
  }));
}

export async function saveQuizAttempt(
  userId: string,
  mode: "practice" | "exam",
  item: HistoryItem,
) {
  const { error } = await supabase.from("quiz_attempts").insert({
    user_id: userId,
    mode,
    label: item.label,
    score: item.score,
    total: item.total,
    completed_at: item.date,
  });
  if (error) throw error;
}
