import { DOMAIN_META } from "../constants/domains";
import type { HistoryItem, Question, QuestionCount, QuestionPerformance } from "../types/quiz";
import { Brand } from "./Brand";

type HomeViewProps = {
  questions: Question[];
  history: HistoryItem[];
  selectedDomain: string;
  questionCount: QuestionCount;
  onDomainChange: (domain: string) => void;
  onQuestionCountChange: (count: QuestionCount) => void;
  onStart: (domain?: string) => void;
  onStartNeedsPractice: () => void;
  onStartExam: () => void;
  userEmail: string;
  onSignOut: () => void;
  masteredQuestionIds: number[];
  questionPerformance: QuestionPerformance[];
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
  onStartNeedsPractice,
  onStartExam,
  userEmail,
  onSignOut,
  masteredQuestionIds,
  questionPerformance,
}: HomeViewProps) {
  const masteredSet = new Set(masteredQuestionIds);
  const masteredCount = questions.filter((question) => masteredSet.has(question.id)).length;
  const remainingCount = questions.length - masteredCount;
  const performanceMap = new Map(questionPerformance.map((item) => [item.questionId, item]));
  const weakQuestionIds = new Set(questionPerformance
    .filter((item) => item.maximumPoints > 0 && item.earnedPoints / item.maximumPoints < 0.7)
    .map((item) => item.questionId));
  const weakCount = questions.filter((question) =>
    weakQuestionIds.has(question.id) && !masteredSet.has(question.id)).length;
  const domains = Object.keys(DOMAIN_META).map((name) => {
    const domainQuestions = questions.filter((question) => question.category === name);
    const mastered = domainQuestions.filter((question) => masteredSet.has(question.id)).length;
    const performance = domainQuestions
      .map((question) => performanceMap.get(question.id))
      .filter((item): item is QuestionPerformance => Boolean(item));
    const earnedPoints = performance.reduce((total, item) => total + item.earnedPoints, 0);
    const maximumPoints = performance.reduce((total, item) => total + item.maximumPoints, 0);
    return {
      name,
      total: domainQuestions.length,
      mastered,
      count: domainQuestions.length - mastered,
      accuracy: maximumPoints ? Math.round((earnedPoints / maximumPoints) * 100) : null,
      ...DOMAIN_META[name],
    };
  });
  const selectedDomainRemaining = domains.find((domain) => domain.name === selectedDomain)?.count ?? 0;

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
        <div className="account-menu">
          <span>{userEmail}</span>
          <button className="text-button" onClick={onSignOut}>Sign out</button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Microsoft Azure certification</span>
          <h1>Prepare for AI-103 with focused practice.</h1>
          <p>
            Work through exam-style questions across every official domain.
            Check each answer instantly and sync your progress across devices.
          </p>
          <div className="hero-stats">
            <span><strong>{remainingCount}</strong> Remaining</span>
            <span><strong>{masteredCount}</strong> Mastered</span>
            <span><strong>{questions.length || 117}</strong> Total</span>
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
            <div className="mode-detail"><span>Available</span><strong>{remainingCount} questions</strong></div>
            <div className="mode-detail"><span>Format</span><strong>Random order</strong></div>
            {countSelect}
            <button
              className="primary-button full"
              disabled={!questions.length || remainingCount === 0}
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
                    {domain.short} ({domain.count} remaining)
                  </option>
                ))}
              </select>
            </label>
            {countSelect}
            <button
              className="secondary-button full"
              disabled={!selectedDomain || selectedDomainRemaining === 0}
              onClick={() => onStart(selectedDomain)}
            >
              Start domain quiz <span>→</span>
            </button>
          </article>

          <article className="mode-card exam-mode-card">
            <div className="mode-icon exam-icon">◷</div>
            <span className="card-kicker exam-kicker">Exam simulation</span>
            <h3>Exam mode</h3>
            <p>Simulate a full exam without feedback until you submit.</p>
            <div className="mode-detail"><span>Questions</span><strong>60 random</strong></div>
            <div className="mode-detail"><span>Time limit</span><strong>120 minutes</strong></div>
            <div className="mode-detail"><span>Passing score</span><strong>70%</strong></div>
            <button
              className="primary-button full exam-button"
              disabled={questions.length < 60}
              onClick={onStartExam}
            >
              Start exam <span>→</span>
            </button>
          </article>

          <article className="mode-card needs-practice-card">
            <div className="mode-icon needs-practice-icon">↻</div>
            <span className="card-kicker practice-kicker">Adaptive study</span>
            <h3>Needs practice</h3>
            <p>Retry questions where your total accuracy is below 70%.</p>
            <div className="mode-detail"><span>Questions identified</span><strong>{weakCount}</strong></div>
            <div className="mode-detail"><span>Mastered excluded</span><strong>Yes</strong></div>
            {countSelect}
            <button
              className="primary-button full practice-button"
              disabled={weakCount === 0}
              onClick={onStartNeedsPractice}
            >
              Practice weak questions <span>→</span>
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
              disabled={domain.count === 0}
            >
              <span className={`domain-number ${domain.tone}`}>0{index + 1}</span>
              <span className="domain-name">
                <strong>{domain.name}</strong>
                <small>{domain.count} remaining · {domain.mastered} mastered · {domain.total} total</small>
                <small className={domain.accuracy !== null && domain.accuracy < 70 ? "weak-accuracy" : ""}>
                  Accuracy: {domain.accuracy === null ? "Not tested" : `${domain.accuracy}%`}
                </small>
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
