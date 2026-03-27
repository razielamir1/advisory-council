# Lead Orchestrator Agent — Confluence Guide

> Step-by-step usage guide for the multi-agent development system in Claude Code.

---

## Table of Contents

1. [What Is This?](#1-what-is-this)
2. [Prerequisites](#2-prerequisites)
3. [Installation](#3-installation)
4. [Your First Task](#4-your-first-task)
5. [Slash Commands](#5-slash-commands)
6. [Working With Agents — Step by Step](#6-working-with-agents--step-by-step)
7. [Advanced Workflows](#7-advanced-workflows)
8. [Safety System](#8-safety-system)
9. [Agent Collaboration](#9-agent-collaboration)
10. [Accessibility Menu](#10-accessibility-menu-automatic)
11. [Deployment Platform Support](#11-deployment-platform-support)
12. [Audit Report System](#12-audit-report-system)
13. [Agent Reference Card](#13-agent-reference-card)
14. [Memory System](#14-memory-system)
15. [MCP — External Tool Integration](#15-mcp--external-tool-integration)
16. [Context Efficiency](#16-context-efficiency)
17. [Customizing for Your Project](#17-customizing-for-your-project)
18. [Troubleshooting](#18-troubleshooting)

---

## 1. What Is This?

A system of **15 specialized AI agents** that work together as a complete development team inside Claude Code. Instead of one AI doing everything, tasks are routed to the right specialist — just like a real team.

**Key benefits:**
- Each agent has deep expertise in its domain
- Read-only agents (QA, security, code review, architect) can never accidentally break your code
- Agents maintain persistent memory — they learn your project over time
- Heavy analysis happens in isolated agent contexts, keeping your main conversation clean
- Safety hooks block destructive operations at the system level
- Slash commands automate common workflows with a single command

---

## 2. Prerequisites

| Requirement | Details |
|---|---|
| Claude Code | Installed and authenticated |
| VSCode | With Claude Code extension |
| Git | For version control and subtree sync |

---

## 3. Installation

### Step 3.1 — New Project

1. Go to the GitHub repository
2. Click **"Use this template"** → **"Create a new repository"**
3. Clone your new repository locally
4. Open it in VSCode
5. Type `/init-project` in the Claude chat — it auto-detects your tech stack and generates `CLAUDE.md`
6. Done! Start working with the agents

### Step 3.2 — Existing Project (Recommended)

This method supports pulling future agent updates.

**Step 3.2.1** — Open a terminal in your project directory

**Step 3.2.2** — Add the agents repository as a remote:
```bash
git remote add agents https://github.com/razielamir1/orca.git
git fetch agents
```

**Step 3.2.3** — Pull the `.claude` directory into your project:
```bash
git subtree add --prefix=.claude agents main --squash
```

**Step 3.2.4** — Open the project in VSCode and type `/init-project` in the Claude chat. The command will:
- Scan your project for `package.json`, `requirements.txt`, `go.mod`, `docker-compose.yml`, etc.
- Detect your frontend framework, backend framework, database, testing tools, and infrastructure
- Generate a customized `CLAUDE.md` with the correct tech stack

**Step 3.2.5** — Commit the changes:
```bash
git add -A && git commit -m "Add Lead Orchestrator Agent system"
```

### Step 3.3 — Updating Agents Later

When new agents are added or existing ones are improved:
```bash
git subtree pull --prefix=.claude agents main --squash
```

---

## 4. Your First Task

Let's walk through a real example to see the system in action.

### Step 4.1 — Open the project in VSCode

Open your project folder. Claude will automatically read `CLAUDE.md` and know about all 11 agents.

### Step 4.2 — Give a simple task

Type in the Claude chat:

```
Build me a health check endpoint that returns the server status and database connection status.
```

### Step 4.3 — Watch the delegation

The Lead Orchestrator will:
1. Recognize this is a backend task
2. Delegate to `backend-developer`
3. The backend-developer will present its plan and wait for you to type **PROCEED**
4. After implementation, optionally route to `qa-expert` to verify

### Step 4.4 — Review the output

Each agent returns a summary of what it did. Review the changes, and if you're happy, commit them.

---

## 5. Slash Commands

Slash commands are pre-built workflows that automate common multi-agent tasks.

| Command | What It Does | Agents Involved |
|---|---|---|
| `/init-project` | Auto-detects tech stack and generates `CLAUDE.md` | Lead Orchestrator |
| `/full-audit` | Runs full codebase audit, produces `FIXES.md` | qa + security + reviewer + perf → architect |
| `/new-feature <desc>` | Builds a feature end-to-end | architect → db → backend → frontend → ui → qa |
| `/fix-bug <desc>` | Diagnoses and fixes a bug | qa → dev agent → qa |
| `/security-check` | Focused security vulnerability scan | security-analyst |
| `/document <type>` | Generates documentation (api/readme/onboarding/jsdoc) | tech-writer |
| `/deploy [platform]` | Full deployment pipeline | devops → qa → security |
| `/review-pr <number>` | Code review + security scan on a PR | code-reviewer + security-analyst |
| `/status` | Project health dashboard | qa + security (quick scan) |
| `/check-updates` | Checks for agent system updates and offers to install | Lead Orchestrator |
| `/update-agents` | Pulls and installs the latest agent version | Lead Orchestrator |

### How to use them

Type the command directly in the Claude chat:

```
/new-feature User authentication with JWT tokens and password reset
```

```
/fix-bug The checkout button is not responding on mobile devices
```

```
/document api
```

---

## 6. Working With Agents — Step by Step

### 6.1 — Automatic Delegation (Easiest)

**What:** Describe your task in natural language. The orchestrator picks the right agent(s).

**How:**
```
I need a user registration page with email validation and a database table to store users.
```

**What happens:**
1. `database-expert` creates the users table and migration
2. `backend-developer` creates the registration endpoint
3. `frontend-developer` builds the registration form logic
4. `ui-designer` styles the form

**When to use:** Most of the time. This is the default way to work.

---

### 6.2 — Direct Agent Invocation (@-mention)

**What:** Target a specific agent when you know exactly who should handle the task.

**How:**
```
@security-analyst scan all files in src/api/ for SQL injection vulnerabilities
```

**More examples:**
```
@architect design the data flow for a real-time chat feature
@tech-writer write JSDoc comments for all exported functions in src/utils/
@performance-optimizer analyze why the /api/products endpoint is slow
@devops-engineer create a Dockerfile for this project
```

**When to use:** When you want a specific expert's opinion, or when the orchestrator delegates to the wrong agent.

---

### 6.3 — Parallel Execution

**What:** Run multiple independent agents at the same time.

**How:**
```
Run these in parallel:
- @code-reviewer review src/api/
- @security-analyst audit src/api/
- @qa-expert check test coverage for src/api/
```

Or simply use `/full-audit` to run all 4 audit agents in parallel automatically.

**What happens:** All agents run simultaneously. Each writes its report to `.claude/audits/`. No agent blocks another.

**When to use:** For audits, reviews, and any tasks that don't depend on each other.

---

### 6.4 — Sequential Chaining

**What:** Run agents one after another, where each builds on the previous agent's work.

**How:**
```
Build a complete user profile feature:
1. @architect — design the architecture
2. @database-expert — create the schema
3. @backend-developer — build the API
4. @frontend-developer — build the page logic
5. @ui-designer — style the page
6. @qa-expert — test everything
```

Or use `/new-feature user profile page with avatar upload` to run the full pipeline automatically.

**When to use:** For full-stack features where order matters.

---

### 6.5 — Background Execution

**What:** Run an agent in the background while you continue working.

**How:**
```
Run @qa-expert in the background to scan the entire project for bugs
```

**Alternative:** Press **Ctrl+B** to move a currently running task to the background.

**What happens:** The agent works silently. When it finishes, you get a notification with the results.

**When to use:** For long-running tasks like full project scans, security audits, or test suites.

---

### 6.6 — Viewing Available Agents

**What:** See all agents and their descriptions.

**How:** Type `/agents` in the chat.

**What you see:** An interactive menu listing all 15 agents with their descriptions. You can select one to invoke it.

---

## 7. Advanced Workflows

### 7.1 — Full Feature Development

**Scenario:** You need to build a complete "Shopping Cart" feature.

```
/new-feature Shopping cart - users can add/remove products, cart persists across sessions, checkout calculates total with tax, responsive sidebar UI
```

**Agent flow:**
```
architect          → Designs the overall approach (waits for PROCEED)
  ↓
database-expert    → Creates cart_items table, indexes
  ↓
backend-developer  → Builds CRUD endpoints for cart
  ↓
frontend-developer → Builds cart state management, API hooks
  ↓
ui-designer        → Creates cart sidebar, animations
  ↓
qa-expert          → Tests all flows, edge cases
```

---

### 7.2 — Bug Investigation & Fix

**Scenario:** Users report that checkout sometimes fails.

```
/fix-bug Users are reporting intermittent checkout failures
```

**Agent flow:**
```
qa-expert              → Diagnoses the bug, identifies root cause
  ↓
backend-developer      → Fixes the root cause
  ↓
qa-expert              → Verifies the fix
```

---

### 7.3 — Pre-Release Audit

**Scenario:** You're about to release v2.0 and want a full quality check.

```
/full-audit
```

**Agent flow (all in parallel):**
```
code-reviewer          → AUDIT_CODE_REVIEW.md
security-analyst       → AUDIT_SECURITY.md
qa-expert              → AUDIT_QA.md
performance-optimizer  → AUDIT_PERFORMANCE.md
         ↓ (all complete)
architect              → Reads all reports → FIXES.md
```

Review `FIXES.md` and address findings before release.

---

### 7.4 — Onboarding Documentation

**Scenario:** A new developer is joining the team and needs documentation.

```
/document onboarding
```

---

## 8. Safety System

### 8.1 — Micro-Checkpoint Protocol (Prompt-Level)

Agents with Write permissions must **PAUSE and present their action plan** before executing changes that involve:

| Trigger | Example |
|---|---|
| 3+ file changes | Creating a new feature across multiple files |
| Database migrations | Adding a new table or modifying a schema |
| Configuration files | package.json, tsconfig, Dockerfile, CI/CD pipelines |
| Auth logic | Login, JWT, session management, permissions |
| Deletions | Removing files, endpoints, or functionality |

The agent presents its plan and waits for the user to type **PROCEED** before executing.

### 8.2 — Safety Hooks (System-Level)

A `PreToolUse` hook in `.claude/settings.json` blocks dangerous operations at the technical level — not a prompt instruction, but actual enforcement:

| Blocked Operation | What Gets Blocked |
|---|---|
| Destructive SQL | `DROP TABLE`, `TRUNCATE`, `DELETE FROM` |
| Recursive deletes | `rm -rf`, `rm -r /` |
| Force operations | `--force`, `--hard` |

When an agent tries a blocked operation, it receives an error message and cannot proceed. This provides a safety net beyond the prompt-level checkpoints.

### 8.3 — Communication Rules

- **Do, don't instruct:** Agents execute commands themselves — they never tell the user to run terminal commands manually. The user is a supervisor, not an operator.
- **Speak plainly:** Agents use simple everyday language with users. Instead of "monolith vs. microservices", they say "one single app vs. separate services that talk to each other." Technical jargon is reserved for code and agent-to-agent communication.

---

## 9. Agent Collaboration

### 9.1 — Handoff Protocol

When agents pass work to the next agent in a pipeline, they provide a structured summary:
- **What was done:** Files created/modified
- **Key decisions made:** Important choices and rationale
- **What the next agent needs to know:** Context and dependencies
- **Open questions:** Anything unresolved

### 9.2 — Cross-Agent Issue Resolution

When an agent discovers a problem outside its domain, it flags it automatically using `@ISSUE → [target-agent]`. The orchestrator routes the issue, the target agent fixes it, and the original agent continues — all without user intervention.

**Examples:**
- `backend-developer` finds a missing database column → auto-routes to `database-expert`
- `frontend-developer` finds a broken API endpoint → auto-routes to `backend-developer`
- `qa-expert` finds a security vulnerability → auto-routes to `security-analyst`
- `ui-designer` finds a component has no data → auto-routes to `frontend-developer`

Resolution chains up to 3 levels deep are supported (agent A → agent B → agent C). The user is informed after the fact.

---

## 10. Accessibility Menu (Automatic)

Every web project automatically gets a floating accessibility menu (♿ icon, bottom-left corner). The `ui-designer` creates it during development. The `qa-expert` flags it as a high-severity finding if missing during audits.

### Features
| Feature | What It Does |
|---|---|
| Font Size | Increase / decrease / reset text size |
| High Contrast | Dark background, bright text |
| Grayscale | For color-blind users |
| Link Highlighting | Underline and highlight all links |
| Readable Font | Dyslexia-friendly font |
| Stop Animations | Pause all CSS animations |
| Big Cursor | Enlarge the mouse cursor |
| Reading Guide | Horizontal line following the cursor |
| Reset | Restore all defaults |

Settings persist in the browser via localStorage.

---

## 11. Deployment Platform Support

Agents have built-in knowledge of modern deployment platforms:

| Category | Platforms |
|---|---|
| Frontend Hosting | Vercel, Netlify, Cloudflare Pages, GitHub Pages |
| Backend Hosting | Railway, Fly.io, Render, AWS, Google Cloud Run |
| Database / BaaS | Supabase, Neon, PlanetScale, Firebase, MongoDB Atlas |
| CI/CD | GitHub Actions, GitLab CI, CircleCI |

The `devops-engineer` includes a full production deployment checklist. The `architect` recommends hosting platforms as part of architecture design. `/init-project` auto-detects which platforms the project uses.

---

## 12. Audit Report System

### How It Works

Audit agents write their findings to files in `.claude/audits/` instead of returning them in the conversation. This prevents "context rot" — where hundreds of lines of logs flood the main chat and degrade AI performance.

| Agent | Writes To |
|---|---|
| `qa-expert` | `.claude/audits/AUDIT_QA.md` |
| `security-analyst` | `.claude/audits/AUDIT_SECURITY.md` |
| `code-reviewer` | `.claude/audits/AUDIT_CODE_REVIEW.md` |
| `performance-optimizer` | `.claude/audits/AUDIT_PERFORMANCE.md` |

### Summarization

After all audit agents complete, the `architect` agent reads all 4 reports and produces a unified `FIXES.md` at the project root:
- Grouped by priority (critical → high → medium → low)
- Deduplicated (overlapping findings merged)
- Each fix assigned to the appropriate agent

### Git Exclusion

Audit reports are excluded from version control via `.gitignore`. They are temporary working documents, not permanent artifacts.

---

## 13. Agent Reference Card

### Agents That WRITE Code

| Agent | Specialization | Best For |
|---|---|---|
| `prompt-architect` | Prompt engineering, requirements refinement | Transforming raw requests into precise specs |
| `business-analyst` | Market research, competitive analysis | Discovery, feasibility, benchmarking |
| `product-manager` | PRDs, user stories, feature specs | Product strategy, requirements, prioritization |
| `frontend-developer` | React, TypeScript, hooks, state | Page logic, data fetching, forms |
| `ui-designer` | TailwindCSS, components, layouts | Visual design, styling, responsiveness |
| `backend-developer` | Express, middleware, APIs | Endpoints, auth, server logic |
| `database-expert` | PostgreSQL, SQL, migrations | Schema design, queries, indexes |
| `devops-engineer` | Docker, CI/CD, deployment | Infrastructure, pipelines, configs |
| `performance-optimizer` | Profiling, caching, optimization | Speed improvements, bundle size |
| `tech-writer` | Documentation, JSDoc | API docs, README, guides |
| `git-manager` | Git workflow, branching, releases | PRs, tags, merge conflicts, repo hygiene |

### Agents That ADVISE Only

| Agent | Specialization | Output |
|---|---|---|
| `architect` | System design, scalability | Design documents, recommendations, FIXES.md |
| `code-reviewer` | Best practices, code quality | Review reports with severity levels |
| `security-analyst` | OWASP, vulnerability scanning | Security audit reports |
| `qa-expert` | Testing, bug hunting | Bug reports, coverage analysis |

---

## 14. Memory System

### How It Works

Each agent has a memory file at `.claude/agent-memory/<agent-name>/MEMORY.md`.

| Event | What Happens |
|---|---|
| Agent starts a task | Reads its memory file for past context |
| Agent finishes a task | Updates memory with new insights |
| New project | Memory starts empty, builds over time |

### What Gets Remembered

| Agent | Remembers |
|---|---|
| `prompt-architect` | Effective prompt patterns, common user gaps, project conventions |
| `business-analyst` | Market data, competitor intel, user personas |
| `product-manager` | Product decisions, feature history, stakeholder preferences |
| `architect` | Architecture decisions, trade-offs, patterns |
| `frontend-developer` | State patterns, API conventions, component structure |
| `ui-designer` | Design decisions, color schemes, component library |
| `backend-developer` | API patterns, middleware conventions, auth flows |
| `database-expert` | Schema history, index strategies, migration decisions |
| `devops-engineer` | Infrastructure configs, deployment steps, env vars |
| `code-reviewer` | Coding standards, recurring issues |
| `security-analyst` | Known vulnerabilities, security patterns |
| `performance-optimizer` | Benchmarks, optimization history, bottlenecks |
| `qa-expert` | Bug patterns, fragile areas, test strategies |
| `tech-writer` | Documentation style, terminology, gaps |
| `git-manager` | Branching conventions, release history, commit style |

### Manually Triggering Memory Save

If an agent didn't automatically save its findings:
```
@qa-expert save what you learned from this session to your memory
```

---

## 15. MCP — External Tool Integration

MCP (Model Context Protocol) lets your agents access external systems. All MCP servers are configured in `.claude/settings.json`.

### Available Integrations

| MCP Server | What It Provides | Best For |
|---|---|---|
| PostgreSQL | Direct database access | `@database-expert` reading schemas |
| GitHub | PR, issue, and repo access | `@code-reviewer` reading PRs |
| Slack | Channel messaging | Status updates and notifications |
| Filesystem | Access to external directories | Reading shared docs or design assets |

See [MCP_SETUP.md](MCP_SETUP.md) for step-by-step setup instructions with configuration examples.

---

## 16. Context Efficiency

Subagents run in isolated contexts — their heavy processing stays in their own session and only a clean summary returns to the main conversation. This prevents context bloat and keeps costs down.

**Best practices:**
- Prefer delegating to agents over doing work inline
- Use `/full-audit` instead of asking each audit agent individually — it routes reports to files, not the chat
- For large codebases, target specific directories (e.g., "audit src/api/") rather than scanning everything

---

## 17. Customizing for Your Project

### Step 14.1 — Auto-Detect Tech Stack

Type `/init-project` in the Claude chat. It scans for:
- `package.json`, `requirements.txt`, `go.mod`, `Cargo.toml`, `Gemfile`, `composer.json`
- `docker-compose.yml`, `Dockerfile`, `.github/workflows/`
- `tsconfig.json`, `tailwind.config.*`, `vite.config.*`
- `prisma/schema.prisma`, `knexfile.*`, `.env`
- `jest.config.*`, `vitest`, `cypress/`, `playwright/`
- `pnpm-workspace.yaml`, `nx.json`, `turbo.json`

### Step 14.2 — Add a New Agent

Create a file in `.claude/agents/` with this structure:

```markdown
---
name: my-new-agent
description: When to use this agent (the orchestrator reads this to decide delegation).
model: sonnet
tools: Read, Write, Edit, Bash, Glob, Grep
---
You are a senior [role]. Your expertise is [domain].

# Persistent Memory
Before starting any task, read `.claude/agent-memory/my-new-agent/MEMORY.md`.
When done, update it with new insights.

# Execution Flow
1. **Load Memory**
2. **Explore existing code**
3. **Execute task**
4. **Save Memory**

# Guidelines
- Specific rules for this agent
```

Then create the memory directory and file:
```bash
mkdir -p .claude/agent-memory/my-new-agent
echo "# My New Agent Memory" > .claude/agent-memory/my-new-agent/MEMORY.md
```

### Step 14.3 — Add a New Slash Command

Create a file in `.claude/commands/` (e.g., `.claude/commands/my-command.md`). The file content is the prompt that runs when a user types `/my-command`. Use `$ARGUMENTS` to capture user input.

### Step 14.4 — Remove an Agent

Delete its file from `.claude/agents/` and optionally remove its memory directory.

---

## 18. Troubleshooting

| Problem | Solution |
|---|---|
| Agent not found | Check that the `.md` file exists in `.claude/agents/` and has correct YAML frontmatter |
| Wrong agent picks up the task | Use `@agent-name` to explicitly target the right agent |
| Agent modifies code it shouldn't | Verify the agent's `tools` field doesn't include `Write` or `Edit` |
| Agent doesn't remember past context | Ask the agent to "read your memory file first", or check that the memory file path is correct in the agent prompt |
| Agent response is too slow | Change `model: opus` to `model: sonnet` for faster responses (at the cost of depth) |
| Subtree pull conflicts | Resolve merge conflicts in `.claude/` directory, keep your memory files |
| Agent generates wrong tech stack code | Run `/init-project` to re-detect your stack, or update agent prompts manually |
| Slash command not found | Check that the `.md` file exists in `.claude/commands/` |
| Safety hook blocks a valid operation | Edit `.claude/settings.json` to adjust the hook rules |
| Audit reports not generated | Verify audit agents have `Write` in their `tools` field |
| CLAUDE.md shows "(not detected)" | Run `/init-project` to auto-detect your tech stack |

### Git Subtree Installation Errors

**`fatal: not a git repository`**

The project is not initialized as a Git repo. Run first:
```bash
git init && git add -A && git commit -m "Initial commit"
```

**`fatal: prefix '.claude' already exists`**

The project already has a `.claude` directory (from Claude Code or a previous install). Remove it first:
```bash
rm -rf .claude
git add -A && git commit -m "Remove old .claude directory"
git subtree add --prefix=.claude agents main --squash
```

**`fatal: working tree has modifications. Cannot add.`**

You have uncommitted changes. Commit them first:
```bash
git add -A && git commit -m "Save current state"
```
Then retry the subtree command.

**Full recovery sequence (run all in order):**
```bash
git add -A && git commit -m "Save current state"
rm -rf .claude
git add -A && git commit -m "Remove old .claude directory"
git remote add agents https://github.com/razielamir1/orca.git
git fetch agents
git subtree add --prefix=.claude agents main --squash
# Then type /init-project in Claude chat
```

---

*Last updated: March 2026*
