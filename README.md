# Lead Orchestrator Agent

A multi-agent system for Claude Code featuring 14 specialized AI agents that work together as a complete development team. Each agent has its own role, tools, permissions, and persistent memory.

## Agents

| Agent | Role | Model | Permissions |
|---|---|---|---|
| **Lead Orchestrator** | Routes tasks to the right agent | opus | Full |
| `prompt-architect` | Refines raw prompts into engineering-grade specs | opus | Read-only |
| `business-analyst` | Market research, competitive analysis, feasibility | opus | Read + Write (docs) |
| `product-manager` | PRDs, user stories, feature specs, product strategy | opus | Read + Write (docs) |
| `architect` | System design, architecture, scalability | opus | Read-only (advises) |
| `frontend-developer` | React logic, state, routing, hooks | sonnet | Read + Write |
| `ui-designer` | Visual design, TailwindCSS, components | sonnet | Read + Write |
| `backend-developer` | API routes, middleware, Express | sonnet | Read + Write |
| `database-expert` | PostgreSQL schemas, migrations, queries | sonnet | Read + Write |
| `devops-engineer` | CI/CD, Docker, deployment | sonnet | Read + Write |
| `code-reviewer` | Code reviews, best practices | opus | Read-only (reviews) |
| `security-analyst` | Security audits, OWASP, vulnerabilities | sonnet | Read-only (audits) |
| `performance-optimizer` | Profiling, optimization, caching | sonnet | Read + Write |
| `qa-expert` | Testing, bug hunting, coverage | sonnet | Read-only (reports) |
| `tech-writer` | API docs, README, JSDoc, guides | sonnet | Read + Write |

**Read-only agents** (architect, code-reviewer, security-analyst, qa-expert) advise and report — they never modify your source code. They can only write to audit reports and their own memory files.

## Quick Start

### Option 1: New Project (GitHub Template)

1. Click **"Use this template"** on GitHub to create a new repository
2. Clone and open in VSCode
3. Type `/init-project` in the Claude chat — it auto-detects your tech stack and configures everything
4. Start working — the agents are ready

### Option 2: Add to Existing Project (Git Subtree — Recommended)

This method lets you pull future agent updates into any project.

**First time — add agents to your project:**

```bash
# Add this repo as a remote
git remote add agents https://github.com/razielamir1/LeadOrchestratorAgent.git
git fetch agents

# Pull the .claude directory into your project
git subtree add --prefix=.claude agents main --squash
```

Then open your project in VSCode and type `/init-project` — it will auto-detect your tech stack and generate `CLAUDE.md`.

**Later — pull agent updates:**

```bash
git subtree pull --prefix=.claude agents main --squash
```

### Option 3: Manual Copy

```bash
cp -r /path/to/LeadOrchestratorAgent/.claude /path/to/your-project/
```

Then type `/init-project` in Claude chat.

> Note: Manual copy does not support pulling future updates.

## Slash Commands

| Command | What It Does |
|---|---|
| `/init-project` | Auto-detects tech stack and generates customized `CLAUDE.md` |
| `/full-audit` | Runs 4 audit agents in parallel → architect summarizes to `FIXES.md` |
| `/new-feature <description>` | Full pipeline: architect → db → backend → frontend → ui → qa |
| `/fix-bug <description>` | Diagnostic pipeline: qa → fix → qa verify |
| `/security-check` | Focused security scan with report |
| `/document <type>` | Generates docs (api / readme / onboarding / jsdoc) |

## How to Use

### Automatic Delegation
Just describe what you need. The orchestrator reads each agent's description and delegates automatically:

```
"Build me a login form with validation"
→ frontend-developer (logic) + ui-designer (styling) + qa-expert (testing)
```

### Direct Invocation (@-mention)
Target a specific agent:

```
@architect plan the architecture for a real-time notification system
@code-reviewer review the code in src/api/users.ts
@security-analyst scan the project for vulnerabilities
```

### Chaining (Sequential)
For full-stack features, agents run in sequence:

```
architect → database-expert → backend-developer → frontend-developer → ui-designer → qa-expert
```

Or just use `/new-feature <description>` and it runs the full pipeline automatically.

### Parallel Execution
Independent tasks run simultaneously:

```
"Run @code-reviewer and @security-analyst on src/ in parallel"
```

Or use `/full-audit` to run all 4 audit agents in parallel with automatic report generation.

### Background Tasks
Run agents in the background while you keep working:

```
"Run @qa-expert in the background to scan the entire project"
```

You can also press **Ctrl+B** to move a running task to the background.

### View All Agents
Type `/agents` in the chat to see an interactive menu of all available agents.

## Safety System

### Micro-Checkpoint Protocol
Agents with Write permissions must **PAUSE and present their action plan** before executing changes that involve:
- Creating or modifying more than 3 files
- Database migrations or schema changes
- Configuration files (package.json, tsconfig, Dockerfile, CI/CD)
- Authentication or authorization logic
- Deleting files or removing functionality

The user must type **PROCEED** before the agent continues.

### Safety Hooks (Hardcoded Protection)
A `PreToolUse` hook in `settings.json` blocks dangerous operations at the system level:

