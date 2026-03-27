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

**Database / BaaS:**
- `supabase/` directory or `@supabase/supabase-js` in deps → Supabase (PostgreSQL + Auth + Storage + Realtime)
- `firebase.json` / `@firebase` in deps → Firebase
- `.env` / `.env.example` → look for SUPABASE_URL, DATABASE_URL, DB_HOST, MONGO_URI, NEON_DATABASE_URL
- `docker-compose.yml` → check for postgres/mysql/mongo/redis services
- `prisma/schema.prisma` → Prisma + detect DB
- `knexfile.*` / `ormconfig.*` / `typeorm` in deps → ORM + detect DB
- `sequelize` in deps → Sequelize
- `drizzle.config.*` → Drizzle ORM
- Migration directories → detect DB type

**Hosting / Deployment:**
- `vercel.json` or `next.config.*` → Vercel
- `netlify.toml` → Netlify
- `fly.toml` → Fly.io
- `railway.toml` or `railway.json` → Railway
- `render.yaml` → Render
- `Dockerfile` → Docker (detect target platform from other configs)
- `docker-compose.yml` → Docker Compose
- `serverless.yml` / `serverless.ts` → Serverless Framework (AWS)
- `wrangler.toml` → Cloudflare Workers/Pages
- `app.yaml` → Google App Engine
- `Procfile` → Heroku / Railway

**CI/CD:**
- `.github/workflows/` → GitHub Actions
- `.gitlab-ci.yml` → GitLab CI
- `Jenkinsfile` → Jenkins
- `.circleci/config.yml` → CircleCI
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

## Step 3: QA Monitoring Setup

After generating CLAUDE.md, ask the user which automatic QA monitoring they want:

Present the options in simple language:

---

**How would you like the QA agent to monitor your project?**

**Option A: After every commit** — Each time you save changes to Git, the QA agent automatically scans the files that changed and reports any issues it finds. Fast and lightweight.

**Option B: Scheduled scan** — The QA agent runs a full project scan on a schedule (e.g., every few hours or once a day). More thorough but uses more resources.

**Option C: Both** — Get instant feedback after commits AND periodic full scans.

**Option D: Manual only** — QA only runs when you ask for it (`/full-audit` or `@qa-expert`).

---

Based on the user's choice:

**If A or C (post-commit hook):**
Add a `PostToolUse` hook to `.claude/settings.local.json` that triggers after Bash commands containing `git commit`. The hook should instruct Claude to run the qa-expert agent in the background on the changed files.

**If B or C (scheduled scan):**
Tell the user: "To set up scheduled scans, type `/schedule` and configure a recurring `/full-audit` task."

**If D:**
No setup needed — just confirm QA is available on demand.

## Step 4: Autonomy Level

Ask the user how much independence they want the agents to have:

---

**How much freedom should the agents have?**

**Level 1: Full control** — Agents stop and ask for your approval (PROCEED) before any significant change. You see everything before it happens. Best if you're new to ORCA or want to learn how each agent works.

**Level 2: Semi-autonomous** — Agents only stop for risky changes (deleting files, database migrations, authentication, deployment). Everything else runs automatically. Best for daily development work.

**Level 3: Fully autonomous** — Agents do everything on their own and give you a summary when done. They only stop if they hit an error they can't resolve. Best when you trust the system and want maximum speed.

---

Based on the user's choice, update the "Rules of Engagement" section in the generated CLAUDE.md:

**If Level 1 (full control):**
Keep the current Micro-Checkpoint rules as-is (PROCEED required for 3+ files, migrations, configs, auth, deletions).

**If Level 2 (semi-autonomous):**
Replace the checkpoint rule with:
"Agents work autonomously for most tasks. PROCEED confirmation is required ONLY for: deleting files or removing functionality, database migrations or schema changes, authentication or authorization logic changes, and deployment to production. All other changes execute automatically."

**If Level 3 (fully autonomous):**
Replace the checkpoint rule with:
"Agents work fully autonomously. They execute all changes without asking for confirmation. If an agent encounters an error it cannot resolve, it pauses and reports to the user. A summary of all changes is provided when the task is complete."

## Step 5: Report

Tell the user what was detected and that CLAUDE.md has been generated. List the detected technologies in a clean table. Also confirm which QA monitoring and autonomy level were set up.
