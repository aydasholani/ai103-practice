# Refactored AI-103 source

Replace the existing `src` directory in `ai103-practice` with the `src`
directory in this package. Keep your current `public`, `package.json`,
`package-lock.json`, `vite.config.ts`, and GitHub Actions workflow.

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
