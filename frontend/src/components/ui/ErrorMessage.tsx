'use client';

import Link from 'next/link';

interface ErrorMessageProps {
  message: string;
  statusCode?: number | null;
}

export function ErrorMessage({ message, statusCode }: ErrorMessageProps) {
  const isUnauthorized = statusCode === 401;

  return (
    <div className="rounded-md bg-red-50 border border-red-200 p-4">
      <p className="text-sm text-red-700">{message}</p>
      {isUnauthorized && (
        <div className="mt-3">
          <Link
            href="/api-key"
            className="inline-block rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Add API Key
          </Link>
        </div>
      )}
    </div>
  );
}
