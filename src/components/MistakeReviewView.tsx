import { questionLearnUrl } from "../constants/domains";
import type { Question, StudyProgress } from "../types/quiz";
import { Brand } from "./Brand";

export function MistakeReviewView({ questions, progress, onPractice, onHome }: {
  questions: Question[];
  progress: StudyProgress[];
  onPractice: () => void;
  onHome: () => void;
}) {
  const byId = new Map(questions.map((question) => [question.id, question]));
  const mistakes = progress.filter((item) => !item.wasCorrect)
    .map((item) => ({ item, question: byId.get(item.questionId) }))
    .filter((entry): entry is { item: StudyProgress; question: Question } => Boolean(entry.question));
  return <main className="app-shell">
    <header className="topbar"><Brand asButton onClick={onHome} /><button className="text-button" onClick={onHome}>Back home</button></header>
    <section className="review-page">
      <div className="section-heading"><span className="eyebrow">Review</span><h1>Mistake review</h1><p>Your latest incorrect answers, correct answers, and explanations.</p></div>
      {mistakes.length ? <>
        <button className="primary-button" onClick={onPractice}>Practice these questions</button>
        <div className="mistake-list">{mistakes.map(({ item, question }) => <details className="review-question" key={question.id}>
          <summary><span>Question {question.id}: {question.question}</span><strong>Latest answer incorrect</strong></summary>
          <div className="review-body">
            <p><b>Your latest answer:</b> {Object.values(item.lastAnswers).flat().join(", ") || "No answer recorded"}</p>
            <p><b>Correct answer:</b> {question.correctAnswers?.join(", ") || question.interactions?.map((i) => "correctAnswer" in i ? i.correctAnswer : i.type).join(", ")}</p>
            {question.options?.filter((option) => question.correctAnswers?.includes(option.id)).map((option) => <p key={option.id}><b>{option.id}.</b> {option.explanation || option.text}</p>)}
            <a className="learn-link" href={questionLearnUrl(question)} target="_blank" rel="noreferrer">Study this topic on Microsoft Learn ↗</a>
          </div>
        </details>)}</div>
      </> : <div className="empty-history"><p>No mistakes recorded yet.</p></div>}
    </section>
  </main>;
}