| Blocked Operation | Example |
|---|---|
| Destructive SQL | `DROP TABLE`, `TRUNCATE`, `DELETE FROM` |
| Recursive deletes | `rm -rf` |
| Force operations | `--force`, `--hard` |

The agent receives an error and cannot proceed — this is technical enforcement, not just a prompt instruction.

## Audit Report System

Audit agents write their findings to `.claude/audits/` instead of flooding the main conversation:

| Agent | Report File |
|---|---|
| `qa-expert` | `AUDIT_QA.md` |
| `security-analyst` | `AUDIT_SECURITY.md` |
| `code-reviewer` | `AUDIT_CODE_REVIEW.md` |
| `performance-optimizer` | `AUDIT_PERFORMANCE.md` |

The `architect` can then summarize all reports into a unified, prioritized `FIXES.md`. Audit files are excluded from Git via `.gitignore`.

## Recommended Workflows

### New Feature (Full-Stack)
`prompt-architect` (refine) → `business-analyst` (research) → `product-manager` (PRD) → `architect` → `database-expert` → `backend-developer` → `frontend-developer` → `ui-designer` → `qa-expert`
> Shortcut: `/new-feature <description>`

### Bug Fix
`qa-expert` (diagnose) → dev agent (fix) → `qa-expert` (verify)
> Shortcut: `/fix-bug <description>`

### Full Audit (Parallel)
`code-reviewer` + `security-analyst` + `qa-expert` + `performance-optimizer` → `architect` (summarize into FIXES.md)
> Shortcut: `/full-audit`

### Deployment
`devops-engineer` → `qa-expert` (validate) → deploy

### Documentation
`tech-writer` → reads codebase → produces docs
> Shortcut: `/document <type>`

## Persistent Memory

Each agent maintains its own memory file at `.claude/agent-memory/<agent-name>/MEMORY.md`. Agents read their memory at the start of every task and update it when done.

This means agents **learn over time** — the QA expert remembers fragile areas, the architect remembers past design decisions, the database expert remembers schema history.

Memory is **per-project**, so agents learn each project independently.

## Context Efficiency

Subagents run in isolated contexts — their heavy processing stays in their own session and only a clean summary returns to the main conversation. This prevents context bloat and keeps costs down.

- Prefer delegating to agents over doing work inline
- Use `/full-audit` instead of asking each audit agent individually — it routes reports to files, not the chat
- For large codebases, target specific directories (e.g., "audit src/api/") rather than scanning everything

## MCP (External Tool Integration)

Connect agents to external systems like PostgreSQL, GitHub, Slack, and more. See [MCP_SETUP.md](MCP_SETUP.md) for step-by-step setup instructions.

## Project Structure

```
your-project/
├── CLAUDE.md                              # Lead Orchestrator config (auto-generated by /init-project)
├── .gitignore                             # Excludes audit reports from git
└── .claude/
    ├── settings.json                      # Safety hooks + MCP server config
    ├── agents/                            # Agent definitions (11 agents)
    │   ├── prompt-architect.md
    │   ├── business-analyst.md
    │   ├── product-manager.md
    │   ├── architect.md
    │   ├── backend-developer.md
    │   ├── code-reviewer.md
    │   ├── database-expert.md
    │   ├── devops-engineer.md
    │   ├── frontend-developer.md
    │   ├── performance-optimizer.md
    │   ├── qa-expert.md
    │   ├── security-analyst.md
    │   ├── tech-writer.md
    │   └── ui-designer.md
    ├── commands/                           # Slash commands
    │   ├── init-project.md                # /init-project
    │   ├── full-audit.md                  # /full-audit
    │   ├── new-feature.md                 # /new-feature
    │   ├── fix-bug.md                     # /fix-bug
    │   ├── security-check.md             # /security-check
    │   └── document.md                    # /document
    ├── audits/                            # Audit reports (git-ignored)
    │   └── .gitkeep
    └── agent-memory/                      # Persistent memory (per-project)
        ├── prompt-architect/MEMORY.md
        ├── business-analyst/MEMORY.md
        ├── product-manager/MEMORY.md
        ├── architect/MEMORY.md
        ├── backend-developer/MEMORY.md
        ├── code-reviewer/MEMORY.md
        ├── database-expert/MEMORY.md
        ├── devops-engineer/MEMORY.md
        ├── frontend-developer/MEMORY.md
        ├── performance-optimizer/MEMORY.md
        ├── qa-expert/MEMORY.md
        ├── security-analyst/MEMORY.md
        ├── tech-writer/MEMORY.md
        └── ui-designer/MEMORY.md
```

## Customization

- **Auto-detect tech stack:** Run `/init-project` to scan your project and generate a customized `CLAUDE.md`
- **Add a new agent:** Create a new `.md` file in `.claude/agents/` with YAML frontmatter (name, description, model, tools) and a prompt
- **Modify an agent:** Edit its `.md` file in `.claude/agents/`
- **Change agent model:** Set `model: opus` for deeper reasoning or `model: sonnet` for faster responses
- **Restrict permissions:** Remove `Write` and `Edit` from the `tools` field to make an agent read-only
- **Add MCP servers:** Edit `.claude/settings.json` — see [MCP_SETUP.md](MCP_SETUP.md) for examples
- **Add slash commands:** Create a new `.md` file in `.claude/commands/`
