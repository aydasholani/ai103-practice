import { DOMAIN_META } from "../constants/domains";
import type { HistoryItem, Question, QuestionCount } from "../types/quiz";
import { Brand } from "./Brand";

type HomeViewProps = {
  questions: Question[];
  history: HistoryItem[];
  selectedDomain: string;
  questionCount: QuestionCount;
  onDomainChange: (domain: string) => void;
  onQuestionCountChange: (count: QuestionCount) => void;
  onStart: (domain?: string) => void;
};

const QUESTION_COUNTS: { value: QuestionCount; label: string }[] = [
  { value: "10", label: "10 questions" },
  { value: "25", label: "25 questions" },
  { value: "50", label: "50 questions" },
  { value: "all", label: "All questions" },
];

export function HomeView({
  questions,
  history,
  selectedDomain,
  questionCount,
  onDomainChange,
  onQuestionCountChange,
  onStart,
}: HomeViewProps) {
  const domains = Object.keys(DOMAIN_META).map((name) => ({
    name,
    count: questions.filter((question) => question.category === name).length,
    ...DOMAIN_META[name],
  }));

  const countSelect = (
    <label className="select-label">
      Number of questions
      <select
        value={questionCount}
        onChange={(event) =>
          onQuestionCountChange(event.target.value as QuestionCount)
        }
      >
        {QUESTION_COUNTS.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );

  return (
    <main className="app-shell">
      <header className="topbar">
        <Brand />
        <span className="question-total">{questions.length} practice questions</span>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Microsoft Azure certification</span>
          <h1>Prepare for AI-103 with focused practice.</h1>
          <p>
            Work through exam-style questions across every official domain.
            Check each answer instantly and track your progress on this device.
          </p>
          <div className="hero-stats">
            <span><strong>{questions.length || 117}</strong> Questions</span>
            <span><strong>5</strong> Domains</span>
            <span><strong>14</strong> Skill areas</span>
          </div>
        </div>
        <div className="exam-card">
          <span className="azure-badge">AZURE</span>
          <div>
            <small>Certification exam</small><strong>AI-103</strong>
            <p>Azure AI Apps and Agents Developer Associate</p>
          </div>
        </div>
      </section>

      <section className="practice-section">
        <div className="section-heading">
          <span className="eyebrow">Start practicing</span>
          <h2>Choose your study mode</h2>
        </div>
        <div className="mode-grid">
          <article className="mode-card featured">
            <div className="mode-icon">✦</div>
            <span className="card-kicker">Recommended</span>
            <h3>All domains</h3>
            <p>Practice with randomly mixed questions from all exam topics.</p>
            <div className="mode-detail"><span>Question mix</span><strong>All topics</strong></div>
            <div className="mode-detail"><span>Format</span><strong>Random order</strong></div>
            {countSelect}
            <button
              className="primary-button full"
              disabled={!questions.length}
              onClick={() => onStart()}
            >
              Start quiz <span>→</span>
            </button>
          </article>

          <article className="mode-card">
            <div className="mode-icon outline">⌁</div>
            <span className="card-kicker muted">Focused study</span>
            <h3>Domain mode</h3>
            <p>Practice questions from a specific topic area.</p>
            <label className="select-label">
              Select domain
              <select
                value={selectedDomain}
                onChange={(event) => onDomainChange(event.target.value)}
              >
                <option value="">Choose a domain…</option>
                {domains.map((domain) => (
                  <option value={domain.name} key={domain.name}>
                    {domain.short} ({domain.count})
                  </option>
                ))}
              </select>
            </label>
            {countSelect}
            <button
              className="secondary-button full"
              disabled={!selectedDomain}
              onClick={() => onStart(selectedDomain)}
            >
              Start domain quiz <span>→</span>
            </button>
          </article>
        </div>
      </section>

      <section className="domains-section">
        <div className="section-heading row">
          <div><span className="eyebrow">Exam coverage</span><h2>Five official domains</h2></div>
          <span className="subtle">Based on the April 2026 skills outline</span>
        </div>
        <div className="domain-list">
          {domains.map((domain, index) => (
            <button
              className="domain-row"
              onClick={() => onStart(domain.name)}
              key={domain.name}
            >
              <span className={`domain-number ${domain.tone}`}>0{index + 1}</span>
              <span className="domain-name">
                <strong>{domain.name}</strong><small>{domain.count} questions</small>
              </span>
              <span className="domain-arrow">→</span>
            </button>
          ))}
        </div>
      </section>

      <section className="history-section">
        <div className="section-heading">
          <span className="eyebrow">Your progress</span><h2>Quiz history</h2>
        </div>
        {history.length ? (
          <div className="history-list">
            {history.map((item, index) => (
              <div className="history-row" key={`${item.date}-${index}`}>
                <span>{item.label}</span>
                <span>{new Date(item.date).toLocaleDateString()}</span>
                <strong>{item.score}/{item.total} · {Math.round((item.score / item.total) * 100)}%</strong>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-history"><span>◷</span><p>Your completed quizzes will appear here.</p></div>
        )}
      </section>

      <footer>
        <span>AI-103 Exam Practice</span>
        <span>Independent study tool · Not affiliated with Microsoft</span>
      </footer>
    </main>
  );
}
