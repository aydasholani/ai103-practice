import { supabase } from "../lib/supabase";

export type ConceptPerformance = {
  conceptKey: string;
  attempts: number;
  correctAttempts: number;
  correctStreak: number;
  lastWasCorrect: boolean;
};

type ConceptAttemptRow = {
  concept_key: string;
  is_correct: boolean;
};

export async function loadConceptPerformance(): Promise<ConceptPerformance[]> {
  const { data, error } = await supabase
    .from("concept_attempts")
    .select("concept_key, is_correct")
    .order("answered_at", { ascending: true });
  if (error) throw error;

  const totals = new Map<string, ConceptPerformance>();
  for (const row of (data ?? []) as ConceptAttemptRow[]) {
    const current = totals.get(row.concept_key) ?? {
      conceptKey: row.concept_key,
      attempts: 0,
      correctAttempts: 0,
      correctStreak: 0,
      lastWasCorrect: false,
    };
    current.attempts += 1;
    current.correctAttempts += row.is_correct ? 1 : 0;
    current.correctStreak = row.is_correct ? current.correctStreak + 1 : 0;
    current.lastWasCorrect = row.is_correct;
    totals.set(row.concept_key, current);
  }
  return [...totals.values()];
}

export async function saveConceptAttempts(
  userId: string,
  category: string,
  attempts: { concept: { term: string }; isCorrect: boolean }[],
) {
  if (!attempts.length) return;
  const { error } = await supabase.from("concept_attempts").insert(attempts.map((attempt) => ({
    user_id: userId,
    concept_key: attempt.concept.term.trim().toLowerCase(),
    term: attempt.concept.term,
    category,
    is_correct: attempt.isCorrect,
  })));
  if (error) throw error;
}
