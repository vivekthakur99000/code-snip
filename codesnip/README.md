# CodeSnip

CodeSnip is a full-stack code snippet manager built with Next.js App Router, tRPC, Drizzle, Neon Postgres, NextAuth, and Tailwind.

## Development

- Install dependencies: npm ci
- Run dev server: npm run dev
- Type check: npm run typecheck
- Lint: npm run lint

## Database

- Push schema changes (development): npm run db:push
- Generate migrations: npm run db:generate
- Apply migrations: npm run db:migrate

## Testing

- Unit tests (Vitest): npm run test:unit
- E2E tests (Playwright): npm run test:e2e
- Full local quality pass: npm run test:ci

## CI

GitHub Actions workflow is defined in .github/workflows/ci.yml and runs:

- lint
- typecheck
- unit tests
- Playwright smoke tests
