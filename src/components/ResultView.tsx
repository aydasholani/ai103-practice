import type { CSSProperties } from "react";

type ResultViewProps = {
  score: number;
  total: number;
  onRetry: () => void;
  onHome: () => void;
};

export function ResultView({ score, total, onRetry, onHome }: ResultViewProps) {
  const percent = Math.round((score / total) * 100);
  const message = percent >= 80
    ? "Excellent work. You are building strong exam readiness."
    : percent >= 60
      ? "Good progress. Review the areas you missed and try again."
      : "Keep practicing. Focus on one domain at a time.";

  return (
    <main className="app-shell result-page">
      <section className="result-card">
        <div
          className="result-ring"
          style={{ "--score": `${percent * 3.6}deg` } as CSSProperties}
        >
          <span>{percent}%</span>
        </div>
        <p className="eyebrow">Quiz complete</p>
        <h1>{score} of {total} correct</h1>
        <p>{message}</p>
        <div className="result-actions">
          <button className="primary-button" onClick={onRetry}>Try again</button>
          <button className="secondary-button" onClick={onHome}>Back to home</button>
        </div>
      </section>
    </main>
  );
}
