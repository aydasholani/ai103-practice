import { useMemo, useState } from "react";

const MAIN_SECTIONS = ["Overview", "Existing Environment", "Problem Statements", "Requirements"];
const KNOWN_SUBSECTIONS = [
  "Company Information",
  "Identity Environment",
  "Generative Environment",
  "Data Environment",
  "Planned Changes",
  "Technical Requirements",
  "Security and Compliance Requirements",
  "Business Requirements",
];

type CaseSection = {
  title: string;
  text: string;
  children: { title: string; text: string }[];
};

function cleanTitle(value: string) {
  return value.replace(/\s+-\s*$/, "").trim();
}

function tokenizeContext(context: string) {
  const rawLines = context.replace(/\r/g, "").split("\n");
  const tokens: { text: string; heading: boolean }[] = [];

  for (let index = 0; index < rawLines.length; index += 1) {
    const text = rawLines[index].trim();
    if (!text || text === "-") continue;

    const nextNonEmpty = rawLines.slice(index + 1).find((line) => line.trim());
    tokens.push({
      text: cleanTitle(text),
      heading: text.endsWith(" -")
        || nextNonEmpty?.trim() === "-"
        || MAIN_SECTIONS.includes(cleanTitle(text))
        || KNOWN_SUBSECTIONS.includes(cleanTitle(text)),
    });
  }

  return tokens;
}

function splitCaseStudy(context: string): CaseSection[] {
  const tokens = tokenizeContext(context);
  const starts = MAIN_SECTIONS
    .map((title) => ({ title, index: tokens.findIndex((token) => token.text === title) }))
    .filter((section) => section.index >= 0)
    .sort((a, b) => a.index - b.index);

  return starts.map((section, sectionIndex) => {
    const segment = tokens.slice(section.index + 1, starts[sectionIndex + 1]?.index ?? tokens.length);
    const childStarts = segment
      .map((token, index) => ({ ...token, index }))
      .filter((token) => token.heading);

    if (!childStarts.length) {
      return {
        title: section.title,
        text: segment.map((token) => token.text).join("\n\n").trim(),
        children: [],
      };
    }

    return {
      title: section.title,
      text: segment.slice(0, childStarts[0].index).map((token) => token.text).join("\n\n").trim(),
      children: childStarts.map((child, childIndex) => ({
        title: child.text,
        text: segment
          .slice(child.index + 1, childStarts[childIndex + 1]?.index ?? segment.length)
          .map((token) => token.text)
          .join("\n\n")
          .trim(),
      })),
    };
  });
}

type CaseStudyPanelProps = {
  context: string;
  position: number;
  size: number;
};

export function CaseStudyPanel({ context, position, size }: CaseStudyPanelProps) {
  const sections = useMemo(() => splitCaseStudy(context), [context]);
  const [expandedSections, setExpandedSections] = useState<string[]>(() =>
    sections.filter((section) => section.children.length > 0).map((section) => section.title),
  );
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const toggleSection = (title: string) => {
    setExpandedSections((current) =>
      current.includes(title) ? current.filter((item) => item !== title) : [...current, title],
    );
  };

  const toggleItem = (key: string) => {
    setActiveItem((current) => current === key ? null : key);
  };

  return (
    <aside className="case-study-panel">
      <div className="case-study-title">
        <strong>Case Study Question:</strong>
        <span>{position} of {size}</span>
      </div>

      {sections.length ? (
        <nav className="case-study-nav" aria-label="Case study information">
          {sections.map((section) => {
            const expanded = expandedSections.includes(section.title);
            const sectionKey = `section-${section.title}`;
            const hasChildren = section.children.length > 0;
            const sectionActive = activeItem === sectionKey;

            return (
              <div className="case-study-nav-group" key={section.title}>
                <button
                  className={`case-study-nav-heading ${sectionActive ? "active" : ""}`}
                  type="button"
                  aria-expanded={hasChildren ? expanded : sectionActive}
                  onClick={() => hasChildren ? toggleSection(section.title) : toggleItem(sectionKey)}
                >
                  <span>{section.title}</span>
                  <span className={`case-study-chevron ${hasChildren && expanded ? "expanded" : ""}`} aria-hidden="true">
                    {hasChildren ? "⌃" : "›"}
                  </span>
                </button>

                {!hasChildren && sectionActive && (
                  <div className="case-study-inline-content preserve-text">{section.text}</div>
                )}

                {hasChildren && expanded && (
                  <div className="case-study-subnav">
                    {section.children.map((child) => {
                      const childKey = `${section.title}-${child.title}`;
                      const childActive = activeItem === childKey;
                      return (
                        <div key={childKey}>
                          <button
                            className={`case-study-nav-child ${childActive ? "active" : ""}`}
                            type="button"
                            aria-expanded={childActive}
                            onClick={() => toggleItem(childKey)}
                          >
                            {child.title}
                          </button>
                          {childActive && (
                            <div className="case-study-inline-content preserve-text">{child.text}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      ) : (
        <div className="case-study-inline-content preserve-text">{context}</div>
      )}
    </aside>
  );
}
