# Advisory Council — מועצת החכמים

AI-powered virtual board of directors. Describe any idea, problem, or existing business — and a council of 8 senior experts will discuss, challenge, research, and advise in real-time.

## What It Does

You present an idea. A boardroom of 8 AI-powered executives sits around the table and holds a **real discussion** — with skepticism, disagreements, evidence, and cross-talk. Not summaries. Not cheerleading. A real debate.

### Three Input Modes

| Mode | Description |
|------|-------------|
| **New Idea** | Describe a new venture, product, or concept |
| **Existing Business** | Paste a website URL — AI reads and analyzes it, then the council discusses |
| **Free Problem** | Any challenge — career decisions, organizational issues, negotiations |

### The Council (8 Members)

| Role | Name | Specialty |
|------|------|-----------|
| CEO | Nadav Berenson | Strategy, exits, scaling — ran a company similar to your idea |
| CTO | Matt Glazner | Tech feasibility, architecture, "what actually works" |
| CFO | Eli Klainman | Unit economics, fundraising, protecting the money |
| CPO | Gili Harmon | Product-market fit, user validation, roadmap |
| CMO | Noa Levitt | GTM, brand, customer acquisition |
| COO | Daniel Katz | Operations, execution, scaling processes |
| CDO | Or Navarro | Data, market research, competitive intelligence |
| CAIO | Raziel Amir | AI/no-code solutions — Base44, Bolt, v0, Lovable |

### 7-Phase Deep Discussion

1. **Opening Statements** — Initial reactions from each angle
2. **Deep Probing** — Experts question each other
3. **Research & Evidence** — Data, case studies, numbers
4. **Challenge & Debate** — Real disagreements, devil's advocate
5. **Guest Expert** — A specialist joins when needed
6. **Consensus Building** — What we agree on, what we don't
7. **Final Recommendations** — One clear action per expert

### Interactive — You're the Chairman

- **Click any character** to ask them directly
- **Inject information** mid-discussion
- **Challenge positions** — make them defend their views
- **Control reading speed** — fast / normal / slow typing
- **Hover on a speech bubble** — discussion pauses so you can read
- **Choose language** — Hebrew, English, Arabic, Russian, French, Spanish

### From Discussion to Execution

- **Smart Summary** — consensus, dissent, key tension, action items
- **Agent Routing** — each action item maps to an ORCA agent
- **Execution Plan** — timeline, team, budget, risks
- **LaunchPad** — Kanban board with progress tracking

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + TailwindCSS v4 |
| Bundler | Vite 8 |
| Backend | Node.js + Express 5 |
| AI | Google Gemini API |
| Streaming | Server-Sent Events (SSE) |

## Quick Start

```bash
git clone https://github.com/razielamir1/advisory-council.git
cd advisory-council
npm install
echo "GEMINI_API_KEY=your-key-here" > .env
npm run dev
```

Open http://localhost:3000

## Project Structure

```
src/
├── client/                    # React frontend
│   ├── components/
│   │   ├── Landing/           # Home page
│   │   ├── DomainSelector/    # Domain + idea input
│   │   ├── Office/            # Boardroom scene + characters
│   │   ├── Summary/           # Discussion summary
│   │   ├── ExecutionPlan/     # Roadmap, team, budget
│   │   └── LaunchPad/         # Kanban + progress
│   ├── hooks/                 # useSSE, useApiKey, useHistory
│   └── contexts/              # Discussion + Theme state
├── server/                    # Express backend
│   ├── services/
│   │   ├── gemini.ts          # Gemini API wrapper
│   │   ├── discussion-engine  # 7-phase orchestration
│   │   ├── council-builder    # Dynamic council assembly
│   │   └── website-reader     # URL analysis
│   └── routes/                # API endpoints
└── shared/                    # Shared TypeScript types
```

## License

MIT
