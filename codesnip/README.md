# CodeSnip

CodeSnip is a full-stack snippet sharing app built with Next.js App Router, tRPC, Drizzle ORM, and NextAuth.
Users can create private snippets, publish selected snippets publicly, search community snippets by text/language, and share snippets through dedicated public pages, embeddable HTML, and OG images.

## Highlights

- Authenticated dashboard for personal snippet management
- Public snippet discovery with debounced search and language filters
- Snippet tags, views, and like/dislike voting
- Public snippet pages with server-side highlighting (Shiki)
- Embeddable snippet endpoint: `/api/embed/[slug]`
- Dynamic Open Graph image endpoint: `/api/og/snippet/[slug]`
- Health check endpoint: `/api/health`
- Search and view rate limiting support
- Optional Redis caching (Upstash) for hot public queries

## Tech Stack

- Framework: Next.js 15 (App Router)
- Language: TypeScript
- API layer: tRPC v11
- Database: PostgreSQL + Drizzle ORM
- Authentication: NextAuth v5 (GitHub provider)
- Styling: Tailwind CSS v4
- Syntax highlighting: Shiki
- Unit testing: Vitest
- E2E testing: Playwright

## Project Structure

```text
codesnip/
	src/
		app/
			(auth)/login
			(dashboard)/dashboard
			(dashboard)/snippets
			s/[slug]                  # Public snippet page
			api/embed/[slug]          # Embeddable HTML snippet
			api/og/snippet/[slug]     # Dynamic OG image
			api/health                # Health endpoint
		components/
			search/
			snippet/
			layout/
		server/
			auth/
			db/
			trpc/
		lib/
			validators/
			cache.ts
			rate-limit.ts
			shiki.ts
	tests/
		e2e/
```

## Requirements

- Node.js (current LTS recommended)
- npm
- A PostgreSQL database
- A GitHub OAuth app (for login)

## Environment Variables

Create a `.env` file in `codesnip/` with the following values:

```bash
# Required
DATABASE_URL="postgres://USER:PASSWORD@HOST:PORT/DBNAME"
AUTH_GITHUB_ID="your_github_oauth_client_id"
AUTH_GITHUB_SECRET="your_github_oauth_client_secret"

# Required in production, optional in development
AUTH_SECRET="your_random_long_secret"

# Optional
AUTH_URL="http://localhost:3000"
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

Notes:

- `AUTH_SECRET` is mandatory in production.
- Redis variables are optional; the app falls back gracefully when unavailable.

## Getting Started

```bash
npm ci
npm run db:push
npm run dev
```

Then open `http://localhost:3000`.

## Available Scripts

### App lifecycle

- `npm run dev` - Start development server (Turbopack)
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run preview` - Build and run production server locally

### Quality

- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with autofix
- `npm run typecheck` - Run TypeScript checks
- `npm run check` - Lint + typecheck
- `npm run format:check` - Check formatting with Prettier
- `npm run format:write` - Apply Prettier formatting

### Database

- `npm run db:push` - Push schema directly to DB (great for local development)
- `npm run db:generate` - Generate SQL migrations from schema changes
- `npm run db:migrate` - Apply generated migrations
- `npm run db:studio` - Open Drizzle Studio
- `npm run db:seed:snippets` - Seed sample snippets

### Tests

- `npm run test` - Run unit tests
- `npm run test:unit` - Run Vitest suite
- `npm run test:e2e` - Run Playwright tests
- `npm run test:e2e:ui` - Open Playwright UI mode
- `npm run test:ci` - Lint + typecheck + unit tests

## Authentication and Access

- GitHub OAuth is the configured sign-in provider.
- Protected routes are enforced via middleware:
	- `/dashboard/*`
	- `/snippets/*`
- Public snippet pages are available at `/s/[slug]`.

## API Endpoints

- `GET /api/health` - Returns `{ "status": "ok" }`
- `GET /api/embed/[slug]` - Returns embeddable HTML for a public snippet
- `GET /api/og/snippet/[slug]` - Returns OG image for a public snippet
- `GET|POST /api/trpc/*` - tRPC endpoint for app operations

## Database Schema (Overview)

Core tables:

- `users`, `accounts`, `sessions`, `verification_tokens`, `authenticators`
- `snippets` (title, code, language, slug, visibility, views, soft-delete)
- `tags`, `snippet_tags`
- `snippet_votes`

Search is backed by a generated Postgres `tsvector` field (`search_vec`) with a GIN index.

## Deployment Notes

- Set all required environment variables in your host.
- Run migrations as part of your deployment flow (`db:push` or `db:migrate` strategy).
- In production, ensure `AUTH_SECRET` is set.
- Optional Redis caching improves performance under load but is not mandatory.

## Troubleshooting

- Login fails: verify GitHub OAuth callback settings and `AUTH_GITHUB_*` values.
- DB errors: verify `DATABASE_URL` and apply schema updates with `npm run db:push`.
- Missing vote table error: run `npm run db:push` to sync schema.
- Slow public queries under heavy load: configure Upstash Redis env vars.

## License

No license file is currently included in this repository.
