import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDiscussionContext } from '../../contexts/DiscussionContext';
import Button from '../shared/Button';
import Card from '../shared/Card';

const AGENT_ICONS: Record<string, string> = {
  architect: '🏗️', 'backend-developer': '⚙️', 'frontend-developer': '🖥️',
  'ui-designer': '🎨', 'database-expert': '🗄️', 'devops-engineer': '🚀',
  'product-manager': '📋', 'business-analyst': '📊', 'security-analyst': '🔒',
  'qa-expert': '🧪', 'tech-writer': '📝', 'performance-optimizer': '⚡',
  caio: '🤖',
};

const AGENT_LABELS: Record<string, string> = {
  architect: 'ארכיטקט', 'backend-developer': 'Backend', 'frontend-developer': 'Frontend',
  'ui-designer': 'עיצוב UI', 'database-expert': 'DB', 'devops-engineer': 'DevOps',
  'product-manager': 'מוצר', 'business-analyst': 'אנליזה', 'security-analyst': 'אבטחה',
  'qa-expert': 'בדיקות', 'tech-writer': 'תיעוד', 'performance-optimizer': 'ביצועים',
  caio: 'פתרון AI',
};
import type { ExecutionPlan as ExecutionPlanType, Milestone, TeamRole, BudgetItem, RiskItem } from '../../../shared/types';

// Demo execution plan for now — will be AI-generated
const DEMO_PLAN: ExecutionPlanType = {
  milestones: [
    { id: 'm1', name: 'Validation', description: 'Validate core assumptions with potential customers', phase: 'Planning', estimatedWeeks: 3, deliverables: ['Customer interviews', 'Market survey', 'Competitor analysis'], status: 'pending', agents: ['business-analyst', 'product-manager'] },
    { id: 'm2', name: 'MVP Design', description: 'Design the minimum viable product', phase: 'Planning', estimatedWeeks: 2, deliverables: ['Wireframes', 'Tech stack decision', 'Architecture doc'], status: 'pending', agents: ['architect', 'ui-designer', 'caio'] },
    { id: 'm3', name: 'MVP Build', description: 'Build the first working version', phase: 'Build', estimatedWeeks: 6, deliverables: ['Working product', 'Basic landing page', 'Payment integration'], status: 'pending', agents: ['backend-developer', 'frontend-developer', 'database-expert'] },
    { id: 'm4', name: 'Beta Launch', description: 'Launch to first 50 users', phase: 'Launch', estimatedWeeks: 2, deliverables: ['Beta users onboarded', 'Feedback collected', 'Bug fixes'], status: 'pending', agents: ['devops-engineer', 'qa-expert'] },
    { id: 'm5', name: 'Growth', description: 'Scale based on beta learnings', phase: 'Scale', estimatedWeeks: 8, deliverables: ['Marketing campaigns', 'Feature iteration', 'Revenue targets'], status: 'pending', agents: ['product-manager', 'performance-optimizer'] },
  ],
  team: [
    { role: 'Technical Co-founder / Lead Developer', why: 'Build the MVP and lead technical decisions', joinAtMilestone: 'm2', type: 'full-time', skills: ['Full-stack', 'Architecture', 'DevOps'] },
    { role: 'Product Designer', why: 'Design user experience and interface', joinAtMilestone: 'm2', type: 'part-time', skills: ['UI/UX', 'Figma', 'User research'] },
    { role: 'Marketing Lead', why: 'GTM strategy and customer acquisition', joinAtMilestone: 'm4', type: 'part-time', skills: ['Digital marketing', 'Content', 'Analytics'] },
    { role: 'Industry Advisor', why: 'Domain expertise and network connections', joinAtMilestone: 'm1', type: 'consultant', skills: ['Industry knowledge', 'Network', 'Strategy'] },
  ],
  budget: [
    { category: 'Development', phase: 'MVP', optimistic: 15000, realistic: 25000, pessimistic: 40000, notes: 'If using co-founder vs contractors' },
    { category: 'Design', phase: 'MVP', optimistic: 3000, realistic: 8000, pessimistic: 15000, notes: 'Part-time designer' },
    { category: 'Marketing', phase: 'Launch', optimistic: 5000, realistic: 12000, pessimistic: 25000, notes: 'Depends on CAC' },
    { category: 'Operations', phase: 'All', optimistic: 2000, realistic: 5000, pessimistic: 10000, notes: 'Tools, hosting, legal' },
  ],
  risks: [
    { risk: 'Market too small', severity: 'high', probability: 'medium', mitigation: 'Validate TAM with real data before building', flaggedBy: [] },
    { risk: 'Strong incumbent competition', severity: 'medium', probability: 'high', mitigation: 'Focus on underserved niche first', flaggedBy: [] },
    { risk: 'Technical complexity underestimated', severity: 'high', probability: 'medium', mitigation: 'Start with simplest possible MVP', flaggedBy: [] },
  ],
  timeline: [
    { name: 'Planning', color: '#6366f1', startWeek: 0, endWeek: 5, milestoneIds: ['m1', 'm2'] },
    { name: 'Build', color: '#059669', startWeek: 5, endWeek: 11, milestoneIds: ['m3'] },
    { name: 'Launch', color: '#ea580c', startWeek: 11, endWeek: 13, milestoneIds: ['m4'] },
    { name: 'Scale', color: '#9333ea', startWeek: 13, endWeek: 21, milestoneIds: ['m5'] },
  ],
  successCriteria: [
    '50 paying users within 3 months of launch',
    'Net Promoter Score > 40',
    'Monthly revenue growth > 15%',
    'Customer acquisition cost < $50',
  ],
  dependencies: [
    { from: 'm1', to: 'm2', type: 'blocks' },
    { from: 'm2', to: 'm3', type: 'blocks' },
    { from: 'm3', to: 'm4', type: 'blocks' },
    { from: 'm4', to: 'm5', type: 'informs' },
  ],
};

