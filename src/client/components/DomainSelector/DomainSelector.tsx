import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Domain, CouncilMode } from '../../../shared/types';
import { useDiscussionContext } from '../../contexts/DiscussionContext';
import { useApiKey } from '../../hooks/useApiKey';
import DomainCard from './DomainCard';
import Button from '../shared/Button';

export default function DomainSelector() {
  const navigate = useNavigate();
  const { state, dispatch } = useDiscussionContext();
  const { apiKey, setApiKey, isValid } = useApiKey();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [search, setSearch] = useState('');
  const [idea, setIdea] = useState(state.idea);
  const [mode, setMode] = useState<CouncilMode>(state.mode);
  const [loading, setLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    fetch('/api/domains')
      .then((r) => r.json())
      .then((d) => setDomains(d.domains))
      .catch(() => {});
  }, []);

  const filtered = domains.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.nameHe.includes(search) ||
      d.description.toLowerCase().includes(search.toLowerCase())
  );

  const selectedDomain = state.domain;

  async function handleStart() {
    if (!selectedDomain || !idea.trim()) return;
    setLoading(true);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (apiKey) headers['x-api-key'] = apiKey;

      const res = await fetch('/api/discussion/start', {
        method: 'POST',
        headers,
        body: JSON.stringify({ domain: selectedDomain, idea, mode, apiKey }),
      });

      if (!res.ok) {
        const err = await res.json();
        if (res.status === 401) {
          setShowApiKey(true);
          return;
        }
        throw new Error(err.error);
      }

      const { discussionId } = await res.json();
      dispatch({ type: 'SET_IDEA', payload: idea });
      dispatch({ type: 'SET_MODE', payload: mode });
      dispatch({
        type: 'START_DISCUSSION',
        payload: { id: discussionId, members: [], characterStates: [] },
      });
      navigate(`/office/${discussionId}`);
    } catch (err: any) {
      alert(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <button onClick={() => navigate('/')} className="text-gray-500 hover:text-white mb-8 inline-flex items-center gap-2 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          חזרה
        </button>

        <h1 className="text-3xl font-bold mb-2">בחר תחום</h1>
        <p className="text-gray-500 mb-8">באיזה עולם הרעיון שלך? המועצה תותאם בהתאם.</p>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="חפש תחום..."
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 mb-8 focus:outline-none focus:border-indigo-500 transition-colors"
        />

        {/* Domain Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-12">
          {filtered.map((d) => (
            <DomainCard
              key={d.id}
              domain={d}
              selected={selectedDomain?.id === d.id}
              onClick={() => dispatch({ type: 'SET_DOMAIN', payload: d })}
            />
          ))}
        </div>

        {/* Idea Input */}
        {selectedDomain && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-2">מה הרעיון?</h2>
            <p className="text-gray-500 mb-4">תאר את הרעיון, האתגר או השאלה שלך ב-2-3 משפטים.</p>

            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              rows={4}
              placeholder={selectedDomain.exampleTopics[0] || 'תאר את הרעיון שלך...'}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 resize-none focus:outline-none focus:border-indigo-500 transition-colors mb-4"
            />

            <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
              <span>{idea.length} תווים</span>
              {idea.length > 0 && idea.length < 30 && <span className="text-amber-500">כדאי לפרט קצת יותר</span>}
            </div>

            {/* Examples */}
            <div className="flex flex-wrap gap-2 mb-8">
              {selectedDomain.exampleTopics.map((t) => (
                <button
                  key={t}
                  onClick={() => setIdea(t)}
                  className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg px-3 py-1.5 transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Mode Selection */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setMode('csuite')}
                className={`flex-1 p-4 rounded-xl border text-right transition-all ${
                  mode === 'csuite'
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                }`}
              >
                <div className="font-semibold text-white mb-1">הנהלה בכירה</div>
                <div className="text-gray-500 text-sm">CEO, CTO, CFO... — 30+ שנות ניסיון כל אחד</div>
              </button>
              <button
                onClick={() => setMode('experts')}
                className={`flex-1 p-4 rounded-xl border text-right transition-all ${
                  mode === 'experts'
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                }`}
              >
                <div className="font-semibold text-white mb-1">מועצת חכמים</div>
                <div className="text-gray-500 text-sm">מומחים אמיתיים — Sam Altman, Charlie Munger...</div>
              </button>
            </div>

            {/* API Key */}
            {showApiKey && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 animate-fade-in">
                <p className="text-amber-400 text-sm mb-3">נדרש API key של Gemini כדי להפעיל את המועצה.</p>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIza..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            {/* Start Button */}
            <Button
              size="lg"
              onClick={handleStart}
              loading={loading}
              disabled={!idea.trim() || idea.length < 10}
              className="w-full text-lg"
            >
              כנס את המועצה
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
