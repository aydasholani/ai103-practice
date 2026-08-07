import { supabase } from "../lib/supabase";

export async function loadMasteredQuestionIds(): Promise<number[]> {
  const { data, error } = await supabase
    .from("mastered_questions")
    .select("question_id")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => row.question_id);
}

export async function setQuestionMastered(
  userId: string,
  questionId: number,
  mastered: boolean,
) {
  if (mastered) {
    const { error } = await supabase
      .from("mastered_questions")
      .upsert(
        { user_id: userId, question_id: questionId },
        { onConflict: "user_id,question_id" },
      );
    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from("mastered_questions")
    .delete()
    .eq("user_id", userId)
    .eq("question_id", questionId);
  if (error) throw error;
}
