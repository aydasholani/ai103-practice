import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { HomeView } from "./components/HomeView";
import { QuizView } from "./components/QuizView";
import { ResultView } from "./components/ResultView";
import { ExamView } from "./components/ExamView";
import { ExamResultView } from "./components/ExamResultView";
import { AuthView } from "./components/AuthView";
import { MistakeReviewView } from "./components/MistakeReviewView";
import { supabase } from "./lib/supabase";
import { loadQuizHistory, saveQuizAttempt } from "./services/quizAttempts";
import { loadMasteredQuestionIds, setQuestionMastered } from "./services/masteredQuestions";
import { loadQuestionPerformance, saveQuestionAttempts } from "./services/questionPerformance";
import { loadStudyProgress, saveStudyProgress } from "./services/studyProgress";
import { DOMAIN_META } from "./constants/domains";
import type {
  Answers,
  ExamAnswers,
  HistoryItem,
  Question,
  QuestionCount,
  QuestionPerformance,
  Confidence,
  StudyProgress,
  View,
} from "./types/quiz";
import { answerIsCorrect, createExamQuiz, createQuiz, isAnswered, maximumExamScore, scoreQuestion } from "./utils/quiz";

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
  const [masteredQuestionIds, setMasteredQuestionIds] = useState<number[]>([]);
  const [questionPerformance, setQuestionPerformance] = useState<QuestionPerformance[]>([]);
  const [studyProgress, setStudyProgress] = useState<StudyProgress[]>([]);
  const [confidence, setConfidence] = useState<Confidence | null>(null);

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
      setMasteredQuestionIds([]);
      setQuestionPerformance([]);
      setStudyProgress([]);
      return;
    }
    loadQuizHistory().then(setHistory).catch((error) => {
      console.error("Could not load quiz history", error);
    });
    loadMasteredQuestionIds().then(setMasteredQuestionIds).catch((error) => {
      console.error("Could not load mastered questions", error);
    });
    loadQuestionPerformance().then(setQuestionPerformance).catch((error) => {
      console.error("Could not load question performance", error);
    });
    loadStudyProgress().then(setStudyProgress).catch((error) => {
      console.error("Could not load study progress. Run supabase/study_progress.sql.", error);
    });
  }, [session]);

  function startQuiz(domain?: string, needsPractice = false) {
    const mastered = new Set(masteredQuestionIds);
    const weakIds = new Set(questionPerformance
      .filter((item) => item.maximumPoints > 0 && item.earnedPoints / item.maximumPoints < 0.7)
      .map((item) => item.questionId));
    const eligible = (question: Question) =>
      !mastered.has(question.id) && (!needsPractice || weakIds.has(question.id));
    const includedGroups = new Set(questions
      .filter(eligible)
      .flatMap((question) => question.examGroup ? [`solution:${question.examGroup.id}`]
        : question.caseStudy ? [`case:${question.caseStudy.id}`] : []));
    const practiceQuestions = questions.filter((question) =>
      eligible(question)
      || Boolean(question.examGroup && includedGroups.has(`solution:${question.examGroup.id}`))
      || Boolean(question.caseStudy && includedGroups.has(`case:${question.caseStudy.id}`)));
    const selectedQuestions = createQuiz(practiceQuestions, questionCount, domain);
    if (!selectedQuestions.length) {
      window.alert(needsPractice
        ? "No questions need extra practice yet. Answer some questions first."
        : domain
        ? "You have mastered every question in this domain."
        : "You have mastered every practice question.");
      return;
    }
    setQuiz(selectedQuestions);
    setQuizLabel(needsPractice ? "Needs practice" : domain ? DOMAIN_META[domain].short : "All domains");
    setActiveDomain(domain);
    setIndex(0);
    setScore(0);
    setAnswers({});
    setSubmitted(false);
    setConfidence(null);
    setView("quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setAnswer(key: string, value: string | string[]) {
    if (!submitted) {
      setAnswers((current) => ({ ...current, [key]: value }));
    }
  }

  function startExam() {
    setQuiz(createExamQuiz(questions, 60));
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

  async function toggleMastered(questionId: number) {
    if (!session) return;
    const wasMastered = masteredQuestionIds.includes(questionId);
    const update = (ids: number[]) => wasMastered
      ? ids.filter((id) => id !== questionId)
      : [...ids, questionId];
    setMasteredQuestionIds(update);

    try {
      await setQuestionMastered(session.user.id, questionId, !wasMastered);
    } catch (error) {
      setMasteredQuestionIds((ids) => wasMastered
        ? [...ids, questionId]
        : ids.filter((id) => id !== questionId));
      console.error("Could not update mastered question", error);
      window.alert("Could not update mastered status. Please try again.");
    }
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
      const attempts = quiz.map((question) => {
        const result = scoreQuestion(question, examAnswers[question.id] ?? {});
        return {
          questionId: question.id,
          category: question.category,
          mode: "exam" as const,
          isCorrect: result.earned === result.maximum,
          earnedPoints: result.earned,
          maximumPoints: result.maximum,
        };
      });
      applyPerformance(attempts);
      saveQuestionAttempts(session.user.id, attempts).catch((error) => {
        console.error("Could not save exam question performance", error);
      });
    }
    setView("exam-result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submitAnswer() {
    const question = quiz[index];
    if (!isAnswered(question, answers)) return;
    const correct = answerIsCorrect(question, answers);
    if (correct) {
      setScore((current) => current + 1);
    }
    if (session) {
      const attempt = {
        questionId: question.id,
        category: question.category,
        mode: "practice" as const,
        isCorrect: correct,
        earnedPoints: correct ? 1 : 0,
        maximumPoints: 1,
      };
      applyPerformance([attempt]);
      saveQuestionAttempts(session.user.id, [attempt]).catch((error) => {
        console.error("Could not save question performance", error);
      });
      saveProgress(question, correct, null);
    }
    setSubmitted(true);
  }

  async function saveProgress(question: Question, correct: boolean, nextConfidence: Confidence | null) {
    if (!session) return;
    const previous = studyProgress.find((item) => item.questionId === question.id);
    try {
      const saved = await saveStudyProgress(session.user.id, question.id, answers, correct, nextConfidence, previous?.reviewStep);
      setStudyProgress((current) => [...current.filter((item) => item.questionId !== question.id), saved]);
    } catch (error) {
      console.error("Could not save study progress", error);
    }
  }

  function chooseConfidence(value: Confidence) {
    const question = quiz[index];
    setConfidence(value);
    saveProgress(question, answerIsCorrect(question, answers), value);
  }

  function startReview(filter: (item: StudyProgress) => boolean, label: string) {
    const ids = new Set(studyProgress.filter(filter).map((item) => item.questionId));
    const selected = createQuiz(questions.filter((question) => ids.has(question.id)), questionCount);
    if (!selected.length) return;
    setQuiz(selected); setQuizLabel(label); setActiveDomain(undefined); setIndex(0); setScore(0);
    setAnswers({}); setSubmitted(false); setConfidence(null); setView("quiz");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function applyPerformance(attempts: {
    questionId: number;
    isCorrect: boolean;
    earnedPoints: number;
    maximumPoints: number;
  }[]) {
    setQuestionPerformance((current) => {
      const next = new Map(current.map((item) => [item.questionId, { ...item }]));
      for (const attempt of attempts) {
        const item = next.get(attempt.questionId) ?? {
          questionId: attempt.questionId,
          attempts: 0,
          correctAttempts: 0,
          earnedPoints: 0,
          maximumPoints: 0,
        };
        item.attempts += 1;
        item.correctAttempts += attempt.isCorrect ? 1 : 0;
        item.earnedPoints += attempt.earnedPoints;
        item.maximumPoints += attempt.maximumPoints;
        next.set(attempt.questionId, item);
      }
      return [...next.values()];
    });
  }

  function nextQuestion() {
    if (index < quiz.length - 1) {
      setIndex((current) => current + 1);
      setAnswers({});
      setSubmitted(false);
      setConfidence(null);
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
        mastered={masteredQuestionIds.includes(quiz[index].id)}
        onToggleMastered={() => toggleMastered(quiz[index].id)}
        confidence={confidence}
        onConfidence={chooseConfidence}
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

  if (view === "mistakes") {
    return <MistakeReviewView questions={questions} progress={studyProgress}
      onPractice={() => startReview((item) => !item.wasCorrect, "Mistake review")}
      onHome={() => setView("home")} />;
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
      onStartNeedsPractice={() => startQuiz(undefined, true)}
      onStartExam={startExam}
      userEmail={session.user.email ?? "Signed in"}
      onSignOut={() => supabase.auth.signOut()}
      masteredQuestionIds={masteredQuestionIds}
      questionPerformance={questionPerformance}
      studyProgress={studyProgress}
      onStartDomainReview={(domain) => startQuiz(domain)}
      onOpenMistakes={() => setView("mistakes")}
      onStartDueReview={() => startReview(
        (item) => Boolean(item.nextReviewAt) && new Date(item.nextReviewAt!) <= new Date(),
        "Due review",
      )}
    />
  );
}
