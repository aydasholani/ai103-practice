import { AI103_COURSE_URL, AI103_STUDY_GUIDE_URL, DOMAIN_META } from "../constants/domains";
import type { HistoryItem, Question, QuestionCount, QuestionFormat, QuestionPerformance, StudyProgress } from "../types/quiz";
import { getQuestionStatus } from "../utils/questionStatus";
import { matchesQuestionFormat } from "../utils/questionFormat";
import { Brand } from "./Brand";

type HomeViewProps = {
  questions: Question[];
  history: HistoryItem[];
  selectedDomain: string;
  questionCount: QuestionCount;
  questionFormat: QuestionFormat;
  onDomainChange: (domain: string) => void;
  onQuestionCountChange: (count: QuestionCount) => void;
  onQuestionFormatChange: (format: QuestionFormat) => void;
  onStart: (domain?: string) => void;
  onStartNeedsPractice: () => void;
  onStartAllQuestions: () => void;
  onStartExam: () => void;
  onStartConcepts: () => void;
  userEmail: string;
  onSignOut: () => void;
  masteredQuestionIds: number[];
  questionPerformance: QuestionPerformance[];
  studyProgress: StudyProgress[];
  onStartDomainReview: (domain: string) => void;
  onOpenMistakes: () => void;
  onStartDueReview: () => void;
  onStartMasteredReview: () => void;
};

const QUESTION_COUNTS: { value: QuestionCount; label: string }[] = [
  { value: "10", label: "10 questions" },
  { value: "25", label: "25 questions" },
  { value: "50", label: "50 questions" },
  { value: "all", label: "All questions" },
];

const QUESTION_FORMATS: { value: QuestionFormat; label: string }[] = [
  { value: "all", label: "All formats" },
  { value: "single", label: "Single choice" },
  { value: "multiple", label: "Multiple choice" },
  { value: "dropdown", label: "Dropdown" },
  { value: "drag_drop", label: "Drag-and-drop / ordering" },
  { value: "yes_no_table", label: "Yes / No tables" },
  { value: "hotspot", label: "HOTSPOT" },
  { value: "case_study", label: "Case studies only" },
  { value: "solution_set", label: "Locked solution sets only" },
];

