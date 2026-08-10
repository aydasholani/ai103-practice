import type { Answers, Question } from "../types/quiz";

export function CodeAnswerTemplate({ question, answers, submitted, onAnswer }: {
  question: Question;
  answers: Answers;
  submitted: boolean;
  onAnswer: (key: string, value: string) => void;
}) {
  const template = question.answerTemplate;
  if (!template) return null;
  const interactions = new Map((question.interactions ?? []).map((item) => [item.id, item]));
  const parts = template.content.split(/(\{\{[^}]+\}\})/g);
  return <section className="code-answer-area">
    <div className="code-answer-heading"><span>Answer Area</span><small>{template.language}</small></div>
    <pre><code>{parts.map((part, index) => {
      const match = part.match(/^\{\{([^}]+)\}\}$/);
      if (!match) return part;
      const interaction = interactions.get(match[1]);
      if (interaction?.type === "dropdown") {
        const value = typeof answers[interaction.id] === "string" ? answers[interaction.id] as string : "";
        const correct = submitted && value === interaction.correctAnswer;
        return <select
          aria-label={interaction.prompt}
          className={submitted ? correct ? "inline-select-correct" : "inline-select-wrong" : ""}
          disabled={submitted}
          key={`${interaction.id}-${index}`}
          value={value}
          onChange={(event) => onAnswer(interaction.id, event.target.value)}
        ><option value="">Select…</option>{interaction.options.map((option) => <option value={option.id} key={option.id}>{option.text}</option>)}</select>;
      }

      const dragDrop = (question.interactions ?? []).find((item) =>
        item.type === "drag_drop" && item.targets.some((target) => target.id === match[1])
      );
      if (!dragDrop || dragDrop.type !== "drag_drop") return part;
      const target = dragDrop.targets.find((item) => item.id === match[1]);
      if (!target) return part;
      const value = typeof answers[target.id] === "string" ? answers[target.id] as string : "";
      const correct = submitted && value === target.correctAnswer;
      return <select
        aria-label={target.prompt}
        className={submitted ? correct ? "inline-select-correct" : "inline-select-wrong" : ""}
        disabled={submitted}
        key={`${target.id}-${index}`}
        value={value}
        onChange={(event) => onAnswer(target.id, event.target.value)}
      ><option value="">Select…</option>{dragDrop.choices.map((choice) => <option value={choice.text} key={choice.id}>{choice.text}</option>)}</select>;
    })}</code></pre>
    {submitted && <div className="code-answer-explanations">{(question.interactions ?? []).map((interaction) => {
      if (interaction.type !== "dropdown") return null;
      const selected = interaction.options.find((option) => option.id === answers[interaction.id]);
      const correct = interaction.options.find((option) => option.id === interaction.correctAnswer);
      return <p key={interaction.id}><strong>{interaction.prompt}:</strong> {selected?.explanation ?? correct?.explanation}</p>;
    })}{(question.interactions ?? []).flatMap((interaction) => {
      if (interaction.type !== "drag_drop") return [];
      return interaction.targets.map((target) => <p key={target.id}><strong>{target.prompt}:</strong> {target.explanation}</p>);
    })}</div>}
  </section>;
}
