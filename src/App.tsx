import { useEffect, useState } from "react";
import { HomeView } from "./components/HomeView";
import { QuizView } from "./components/QuizView";
import { ResultView } from "./components/ResultView";
import { DOMAIN_META } from "./constants/domains";
import type {
  Answers,
  HistoryItem,
  Question,
  QuestionCount,
  View,
} from "./types/quiz";
import { answerIsCorrect, createQuiz, isAnswered } from "./utils/quiz";

export default function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [view, setView] = useState<View>("home");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [questionCount, setQuestionCount] = useState<QuestionCount>("25");
  const [quiz, setQuiz] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [quizLabel, setQuizLabel] = useState("All domains");
  const [activeDomain, setActiveDomain] = useState<string>();

  useEffect(() => {
    fetch("./questions.json")
      .then((response) => response.json())
      .then(setQuestions);

    const saved = localStorage.getItem("ai103-history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  function startQuiz(domain?: string) {
    const selectedQuestions = createQuiz(questions, questionCount, domain);
    setQuiz(selectedQuestions);
    setQuizLabel(domain ? DOMAIN_META[domain].short : "All domains");
    setActiveDomain(domain);
    setIndex(0);
    setScore(0);
    setAnswers({});
    setSubmitted(false);
    setView("quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setAnswer(key: string, value: string | string[]) {
    if (!submitted) {
      setAnswers((current) => ({ ...current, [key]: value }));
    }
  }

  function submitAnswer() {
    const question = quiz[index];
    if (!isAnswered(question, answers)) return;
    if (answerIsCorrect(question, answers)) {
      setScore((current) => current + 1);
    }
    setSubmitted(true);
  }

  function nextQuestion() {
    if (index < quiz.length - 1) {
      setIndex((current) => current + 1);
      setAnswers({});
      setSubmitted(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const entry: HistoryItem = {
      date: new Date().toISOString(),
      score,
      total: quiz.length,
      label: quizLabel,
    };
    const updated = [entry, ...history].slice(0, 8);
    setHistory(updated);
    localStorage.setItem("ai103-history", JSON.stringify(updated));
    setView("result");
  }

  if (view === "quiz" && quiz[index]) {
    return (
      <QuizView
        question={quiz[index]}
        index={index}
        total={quiz.length}
        answers={answers}
        submitted={submitted}
        onAnswer={setAnswer}
        onSubmit={submitAnswer}
        onNext={nextQuestion}
        onExit={() => setView("home")}
      />
    );
  }

  if (view === "result") {
    return (
      <ResultView
        score={score}
        total={quiz.length}
        onRetry={() => startQuiz(activeDomain)}
        onHome={() => setView("home")}
      />
    );
  }

  return (
    <HomeView
      questions={questions}
      history={history}
      selectedDomain={selectedDomain}
      questionCount={questionCount}
      onDomainChange={setSelectedDomain}
      onQuestionCountChange={setQuestionCount}
      onStart={startQuiz}
    />
  );
}
