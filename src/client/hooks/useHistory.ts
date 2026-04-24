import { useEffect, useState, useCallback } from 'react';
import { authedFetch } from '../lib/authedFetch';
import { authEnabled } from '../lib/authConfig';

export interface DiscussionRecord {
  id: string;
  idea: string;
  domain: string;
  domainIcon: string;
  mode: string;
  language: string;
  date: string;
  membersCount: number;
  messagesCount: number;
}

const STORAGE_KEY = 'advisory-council-history';
const MAX_HISTORY = 50;

function loadLocalHistory(): DiscussionRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

type ServerRow = {
  id: string;
  domain: string;
  mode: string;
  language: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  total_messages: number;
};

function serverToRecord(row: ServerRow): DiscussionRecord {
  return {
    id: row.id,
    idea: '',
    domain: row.domain,
    domainIcon: '💼',
    mode: row.mode,
    language: row.language,
    date: new Date(row.started_at).toLocaleDateString('he-IL'),
    membersCount: 8,
    messagesCount: row.total_messages,
  };
}

export function useHistory() {
  const [history, setHistory] = useState<DiscussionRecord[]>(loadLocalHistory);

  useEffect(() => {
    if (!authEnabled) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await authedFetch('/api/history');
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const rows: ServerRow[] = data.discussions ?? [];
        setHistory(rows.map(serverToRecord));
      } catch {
        // ignore - fall back to local history
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const addToHistory = useCallback((record: DiscussionRecord) => {
    setHistory((prev) => {
      const filtered = prev.filter((r) => r.id !== record.id);
      const updated = [record, ...filtered].slice(0, MAX_HISTORY);
      if (!authEnabled) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  }, []);

  return { history, addToHistory, clearHistory };
}
