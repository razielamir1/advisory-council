Scan this project and auto-generate a customized CLAUDE.md file. Do NOT ask the user any questions — detect everything automatically.

## Step 1: Detect Tech Stack

Scan the project root for these files and infer the stack:

**Frontend:**
- `package.json` with react/next/vue/angular/svelte → detect framework
- `tsconfig.json` → TypeScript
- `tailwind.config.*` → TailwindCSS
- `postcss.config.*` / `sass` in dependencies → CSS preprocessor
- `vite.config.*` / `webpack.config.*` / `next.config.*` → build tool

**Backend:**
- `package.json` with express/fastify/koa/nestjs → Node.js framework
- `requirements.txt` / `pyproject.toml` / `Pipfile` → Python (detect django/flask/fastapi)
- `go.mod` → Go
- `Cargo.toml` → Rust
- `pom.xml` / `build.gradle` → Java/Kotlin
- `Gemfile` → Ruby/Rails
- `composer.json` → PHP/Laravel

**Database:**
- `docker-compose.yml` → check for postgres/mysql/mongo/redis services
- `.env` / `.env.example` → look for DATABASE_URL, DB_HOST, MONGO_URI
- `prisma/schema.prisma` → Prisma + detect DB
- `knexfile.*` / `ormconfig.*` / `typeorm` in deps → ORM + detect DB
- `sequelize` in deps → Sequelize
- `drizzle.config.*` → Drizzle ORM
- Migration directories → detect DB type

**Infrastructure:**
- `Dockerfile` → Docker
- `docker-compose.yml` → Docker Compose
- `.github/workflows/` → GitHub Actions
- `Jenkinsfile` → Jenkins
- `.gitlab-ci.yml` → GitLab CI
- `vercel.json` / `netlify.toml` → deployment platform
- `terraform/` / `*.tf` → Terraform
- `k8s/` / `kubernetes/` → Kubernetes

**Testing:**
- `jest.config.*` / jest in deps → Jest
- `vitest` in deps → Vitest
- `cypress/` / `playwright/` → E2E framework
- `pytest` in deps → pytest
- `.mocharc.*` → Mocha

**Monorepo:**
- `pnpm-workspace.yaml` / `lerna.json` / `nx.json` / `turbo.json` → monorepo tool
- `packages/` / `apps/` directories → workspace structure

## Step 2: Generate CLAUDE.md

Write a `CLAUDE.md` file at the project root using the template from the existing CLAUDE.md, but replace the Tech Stack section with the auto-detected stack. Keep everything else (Delegation Table, Rules of Engagement, Workflows, etc.) exactly the same.

If the detected stack is very different from the default (e.g., Python instead of Node.js), also update the agent descriptions in the Delegation Table to reflect the actual technologies (e.g., "FastAPI backend" instead of "Express backend").

## Step 3: Report

Tell the user what was detected and that CLAUDE.md has been generated. List the detected technologies in a clean table.
