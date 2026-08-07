import type { Answers, Interaction } from "../types/quiz";

type InteractionFieldProps = {
  interaction: Interaction;
  answers: Answers;
  submitted: boolean;
  onAnswer: (key: string, value: string) => void;
};

export function InteractionField({
  interaction,
  answers,
  submitted,
  onAnswer,
}: InteractionFieldProps) {
  if (interaction.type === "dropdown") {
    const value = (answers[interaction.id] as string) ?? "";
    const selectedOption = interaction.options.find((option) => option.id === value);
    const state = submitted
      ? value === interaction.correctAnswer
        ? "correct-select"
        : "wrong-select"
      : "";

    return (
      <label className={`interaction-field ${state}`}>
        <span>{interaction.prompt}</span>
        <select
          value={value}
          disabled={submitted}
          onChange={(event) => onAnswer(interaction.id, event.target.value)}
        >
          <option value="">Select an answer…</option>
          {interaction.options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.text}
            </option>
          ))}
        </select>
        {submitted && value !== interaction.correctAnswer && (
          <small>
            Correct: {interaction.options.find(
              (option) => option.id === interaction.correctAnswer,
            )?.text}
          </small>
        )}
        {submitted && selectedOption?.explanation && (
          <small className="option-explanation">
            <strong>{value === interaction.correctAnswer ? "Why it is correct:" : "Why it is incorrect:"}</strong>{" "}
            {selectedOption.explanation}
          </small>
        )}
      </label>
    );
  }

  if (interaction.type === "yes_no_table") {
    return (
      <div className="table-interaction">
        <div className="table-head">
          <span>Statement</span><span>Yes</span><span>No</span>
        </div>
        {interaction.rows.map((row) => (
          <div className="table-row-wrap" key={row.id}>
          <div className="table-row">
            <p>{row.text}</p>
            {["yes", "no"].map((value) => {
              const selected = answers[row.id] === value;
              const correct = row.correctAnswer === value;
              const state = submitted
                ? correct ? "radio-correct" : selected ? "radio-wrong" : ""
                : "";
              return (
                <label className={state} key={value}>
                  <input
                    type="radio"
                    name={row.id}
                    checked={selected}
                    disabled={submitted}
                    onChange={() => onAnswer(row.id, value)}
                  />
                  <span />
                </label>
              );
            })}
          </div>
          {submitted && row.explanation && (
            <small className="row-explanation">{row.explanation}</small>
          )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mapping-interaction">
      {interaction.targets.map((target) => {
        const value = (answers[target.id] as string) ?? "";
        const state = submitted
          ? value === target.correctAnswer ? "correct-select" : "wrong-select"
          : "";
        return (
          <label className={state} key={target.id}>
            <span>{target.prompt}</span>
            <select
              value={value}
              disabled={submitted}
              onChange={(event) => onAnswer(target.id, event.target.value)}
            >
              <option value="">Choose an option…</option>
              {interaction.choices.map((choice) => (
                <option value={choice.text} key={choice.id}>{choice.text}</option>
              ))}
            </select>
            {submitted && value !== target.correctAnswer && (
              <small>Correct: {target.correctAnswer}</small>
            )}
            {submitted && target.explanation && (
              <small className="option-explanation">{target.explanation}</small>
            )}
          </label>
        );
      })}
    </div>
  );
}
