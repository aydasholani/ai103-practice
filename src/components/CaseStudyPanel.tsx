import { useMemo, useState } from "react";

const MAIN_SECTIONS = ["Overview", "Existing Environment", "Problem Statements", "Requirements"];

function normalizeContext(context: string) {
  return context
    .replace(/\r/g, "")
    .replace(/\n\s*-\s*\n/g, "\n")
    .replace(/^(Overview|Existing Environment|Problem Statements|Requirements)\s*-\s*$/gm, "$1");
}

function splitCaseStudy(context: string) {
  const normalized = normalizeContext(context);
  const lines = normalized.split("\n");
  const starts = MAIN_SECTIONS
    .map((title) => ({ title, index: lines.findIndex((line) => line.trim() === title) }))
    .filter((section) => section.index >= 0)
    .sort((a, b) => a.index - b.index);
  return starts.map((section, index) => ({
    title: section.title,
    text: lines.slice(section.index + 1, starts[index + 1]?.index ?? lines.length).join("\n").trim(),
  }));
}

export function CaseStudyPanel({ context }: { context: string }) {
  const sections = useMemo(() => splitCaseStudy(context), [context]);
  const [active, setActive] = useState(0);
  if (!sections.length) return <aside className="case-study-panel"><div className="case-study-content preserve-text">{context}</div></aside>;
  const selected = sections[Math.min(active, sections.length - 1)];
  return <aside className="case-study-panel">
    <div className="case-study-title"><span>Case study</span><strong>Scenario information</strong></div>
    <nav>{sections.map((section, index) => <button className={active === index ? "active" : ""} key={section.title} onClick={() => setActive(index)}>{section.title}</button>)}</nav>
    <div className="case-study-content"><h2>{selected.title}</h2><div className="preserve-text">{selected.text}</div></div>
  </aside>;
}