type Tab = 'timeline' | 'team' | 'budget' | 'risks';

export default function ExecutionPlan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useDiscussionContext();
  const [activeTab, setActiveTab] = useState<Tab>('timeline');
  const [plan] = useState<ExecutionPlanType>(DEMO_PLAN);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'timeline', label: 'ציר זמן' },
    { id: 'team', label: 'צוות' },
    { id: 'budget', label: 'תקציב' },
    { id: 'risks', label: 'סיכונים' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button onClick={() => navigate(`/summary/${id}`)} className="text-gray-500 hover:text-white text-sm mb-2 inline-flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              חזרה לסיכום
            </button>
            <h1 className="text-3xl font-bold">תוכנית ביצוע</h1>
            <p className="text-gray-500 mt-1">{state.idea?.substring(0, 80)}</p>
          </div>
          <Button onClick={() => navigate(`/launch/${id}`)}>יציאה לדרך</Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-900 rounded-xl p-1 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Timeline */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            {/* Visual timeline bar */}
            <div className="flex gap-0.5 h-8 rounded-xl overflow-hidden mb-8">
              {plan.timeline.map((phase) => (
                <div
                  key={phase.name}
                  className="flex items-center justify-center text-xs font-medium text-white/80"
                  style={{
                    background: phase.color,
                    flex: phase.endWeek - phase.startWeek,
                  }}
                >
                  {phase.name} ({phase.endWeek - phase.startWeek}w)
                </div>
              ))}
            </div>

            {/* Milestones */}
            {plan.milestones.map((ms, i) => (
              <Card key={ms.id} className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    ms.status === 'done' ? 'bg-green-600' : 'bg-gray-700'
                  }`}>
                    {i + 1}
                  </div>
                  {i < plan.milestones.length - 1 && <div className="w-0.5 h-8 bg-gray-700 mt-1" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{ms.name}</h3>
                    <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">{ms.estimatedWeeks} weeks</span>
                    <span className="text-xs text-gray-600">{ms.phase}</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{ms.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {ms.deliverables.map((d) => (
                      <span key={d} className="text-[11px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded">
                        {d}
                      </span>
                    ))}
                  </div>
                  {/* Assigned agents */}
                  {ms.agents && ms.agents.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-800">
                      <span className="text-[10px] text-gray-500 ml-1">סוכנים:</span>
                      {ms.agents.map((agent) => (
                        <button
                          key={agent}
                          onClick={() => {
                            const cmd = `/new-feature ${ms.name}: ${ms.description}`;
                            navigator.clipboard.writeText(cmd);
                            alert(`הועתק ללוח:\n${cmd}\n\nהדבק ב-Claude Code כדי להפעיל`);
                          }}
                          className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-lg hover:bg-indigo-500/20 transition-colors flex items-center gap-1"
                        >
                          {AGENT_ICONS[agent] || '🤖'} {AGENT_LABELS[agent] || agent}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}

            {/* Success Criteria */}
            <Card className="mt-8 border-green-500/20">
              <h3 className="font-bold text-green-400 mb-3">קריטריוני הצלחה</h3>
              <ul className="space-y-2">
                {plan.successCriteria.map((c, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-center gap-2">
                    <span className="text-green-500">◎</span> {c}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}

        {/* Team */}
        {activeTab === 'team' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.team.map((role, i) => (
              <Card key={i}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-lg">
                    {role.type === 'full-time' ? '👤' : role.type === 'part-time' ? '⏰' : '🎓'}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{role.role}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${
                      role.type === 'full-time' ? 'bg-green-500/10 text-green-400' :
                      role.type === 'part-time' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-purple-500/10 text-purple-400'
                    }`}>
                      {role.type}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-2">{role.why}</p>
                <div className="flex flex-wrap gap-1">
                  {role.skills.map((s) => (
                    <span key={s} className="text-[10px] bg-gray-800 text-gray-500 px-2 py-0.5 rounded">{s}</span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Budget */}
        {activeTab === 'budget' && (
          <div>
            <div className="grid grid-cols-4 gap-3 text-xs text-gray-500 mb-2 px-4">
              <span>קטגוריה</span>
              <span className="text-center">אופטימי</span>
              <span className="text-center">ריאליסטי</span>
              <span className="text-center">פסימי</span>
            </div>
            {plan.budget.map((item, i) => (
              <Card key={i} className="mb-2 p-4">
                <div className="grid grid-cols-4 gap-3 items-center">
                  <div>
                    <div className="font-medium text-sm">{item.category}</div>
                    <div className="text-xs text-gray-600">{item.phase}</div>
                  </div>
                  <div className="text-center text-green-400 text-sm">${item.optimistic.toLocaleString()}</div>
                  <div className="text-center text-amber-400 text-sm font-bold">${item.realistic.toLocaleString()}</div>
                  <div className="text-center text-red-400 text-sm">${item.pessimistic.toLocaleString()}</div>
                </div>
                {item.notes && <div className="text-xs text-gray-600 mt-1">{item.notes}</div>}
              </Card>
            ))}
            <Card className="mt-4 border-amber-500/20">
              <div className="grid grid-cols-4 gap-3 items-center font-bold">
                <span>סה"כ</span>
                <span className="text-center text-green-400">${plan.budget.reduce((s, b) => s + b.optimistic, 0).toLocaleString()}</span>
                <span className="text-center text-amber-400">${plan.budget.reduce((s, b) => s + b.realistic, 0).toLocaleString()}</span>
                <span className="text-center text-red-400">${plan.budget.reduce((s, b) => s + b.pessimistic, 0).toLocaleString()}</span>
              </div>
            </Card>
          </div>
        )}

        {/* Risks */}
        {activeTab === 'risks' && (
          <div className="space-y-3">
            {plan.risks.map((risk, i) => {
              const severityStyles: Record<string, string> = {
                critical: 'border-red-500/20 bg-red-500/10 text-red-400',
                high: 'border-orange-500/20 bg-orange-500/10 text-orange-400',
                medium: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400',
                low: 'border-green-500/20 bg-green-500/10 text-green-400',
              };
              const style = severityStyles[risk.severity] || severityStyles.medium;
              const borderClass = style.split(' ')[0];
              const badgeClass = style.split(' ').slice(1).join(' ');
              return (
                <Card key={i} className={borderClass}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-mono uppercase px-2 py-0.5 rounded ${badgeClass}`}>
                      {risk.severity}
                    </span>
                    <span className="text-xs text-gray-500">Probability: {risk.probability}</span>
                  </div>
                  <h3 className="font-medium text-sm mb-1">{risk.risk}</h3>
                  <p className="text-sm text-gray-500">
                    <span className="text-gray-400">Mitigation:</span> {risk.mitigation}
                  </p>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
