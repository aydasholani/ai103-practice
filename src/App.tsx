"use client";

import { useEffect, useMemo, useState } from "react";

type Option = { id: string; text: string };
type DropdownInteraction = {
  id: string;
  prompt: string;
  type: "dropdown";
  options: Option[];
  correctAnswer: string;
};
type YesNoInteraction = {
  id: string;
  type: "yes_no_table";
  options: Option[];
  rows: { id: string; text: string; correctAnswer: string }[];
};
type DragDropInteraction = {
  id: string;
  type: "drag_drop";
  choices: { id: string; text: string }[];
  targets: { id: string; prompt: string; correctAnswer: string }[];
};
type Interaction = DropdownInteraction | YesNoInteraction | DragDropInteraction;
type Question = {
  id: number;
  category: string;
  subcategory: string;
  question: string;
  type: string;
  context?: string;
  options?: Option[];
  correctAnswers?: string[];
  interactions?: Interaction[];
  media?: { type: string; src: string; alt: string }[];
};
type HistoryItem = { date: string; score: number; total: number; label: string };

const DOMAIN_META: Record<string, { short: string; tone: string }> = {
  "Plan and manage an Azure AI solution": { short: "Plan & manage", tone: "violet" },
  "Implement generative AI and agentic solutions": { short: "Generative AI & agents", tone: "blue" },
  "Implement computer vision solutions": { short: "Computer vision", tone: "orange" },
  "Implement text analysis solutions": { short: "Text analysis", tone: "green" },
  "Implement information extraction solutions": { short: "Information extraction", tone: "pink" },
};

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function expectedAnswers(question: Question) {
  const expected: Record<string, string | string[]> = {};
  if (question.type === "single" || question.type === "multiple") {
    expected.main = question.correctAnswers ?? [];
  }
  for (const interaction of question.interactions ?? []) {
    if (interaction.type === "dropdown") expected[interaction.id] = interaction.correctAnswer;
    if (interaction.type === "yes_no_table") {
      interaction.rows.forEach((row) => (expected[row.id] = row.correctAnswer));
    }
    if (interaction.type === "drag_drop") {
      interaction.targets.forEach((target) => (expected[target.id] = target.correctAnswer));
    }
  }
  return expected;
}

function answerIsCorrect(question: Question, answers: Record<string, string | string[]>) {
  const expected = expectedAnswers(question);
  return Object.entries(expected).every(([key, value]) => {
    const actual = answers[key];
    if (Array.isArray(value)) {
      const a = Array.isArray(actual) ? [...actual].sort() : [];
      return JSON.stringify(a) === JSON.stringify([...value].sort());
    }
    return actual === value;
  });
}

