export type Option = {
  id: string;
  text: string;
  explanation?: string;
};

export type DropdownInteraction = {
  id: string;
  prompt: string;
  type: "dropdown";
  options: Option[];
  correctAnswer: string;
};

export type YesNoInteraction = {
  id: string;
  type: "yes_no_table";
  options: Option[];
  rows: {
    id: string;
    text: string;
    correctAnswer: string;
    explanation?: string;
  }[];
};

export type DragDropInteraction = {
  id: string;
  type: "drag_drop";
  choices: { id: string; text: string }[];
  targets: {
    id: string;
    prompt: string;
    correctAnswer: string;
    explanation?: string;
  }[];
};

export type Interaction =
  | DropdownInteraction
  | YesNoInteraction
  | DragDropInteraction;

export type Question = {
  id: number;
  category: string;
  subcategory: string;
  question: string;
  type: string;
  context?: string;
  options?: Option[];
  correctAnswers?: string[];
  interactions?: Interaction[];
  media?: { type: string; src: string; alt: string }[];
  communityNotes?: {
    summary: string;
    caveats?: string[];
    answerDisputed?: boolean;
  };
};

export type Answers = Record<string, string | string[]>;
export type HistoryItem = {
  date: string;
  score: number;
  total: number;
  label: string;
};
export type View = "home" | "quiz" | "result" | "exam" | "exam-result" | "mistakes";
export type QuestionCount = "10" | "25" | "50" | "all";
export type ExamAnswers = Record<number, Answers>;

export type QuestionPerformance = {
  questionId: number;
  attempts: number;
  correctAttempts: number;
  earnedPoints: number;
  maximumPoints: number;
};

export type Confidence = "guessed" | "unsure" | "confident";

export type StudyProgress = {
  questionId: number;
  lastAnswers: Answers;
  wasCorrect: boolean;
  confidence: Confidence | null;
  reviewStep: number;
  nextReviewAt: string | null;
  updatedAt: string;
};
