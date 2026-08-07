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
flagging and navigation, automatic submission when time expires, a 70 percent
passing score, and answer review only after the exam has been submitted.
