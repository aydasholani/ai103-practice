import { useEffect, useRef, useState } from "react";
import { DOMAIN_META } from "../constants/domains";
import type { Answers, ExamAnswers, Question } from "../types/quiz";
import { isAnswered } from "../utils/quiz";
import { Brand } from "./Brand";
import { InteractionField } from "./InteractionField";

const EXAM_SECONDS = 120 * 60;

type ExamViewProps = {
  question: Question;
  questions: Question[];
  index: number;
  answers: Answers;
  allAnswers: ExamAnswers;
  flaggedQuestions: number[];
  onAnswer: (key: string, value: string | string[]) => void;
  onNavigate: (index: number) => void;
  onToggleFlag: () => void;
  onFinish: () => void;
  onExit: () => void;
};

function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function ExamView(props: ExamViewProps) {
  const [secondsLeft, setSecondsLeft] = useState(EXAM_SECONDS);
  const finishRef = useRef(props.onFinish);
  finishRef.current = props.onFinish;
  const { question, questions, index, answers } = props;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          finishRef.current();
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const submitExam = () => {
    const unanswered = questions.filter((item) =>
      !isAnswered(item, props.allAnswers[item.id] ?? {}),
    ).length;
    const message = unanswered
      ? `You have ${unanswered} unanswered question${unanswered === 1 ? "" : "s"}. Submit anyway?`
      : "Submit exam and view your result?";
    if (window.confirm(message)) props.onFinish();
  };

  return (
    <main className="app-shell quiz-shell">
      <header className="topbar compact exam-topbar">
        <Brand />
        <div className={`exam-timer ${secondsLeft < 600 ? "urgent" : ""}`}>
          <span>Time remaining</span><strong>{formatTime(secondsLeft)}</strong>
        </div>
        <button className="text-button" onClick={props.onExit}>Exit exam</button>
      </header>
      <div className="progress-track"><span style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div>

      <div className="exam-layout">
        <aside className="exam-navigator">
          <strong>Questions</strong>
          <div className="question-grid">
            {questions.map((item, itemIndex) => {
              const answered = isAnswered(item, props.allAnswers[item.id] ?? {});
              const flagged = props.flaggedQuestions.includes(item.id);
              return (
                <button
                  className={`${itemIndex === index ? "current" : ""} ${answered ? "answered" : ""} ${flagged ? "flagged" : ""}`}
                  key={item.id}
                  onClick={() => props.onNavigate(itemIndex)}
                  title={flagged ? "Flagged for review" : undefined}
                >{itemIndex + 1}</button>
              );
            })}
          </div>
          <button className="secondary-button full" onClick={submitExam}>Submit exam</button>
        </aside>

        <section className="exam-question-area">
          <div className="question-meta">
            <span className={`domain-pill ${DOMAIN_META[question.category]?.tone ?? "blue"}`}>{DOMAIN_META[question.category]?.short}</span>
            <span>Question {index + 1} of {questions.length}</span>
          </div>
          <article className="question-card">
            {question.context && <details className="context-box"><summary>Open case study context</summary><div className="preserve-text">{question.context}</div></details>}
            <div className="exam-question-heading">
              <div className="question-number">Question {question.id}</div>
              <button className={`flag-button ${props.flaggedQuestions.includes(question.id) ? "active" : ""}`} onClick={props.onToggleFlag}>⚑ Mark for review</button>
            </div>
            <h1 className="question-text preserve-text">{question.question}</h1>
            {question.media?.map((media) => <img className="question-image" key={media.src} src={media.src} alt={media.alt} />)}

            {(question.type === "single" || question.type === "multiple") && (
              <div className="answer-list">
                {question.options?.map((option) => {
                  const selected = (answers.main ?? []).includes(option.id);
                  return (
                    <label className={`answer-option ${selected ? "selected" : ""}`} key={option.id}>
                      <input
                        type={question.type === "multiple" ? "checkbox" : "radio"}
                        name="main-answer"
                        checked={selected}
                        onChange={() => {
                          if (question.type === "multiple") {
                            const current = (answers.main as string[]) ?? [];
                            const maximumSelections = question.correctAnswers?.length ?? current.length + 1;
                            if (!selected && current.length >= maximumSelections) return;
                            props.onAnswer("main", selected ? current.filter((id) => id !== option.id) : [...current, option.id]);
                          } else props.onAnswer("main", [option.id]);
                        }}
                      />
                      <span className="option-letter">{option.id}</span>
                      <span className="preserve-text">{option.text}</span>
                    </label>
                  );
                })}
              </div>
            )}
            {question.interactions?.map((interaction) => <InteractionField key={interaction.id} interaction={interaction} answers={answers} submitted={false} onAnswer={props.onAnswer} />)}

            <div className="question-actions exam-actions">
              <button className="secondary-button" disabled={index === 0} onClick={() => props.onNavigate(index - 1)}>← Previous</button>
              {index < questions.length - 1
                ? <button className="primary-button" onClick={() => props.onNavigate(index + 1)}>Next →</button>
                : <button className="primary-button" onClick={submitExam}>Submit exam</button>}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
