import type { DiscussionState, ExecutionPlan } from '../../shared/types.js';
import { GeminiService } from './gemini.js';

const LANG_NAMES: Record<string, string> = {
  he: 'Hebrew',
  en: 'English',
  ar: 'Arabic',
  ru: 'Russian',
  fr: 'French',
  es: 'Spanish',
};

function extractJson(raw: string): unknown {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : raw;
  const start = candidate!.indexOf('{');
  const end = candidate!.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object in model response');
  return JSON.parse(candidate!.slice(start, end + 1));
}

const SCHEMA_HINT = `Return ONLY a JSON object matching this shape (no prose, no markdown fences):
{
  "milestones": [
    { "id": "m1", "name": string, "description": string, "phase": "Planning"|"Build"|"Launch"|"Scale",
      "estimatedWeeks": number, "deliverables": string[], "status": "pending",
      "agents": string[] (subset of: architect, backend-developer, frontend-developer, ui-designer, database-expert, devops-engineer, product-manager, business-analyst, security-analyst, qa-expert, tech-writer, performance-optimizer, caio) }
  ],
  "team": [
    { "role": string, "why": string, "joinAtMilestone": "m1"|"m2"|..., "type": "full-time"|"part-time"|"consultant", "skills": string[] }
  ],
  "budget": [
    { "category": string, "phase": string, "optimistic": number, "realistic": number, "pessimistic": number, "notes": string }
  ],
  "risks": [
    { "risk": string, "severity": "critical"|"high"|"medium"|"low", "probability": "high"|"medium"|"low", "mitigation": string, "flaggedBy": [] }
  ],
  "timeline": [
    { "name": "Planning"|"Build"|"Launch"|"Scale", "color": string (hex), "startWeek": number, "endWeek": number, "milestoneIds": string[] }
  ],
  "successCriteria": string[],
  "dependencies": [
    { "from": "m1", "to": "m2", "type": "blocks"|"informs" }
  ]
}

Rules:
- 4–6 milestones with sequential ids m1..m6
- Budget values in USD, realistic between optimistic and pessimistic
- timeline phases must cover all milestones and align with milestone weeks (startWeek of phase N = endWeek of phase N-1)
- 3–5 risks, 3–6 team roles, 4–6 success criteria
- All prose fields in the discussion language`;

export async function buildExecutionPlanFromDiscussion(
  discussion: DiscussionState,
  apiKey: string
): Promise<ExecutionPlan> {
  if (!discussion.summary) {
    throw new Error('Discussion has no summary yet');
  }

  const gemini = new GeminiService(apiKey);
  const lang = LANG_NAMES[discussion.language] || 'Hebrew';

  const systemPrompt = `You are a senior COO who turns board-room decisions into concrete execution plans.
Output must be valid JSON matching the provided schema exactly. No commentary. All free-text fields in ${lang}.`;

  const userPrompt = `IDEA:
${discussion.idea}

DOMAIN: ${discussion.domain.nameHe} / ${discussion.domain.name}

EXECUTIVE SUMMARY:
${discussion.summary.executiveSummary}

KEY TENSION:
${discussion.summary.keyTension}

CONSENSUS:
${discussion.summary.consensus.map((c) => `- ${c}`).join('\n')}

DISSENT:
${discussion.summary.dissent.map((d) => `- ${d}`).join('\n')}

ACTION ITEMS:
${discussion.summary.actionItems
  .map((a) => `- [${a.priority}] ${a.action} (owner: ${a.owner}, when: ${a.timeframe}${a.agent ? `, agent: ${a.agent}` : ''})`)
  .join('\n')}

RISKS (from discussion):
${discussion.summary.risks.map((r) => `- [${r.severity}/${r.probability}] ${r.risk} — mitigation: ${r.mitigation}`).join('\n')}

${SCHEMA_HINT}`;

  const raw = await gemini.generateMessage(systemPrompt, userPrompt);
  const parsed = extractJson(raw) as ExecutionPlan;

  // Light validation + defaults
  if (!Array.isArray(parsed.milestones) || !parsed.milestones.length) {
    throw new Error('Invalid plan: no milestones');
  }
  parsed.milestones.forEach((m, i) => {
    m.id ||= `m${i + 1}`;
    m.status ||= 'pending';
    m.deliverables ||= [];
    m.agents ||= [];
  });
  parsed.team ||= [];
  parsed.budget ||= [];
  parsed.risks ||= [];
  parsed.timeline ||= [];
  parsed.successCriteria ||= [];
  parsed.dependencies ||= [];

  return parsed;
}
