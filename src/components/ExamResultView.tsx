import type { CSSProperties } from "react";
import type { ExamAnswers, Question } from "../types/quiz";
import { scoreQuestion } from "../utils/quiz";
import { InteractionField } from "./InteractionField";
import { CodeAnswerTemplate } from "./CodeAnswerTemplate";
import { QuestionSupportingContent } from "./QuestionSupportingContent";

type ExamResultViewProps = {
  questions: Question[];
  answers: ExamAnswers;
  score: number;
  maximumScore: number;
  onRetry: () => void;
  onHome: () => void;
};

export function ExamResultView({ questions, answers, score, maximumScore, onRetry, onHome }: ExamResultViewProps) {
  const percent = Math.round((score / maximumScore) * 100);
  const passed = percent >= 80;

  return (
    <main className="app-shell exam-result-page">
      <section className="result-card exam-summary">
        <div className="result-ring" style={{ "--score": `${percent * 3.6}deg` } as CSSProperties}><span>{percent}%</span></div>
        <p className="eyebrow">Exam complete</p>
        <h1>{passed ? "Passed" : "Not passed"}</h1>
        <p>{score} of {maximumScore} points · Practice target: 80%</p>
        <div className="result-actions"><button className="primary-button" onClick={onRetry}>New exam</button><button className="secondary-button" onClick={onHome}>Back to home</button></div>
      </section>

      <section className="exam-review">
        <div className="section-heading"><span className="eyebrow">Answer review</span><h2>Review every question</h2></div>
        {questions.map((question, index) => {
          const questionAnswers = answers[question.id] ?? {};
          const points = scoreQuestion(question, questionAnswers);
          const correct = points.earned === points.maximum;
          const partial = points.earned > 0 && !correct;
          return (
            <details className={`review-question ${correct ? "review-correct" : partial ? "review-partial" : "review-wrong"}`} key={question.id}>
              <summary><span>Question {index + 1}</span><strong>{correct ? "Correct" : partial ? "Partial" : "Incorrect"} · {points.earned}/{points.maximum} points</strong></summary>
              <div className="review-body">
                <h3 className="preserve-text">{question.question}</h3>
                <QuestionSupportingContent question={question} />
                {(question.type === "single" || question.type === "multiple") && <div className="answer-list">
                  {question.options?.map((option) => {
                    const selected = (questionAnswers.main ?? []).includes(option.id);
                    const isCorrectOption = question.correctAnswers?.includes(option.id);
                    const state = isCorrectOption ? "correct" : selected ? "wrong" : "";
                    return <div className={`answer-option ${state}`} key={option.id}><span /><span className="option-letter">{option.id}</span><span className="option-content"><span>{option.text}</span>{option.explanation && <small className="option-explanation"><strong>{isCorrectOption ? "Why it is correct:" : "Why it is incorrect:"}</strong> {option.explanation}</small>}</span></div>;
                  })}
                </div>}
                {question.answerTemplate
                  ? <CodeAnswerTemplate question={question} answers={questionAnswers} submitted onAnswer={() => undefined} />
                  : question.interactions?.map((interaction) => <InteractionField key={interaction.id} interaction={interaction} answers={questionAnswers} submitted onAnswer={() => undefined} />)}
                {question.communityNotes && <div className={`community-notes open-note ${question.communityNotes.answerDisputed ? "disputed" : ""}`}><strong>Community discussion{question.communityNotes.answerDisputed ? " · Answer debated" : ""}</strong><p>{question.communityNotes.summary}</p>{question.communityNotes.caveats?.length ? <ul>{question.communityNotes.caveats.map((caveat) => <li key={caveat}>{caveat}</li>)}</ul> : null}</div>}
              </div>
            </details>
          );
        })}
      </section>
    </main>
  );
}
