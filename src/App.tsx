import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { HomeView } from "./components/HomeView";
import { QuizView } from "./components/QuizView";
import { ResultView } from "./components/ResultView";
import { ExamView } from "./components/ExamView";
import { ExamResultView } from "./components/ExamResultView";
import { AuthView } from "./components/AuthView";
import { supabase } from "./lib/supabase";
import { loadQuizHistory, saveQuizAttempt } from "./services/quizAttempts";
import { DOMAIN_META } from "./constants/domains";
import type {
  Answers,
  ExamAnswers,
  HistoryItem,
  Question,
  QuestionCount,
  View,
} from "./types/quiz";
import { answerIsCorrect, createQuiz, isAnswered, maximumExamScore, scoreQuestion } from "./utils/quiz";

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
  const [examAnswers, setExamAnswers] = useState<ExamAnswers>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    fetch("./questions.json")
      .then((response) => response.json())
      .then(setQuestions);

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setHistory([]);
      return;
    }
    loadQuizHistory().then(setHistory).catch((error) => {
      console.error("Could not load quiz history", error);
    });
  }, [session]);

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

  function startExam() {
    setQuiz(createQuiz(questions, "all").slice(0, 60));
    setExamAnswers({});
    setFlaggedQuestions([]);
    setIndex(0);
    setView("exam");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setExamAnswer(key: string, value: string | string[]) {
    const questionId = quiz[index].id;
    setExamAnswers((current) => ({
      ...current,
      [questionId]: { ...current[questionId], [key]: value },
    }));
  }

  function toggleFlag(questionId: number) {
    setFlaggedQuestions((current) => current.includes(questionId)
      ? current.filter((id) => id !== questionId)
      : [...current, questionId]);
  }

  function finishExam() {
    const finalScore = quiz.reduce(
      (total, question) => total + scoreQuestion(question, examAnswers[question.id] ?? {}).earned,
      0,
    );
    const maximumScore = maximumExamScore(quiz);
    setScore(finalScore);
    const entry: HistoryItem = {
      date: new Date().toISOString(),
      score: finalScore,
      total: maximumScore,
      label: "Exam mode",
    };
    const updated = [entry, ...history].slice(0, 8);
    setHistory(updated);
    if (session) {
      saveQuizAttempt(session.user.id, "exam", entry).catch((error) => {
        console.error("Could not save exam result", error);
      });
    }
    setView("exam-result");
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    if (session) {
      saveQuizAttempt(session.user.id, "practice", entry).catch((error) => {
        console.error("Could not save quiz result", error);
      });
    }
    setView("result");
  }

  if (authLoading) {
    return <main className="auth-page"><p>Loading…</p></main>;
  }

  if (!session) {
    return <AuthView />;
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


  if (view === "exam" && quiz[index]) {
    return (
      <ExamView
        question={quiz[index]}
        questions={quiz}
        index={index}
        answers={examAnswers[quiz[index].id] ?? {}}
        allAnswers={examAnswers}
        flaggedQuestions={flaggedQuestions}
        onAnswer={setExamAnswer}
        onNavigate={setIndex}
        onToggleFlag={() => toggleFlag(quiz[index].id)}
        onFinish={finishExam}
        onExit={() => setView("home")}
      />
    );
  }

  if (view === "exam-result") {
    return (
      <ExamResultView
        questions={quiz}
        answers={examAnswers}
        score={score}
        maximumScore={maximumExamScore(quiz)}
        onRetry={startExam}
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
      onStartExam={startExam}
      userEmail={session.user.email ?? "Signed in"}
      onSignOut={() => supabase.auth.signOut()}
    />
  );
}
