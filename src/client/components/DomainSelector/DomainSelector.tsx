import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Domain, CouncilMode, DiscussionLanguage } from '../../../shared/types';
import { LANGUAGES } from '../../../shared/types';
import { useDiscussionContext } from '../../contexts/DiscussionContext';
import { useApiKey } from '../../hooks/useApiKey';
import { useHistory } from '../../hooks/useHistory';
import DomainCard from './DomainCard';
import Button from '../shared/Button';
import ThemeToggle from '../shared/ThemeToggle';

type InputMode = 'new-idea' | 'existing-business' | 'free-problem' | 'open-chat';

export default function DomainSelector() {
  const navigate = useNavigate();
  const { state, dispatch } = useDiscussionContext();
  const { apiKey, setApiKey } = useApiKey();
  const { addToHistory } = useHistory();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [search, setSearch] = useState('');
  const [idea, setIdea] = useState(state.idea);
  const [mode, setMode] = useState<CouncilMode>(state.mode);
  const [language, setLanguage] = useState<DiscussionLanguage>(state.language);
  const [inputMode, setInputMode] = useState<InputMode>('new-idea');
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  const [freeProblem, setFreeProblem] = useState('');
  const [chatTopic, setChatTopic] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [websiteSummary, setWebsiteSummary] = useState('');
  const [analyzingWebsite, setAnalyzingWebsite] = useState(false);
  const [websiteError, setWebsiteError] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [error, setError] = useState('');

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

  async function handleAnalyzeWebsite() {
    if (!websiteUrl.trim()) return;
    setAnalyzingWebsite(true);
    setWebsiteError('');
    setWebsiteSummary('');

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (apiKey) headers['x-api-key'] = apiKey;

      // Auto-add https:// if missing
      let normalizedUrl = websiteUrl.trim();
      if (!/^https?:\/\//i.test(normalizedUrl)) {
        normalizedUrl = 'https://' + normalizedUrl;
      }

      const res = await fetch('/api/discussion/analyze-website', {
        method: 'POST',
        headers,
        body: JSON.stringify({ url: normalizedUrl }),
      });

      if (!res.ok) {
        const err = await res.json();
        if (res.status === 401) { setShowApiKey(true); return; }
        throw new Error(err.error);
      }

      const data = await res.json();
      setWebsiteSummary(data.summary);
    } catch (err: any) {
      setWebsiteError(err.message || 'Failed to analyze website');
    } finally {
      setAnalyzingWebsite(false);
    }
  }

  async function handleStart() {
    // Build the idea text
    let fullIdea = '';
    let domainId = selectedDomain?.id;

    if (inputMode === 'open-chat') {
      fullIdea = `[שיחה חופשית עם המועצה]\n${chatTopic}`;
      domainId = domainId || 'consulting';
    } else if (inputMode === 'free-problem') {
      fullIdea = freeProblem;
      domainId = domainId || 'consulting';
    } else if (inputMode === 'existing-business' && websiteSummary) {
      fullIdea = `[Existing Business Analysis]\nWebsite: ${websiteUrl}\n\n${websiteSummary}`;
      if (additionalNotes.trim()) {
        fullIdea += `\n\n[Founder's Notes]\n${additionalNotes.trim()}`;
      }
    } else {
      fullIdea = idea;
    }

    if (!domainId || fullIdea.trim().length < 10) return;
    setLoading(true);
    setError('');

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (apiKey) headers['x-api-key'] = apiKey;

      const res = await fetch('/api/discussion/start', {
        method: 'POST',
        headers,
        body: JSON.stringify({ domain: { id: domainId }, idea: fullIdea, mode, language, userName: userName.trim() || undefined }),
      });

      if (!res.ok) {
        const err = await res.json();
        if (res.status === 401) { setShowApiKey(true); return; }
        throw new Error(err.error);
      }

      const { discussionId } = await res.json();

      // Find domain for history
      const usedDomain = domains.find(d => d.id === domainId);
      addToHistory({
        id: discussionId,
        idea: fullIdea.substring(0, 100),
        domain: usedDomain?.nameHe || 'ייעוץ',
        domainIcon: usedDomain?.icon || '💼',
        mode,
        language,
        date: new Date().toLocaleDateString('he-IL'),
        membersCount: 8,
        messagesCount: 0,
      });

      dispatch({ type: 'SET_IDEA', payload: fullIdea });
      dispatch({ type: 'SET_MODE', payload: mode });
      dispatch({ type: 'SET_LANGUAGE', payload: language });
      dispatch({
        type: 'START_DISCUSSION',
        payload: { id: discussionId, members: [], characterStates: [] },
      });
      navigate(`/office/${discussionId}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const canStart =
    inputMode === 'open-chat' ? chatTopic.trim().length >= 5 :
    inputMode === 'free-problem' ? freeProblem.trim().length >= 10 :
    inputMode === 'new-idea' ? (selectedDomain && idea.trim().length >= 10) :
    (selectedDomain && websiteSummary.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-900 dark:hover:text-white inline-flex items-center gap-2 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            חזרה
          </button>
          <ThemeToggle />
        </div>

        {/* Input Mode Toggle */}
        <div className="flex gap-2 mb-8 bg-gray-200 dark:bg-gray-900 rounded-xl p-1">
          <button
            onClick={() => setInputMode('new-idea')}
            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
              inputMode === 'new-idea'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            רעיון חדש
          </button>
          <button
            onClick={() => setInputMode('existing-business')}
            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
              inputMode === 'existing-business'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            עסק קיים
          </button>
          <button
            onClick={() => setInputMode('free-problem')}
            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
              inputMode === 'free-problem'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            בעיה / שאלה
          </button>
          <button
            onClick={() => setInputMode('open-chat')}
            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
              inputMode === 'open-chat'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            שיחה חופשית
          </button>
        </div>

        {/* Open Chat Mode */}
        {inputMode === 'open-chat' && (
          <div className="mb-10 animate-fade-in">
            <h1 className="text-3xl font-bold mb-2">שיחה חופשית עם המועצה</h1>
            <p className="text-gray-500 mb-6">על מה תרצה לדבר? כתוב בחופשיות — בלי מבנה, בלי תחום, בלי מסגרת.</p>

            <textarea
              value={chatTopic}
              onChange={(e) => setChatTopic(e.target.value)}
              rows={4}
              autoFocus
              placeholder={"למשל:\n• מה דעתכם על לעבור מתפקיד שכיר לעצמאי?\n• אני חושב על רעיון אבל לא בטוח אם הוא שווה משהו\n• צריך חוות דעת על מצב השוק\n• סתם רוצה brainstorm על הכיוון של החיים שלי"}
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 resize-none focus:outline-none focus:border-indigo-500 transition-colors mb-4 text-[15px] leading-relaxed"
            />

            <div className="text-sm text-gray-400 mb-6">
              המועצה תקרא, תבין, ותגיב — כל אחד מהזווית שלו. אתה יכול לשאול follow-up, לאתגר, ולנהל את השיחה כרצונך.
            </div>

            {/* Quick starters */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                'חוות דעת על כיוון קריירה',
                'brainstorm על רעיון גולמי',
                'מה דעתכם על המצב הכלכלי',
                'איך הייתם מתמודדים עם...',
              ].map((ex) => (
                <button
                  key={ex}
                  onClick={() => setChatTopic(ex)}
                  className="text-xs bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg px-3 py-1.5 transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Free Problem Mode */}
        {inputMode === 'free-problem' && (
          <div className="mb-10 animate-fade-in">
            <h1 className="text-3xl font-bold mb-2">תאר את הבעיה</h1>
            <p className="text-gray-500 mb-6">כתוב בחופשיות — המועצה תזהה את התחום ותרכיב את הצוות המתאים.</p>

            <textarea
              value={freeProblem}
              onChange={(e) => setFreeProblem(e.target.value)}
              rows={6}
              autoFocus
              placeholder={"למשל:\n• ביקשו ממני לפתור בעיית תקשורת בין מחלקות בארגון של 200 עובדים\n• אני שוקל לעבור קריירה מהייטק לנדל\"ן\n• יש לי תקציב של 500K והשקעה בין שתי אופציות\n• צריך להחליט אם להרחיב את העסק לשוק חדש"}
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 resize-none focus:outline-none focus:border-indigo-500 transition-colors mb-3 text-[15px] leading-relaxed"
            />

            <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
              <span>{freeProblem.length} תווים</span>
              {freeProblem.length > 0 && freeProblem.length < 30 && <span className="text-amber-500">כדאי לפרט יותר</span>}
              {freeProblem.length >= 30 && <span className="text-green-500">מעולה, מספיק מידע</span>}
            </div>

            {/* Quick examples */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                'בעיית תקשורת בין מחלקות בארגון',
                'שוקל לעבור קריירה',
                'צריך לגייס סבב ראשון',
                'התלבטות בין שתי הזדמנויות עסקיות',
                'ייעוץ לגבי משא ומתן מורכב',
              ].map((ex) => (
                <button
                  key={ex}
                  onClick={() => setFreeProblem(ex)}
                  className="text-xs bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg px-3 py-1.5 transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Existing Business Mode */}
        {inputMode === 'existing-business' && (
          <div className="mb-10 animate-fade-in">
            <h1 className="text-3xl font-bold mb-2">ניתוח עסק קיים</h1>
            <p className="text-gray-500 mb-6">הזן את כתובת האתר של העסק — המועצה תקרא, תבין, ותייעץ.</p>

            {/* URL Input */}
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="google.com"
                dir="ltr"
                className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <Button
                onClick={handleAnalyzeWebsite}
                loading={analyzingWebsite}
                disabled={!websiteUrl.trim()}
              >
                {analyzingWebsite ? 'קורא...' : 'קרא את האתר'}
              </Button>
            </div>

            {/* Website Error */}
            {websiteError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4 text-red-400 text-sm">
                {websiteError}
              </div>
            )}

            {/* Website Summary */}
            {websiteSummary && (
              <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-5 mb-6 animate-fade-in">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-green-500">✓</span>
                  <span className="text-green-400 font-medium text-sm">האתר נקרא בהצלחה</span>
                  <span className="text-xs text-gray-600 dir-ltr" dir="ltr">{websiteUrl}</span>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {websiteSummary}
                </div>
              </div>
            )}

            {/* Additional Notes */}
            {websiteSummary && (
              <div className="animate-fade-in">
                <h3 className="text-lg font-bold mb-2">הוסף הערות (אופציונלי)</h3>
                <p className="text-gray-500 text-sm mb-3">מה אתה רוצה שהמועצה תתמקד בו? אתגרים? שאלות ספציפיות?</p>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  rows={3}
                  placeholder="למשל: אנחנו רוצים להיכנס לשוק האמריקאי, מה הסיכונים?"
                  className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 resize-none focus:outline-none focus:border-indigo-500 transition-colors mb-4"
                />
              </div>
            )}
          </div>
        )}

        {/* New Idea Mode */}
        {inputMode === 'new-idea' && (
          <>
            <h1 className="text-3xl font-bold mb-2">בחר תחום</h1>
            <p className="text-gray-500 mb-8">באיזה עולם הרעיון שלך? המועצה תותאם בהתאם.</p>
          </>
        )}

        {/* Domain Selector — hidden in free-problem mode */}
        {inputMode !== 'free-problem' && inputMode !== 'open-chat' && <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="חפש תחום..."
          className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 mb-6 focus:outline-none focus:border-indigo-500 transition-colors"
        />}

        {inputMode !== 'free-problem' && inputMode !== 'open-chat' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-10">
            {filtered.map((d) => (
              <DomainCard
                key={d.id}
                domain={d}
                selected={selectedDomain?.id === d.id}
                onClick={() => dispatch({ type: 'SET_DOMAIN', payload: d })}
              />
            ))}
          </div>
        )}

        {/* Idea Input (only for new idea mode) */}
        {selectedDomain && inputMode === 'new-idea' && (
          <div className="animate-fade-in mb-8">
            <h2 className="text-2xl font-bold mb-2">מה הרעיון?</h2>
            <p className="text-gray-500 mb-4">תאר את הרעיון, האתגר או השאלה שלך ב-2-3 משפטים.</p>

            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              rows={4}
              placeholder={selectedDomain.exampleTopics[0] || 'תאר את הרעיון שלך...'}
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 resize-none focus:outline-none focus:border-indigo-500 transition-colors mb-4"
            />

            <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
              <span>{idea.length} תווים</span>
              {idea.length > 0 && idea.length < 30 && <span className="text-amber-500">כדאי לפרט קצת יותר</span>}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {selectedDomain.exampleTopics.map((t) => (
                <button
                  key={t}
                  onClick={() => setIdea(t)}
                  className="text-xs bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg px-3 py-1.5 transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mode + Start (shared) */}
        {(
          inputMode === 'open-chat' ? chatTopic.trim().length >= 5 :
          inputMode === 'free-problem' ? freeProblem.trim().length >= 10 :
          inputMode === 'new-idea' ? (selectedDomain && idea.trim().length > 0) :
          (selectedDomain && websiteSummary)
        ) && (
          <div className="animate-fade-in">
            {/* Council Mode Selection */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {([
                { id: 'csuite' as CouncilMode, title: 'הנהלה בכירה', desc: 'CEO, CTO, CFO... — 30+ שנות ניסיון כל אחד', icon: '🏢' },
                { id: 'experts' as CouncilMode, title: 'מועצת חכמים', desc: 'מומחים אמיתיים — Sam Altman, Charlie Munger...', icon: '🧠' },
              ]).map((opt) => {
                const isSelected = mode === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setMode(opt.id)}
                    className={`flex-1 p-5 rounded-xl border text-right transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
                        : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-indigo-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="text-xl mb-2">{opt.icon}</div>
                    <div className={`font-semibold mb-1 ${isSelected ? 'text-indigo-600 dark:text-indigo-300' : 'text-gray-900 dark:text-white'}`}>
                      {opt.title}
                    </div>
                    <div className={`text-sm ${isSelected ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-500'}`}>{opt.desc}</div>
                  </button>
                );
              })}
            </div>

            {/* User Name */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">איך קוראים לך? <span className="text-gray-400 font-normal">(רשות)</span></h3>
              <input
                type="text"
                value={userName}
                onChange={(e) => { setUserName(e.target.value); localStorage.setItem('userName', e.target.value); }}
                placeholder="השם שלך — כדי שחברי המועצה יפנו אליך אישית"
                className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Language Selector */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">שפת הדיון</h3>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setLanguage(lang.id)}
                    className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                      language === lang.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
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

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Start Button */}
            <Button
              size="lg"
              onClick={handleStart}
              loading={loading}
              disabled={!canStart}
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
