import { useState, useCallback } from 'react';

const STORAGE_KEY = 'advisory-council-api-key';

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) || '';
  });

  const setApiKey = useCallback((key: string) => {
    setApiKeyState(key);
    localStorage.setItem(STORAGE_KEY, key);
  }, []);

  const clearApiKey = useCallback(() => {
    setApiKeyState('');
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const isValid = apiKey.startsWith('AIza') || apiKey.length > 20;

  return { apiKey, setApiKey, isValid, clearApiKey };
}
