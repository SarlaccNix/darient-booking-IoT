'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'workspace_api_key';

export function useApiKey() {
  const [key, setKeyState] = useState<string>('');

  useEffect(() => {
    setKeyState(localStorage.getItem(STORAGE_KEY) ?? '');
  }, []);

  const setKey = (newKey: string) => {
    localStorage.setItem(STORAGE_KEY, newKey);
    setKeyState(newKey);
  };

  const clearKey = () => {
    localStorage.removeItem(STORAGE_KEY);
    setKeyState('');
  };

  return { key, setKey, clearKey, hasKey: key.length > 0 };
}

export function getStoredApiKey(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_KEY) ?? '';
  }
  return '';
}
