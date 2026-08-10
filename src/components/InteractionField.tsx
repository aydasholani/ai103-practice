import { useState } from "react";
import type { Answers, DragDropInteraction, Interaction } from "../types/quiz";

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

  return <DragDropField interaction={interaction} answers={answers} submitted={submitted} onAnswer={onAnswer} />;
}

function DragDropField({ interaction, answers, submitted, onAnswer }: {
  interaction: DragDropInteraction;
  answers: Answers;
  submitted: boolean;
  onAnswer: (key: string, value: string) => void;
}) {
  const [selectedChoice, setSelectedChoice] = useState("");
  const isOrdering = interaction.targets.every((target) => /^\d+$/.test(target.prompt.trim()));
  const usedChoices = new Set(interaction.targets
    .map((target) => answers[target.id])
    .filter((value): value is string => typeof value === "string" && Boolean(value)));

  const placeChoice = (targetId: string, choice: string) => {
    if (submitted || !choice) return;
    if (isOrdering) {
      const previousTarget = interaction.targets.find((target) => target.id !== targetId && answers[target.id] === choice);
      if (previousTarget) onAnswer(previousTarget.id, "");
    }
    onAnswer(targetId, choice);
    setSelectedChoice("");
  };

  return (
    <div className={`drag-drop-interaction ${isOrdering ? "ordering-interaction" : ""}`}>
      <div className="drag-choice-panel">
        <strong>{isOrdering ? "Actions" : "Options"}</strong>
        <small>Drag an option to a target, or tap an option and then a target.</small>
        <div className="drag-choice-list">
          {interaction.choices.map((choice) => {
            const used = isOrdering && usedChoices.has(choice.text);
            return <button
              type="button"
              className={`drag-choice ${selectedChoice === choice.text ? "selected" : ""} ${used ? "used" : ""}`}
              draggable={!submitted && !used}
              disabled={submitted || used}
              key={choice.id}
              onClick={() => setSelectedChoice((current) => current === choice.text ? "" : choice.text)}
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", choice.text);
                setSelectedChoice(choice.text);
              }}
            ><span className="drag-handle" aria-hidden="true">⠿</span>{choice.text}</button>;
          })}
        </div>
      </div>

      <div className="drag-target-list">
        <strong>Answer area</strong>
        {interaction.targets.map((target) => {
        const value = (answers[target.id] as string) ?? "";
        const state = submitted
          ? value === target.correctAnswer ? "correct-drop" : "wrong-drop"
          : "";
        return (
          <div className={`drag-target-row ${state}`} key={target.id}>
            <span className="drag-target-prompt">{isOrdering ? `Step ${target.prompt}` : target.prompt}</span>
            <div
              className={`drag-target ${value ? "filled" : ""} ${selectedChoice ? "ready" : ""}`}
              role="button"
              tabIndex={submitted ? -1 : 0}
              aria-label={`${target.prompt}: ${value || "empty"}`}
              onDragOver={(event) => {
                if (!submitted) {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                placeChoice(target.id, event.dataTransfer.getData("text/plain"));
              }}
              onClick={() => selectedChoice ? placeChoice(target.id, selectedChoice) : value && !submitted ? onAnswer(target.id, "") : undefined}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                if (selectedChoice) placeChoice(target.id, selectedChoice);
                else if (value && !submitted) onAnswer(target.id, "");
              }}
            >
              {value ? <><span className="drag-handle" aria-hidden="true">⠿</span><span>{value}</span>{!submitted && <span className="remove-drop" aria-hidden="true">×</span>}</> : <span className="drop-placeholder">Drop or tap here</span>}
            </div>
            {submitted && value !== target.correctAnswer && (
              <small>Correct: {target.correctAnswer}</small>
            )}
            {submitted && target.explanation && (
              <small className="option-explanation">{target.explanation}</small>
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
}
