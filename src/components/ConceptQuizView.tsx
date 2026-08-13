import { useEffect, useMemo, useState } from "react";
import { Brand } from "./Brand";
import {
  loadConceptPerformance,
  saveConceptAttempts,
  type ConceptPerformance,
} from "../services/conceptPerformance";

type Concept = { term: string; definition: string };
type ConceptGroup = {
  id: string;
  title: string;
  domain: string;
  kind: "concept" | "code";
  concepts: Concept[];
};
type ConceptBank = { groups: ConceptGroup[] };
type ConceptPool = "new" | "needs_practice" | "mastered" | "all";
type ConceptRoundSize = 10 | 25 | 50 | "all";

const conceptKey = (concept: Concept) => concept.term.trim().toLowerCase();
const statusOf = (performance?: ConceptPerformance): Exclude<ConceptPool, "all"> => {
  if (!performance?.attempts) return "new";
  const accuracy = performance.correctAttempts / performance.attempts;
  return performance.correctStreak >= 3 && accuracy >= .7 ? "mastered" : "needs_practice";
};

function shuffled<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - .5);
}

function flattenConcepts(groups: ConceptGroup[]) {
  return groups.flatMap((group) => group.concepts.map((concept) => ({ ...concept, group })));
}

function createRound(
  groups: ConceptGroup[],
  performance: Map<string, ConceptPerformance>,
  pool: ConceptPool,
  count: ConceptRoundSize,
) {
  const maximum = count === "all" ? Number.POSITIVE_INFINITY : count;
  let selectedCount = 0;
  const round: ConceptGroup[] = [];

  for (const group of shuffled(groups)) {
    if (selectedCount >= maximum) break;
    const eligible = group.concepts.filter((concept) =>
      pool === "all" || statusOf(performance.get(conceptKey(concept))) === pool);
    if (!eligible.length) continue;
    const selected = eligible.slice(0, maximum - selectedCount);
    round.push({ ...group, concepts: selected });
    selectedCount += selected.length;
  }
  return round;
}

function updateLocalPerformance(
  current: ConceptPerformance[],
  results: { concept: Concept; isCorrect: boolean }[],
) {
  const next = new Map(current.map((item) => [item.conceptKey, { ...item }]));
  for (const result of results) {
    const key = conceptKey(result.concept);
    const previous = next.get(key) ?? {
      conceptKey: key,
      attempts: 0,
      correctAttempts: 0,
      correctStreak: 0,
      lastWasCorrect: false,
    };
    previous.attempts += 1;
    previous.correctAttempts += result.isCorrect ? 1 : 0;
    previous.correctStreak = result.isCorrect ? previous.correctStreak + 1 : 0;
    previous.lastWasCorrect = result.isCorrect;
    next.set(key, previous);
  }
  return [...next.values()];
}

