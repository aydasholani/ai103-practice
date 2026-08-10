import type { Question } from "../types/quiz";

export function QuestionSupportingContent({ question }: { question: Question }) {
  if (!question.supportingContent?.length) return null;

  return <div className="question-supporting-content">{question.supportingContent.map((block, index) => {
    if (block.type === "code") {
      return <section className="supporting-code" key={`${block.type}-${index}`}>
        <div className="code-answer-heading"><span>Code</span><small>{block.language}</small></div>
        <pre><code>{block.content}</code></pre>
      </section>;
    }

    return <div className="supporting-table-wrap" key={`${block.type}-${index}`}>
      <table className="supporting-table">
        <thead><tr>{block.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
        <tbody>{block.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>;
  })}</div>;
}
