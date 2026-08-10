import { useEffect, useRef, useState } from "react";
import { DOMAIN_META } from "../constants/domains";
import type { Answers, ExamAnswers, Question } from "../types/quiz";
import { isAnswered } from "../utils/quiz";
import { Brand } from "./Brand";
import { InteractionField } from "./InteractionField";
import { CaseStudyPanel } from "./CaseStudyPanel";
import { CodeAnswerTemplate } from "./CodeAnswerTemplate";
import { QuestionSupportingContent } from "./QuestionSupportingContent";

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
  const [committedLockedIds, setCommittedLockedIds] = useState<number[]>([]);
  const [completedCaseIds, setCompletedCaseIds] = useState<string[]>([]);
  const [reviewingCase, setReviewingCase] = useState(false);
  const finishRef = useRef(props.onFinish);
  finishRef.current = props.onFinish;
  const { question, questions, index, answers } = props;
  const locked = question.examGroup?.locked === true;
  const caseId = question.caseStudy?.id;
  const caseIndexes = caseId ? questions.map((item, itemIndex) => item.caseStudy?.id === caseId ? itemIndex : -1).filter((itemIndex) => itemIndex >= 0) : [];
  const caseStart = caseIndexes[0] ?? -1;
  const caseEnd = caseIndexes.at(-1) ?? -1;

  const navigate = (targetIndex: number) => {
    const target = questions[targetIndex];
    if (!target || committedLockedIds.includes(target.id)) return;
    if (target.caseStudy && completedCaseIds.includes(target.caseStudy.id)) return;
    if (caseId && (targetIndex < caseStart || targetIndex > caseEnd)) return;
    if (locked) {
      if (targetIndex !== index + 1 || !isAnswered(question, answers)) return;
      setCommittedLockedIds((current) => [...current, question.id]);
      props.onNavigate(targetIndex);
      return;
    }
    if (target.examGroup?.locked && target.examGroup.position !== 1) return;
    if (target.caseStudy && target.caseStudy.position !== 1 && target.caseStudy.id !== caseId) return;
    setReviewingCase(false);
    props.onNavigate(targetIndex);
  };

  const finishCaseStudy = () => {
    if (!caseId) return;
    setCompletedCaseIds((current) => [...current, caseId]);
    setReviewingCase(false);
    if (caseEnd < questions.length - 1) props.onNavigate(caseEnd + 1);
    else submitExam();
  };

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
              const lockedItem = item.examGroup?.locked === true;
              const caseItem = item.caseStudy;
              const inaccessible = committedLockedIds.includes(item.id)
                || (locked && itemIndex !== index)
                || (lockedItem && item.examGroup?.position !== 1 && itemIndex !== index)
                || Boolean(caseItem && completedCaseIds.includes(caseItem.id))
                || Boolean(caseId && caseItem?.id !== caseId)
                || Boolean(caseItem && caseItem.position !== 1 && caseItem.id !== caseId);
              return (
                <button
                  className={`${itemIndex === index ? "current" : ""} ${answered ? "answered" : ""} ${flagged ? "flagged" : ""}`}
                  key={item.id}
                  onClick={() => navigate(itemIndex)}
                  disabled={inaccessible}
                  title={inaccessible ? "This question cannot be reviewed" : flagged ? "Flagged for review" : undefined}
                >{itemIndex + 1}</button>
              );
            })}
          </div>
          <button className="secondary-button full" disabled={locked || Boolean(caseId)} onClick={submitExam}>Submit exam</button>
        </aside>

        <section className="exam-question-area">
          <div className="question-meta">
            <span className={`domain-pill ${DOMAIN_META[question.category]?.tone ?? "blue"}`}>{DOMAIN_META[question.category]?.short}</span>
            <span>Question {index + 1} of {questions.length}</span>
          </div>
          <div className={question.caseStudy ? "case-study-question-layout" : ""}>
          {question.caseStudy && question.context && <CaseStudyPanel context={question.context} />}
          <article className="question-card">
            {question.caseStudy && <div className="case-section-notice"><strong>Case study · Question {question.caseStudy.position} of {question.caseStudy.size}</strong><span>You can review questions in this case until you finish the section. You cannot return after leaving it.</span></div>}
            {reviewingCase && caseId && <section className="case-review-screen"><span className="eyebrow">Case study review</span><h2>Review your answers</h2><p>You can return to any question in this case before finishing the section.</p><div className="case-review-grid">{caseIndexes.map((itemIndex) => {
              const item = questions[itemIndex];
              const answered = isAnswered(item, props.allAnswers[item.id] ?? {});
              return <button className={answered ? "answered" : ""} key={item.id} onClick={() => navigate(itemIndex)}>Question {item.caseStudy?.position} · {answered ? "Answered" : "Unanswered"}</button>;
            })}</div><button className="primary-button" onClick={finishCaseStudy}>Finish case study →</button></section>}
            {locked && <div className="locked-section-notice"><strong>Locked solution set · {question.examGroup?.position} of {question.examGroup?.size}</strong><span>Answer before continuing. After Next, you cannot return to this question.</span></div>}
            {question.context && !question.caseStudy && <details className="context-box"><summary>Open case study context</summary><div className="preserve-text">{question.context}</div></details>}
            <div className="exam-question-heading">
              <div className="question-number">Question {question.id}</div>
              {!locked && <button className={`flag-button ${props.flaggedQuestions.includes(question.id) ? "active" : ""}`} onClick={props.onToggleFlag}>⚑ Mark for review</button>}
            </div>
            <h1 className="question-text preserve-text">{question.question}</h1>
            <QuestionSupportingContent question={question} />
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
            {question.answerTemplate
              ? <CodeAnswerTemplate question={question} answers={answers} submitted={false} onAnswer={(key, value) => props.onAnswer(key, value)} />
              : question.interactions?.map((interaction) => <InteractionField key={interaction.id} interaction={interaction} answers={answers} submitted={false} onAnswer={props.onAnswer} />)}

            <div className="question-actions exam-actions">
              <button className="secondary-button" disabled={index === 0 || locked || index === caseStart || questions[index - 1]?.examGroup?.reviewable === false} onClick={() => navigate(index - 1)}>← Previous</button>
              {caseId && index === caseEnd
                ? <button className="primary-button" onClick={() => setReviewingCase(true)}>Review case study →</button>
                : index < questions.length - 1
                ? <button className="primary-button" disabled={locked && !isAnswered(question, answers)} onClick={() => navigate(index + 1)}>Next →</button>
                : <button className="primary-button" disabled={locked && !isAnswered(question, answers)} onClick={submitExam}>Submit exam</button>}
            </div>
          </article>
          </div>
        </section>
      </div>
    </main>
  );
}
