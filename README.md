# Lead Orchestrator Agent

A multi-agent system for Claude Code featuring 11 specialized AI agents that work together as a complete development team. Each agent has its own role, tools, permissions, and persistent memory.

## Agents

| Agent | Role | Model | Permissions |
|---|---|---|---|
| **Lead Orchestrator** | Routes tasks to the right agent | opus | Full |
| `architect` | System design, architecture, scalability | opus | Read-only |
| `frontend-developer` | React logic, state, routing, hooks | sonnet | Read + Write |
| `ui-designer` | Visual design, TailwindCSS, components | sonnet | Read + Write |
| `backend-developer` | API routes, middleware, Express | sonnet | Read + Write |
| `database-expert` | PostgreSQL schemas, migrations, queries | sonnet | Read + Write |
| `devops-engineer` | CI/CD, Docker, deployment | sonnet | Read + Write |
| `code-reviewer` | Code reviews, best practices | opus | Read-only |
| `security-analyst` | Security audits, OWASP, vulnerabilities | sonnet | Read-only |
| `performance-optimizer` | Profiling, optimization, caching | sonnet | Read + Write |
| `qa-expert` | Testing, bug hunting, coverage | sonnet | Read-only |
| `tech-writer` | API docs, README, JSDoc, guides | sonnet | Read + Write |

**Read-only agents** (architect, code-reviewer, security-analyst, qa-expert) advise and report — they never modify your code.

## Quick Start

### Option 1: New Project (GitHub Template)

Click **"Use this template"** on GitHub to create a new repository with all agents pre-configured.

After creating:
1. Open the project in VSCode
2. Edit `CLAUDE.md` — update the **Tech Stack** section to match your project
3. Start chatting with Claude — the agents are ready

### Option 2: Add to Existing Project (Git Subtree)

This method lets you pull future agent updates into any project.

**First time — add agents to your project:**

```bash
# Add this repo as a remote
git remote add agents https://github.com/razielamir1/LeadOrchestratorAgent.git
git fetch agents

# Pull the .claude directory into your project
git subtree add --prefix=.claude agents main --squash

# Copy the orchestrator config
cp .claude/../CLAUDE.md ./CLAUDE.md
# Edit CLAUDE.md to match your project's tech stack
```

**Later — pull agent updates:**

```bash
git subtree pull --prefix=.claude agents main --squash
```

### Option 3: Manual Copy

```bash
cp -r /path/to/LeadOrchestratorAgent/.claude /path/to/your-project/
cp /path/to/LeadOrchestratorAgent/CLAUDE.md /path/to/your-project/
```

> Note: Manual copy does not support pulling future updates.

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

### Parallel Execution
Independent tasks run simultaneously:

```
"Run @code-reviewer and @security-analyst on src/ in parallel"
```

### Background Tasks
Run agents in the background while you keep working:

```
"Run @qa-expert in the background to scan the entire project"
```

You can also press **Ctrl+B** to move a running task to the background.

### View All Agents
Type `/agents` in the chat to see an interactive menu of all available agents.

## Recommended Workflows

### New Feature (Full-Stack)
`architect` → `database-expert` → `backend-developer` → `frontend-developer` → `ui-designer` → `qa-expert`

### Bug Fix
`qa-expert` (diagnose) → dev agent (fix) → `qa-expert` (verify)

### Code Review + Security Audit (Parallel)
`code-reviewer` + `security-analyst` → report

### Deployment
`devops-engineer` → `qa-expert` (validate) → deploy

### Documentation
`tech-writer` → reads codebase → produces docs

## Persistent Memory

Each agent maintains its own memory file at `.claude/agent-memory/<agent-name>/MEMORY.md`. Agents read their memory at the start of every task and update it when done.

This means agents **learn over time** — the QA expert remembers fragile areas, the architect remembers past design decisions, the database expert remembers schema history.

Memory is **per-project**, so agents learn each project independently.

## Project Structure

```
your-project/
├── CLAUDE.md                              # Lead Orchestrator config
└── .claude/
    ├── agents/                            # Agent definitions
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
    └── agent-memory/                      # Persistent memory (per-project)
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

- **Change tech stack:** Edit the `Tech Stack` and `Delegation Table` sections in `CLAUDE.md`
- **Add a new agent:** Create a new `.md` file in `.claude/agents/` with YAML frontmatter (name, description, model, tools) and a prompt
- **Modify an agent:** Edit its `.md` file in `.claude/agents/`
- **Change agent model:** Set `model: opus` for deeper reasoning or `model: sonnet` for faster responses
- **Restrict permissions:** Remove `Write` and `Edit` from the `tools` field to make an agent read-only