export function ConceptQuizView({ userId, onHome }: { userId: string; onHome: () => void }) {
  const [groups, setGroups] = useState<ConceptGroup[]>([]);
  const [roundSize, setRoundSize] = useState<ConceptRoundSize>(10);
  const [round, setRound] = useState<ConceptGroup[]>([]);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [singleAnswer, setSingleAnswer] = useState("");
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [selectedDefinition, setSelectedDefinition] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);
  const [dashboard, setDashboard] = useState(true);
  const [pool, setPool] = useState<ConceptPool>("new");
  const [performance, setPerformance] = useState<ConceptPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [progressError, setProgressError] = useState("");

  useEffect(() => {
    fetch("./concept-bank.json")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Concept bank unavailable")))
      .then((bank: ConceptBank) => setGroups(bank.groups))
      .catch(() => setProgressError("The concept bank could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadConceptPerformance().then(setPerformance).catch(() => {
      setProgressError("Concept progress is not available yet. Run supabase/concept_attempts.sql in Supabase.");
    });
  }, []);

  const performanceMap = useMemo(
    () => new Map(performance.map((item) => [item.conceptKey, item])),
    [performance],
  );
  const allConcepts = useMemo(() => flattenConcepts(groups), [groups]);
  const counts = useMemo(() => ({
    new: allConcepts.filter(({ term }) => statusOf(performanceMap.get(term.toLowerCase())) === "new").length,
    needs_practice: allConcepts.filter(({ term }) => statusOf(performanceMap.get(term.toLowerCase())) === "needs_practice").length,
    mastered: allConcepts.filter(({ term }) => statusOf(performanceMap.get(term.toLowerCase())) === "mastered").length,
  }), [allConcepts, performanceMap]);
  const attemptedConcepts = useMemo(() => allConcepts
    .filter(({ term }) => (performanceMap.get(term.toLowerCase())?.attempts ?? 0) > 0)
    .sort((a, b) => a.term.localeCompare(b.term)), [allConcepts, performanceMap]);
  const needsPracticeConcepts = useMemo(() => attemptedConcepts
    .filter(({ term }) => statusOf(performanceMap.get(term.toLowerCase())) === "needs_practice"),
  [attemptedConcepts, performanceMap]);

  const current = round[index];
  const isMatching = Boolean(current && current.concepts.length > 1);
  const definitions = useMemo(
    () => current ? shuffled(current.concepts.map((concept) => concept.definition)) : [],
    [current],
  );
  const singleChoices = useMemo(() => {
    if (!current || isMatching) return [];
    const concept = current.concepts[0];
    const sameDomain = allConcepts.filter((item) =>
      item.term.toLowerCase() !== concept.term.toLowerCase() && item.group.domain === current.domain);
    return shuffled([concept.definition, ...shuffled(sameDomain).slice(0, 3).map((item) => item.definition)]);
  }, [allConcepts, current, isMatching]);

  function startPool(nextPool: ConceptPool) {
    const nextRound = createRound(groups, performanceMap, nextPool, roundSize);
    if (!nextRound.length) return;
    setPool(nextPool);
    setRound(nextRound);
    setIndex(0);
    setCorrectCount(0);
    setAnsweredCount(0);
    setSingleAnswer("");
    setMatches({});
    setSelectedDefinition("");
    setSubmitted(false);
    setResults({});
    setFinished(false);
    setDashboard(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function restart() { startPool(pool); }

  function placeDefinition(key: string, definition: string) {
    if (submitted) return;
    setMatches((currentMatches) => {
      const next = { ...currentMatches };
      if (!definition) {
        delete next[key];
        return next;
      }
      for (const existingKey of Object.keys(next)) {
        if (next[existingKey] === definition) delete next[existingKey];
      }
      next[key] = definition;
      return next;
    });
    setSelectedDefinition("");
  }

  function submit() {
    if (!current) return;
    if (isMatching && current.concepts.some((concept) => !matches[conceptKey(concept)])) return;
    if (!isMatching && !singleAnswer) return;

    const conceptResults = current.concepts.map((concept) => ({
      concept,
      isCorrect: isMatching
        ? matches[conceptKey(concept)] === concept.definition
        : singleAnswer === concept.definition,
    }));
    const resultMap = Object.fromEntries(conceptResults.map((result) => [conceptKey(result.concept), result.isCorrect]));
    const newlyCorrect = conceptResults.filter((result) => result.isCorrect).length;
    setResults(resultMap);
    setCorrectCount((value) => value + newlyCorrect);
    setAnsweredCount((value) => value + conceptResults.length);
    setPerformance((items) => updateLocalPerformance(items, conceptResults));
    saveConceptAttempts(userId, current.domain, conceptResults).catch(() => {
      setProgressError("The answers could not be saved to concept progress.");
    });
    setSubmitted(true);
  }

  function next() {
    if (index === round.length - 1) {
      setFinished(true);
      return;
    }
    setIndex((value) => value + 1);
    setSingleAnswer("");
    setMatches({});
    setSelectedDefinition("");
    setSubmitted(false);
    setResults({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const roundConceptTotal = round.reduce((total, group) => total + group.concepts.length, 0);
  const conceptsBeforeCurrent = round.slice(0, index).reduce((total, group) => total + group.concepts.length, 0);

  return <main className="concept-page">
    <header className="topbar compact">
      <Brand asButton onClick={onHome} />
      <button className="text-button" onClick={onHome}>Exit</button>
    </header>
    <div className="concept-shell">
      {dashboard ? <section className="concept-dashboard">
        <div className="section-heading">
          <span className="eyebrow">Separate learning progress</span>
          <h1>Concept practice</h1>
          <p>Learn what terms and code do. Related concepts are matched together; standalone concepts use definition questions.</p>
        </div>
        {progressError && <p className="concept-setup-warning">{progressError}</p>}
        <label className="select-label concept-count-select">Number of concepts per round
          <select value={roundSize} onChange={(event) => setRoundSize(event.target.value === "all" ? "all" : Number(event.target.value) as ConceptRoundSize)}>
            <option value={10}>10 concepts</option>
            <option value={25}>25 concepts</option>
            <option value={50}>50 concepts</option>
            <option value="all">All available concepts</option>
          </select>
        </label>
        <div className="concept-status-grid">
          {counts.new > 0 && <article className="mode-card featured">
            <h3>New concepts</h3><p>Terms and code you have not answered before.</p>
            <div className="mode-detail"><span>Available</span><strong>{loading ? "…" : counts.new}</strong></div>
            <button className="primary-button full" disabled={loading} onClick={() => startPool("new")}>Start new concepts <span>→</span></button>
          </article>}
          <article className="mode-card needs-practice-card">
            <h3>Needs practice</h3><p>Attempted concepts that have not reached Mastered.</p>
            <div className="mode-detail"><span>Available</span><strong>{counts.needs_practice}</strong></div>
            <button className="primary-button full practice-button" disabled={!counts.needs_practice} onClick={() => startPool("needs_practice")}>Practice concepts <span>→</span></button>
          </article>
          <article className="mode-card">
            <h3>Mastered</h3><p>At least three correct in a row and 70% total accuracy.</p>
            <div className="mode-detail"><span>Mastered</span><strong>{counts.mastered}</strong></div>
            <button className="secondary-button full" disabled={!counts.mastered} onClick={() => startPool("mastered")}>Review mastered <span>→</span></button>
          </article>
          <article className="mode-card concept-mode-card">
            <h3>All concepts</h3><p>Mix definitions, comparison matching, and code questions.</p>
            <div className="mode-detail"><span>Total</span><strong>{loading ? "…" : allConcepts.length}</strong></div>
            <button className="primary-button full concept-button" disabled={loading || !allConcepts.length} onClick={() => startPool("all")}>Start mixed round <span>→</span></button>
          </article>
        </div>
        <section className="concept-history-section">
          <div className="section-heading"><span className="eyebrow">Concept history</span><h2>See what you have practiced</h2></div>
          <details className="concept-list-panel" open={needsPracticeConcepts.length > 0}>
            <summary><span>Needs practice</span><strong>{needsPracticeConcepts.length}</strong></summary>
            {needsPracticeConcepts.length
              ? <ConceptProgressList concepts={needsPracticeConcepts} performanceMap={performanceMap} />
              : <p className="concept-empty-list">No attempted concepts currently need practice.</p>}
          </details>
          <details className="concept-list-panel">
            <summary><span>All attempted concepts</span><strong>{attemptedConcepts.length}</strong></summary>
            {attemptedConcepts.length
              ? <ConceptProgressList concepts={attemptedConcepts} performanceMap={performanceMap} />
              : <p className="concept-empty-list">You have not attempted any concepts yet.</p>}
          </details>
        </section>
      </section> : finished ? <section className="concept-card concept-result">
        <span className="eyebrow">Round complete</span>
        <h1>Concept practice</h1>
        <strong className="score">{correctCount}/{answeredCount}</strong>
        <p>{correctCount / Math.max(answeredCount, 1) >= .8
          ? "Strong result. Continue until every concept is Mastered."
          : "The concepts answered incorrectly are now available under Needs practice."}</p>
        <div className="result-actions">
          <button className="primary-button" onClick={restart}>New round</button>
          <button className="secondary-button" onClick={() => setDashboard(true)}>Concept overview</button>
          <button className="secondary-button" onClick={onHome}>Back home</button>
        </div>
      </section> : current ? <>
        <span className="eyebrow">{pool.replace("_", " ")} · {current.domain} · {current.kind === "code" ? "Code" : "Concepts"}</span>
        <div className="concept-progress"><span style={{ width: `${((conceptsBeforeCurrent + current.concepts.length) / roundConceptTotal) * 100}%` }} /></div>
        <section className="concept-card">
          <span className="question-total">Question {index + 1} of {round.length} · {current.concepts.length} concept{current.concepts.length === 1 ? "" : "s"}</span>
          <h1>{isMatching ? current.title : current.kind === "code" ? `What does ${current.concepts[0].term} do?` : `What does “${current.concepts[0].term}” mean?`}</h1>
          {isMatching
            ? <MatchingQuestion group={current} matches={matches} definitions={definitions} selectedDefinition={selectedDefinition} submitted={submitted} results={results} onSelectDefinition={setSelectedDefinition} onPlace={placeDefinition} />
            : <SingleDefinitionQuestion choices={singleChoices} selected={singleAnswer} correctDefinition={current.concepts[0].definition} submitted={submitted} onSelect={setSingleAnswer} />}
          {submitted && <div className={`concept-feedback ${Object.values(results).every(Boolean) ? "correct" : "wrong"}`}>
            <strong>{Object.values(results).every(Boolean) ? "All correct" : `${Object.values(results).filter(Boolean).length} of ${current.concepts.length} correct`}</strong>
            <p>Each concept is saved separately to New, Needs practice, or Mastered.</p>
          </div>}
          <div className="question-actions">
            {!submitted
              ? <button className="primary-button" disabled={isMatching ? current.concepts.some((concept) => !matches[conceptKey(concept)]) : !singleAnswer} onClick={submit}>Check answer</button>
              : <button className="primary-button" onClick={next}>{index === round.length - 1 ? "See result" : "Next question"}</button>}
          </div>
        </section>
      </> : null}
    </div>
  </main>;
}

function SingleDefinitionQuestion({ choices, selected, correctDefinition, submitted, onSelect }: {
  choices: string[];
  selected: string;
  correctDefinition: string;
  submitted: boolean;
  onSelect: (value: string) => void;
}) {
  return <div className="concept-answer-list">{choices.map((choice, index) => {
    const state = submitted
      ? choice === correctDefinition ? "correct" : choice === selected ? "wrong" : ""
      : choice === selected ? "selected" : "";
    return <button type="button" className={`concept-answer ${state}`} disabled={submitted} key={choice} onClick={() => onSelect(choice)}>
      <span>{String.fromCharCode(65 + index)}</span><p>{choice}</p>
    </button>;
  })}</div>;
}

function MatchingQuestion({ group, matches, definitions, selectedDefinition, submitted, results, onSelectDefinition, onPlace }: {
  group: ConceptGroup;
  matches: Record<string, string>;
  definitions: string[];
  selectedDefinition: string;
  submitted: boolean;
  results: Record<string, boolean>;
  onSelectDefinition: (definition: string) => void;
  onPlace: (key: string, definition: string) => void;
}) {
  const used = new Set(Object.values(matches));
  return <div className="concept-match-layout">
    <div className="concept-definition-bank">
      <strong>Explanations</strong>
      <small>Drag one explanation to each concept, or tap an explanation and then its box.</small>
      {definitions.map((definition) => <button
        type="button"
        draggable={!submitted}
        disabled={submitted}
        className={`concept-definition ${selectedDefinition === definition ? "selected" : ""} ${used.has(definition) ? "used" : ""}`}
        key={definition}
        onClick={() => onSelectDefinition(selectedDefinition === definition ? "" : definition)}
        onDragStart={(event) => event.dataTransfer.setData("text/plain", definition)}
      >{definition}</button>)}
    </div>
    <div className="concept-targets">
      <strong>Concept boxes</strong>
      {group.concepts.map((concept) => {
        const key = conceptKey(concept);
        const value = matches[key] ?? "";
        const state = submitted ? results[key] ? "correct" : "wrong" : "";
        return <div className={`concept-target-row ${state}`} key={key}>
          <span>{concept.term}</span>
          <div
            className={`concept-target ${value ? "filled" : ""}`}
            role="button"
            tabIndex={submitted ? -1 : 0}
            onDragOver={(event) => { if (!submitted) event.preventDefault(); }}
            onDrop={(event) => { event.preventDefault(); onPlace(key, event.dataTransfer.getData("text/plain")); }}
            onClick={() => selectedDefinition ? onPlace(key, selectedDefinition) : value && !submitted ? onPlace(key, "") : undefined}
          >{value || "Drop or tap an explanation here"}</div>
          {submitted && !results[key] && <small><strong>Correct:</strong> {concept.definition}</small>}
        </div>;
      })}
    </div>
  </div>;
}

function ConceptProgressList({ concepts, performanceMap }: {
  concepts: ReturnType<typeof flattenConcepts>;
  performanceMap: Map<string, ConceptPerformance>;
}) {
  return <div className="concept-progress-list">{concepts.map((concept) => {
    const item = performanceMap.get(concept.term.toLowerCase())!;
    const accuracy = Math.round((item.correctAttempts / item.attempts) * 100);
    const status = statusOf(item);
    return <div className="concept-progress-row" key={concept.term.toLowerCase()}>
      <span className="concept-progress-name"><strong>{concept.term}</strong><small>{concept.group.title}</small></span>
      <span><small>Attempts</small><strong>{item.attempts}</strong></span>
      <span><small>Accuracy</small><strong>{accuracy}%</strong></span>
      <span><small>Streak</small><strong>{item.correctStreak}</strong></span>
      <span className={`concept-status-badge ${status}`}>{status.replace("_", " ")}</span>
    </div>;
  })}</div>;
}
