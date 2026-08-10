import type { Answers, Question, QuestionCount } from "../types/quiz";

export function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

export function createQuiz(
  questions: Question[],
  count: QuestionCount,
  domain?: string,
) {
  const pool = domain
    ? questions.filter((question) => question.category === domain)
    : questions;
  const limit = count === "all" ? pool.length : Number(count);
  return selectGroupedQuestions(pool, limit);
}

export function createExamQuiz(questions: Question[], limit = 60) {
  return selectGroupedQuestions(questions, limit);
}

function selectGroupedQuestions(questions: Question[], limit: number) {
  const groupedIds = new Set(questions.filter((question) => question.examGroup || question.caseStudy).map((question) => question.id));
  const groups = new Map<string, Question[]>();
  for (const question of questions.filter((item) => item.examGroup || item.caseStudy)) {
    const id = question.examGroup ? `solution:${question.examGroup.id}` : `case:${question.caseStudy!.id}`;
    groups.set(id, [...(groups.get(id) ?? []), question]);
  }
  const blocks: Question[][] = [
    ...questions.filter((question) => !groupedIds.has(question.id)).map((question) => [question]),
    ...[...groups.values()].map((group) => group.sort((a, b) =>
      (a.examGroup?.position ?? a.caseStudy!.position) - (b.examGroup?.position ?? b.caseStudy!.position))),
  ];
  const selected: Question[] = [];
  for (const block of shuffle(blocks)) {
    if (selected.length + block.length <= limit) selected.push(...block);
    if (selected.length === limit) break;
  }
  if (selected.length < Math.min(limit, questions.length)) {
    const used = new Set(selected.map((question) => question.id));
    selected.push(...shuffle(questions.filter((question) => !used.has(question.id) && !question.examGroup && !question.caseStudy)).slice(0, limit - selected.length));
  }
  return selected;
}

export function expectedAnswers(question: Question) {
  const expected: Answers = {};
  if (question.type === "single" || question.type === "multiple") {
    expected.main = question.correctAnswers ?? [];
  }

  for (const interaction of question.interactions ?? []) {
    if (interaction.type === "dropdown") {
      expected[interaction.id] = interaction.correctAnswer;
    }
    if (interaction.type === "yes_no_table") {
      interaction.rows.forEach((row) => {
        expected[row.id] = row.correctAnswer;
      });
    }
    if (interaction.type === "drag_drop") {
      interaction.targets.forEach((target) => {
        expected[target.id] = target.correctAnswer;
      });
    }
  }
  return expected;
}

export function answerIsCorrect(question: Question, answers: Answers) {
  return Object.entries(expectedAnswers(question)).every(([key, expected]) => {
    const actual = answers[key];
    if (Array.isArray(expected)) {
      const selected = Array.isArray(actual) ? [...actual].sort() : [];
      return JSON.stringify(selected) === JSON.stringify([...expected].sort());
    }
    return actual === expected;
  });
}

export function scoreQuestion(question: Question, answers: Answers) {
  let earned = 0;
  let maximum = 0;

  for (const [key, expected] of Object.entries(expectedAnswers(question))) {
    const actual = answers[key];
    if (Array.isArray(expected)) {
      maximum += expected.length;
      const selected = Array.isArray(actual) ? actual : [];
      earned += expected.filter((answer) => selected.includes(answer)).length;
    } else {
      maximum += 1;
      if (actual === expected) earned += 1;
    }
  }

  return { earned, maximum };
}

export function maximumExamScore(questions: Question[]) {
  return questions.reduce(
    (total, question) => total + scoreQuestion(question, {}).maximum,
    0,
  );
}

export function isAnswered(question: Question, answers: Answers) {
  return Object.keys(expectedAnswers(question)).every((key) => {
    const value = answers[key];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  });
}