export function HomeView({
  questions,
  history,
  selectedDomain,
  questionCount,
  questionFormat,
  onDomainChange,
  onQuestionCountChange,
  onQuestionFormatChange,
  onStart,
  onStartNeedsPractice,
  onStartAllQuestions,
  onStartExam,
  onStartConcepts,
  userEmail,
  onSignOut,
  masteredQuestionIds,
  questionPerformance,
  studyProgress,
  onStartDomainReview,
  onOpenMistakes,
  onStartDueReview,
  onStartMasteredReview,
}: HomeViewProps) {
  const masteredSet = new Set(masteredQuestionIds);
  const performanceMap = new Map(questionPerformance.map((item) => [item.questionId, item]));
  const statusOf = (question: Question) => getQuestionStatus(performanceMap.get(question.id));
  const filteredQuestions = questions.filter((question) => matchesQuestionFormat(question, questionFormat));
  const overallNewCount = questions.filter((question) => statusOf(question) === "new").length;
  const overallWeakCount = questions.filter((question) => statusOf(question) === "needs_practice").length;
  const overallMasteredCount = questions.filter((question) => masteredSet.has(question.id)).length;
  const newCount = filteredQuestions.filter((question) => statusOf(question) === "new").length;
  const weakCount = filteredQuestions.filter((question) => statusOf(question) === "needs_practice").length;
  const masteredCount = filteredQuestions.filter((question) => masteredSet.has(question.id)).length;
  const domains = Object.keys(DOMAIN_META).map((name) => {
    const domainQuestions = filteredQuestions.filter((question) => question.category === name);
    const mastered = domainQuestions.filter((question) => masteredSet.has(question.id)).length;
    const needsPractice = domainQuestions.filter((question) => statusOf(question) === "needs_practice").length;
    const count = domainQuestions.filter((question) => statusOf(question) === "new").length;
    const performance = domainQuestions
      .map((question) => performanceMap.get(question.id))
      .filter((item): item is QuestionPerformance => Boolean(item));
    const earnedPoints = performance.reduce((total, item) => total + item.earnedPoints, 0);
    const maximumPoints = performance.reduce((total, item) => total + item.maximumPoints, 0);
    return {
      name,
      total: domainQuestions.length,
      mastered,
      needsPractice,
      count,
      accuracy: maximumPoints ? Math.round((earnedPoints / maximumPoints) * 100) : null,
      ...DOMAIN_META[name],
    };
  });
  const selectedDomainRemaining = domains.find((domain) => domain.name === selectedDomain)?.count ?? 0;
  const filteredIds = new Set(filteredQuestions.map((question) => question.id));
  const dueCount = studyProgress.filter((item) => filteredIds.has(item.questionId) && item.nextReviewAt && new Date(item.nextReviewAt) <= new Date()).length;
  const mistakeCount = studyProgress.filter((item) => filteredIds.has(item.questionId) && !item.wasCorrect).length;

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

  const formatSelect = (
    <label className="select-label">
      Question format
      <select value={questionFormat} onChange={(event) => onQuestionFormatChange(event.target.value as QuestionFormat)}>
        {QUESTION_FORMATS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
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
            <span><strong>{overallNewCount}</strong> New</span>
            <span><strong>{overallWeakCount}</strong> Needs practice</span>
            <span><strong>{overallMasteredCount}</strong> Mastered</span>
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
        <div className="practice-filters">{formatSelect}<span>{filteredQuestions.length} questions match this format</span></div>
        <div className="mode-grid">
          <article className="mode-card concept-mode-card">
            <div className="mode-icon concept-icon">⇄</div>
            <span className="card-kicker concept-kicker">Learn concepts</span>
            <h3>Concept matching</h3>
            <p>Match Azure terms with what they do and when they should be used.</p>
            <div className="mode-detail"><span>Format</span><strong>Drag and drop</strong></div>
            <div className="mode-detail"><span>Concept bank</span><strong>Curated concepts and code</strong></div>
            <div className="mode-detail"><span>Questions</span><strong>10 per round</strong></div>
            <div className="mode-detail"><span>Affects mastery</span><strong>No</strong></div>
            <button className="primary-button full concept-button" onClick={onStartConcepts}>
              Learn concepts <span>→</span>
            </button>
          </article>
          {newCount > 0 && <article className="mode-card featured">
            <div className="mode-icon">✦</div>
            <span className="card-kicker">Recommended</span>
            <h3>New questions</h3>
            <p>Practice questions you have not answered before across all domains.</p>
            <div className="mode-detail"><span>Excluded</span><strong>Answered questions</strong></div>
            <div className="mode-detail"><span>Available</span><strong>{newCount} questions</strong></div>
            <div className="mode-detail"><span>Format</span><strong>Random order</strong></div>
            {countSelect}
            <button
              className="primary-button full"
              disabled={!questions.length || newCount === 0}
              onClick={() => onStart()}
            >
              Start quiz <span>→</span>
            </button>
          </article>}

          <article className="mode-card needs-practice-card">
            <div className="mode-icon needs-practice-icon">↻</div>
            <span className="card-kicker practice-kicker">Adaptive study</span>
            <h3>Needs practice</h3>
            <p>Retry every answered question that has not reached Mastered yet.</p>
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
            <div className="mode-detail"><span>Questions</span><strong>60 weighted</strong></div>
            <div className="mode-detail"><span>Domain mix</span><strong>Official weighting</strong></div>
            <div className="mode-detail"><span>Time limit</span><strong>120 minutes</strong></div>
            <div className="mode-detail"><span>Practice target</span><strong>80%</strong></div>
            <button
              className="primary-button full exam-button"
              disabled={questions.length < 60}
              onClick={onStartExam}
            >
              Start exam <span>→</span>
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
                <small>{domain.count} new · {domain.needsPractice} needs practice · {domain.mastered} mastered</small>
                <small className={domain.accuracy !== null && domain.accuracy < 70 ? "weak-accuracy" : ""}>
                  Accuracy: {domain.accuracy === null ? "Not tested" : `${domain.accuracy}%`}
                </small>
              </span>
              <span className="domain-arrow">→</span>
            </button>
          ))}
        </div>
      </section>

      <section className="insights-section">
        <div className="section-heading"><span className="eyebrow">Adaptive learning</span><h2>Weak areas</h2></div>
        <div className="insight-grid">
          {domains.filter((domain) => domain.accuracy !== null).sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0)).map((domain) => <article className="insight-card" key={domain.name}>
            <span>{domain.short}</span><strong>{domain.accuracy}%</strong>
            <button className="secondary-button" disabled={domain.needsPractice === 0} onClick={() => onStartDomainReview(domain.name)}>Practice this area ({domain.needsPractice})</button>
            <a href={domain.learnUrl} target="_blank" rel="noreferrer">Microsoft Learn ↗</a>
          </article>)}
        </div>
        <div className="review-actions">
          <button className="secondary-button" disabled={!filteredQuestions.length} onClick={onStartAllQuestions}>All questions ({filteredQuestions.length})</button>
          <button className="secondary-button" disabled={!mistakeCount} onClick={onOpenMistakes}>Mistake review ({mistakeCount})</button>
          <button className="secondary-button" disabled={!dueCount} onClick={onStartDueReview}>Due for review ({dueCount})</button>
          <button className="secondary-button" disabled={!masteredCount} onClick={onStartMasteredReview}>Review mastered ({masteredCount})</button>
        </div>
      </section>

      <section className="resources-section">
        <div className="section-heading"><span className="eyebrow">Official resources</span><h2>Microsoft Learn</h2></div>
        <div className="resource-links"><a href={AI103_COURSE_URL} target="_blank" rel="noreferrer">AI-103 course ↗</a><a href={AI103_STUDY_GUIDE_URL} target="_blank" rel="noreferrer">Official study guide ↗</a></div>
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
