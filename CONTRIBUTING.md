# Contributing to PvdAI

Thanks for your interest in contributing!

## Getting Started

1. Fork the repository and clone it locally.
2. Copy `.env.example` to `.env.local` and add your OpenAI API key.
3. Run `npm install` to install dependencies.
4. Run `npm run dev` to start the development server.

## Before You Submit

- **Open an issue first** to discuss what you'd like to change, especially for new features or significant refactors.
- For bug fixes, you can open a pull request directly.

## Development Workflow

```sh
npm run dev       # Start dev server
npm test          # Run tests (Vitest)
npm run lint      # ESLint check
npm run build     # Full build (runs embeddings + Next.js build)
```

All CI checks (lint, tests, `npm audit`) must pass before a PR can be merged.

## Pull Request Guidelines

- Keep PRs focused — one logical change per PR.
- Write a clear description of what the change does and why.
- Update the privacy policy (`app/privacybeleid/page.tsx`) if your change affects data handling, rate limiting, or analytics (see CLAUDE.md for details).
- Add or update tests where appropriate.

## Commit Style

Follow the existing commit style: short imperative summary, optionally followed by a blank line and more detail.

```
fix: article links on mobile
feat: add document search
```

## Reporting Bugs

Please use the [bug report issue template](.github/ISSUE_TEMPLATE/bug_report.md).

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
