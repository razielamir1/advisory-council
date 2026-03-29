import { useState, useCallback } from 'react';

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

function loadHistory(): DiscussionRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function useHistory() {
  const [history, setHistory] = useState<DiscussionRecord[]>(loadHistory);

  const addToHistory = useCallback((record: DiscussionRecord) => {
    setHistory((prev) => {
      const filtered = prev.filter((r) => r.id !== record.id);
      const updated = [record, ...filtered].slice(0, MAX_HISTORY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  }, []);

  return { history, addToHistory, clearHistory };
}
