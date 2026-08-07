# Refactored AI-103 source

Replace the existing `src` directory in `ai103-practice` with the `src`
directory in this package. Also replace `public/questions.json` with the
included version. Keep your other files in `public`, plus `package.json`,
`package-lock.json`, `vite.config.ts`, and the GitHub Actions workflow.

The original large component has been split into:

- `App.tsx` — application state and navigation
- `components/HomeView.tsx` — start page and quiz configuration
- `components/QuizView.tsx` — question screen
- `components/ResultView.tsx` — result screen
- `components/InteractionField.tsx` — dropdown, yes/no, and matching fields
- `components/Brand.tsx` — shared logo/header element
- `constants/domains.ts` — domain labels and colors
- `types/quiz.ts` — TypeScript types
- `utils/quiz.ts` — shuffle, quiz selection, and answer validation

The question-count selector is included with 10, 25, 50, and all questions.

Every normal answer option and every dropdown, yes/no, or drag-and-drop target
includes an English explanation. Explanations are displayed after the answer
has been checked.

Exam mode includes 60 random questions, a 120-minute countdown, question
flagging and navigation, automatic submission when time expires, an 80 percent
practice target, and answer review only after the exam has been submitted. This
practice target does not reproduce Microsoft's scaled 700-point scoring system.

Supabase authentication and synchronized quiz history are included. Install
the client package with `npm install @supabase/supabase-js` and provide
`VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env.local` and in
the GitHub Actions build environment.

Run all three SQL files in the `supabase` directory in Supabase SQL Editor. The app
then syncs mastered questions and per-question answer history between devices.
Mastered questions are excluded from practice but remain in Exam Mode.

The start page shows accuracy per exam domain. Questions with a cumulative
score below 70 percent are automatically available in **Needs practice** mode.
Practice answers and Exam Mode component scores both contribute to these
statistics.

Curated ExamTopics discussion insights are included. Twelve questions contain
a separate Community discussion section, including an Answer debated badge
where interpretations conflict. Relevant discussion from the remaining
questions has been incorporated into the answer explanations; usernames,
votes, duplicate comments, and unrelated discussion have been removed.

Exam mode uses selection-level scoring: every correct multiple-choice option,
dropdown, yes/no row, or drag-and-drop target is worth one point. Partially
correct questions show the points earned during answer review. Practice mode
continues to require the complete answer set.

The home page includes official Microsoft Learn resources per exam domain, a
Weak areas panel, due-review shortcuts, and Mistake review. After checking a
practice answer, users can mark it Guessed, Unsure, or Confident and open a
Microsoft Learn search for that question's topic. Incorrect, guessed, and
unsure questions are scheduled for spaced review after 1, 3, and 7 days. Run
`supabase/study_progress.sql` before using these synchronized learning features.
