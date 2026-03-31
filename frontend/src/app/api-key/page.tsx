'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApiKey } from '@/hooks/useApiKey';

export default function ApiKeyPage() {
  const { key, setKey, clearKey, hasKey } = useApiKey();
  const [input, setInput] = useState('');
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const handleSave = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setKey(trimmed);
    setInput('');
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      router.back();
    }, 800);
  };

  const handleClear = () => {
    clearKey();
    setInput('');
  };

  return (
    <main className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">API Key</h1>
      <p className="text-sm text-gray-500 mb-8">
        Enter your API key to authenticate requests to the backend. The key is stored in your
        browser&apos;s local storage and never sent anywhere except as a request header.
      </p>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        {hasKey ? (
          <>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Current Key</p>
              <p className="font-mono text-sm text-gray-500 bg-gray-50 rounded-md border border-gray-200 px-3 py-2">
                {key.slice(0, 6)}{'*'.repeat(Math.max(0, key.length - 6))}
              </p>
            </div>
            <button
              onClick={handleClear}
              className="w-full rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              Clear Key
            </button>
          </>
        ) : (
          <>
            <div>
              <label htmlFor="api-key-input" className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <input
                id="api-key-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder="Enter your API key"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={handleSave}
              disabled={!input.trim() || saved}
              className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saved ? 'Saved!' : 'Save Key'}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
