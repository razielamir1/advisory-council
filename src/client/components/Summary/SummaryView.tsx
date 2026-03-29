import { useNavigate, useParams } from 'react-router-dom';
import { useDiscussionContext } from '../../contexts/DiscussionContext';
import Button from '../shared/Button';
import Card from '../shared/Card';

const PRIORITY_COLORS = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  low: 'bg-green-500/10 text-green-400 border-green-500/20',
};

export default function SummaryView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useDiscussionContext();
  const { summary, members } = state;

  if (!summary) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📋</div>
          <div className="text-gray-500">הסיכום עדיין לא מוכן</div>
          <Button variant="ghost" className="mt-4" onClick={() => navigate(`/office/${id}`)}>
            חזרה לדיון
          </Button>
        </div>
      </div>
    );
  }

  const getMember = (memberId: string) => members.find((m) => m.id === memberId);

  function handleCopyMarkdown() {
    if (!summary) return;
    const lines = [
      '# Advisory Council Summary',
      '',
      '## Executive Summary',
      summary.executiveSummary,
      '',
      '## Key Tension',
      summary.keyTension,
      '',
      '## Consensus',
      ...summary.consensus.map((c) => `- ${c}`),
      '',
      '## Open Question',
      summary.openQuestion,
      '',
      '## Action Items',
      ...summary.actionItems.map((a) => `- [${a.priority}] ${a.action} (${a.owner}, ${a.timeframe})`),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button onClick={() => navigate(`/office/${id}`)} className="text-gray-500 hover:text-white text-sm mb-2 inline-flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              חזרה
            </button>
            <h1 className="text-3xl font-bold">סיכום המועצה</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleCopyMarkdown}>Copy MD</Button>
            <Button size="sm" onClick={() => navigate(`/plan/${id}`)}>בנה תוכנית ביצוע</Button>
          </div>
        </div>

        {/* Executive Summary */}
        <Card className="mb-6">
          <h2 className="text-lg font-bold mb-3 text-indigo-400">סיכום מנהלים</h2>
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{summary.executiveSummary}</p>
        </Card>

        {/* Key Tension */}
        <Card className="mb-6 border-amber-500/20">
          <h2 className="text-lg font-bold mb-2 text-amber-400">המתח המרכזי</h2>
          <p className="text-gray-300">{summary.keyTension}</p>
        </Card>

        {/* Consensus vs Dissent */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <h3 className="text-sm font-bold text-green-400 mb-3">נקודות הסכמה</h3>
            <ul className="space-y-2">
              {summary.consensus.map((c, i) => (
                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span> {c}
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <h3 className="text-sm font-bold text-red-400 mb-3">נקודות מחלוקת</h3>
            <ul className="space-y-2">
              {summary.dissent.map((d, i) => (
                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">✗</span> {d}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Member Recommendations */}
        <h2 className="text-lg font-bold mb-4">המלצות סופיות</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {summary.memberRecommendations.map((rec) => {
            const member = getMember(rec.memberId);
            return (
              <Card key={rec.memberId} className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] text-white font-bold" style={{ background: member?.color || '#6366f1' }}>
                    {member?.role?.substring(0, 2) || '?'}
                  </div>
                  <span className="text-sm font-medium" style={{ color: member?.color }}>{member?.role}</span>
                  <span className="text-xs text-gray-600">{member?.name}</span>
                </div>
                <p className="text-sm text-gray-300 mb-2">{rec.recommendation}</p>
                <div className="text-xs text-green-400">✓ {rec.doThis}</div>
                <div className="text-xs text-red-400 mt-1">✗ {rec.avoidThis}</div>
              </Card>
            );
          })}
        </div>

        {/* Action Items */}
        <h2 className="text-lg font-bold mb-4">Action Items</h2>
        <div className="space-y-2 mb-6">
          {summary.actionItems.map((item, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${PRIORITY_COLORS[item.priority]}`}>
              <span className="text-xs font-mono uppercase w-16">{item.priority}</span>
              <span className="flex-1 text-sm">{item.action}</span>
              <span className="text-xs opacity-60">{item.owner}</span>
              <span className="text-xs opacity-40">{item.timeframe}</span>
            </div>
          ))}
        </div>

        {/* Open Question */}
        <Card className="border-purple-500/20 mb-8">
          <h2 className="text-lg font-bold mb-2 text-purple-400">השאלה שרק אתה יכול לענות עליה</h2>
          <p className="text-gray-300 text-lg">{summary.openQuestion}</p>
        </Card>

        {/* Next Steps */}
        <div className="flex gap-4">
          <Button size="lg" onClick={() => navigate(`/plan/${id}`)} className="flex-1">
            בנה תוכנית ביצוע
          </Button>
          <Button variant="ghost" size="lg" onClick={() => navigate(`/office/${id}`)} className="flex-1">
            חזרה למועצה
          </Button>
        </div>
      </div>
    </div>
  );
}
