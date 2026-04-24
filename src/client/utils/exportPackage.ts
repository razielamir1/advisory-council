import type { DiscussionState, DiscussionSummary, ExecutionPlan } from '../../shared/types';

type StateLike = {
  id: DiscussionState['id'] | null;
  idea: DiscussionState['idea'];
  domain: DiscussionState['domain'] | null;
  members: DiscussionState['members'];
  language: DiscussionState['language'];
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 40) || 'advisory-council';
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function buildPRD(state: StateLike, summary: DiscussionSummary): string {
  const { idea, domain, members, language } = state;
  const lines: string[] = [
    `# PRD — Product Requirements Document`,
    ``,
    `**Date:** ${today()}  `,
    `**Domain:** ${domain?.nameHe || domain?.name || '—'}  `,
    `**Language:** ${language}`,
    ``,
    `## 1. Problem & Idea`,
    idea || '—',
    ``,
    `## 2. Executive Summary`,
    summary.executiveSummary || '—',
    ``,
    `## 3. Goals & Non-Goals`,
    `### Goals`,
    ...summary.consensus.map((c) => `- ${c}`),
    ``,
    `### Non-Goals / Known Disagreements`,
    ...summary.dissent.map((d) => `- ${d}`),
    ``,
    `## 4. Key Tension`,
    summary.keyTension || '—',
    ``,
    `## 5. Open Question (Founder Decision)`,
    summary.openQuestion || '—',
    ``,
    `## 6. Requirements — By Expert`,
    ...summary.memberRecommendations.map((rec) => {
      const member = members.find((m) => m.id === rec.memberId);
      return [
        `### ${member?.role || rec.memberId}${member?.name ? ` — ${member.name}` : ''}`,
        ``,
        `**Recommendation:** ${rec.recommendation}`,
        ``,
        `- ✅ Do: ${rec.doThis}`,
        `- ❌ Avoid: ${rec.avoidThis}`,
        ``,
      ].join('\n');
    }),
    `## 7. Risks`,
    ...(summary.risks || []).map(
      (r) => `- **[${r.severity}/${r.probability}]** ${r.risk} — *mitigation:* ${r.mitigation}`
    ),
    ``,
    `## 8. Opportunities`,
    ...(summary.opportunities || []).map(
      (o) => `- **[${o.potential}]** ${o.opportunity} — ${o.description}`
    ),
    ``,
    `## 9. Success Criteria`,
    `_See EXECUTION_PLAN.md for measurable KPIs._`,
    ``,
  ];
  return lines.join('\n');
}

export function buildBusinessPlan(state: StateLike, summary: DiscussionSummary, plan: ExecutionPlan): string {
  const { idea, domain } = state;
  const totalOpt = plan.budget.reduce((s, b) => s + b.optimistic, 0);
  const totalReal = plan.budget.reduce((s, b) => s + b.realistic, 0);
  const totalPess = plan.budget.reduce((s, b) => s + b.pessimistic, 0);
  const totalWeeks = plan.milestones.reduce((s, m) => s + m.estimatedWeeks, 0);

  const lines: string[] = [
    `# Business Plan`,
    ``,
    `**Date:** ${today()}  `,
    `**Domain:** ${domain?.nameHe || domain?.name || '—'}`,
    ``,
    `## 1. The Idea`,
    idea || '—',
    ``,
    `## 2. Executive Summary`,
    summary.executiveSummary || '—',
    ``,
    `## 3. Market & Problem`,
    `- **Key tension:** ${summary.keyTension || '—'}`,
    `- **Opportunities:**`,
    ...(summary.opportunities || []).map((o) => `  - ${o.opportunity} (${o.potential}) — ${o.description}`),
    ``,
    `## 4. Product & Roadmap`,
    ...plan.milestones.map(
      (m, i) =>
        `${i + 1}. **${m.name}** (${m.estimatedWeeks}w — ${m.phase}): ${m.description}\n   - Deliverables: ${m.deliverables.join(', ')}`
    ),
    ``,
    `**Total timeline:** ~${totalWeeks} weeks`,
    ``,
    `## 5. Team`,
    ...plan.team.map(
      (t) => `- **${t.role}** (${t.type}) — ${t.why}. Skills: ${t.skills.join(', ')}`
    ),
    ``,
    `## 6. Budget (USD)`,
    ``,
    `| Category | Phase | Optimistic | Realistic | Pessimistic | Notes |`,
    `|---|---|---:|---:|---:|---|`,
    ...plan.budget.map(
      (b) =>
        `| ${b.category} | ${b.phase} | $${b.optimistic.toLocaleString()} | $${b.realistic.toLocaleString()} | $${b.pessimistic.toLocaleString()} | ${b.notes} |`
    ),
    `| **TOTAL** |  | **$${totalOpt.toLocaleString()}** | **$${totalReal.toLocaleString()}** | **$${totalPess.toLocaleString()}** |  |`,
    ``,
    `## 7. Risks & Mitigations`,
    ...plan.risks.map(
      (r) => `- **[${r.severity}/${r.probability}]** ${r.risk} — *mitigation:* ${r.mitigation}`
    ),
    ``,
    `## 8. Success Criteria`,
    ...plan.successCriteria.map((c) => `- ${c}`),
    ``,
    `## 9. Founder's Open Question`,
    summary.openQuestion || '—',
    ``,
  ];
  return lines.join('\n');
}