function answered(question: Question, answers: Record<string, string | string[]>) {
  const expected = expectedAnswers(question);
  return Object.keys(expected).every((key) => {
    const value = answers[key];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  });
}

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [view, setView] = useState<"home" | "quiz" | "result">("home");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [quiz, setQuiz] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [quizLabel, setQuizLabel] = useState("All domains");

  useEffect(() => {
    fetch("./questions.json").then((response) => response.json()).then(setQuestions);
    const saved = localStorage.getItem("ai103-history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const domains = useMemo(() => {
    return Object.keys(DOMAIN_META).map((name) => ({
      name,
      count: questions.filter((question) => question.category === name).length,
      ...DOMAIN_META[name],
    }));
  }, [questions]);

  function startQuiz(domain?: string) {
    const pool = domain ? questions.filter((question) => question.category === domain) : questions;
    setQuiz(shuffle(pool));
    setQuizLabel(domain ? DOMAIN_META[domain].short : "All domains");
    setIndex(0);
    setScore(0);
    setAnswers({});
    setSubmitted(false);
    setView("quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setAnswer(key: string, value: string | string[]) {
    if (!submitted) setAnswers((current) => ({ ...current, [key]: value }));
  }

  function submit() {
    if (!answered(quiz[index], answers)) return;
    if (answerIsCorrect(quiz[index], answers)) setScore((value) => value + 1);
    setSubmitted(true);
  }

  function next() {
    if (index < quiz.length - 1) {
      setIndex((value) => value + 1);
      setAnswers({});
      setSubmitted(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const finalScore = score + (submitted ? 0 : answerIsCorrect(quiz[index], answers) ? 1 : 0);
    const entry = { date: new Date().toISOString(), score: finalScore, total: quiz.length, label: quizLabel };
    const updated = [entry, ...history].slice(0, 8);
    setHistory(updated);
    localStorage.setItem("ai103-history", JSON.stringify(updated));
    setScore(finalScore);
    setView("result");
  }

  if (view === "quiz" && quiz[index]) {
    const question = quiz[index];
    const isCorrect = submitted && answerIsCorrect(question, answers);
    return (
      <main className="app-shell quiz-shell">
        <header className="topbar compact">
          <button className="brand brand-button" onClick={() => setView("home")} aria-label="Back to home">
            <span className="brand-mark">A</span><span>AI-103 Practice</span>
          </button>
          <div className="quiz-counter">Question {index + 1} of {quiz.length}</div>
          <button className="text-button" onClick={() => setView("home")}>Exit quiz</button>
        </header>
        <div className="progress-track"><span style={{ width: `${((index + 1) / quiz.length) * 100}%` }} /></div>

        <section className="question-wrap">
          <div className="question-meta">
            <span className={`domain-pill ${DOMAIN_META[question.category]?.tone ?? "blue"}`}>{DOMAIN_META[question.category]?.short}</span>
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

            {question.media?.map((media) => <img className="question-image" key={media.src} src={media.src} alt={media.alt} />)}

            {(question.type === "single" || question.type === "multiple") && (
              <div className="answer-list">
                {question.options?.map((option) => {
                  const selected = (answers.main ?? []).includes(option.id);
                  const correct = question.correctAnswers?.includes(option.id);
                  const state = submitted ? (correct ? "correct" : selected ? "wrong" : "") : selected ? "selected" : "";
                  return (
                    <label className={`answer-option ${state}`} key={option.id}>
                      <input
                        type={question.type === "multiple" ? "checkbox" : "radio"}
                        name="main-answer"
                        checked={selected}
                        onChange={() => {
                          if (question.type === "multiple") {
                            const current = (answers.main as string[]) ?? [];
                            setAnswer("main", selected ? current.filter((id) => id !== option.id) : [...current, option.id]);
                          } else setAnswer("main", [option.id]);
                        }}
                      />
                      <span className="option-letter">{option.id}</span>
                      <span className="preserve-text">{option.text}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {question.interactions?.map((interaction) => (
              <InteractionField key={interaction.id} interaction={interaction} answers={answers} submitted={submitted} onAnswer={setAnswer} />
            ))}

            {submitted && (
              <div className={`feedback ${isCorrect ? "success" : "error"}`}>
                <span className="feedback-icon">{isCorrect ? "✓" : "×"}</span>
                <div><strong>{isCorrect ? "Correct" : "Not quite"}</strong><p>{isCorrect ? "Good work — you selected the right answer." : "The correct answer is highlighted above."}</p></div>
              </div>
            )}

            <div className="question-actions">
              {!submitted ? (
                <button className="primary-button" disabled={!answered(question, answers)} onClick={submit}>Check answer</button>
              ) : (
                <button className="primary-button" onClick={next}>{index === quiz.length - 1 ? "See results" : "Next question"}</button>
              )}
            </div>
          </article>
        </section>
      </main>
    );
  }

  if (view === "result") {
    const percent = Math.round((score / quiz.length) * 100);
    return (
      <main className="app-shell result-page">
        <section className="result-card">
          <div className="result-ring" style={{ "--score": `${percent * 3.6}deg` } as React.CSSProperties}><span>{percent}%</span></div>
          <p className="eyebrow">Quiz complete</p>
          <h1>{score} of {quiz.length} correct</h1>
          <p>{percent >= 80 ? "Excellent work. You are building strong exam readiness." : percent >= 60 ? "Good progress. Review the areas you missed and try again." : "Keep practicing. Focus on one domain at a time."}</p>
          <div className="result-actions">
            <button className="primary-button" onClick={() => startQuiz(quizLabel === "All domains" ? undefined : Object.keys(DOMAIN_META).find((key) => DOMAIN_META[key].short === quizLabel))}>Try again</button>
            <button className="secondary-button" onClick={() => setView("home")}>Back to home</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">A</span><span>AI-103 Practice</span></div>
        <span className="question-total">{questions.length} practice questions</span>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Microsoft Azure certification</span>
          <h1>Prepare for AI-103 with focused practice.</h1>
          <p>Work through exam-style questions across every official domain. Check each answer instantly and track your progress on this device.</p>
          <div className="hero-stats"><span><strong>117</strong> Questions</span><span><strong>5</strong> Domains</span><span><strong>14</strong> Skill areas</span></div>
        </div>
        <div className="exam-card">
          <span className="azure-badge">AZURE</span>
          <div><small>Certification exam</small><strong>AI-103</strong><p>Azure AI Apps and Agents Developer Associate</p></div>
        </div>
      </section>

      <section className="practice-section">
        <div className="section-heading"><span className="eyebrow">Start practicing</span><h2>Choose your study mode</h2></div>
        <div className="mode-grid">
          <article className="mode-card featured">
            <div className="mode-icon">✦</div>
            <span className="card-kicker">Recommended</span>
            <h3>All domains</h3>
            <p>Practice with randomly mixed questions from all exam topics.</p>
            <div className="mode-detail"><span>Question mix</span><strong>All topics</strong></div>
            <div className="mode-detail"><span>Format</span><strong>Random order</strong></div>
            <button className="primary-button full" disabled={!questions.length} onClick={() => startQuiz()}>Start quiz <span>→</span></button>
          </article>

          <article className="mode-card">
            <div className="mode-icon outline">⌁</div>
            <span className="card-kicker muted">Focused study</span>
            <h3>Domain mode</h3>
            <p>Practice questions from a specific topic area.</p>
            <label className="select-label">Select domain
              <select value={selectedDomain} onChange={(event) => setSelectedDomain(event.target.value)}>
                <option value="">Choose a domain…</option>
                {domains.map((domain) => <option value={domain.name} key={domain.name}>{domain.short} ({domain.count})</option>)}
              </select>
            </label>
            <button className="secondary-button full" disabled={!selectedDomain} onClick={() => startQuiz(selectedDomain)}>Start domain quiz <span>→</span></button>
          </article>
        </div>
      </section>

      <section className="domains-section">
        <div className="section-heading row"><div><span className="eyebrow">Exam coverage</span><h2>Five official domains</h2></div><span className="subtle">Based on the April 2026 skills outline</span></div>
        <div className="domain-list">
          {domains.map((domain, i) => (
            <button className="domain-row" onClick={() => startQuiz(domain.name)} key={domain.name}>
              <span className={`domain-number ${domain.tone}`}>0{i + 1}</span>
              <span className="domain-name"><strong>{domain.name}</strong><small>{domain.count} questions</small></span>
              <span className="domain-arrow">→</span>
            </button>
          ))}
        </div>
      </section>

      <section className="history-section">
        <div className="section-heading"><span className="eyebrow">Your progress</span><h2>Quiz history</h2></div>
        {history.length ? (
          <div className="history-list">{history.map((item, i) => <div className="history-row" key={`${item.date}-${i}`}><span>{item.label}</span><span>{new Date(item.date).toLocaleDateString()}</span><strong>{item.score}/{item.total} · {Math.round((item.score / item.total) * 100)}%</strong></div>)}</div>
        ) : <div className="empty-history"><span>◷</span><p>Your completed quizzes will appear here.</p></div>}
      </section>

      <footer><span>AI-103 Exam Practice</span><span>Independent study tool · Not affiliated with Microsoft</span></footer>
    </main>
  );
}

function InteractionField({ interaction, answers, submitted, onAnswer }: { interaction: Interaction; answers: Record<string, string | string[]>; submitted: boolean; onAnswer: (key: string, value: string) => void }) {
  if (interaction.type === "dropdown") {
    const value = (answers[interaction.id] as string) ?? "";
    const state = submitted ? (value === interaction.correctAnswer ? "correct-select" : "wrong-select") : "";
    return <label className={`interaction-field ${state}`}><span>{interaction.prompt}</span><select value={value} disabled={submitted} onChange={(event) => onAnswer(interaction.id, event.target.value)}><option value="">Select an answer…</option>{interaction.options.map((option) => <option key={option.id} value={option.id}>{option.text}</option>)}</select>{submitted && value !== interaction.correctAnswer && <small>Correct: {interaction.options.find((option) => option.id === interaction.correctAnswer)?.text}</small>}</label>;
  }
  if (interaction.type === "yes_no_table") {
    return <div className="table-interaction"><div className="table-head"><span>Statement</span><span>Yes</span><span>No</span></div>{interaction.rows.map((row) => <div className="table-row" key={row.id}><p>{row.text}</p>{["yes", "no"].map((value) => { const selected = answers[row.id] === value; const correct = row.correctAnswer === value; return <label className={submitted ? (correct ? "radio-correct" : selected ? "radio-wrong" : "") : ""} key={value}><input type="radio" name={row.id} checked={selected} disabled={submitted} onChange={() => onAnswer(row.id, value)} /><span /></label>; })}</div>)}</div>;
  }
  return <div className="mapping-interaction">{interaction.targets.map((target) => { const value = (answers[target.id] as string) ?? ""; return <label className={submitted ? (value === target.correctAnswer ? "correct-select" : "wrong-select") : ""} key={target.id}><span>{target.prompt}</span><select value={value} disabled={submitted} onChange={(event) => onAnswer(target.id, event.target.value)}><option value="">Choose an option…</option>{interaction.choices.map((choice) => <option value={choice.text} key={choice.id}>{choice.text}</option>)}</select>{submitted && value !== target.correctAnswer && <small>Correct: {target.correctAnswer}</small>}</label>; })}</div>;
}
