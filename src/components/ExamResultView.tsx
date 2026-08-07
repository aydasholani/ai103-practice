import type { CSSProperties } from "react";
import type { ExamAnswers, Question } from "../types/quiz";
import { answerIsCorrect } from "../utils/quiz";
import { InteractionField } from "./InteractionField";

type ExamResultViewProps = {
  questions: Question[];
  answers: ExamAnswers;
  score: number;
  onRetry: () => void;
  onHome: () => void;
};

export function ExamResultView({ questions, answers, score, onRetry, onHome }: ExamResultViewProps) {
  const percent = Math.round((score / questions.length) * 100);
  const passed = percent >= 70;

  return (
    <main className="app-shell exam-result-page">
      <section className="result-card exam-summary">
        <div className="result-ring" style={{ "--score": `${percent * 3.6}deg` } as CSSProperties}><span>{percent}%</span></div>
        <p className="eyebrow">Exam complete</p>
        <h1>{passed ? "Passed" : "Not passed"}</h1>
        <p>{score} of {questions.length} correct · Passing score: 70%</p>
        <div className="result-actions"><button className="primary-button" onClick={onRetry}>New exam</button><button className="secondary-button" onClick={onHome}>Back to home</button></div>
      </section>

      <section className="exam-review">
        <div className="section-heading"><span className="eyebrow">Answer review</span><h2>Review every question</h2></div>
        {questions.map((question, index) => {
          const questionAnswers = answers[question.id] ?? {};
          const correct = answerIsCorrect(question, questionAnswers);
          return (
            <details className={`review-question ${correct ? "review-correct" : "review-wrong"}`} key={question.id}>
              <summary><span>Question {index + 1}</span><strong>{correct ? "Correct" : "Incorrect"}</strong></summary>
              <div className="review-body">
                <h3 className="preserve-text">{question.question}</h3>
                {(question.type === "single" || question.type === "multiple") && <div className="answer-list">
                  {question.options?.map((option) => {
                    const selected = (questionAnswers.main ?? []).includes(option.id);
                    const isCorrectOption = question.correctAnswers?.includes(option.id);
                    const state = isCorrectOption ? "correct" : selected ? "wrong" : "";
                    return <div className={`answer-option ${state}`} key={option.id}><span /><span className="option-letter">{option.id}</span><span className="option-content"><span>{option.text}</span>{option.explanation && <small className="option-explanation"><strong>{isCorrectOption ? "Why it is correct:" : "Why it is incorrect:"}</strong> {option.explanation}</small>}</span></div>;
                  })}
                </div>}
                {question.interactions?.map((interaction) => <InteractionField key={interaction.id} interaction={interaction} answers={questionAnswers} submitted onAnswer={() => undefined} />)}
              </div>
            </details>
          );
        })}
      </section>
    </main>
  );
}
