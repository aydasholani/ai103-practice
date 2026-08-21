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
  const domainTargets = allocateExamDomains(limit);
  const allBlocks = createQuestionBlocks(questions);
  const caseBlocks = allBlocks.filter((block) => block[0]?.caseStudy);
  const eligibleCaseBlocks = caseBlocks.filter((block) => {
    if (block.length > limit) return false;
    const blockByDomain = countQuestionsByDomain(block);
    return Object.entries(blockByDomain).every(([domain, count]) =>
      count <= (domainTargets[domain] ?? 0),
    );
  });
  const finalCaseBlock = shuffle(eligibleCaseBlocks)[0] ?? [];
  const regularLimit = limit - finalCaseBlock.length;
  const regularBlocks = shuffle(allBlocks.filter((block) => !block[0]?.caseStudy));
  const selectedBlocks: Question[][] = [];
  const selectedIds = new Set<number>();
  const selectedByDomain = countQuestionsByDomain(finalCaseBlock);
  let selectedCount = 0;

  for (const block of regularBlocks) {
    if (selectedCount + block.length > regularLimit) continue;

    const blockByDomain = countQuestionsByDomain(block);
    const fitsDomainTargets = Object.entries(blockByDomain).every(([domain, count]) =>
      (selectedByDomain[domain] ?? 0) + count <= (domainTargets[domain] ?? 0),
    );
    if (!fitsDomainTargets) continue;

    selectedBlocks.push(block);
    block.forEach((question) => selectedIds.add(question.id));
    Object.entries(blockByDomain).forEach(([domain, count]) => {
      selectedByDomain[domain] = (selectedByDomain[domain] ?? 0) + count;
    });
    selectedCount += block.length;
    if (selectedCount === regularLimit) break;
  }

  // This fallback only matters for a custom question bank that cannot satisfy
  // the domain allocation exactly. Grouped questions still remain atomic.
  const availableRegularQuestions = regularBlocks.reduce((total, block) => total + block.length, 0);
  const regularTarget = Math.min(regularLimit, availableRegularQuestions);
  if (selectedCount < regularTarget) {
    for (const block of regularBlocks) {
      if (block.some((question) => selectedIds.has(question.id))) continue;
      if (selectedCount + block.length > regularTarget) continue;
      selectedBlocks.push(block);
      block.forEach((question) => selectedIds.add(question.id));
      selectedCount += block.length;
      if (selectedCount === regularTarget) break;
    }
  }

  return [...shuffle(selectedBlocks).flat(), ...finalCaseBlock];
}

// 60 questions at 28.3%, 33.3%, 13.3%, 11.7%, and 13.3% respectively.
// Every value is inside Microsoft's published AI-103 domain range.
const EXAM_DOMAIN_TARGETS = {
  "Plan and manage an Azure AI solution": 17,
  "Implement generative AI and agentic solutions": 20,
  "Implement computer vision solutions": 8,
  "Implement text analysis solutions": 7,
  "Implement information extraction solutions": 8,
} as const;

function allocateExamDomains(limit: number) {
  const entries = Object.entries(EXAM_DOMAIN_TARGETS).map(([domain, target]) => {
    const exact = limit * target / 60;
    return { domain, count: Math.floor(exact), remainder: exact % 1 };
  });
  let remaining = limit - entries.reduce((total, entry) => total + entry.count, 0);

  for (const entry of [...entries].sort((a, b) => b.remainder - a.remainder)) {
    if (remaining === 0) break;
    entry.count += 1;
    remaining -= 1;
  }

  return Object.fromEntries(entries.map(({ domain, count }) => [domain, count]));
}

function createQuestionBlocks(questions: Question[]) {
  const grouped = new Map<string, Question[]>();
  const blocks: Question[][] = [];

  for (const question of questions) {
    const groupId = question.examGroup
      ? `solution:${question.examGroup.id}`
      : question.caseStudy
        ? `case:${question.caseStudy.id}`
        : null;

    if (!groupId) blocks.push([question]);
    else grouped.set(groupId, [...(grouped.get(groupId) ?? []), question]);
  }

  blocks.push(...[...grouped.values()].map((group) => group.sort((a, b) =>
    (a.examGroup?.position ?? a.caseStudy!.position) -
    (b.examGroup?.position ?? b.caseStudy!.position))));

  return blocks;
}

function countQuestionsByDomain(questions: Question[]) {
  return questions.reduce<Record<string, number>>((counts, question) => {
    counts[question.category] = (counts[question.category] ?? 0) + 1;
    return counts;
  }, {});
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

function shuffleGroupedQuestions(questions: Question[]) {
  const groups = new Map<string, Question[]>();
  const blocks: Question[][] = [];

  for (const question of questions) {
    const groupId = question.examGroup
      ? `solution:${question.examGroup.id}`
      : question.caseStudy
        ? `case:${question.caseStudy.id}`
        : null;
    if (!groupId) blocks.push([question]);
    else groups.set(groupId, [...(groups.get(groupId) ?? []), question]);
  }

  blocks.push(...[...groups.values()].map((group) => group.sort((a, b) =>
    (a.examGroup?.position ?? a.caseStudy!.position) -
    (b.examGroup?.position ?? b.caseStudy!.position))));

  return shuffle(blocks).flat();
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
