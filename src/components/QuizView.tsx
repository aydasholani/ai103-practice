import { DOMAIN_META } from "../constants/domains";
import type { Answers, Question } from "../types/quiz";
import { answerIsCorrect, isAnswered } from "../utils/quiz";
import { Brand } from "./Brand";
import { InteractionField } from "./InteractionField";

type QuizViewProps = {
  question: Question;
  index: number;
  total: number;
  answers: Answers;
  submitted: boolean;
  onAnswer: (key: string, value: string | string[]) => void;
  onSubmit: () => void;
  onNext: () => void;
  onExit: () => void;
};

export function QuizView(props: QuizViewProps) {
  const { question, index, total, answers, submitted } = props;
  const correct = submitted && answerIsCorrect(question, answers);

  return (
    <main className="app-shell quiz-shell">
      <header className="topbar compact">
        <Brand asButton onClick={props.onExit} />
        <div className="quiz-counter">Question {index + 1} of {total}</div>
        <button className="text-button" onClick={props.onExit}>Exit quiz</button>
      </header>
      <div className="progress-track">
        <span style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>

      <section className="question-wrap">
        <div className="question-meta">
          <span className={`domain-pill ${DOMAIN_META[question.category]?.tone ?? "blue"}`}>
            {DOMAIN_META[question.category]?.short}
          </span>
          <span>{question.subcategory}</span>
        </div>
        <article className="question-card">
          {question.context && (
            <details className="context-box">
              <summary>Open case study context</summary>
              <div className="preserve-text">{question.context}</div>
            </details>
          )}
          <div className="question-number">Question {question.id}</div>
          <h1 className="question-text preserve-text">{question.question}</h1>

          {question.media?.map((media) => (
            <img className="question-image" key={media.src} src={media.src} alt={media.alt} />
          ))}

          {(question.type === "single" || question.type === "multiple") && (
            <div className="answer-list">
              {question.options?.map((option) => {
                const selected = (answers.main ?? []).includes(option.id);
                const isCorrectOption = question.correctAnswers?.includes(option.id);
                const state = submitted
                  ? isCorrectOption ? "correct" : selected ? "wrong" : ""
                  : selected ? "selected" : "";

                return (
                  <label className={`answer-option ${state}`} key={option.id}>
                    <input
                      type={question.type === "multiple" ? "checkbox" : "radio"}
                      name="main-answer"
                      checked={selected}
                      disabled={submitted}
                      onChange={() => {
                        if (question.type === "multiple") {
                          const current = (answers.main as string[]) ?? [];
                          props.onAnswer(
                            "main",
                            selected
                              ? current.filter((id) => id !== option.id)
                              : [...current, option.id],
                          );
                        } else {
                          props.onAnswer("main", [option.id]);
                        }
                      }}
                    />
                    <span className="option-letter">{option.id}</span>
                    <span className="option-content">
                      <span className="preserve-text">{option.text}</span>
                      {submitted && option.explanation && (
                        <small className="option-explanation">
                          <strong>{isCorrectOption ? "Why it is correct:" : "Why it is incorrect:"}</strong>{" "}
                          {option.explanation}
                        </small>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
          )}

          {question.interactions?.map((interaction) => (
            <InteractionField
              key={interaction.id}
              interaction={interaction}
              answers={answers}
              submitted={submitted}
              onAnswer={props.onAnswer}
            />
          ))}

          {submitted && (
            <div className={`feedback ${correct ? "success" : "error"}`}>
              <span className="feedback-icon">{correct ? "✓" : "×"}</span>
              <div>
                <strong>{correct ? "Correct" : "Not quite"}</strong>
                <p>{correct
                  ? "Good work — you selected the right answer."
                  : "The correct answer is highlighted above."}</p>
              </div>
            </div>
          )}

          {submitted && question.communityNotes && (
            <details className={`community-notes ${question.communityNotes.answerDisputed ? "disputed" : ""}`}>
              <summary>
                Community discussion
                {question.communityNotes.answerDisputed && <span>Answer debated</span>}
              </summary>
              <div>
                <p>{question.communityNotes.summary}</p>
                {question.communityNotes.caveats?.length ? (
                  <ul>{question.communityNotes.caveats.map((caveat) => <li key={caveat}>{caveat}</li>)}</ul>
                ) : null}
              </div>
            </details>
          )}

          <div className="question-actions">
            {!submitted ? (
              <button
                className="primary-button"
                disabled={!isAnswered(question, answers)}
                onClick={props.onSubmit}
              >
                Check answer
              </button>
            ) : (
              <button className="primary-button" onClick={props.onNext}>
                {index === total - 1 ? "See results" : "Next question"}
              </button>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}