export function buildExecutionPlan(plan: ExecutionPlan): string {
  const lines: string[] = [
    `# Execution Plan`,
    ``,
    `**Date:** ${today()}`,
    ``,
    `## Timeline`,
    ``,
    ...plan.timeline.map(
      (p) => `- **${p.name}** — weeks ${p.startWeek}–${p.endWeek} (milestones: ${p.milestoneIds.join(', ')})`
    ),
    ``,
    `## Milestones`,
    ...plan.milestones.map((m, i) => [
      ``,
      `### ${i + 1}. ${m.name} (${m.phase} — ${m.estimatedWeeks}w)`,
      ``,
      m.description,
      ``,
      `**Deliverables:**`,
      ...m.deliverables.map((d) => `- ${d}`),
      m.agents && m.agents.length
        ? `\n**Agents:** ${m.agents.map((a) => `\`${a}\``).join(', ')}`
        : '',
    ].filter(Boolean).join('\n')),
    ``,
    `## Dependencies`,
    ...plan.dependencies.map((d) => `- \`${d.from}\` **${d.type}** \`${d.to}\``),
    ``,
    `## Success Criteria`,
    ...plan.successCriteria.map((c) => `- [ ] ${c}`),
    ``,
  ];
  return lines.join('\n');
}

export function buildTasks(summary: DiscussionSummary): string {
  const lines: string[] = [
    `# Tasks — Action Items`,
    ``,
    `**Date:** ${today()}`,
    ``,
    `## By Priority`,
    ``,
    ...(['critical', 'high', 'medium', 'low'] as const).flatMap((prio) => {
      const items = summary.actionItems.filter((a) => a.priority === prio);
      if (!items.length) return [];
      return [
        `### ${prio.toUpperCase()}`,
        ``,
        ...items.map(
          (a) =>
            `- [ ] **${a.action}**  \n  _Owner:_ ${a.owner} · _Timeframe:_ ${a.timeframe}${a.agent ? ` · _Agent:_ \`@${a.agent}\`` : ''}`
        ),
        ``,
      ];
    }),
    `## Agent Commands (Claude Code)`,
    ``,
    `Copy-paste any of the following into Claude Code to dispatch the task to its agent:`,
    ``,
    ...summary.actionItems
      .filter((a) => a.agent)
      .map((a) => '```\n' + `@${a.agent} ${a.action}` + '\n```'),
    ``,
  ];
  return lines.join('\n');
}

export function buildReadme(state: StateLike): string {
  return [
    `# Advisory Council — Execution Package`,
    ``,
    `**Generated:** ${today()}  `,
    `**Idea:** ${state.idea || '—'}  `,
    `**Domain:** ${state.domain?.nameHe || state.domain?.name || '—'}`,
    ``,
    `## Files`,
    `- \`PRD.md\` — Product Requirements Document`,
    `- \`BUSINESS_PLAN.md\` — Full business plan (market, team, budget, risks)`,
    `- \`EXECUTION_PLAN.md\` — Milestones, timeline, dependencies`,
    `- \`TASKS.md\` — Action items with priorities + agent commands`,
    ``,
    `## How to use`,
    `1. Review \`PRD.md\` — make sure it captures your intent.`,
    `2. Open \`EXECUTION_PLAN.md\` — confirm milestones and timeline.`,
    `3. Start executing from \`TASKS.md\` — each task can be dispatched via Claude Code agent command.`,
    ``,
  ].join('\n');
}

export interface ExportInput {
  state: StateLike;
  summary: DiscussionSummary;
  plan: ExecutionPlan;
}

export function downloadExecutionPackage({ state, summary, plan }: ExportInput) {
  const slug = slugify(state.idea || 'advisory-council');
  const files: Array<[string, string]> = [
    [`${slug}__README.md`, buildReadme(state)],
    [`${slug}__PRD.md`, buildPRD(state, summary)],
    [`${slug}__BUSINESS_PLAN.md`, buildBusinessPlan(state, summary, plan)],
    [`${slug}__EXECUTION_PLAN.md`, buildExecutionPlan(plan)],
    [`${slug}__TASKS.md`, buildTasks(summary)],
  ];
  files.forEach(([name, content], i) => {
    setTimeout(() => downloadFile(name, content), i * 250);
  });
}

export function downloadCombinedMarkdown({ state, summary, plan }: ExportInput) {
  const slug = slugify(state.idea || 'advisory-council');
  const content = [
    buildReadme(state),
    '---',
    buildPRD(state, summary),
    '---',
    buildBusinessPlan(state, summary, plan),
    '---',
    buildExecutionPlan(plan),
    '---',
    buildTasks(summary),
  ].join('\n\n');
  downloadFile(`${slug}__full-package.md`, content);
}
