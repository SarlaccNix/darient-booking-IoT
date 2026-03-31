'use client';

import { useEffect, useState } from 'react';
import { spacesApi } from '@/lib/api/spaces';
import type { Space } from '@/types';

/** Fetches spaces for a given site, re-fetches when siteId changes. */
export function useSiteSpaces(siteId: string): Space[] {
  const [spaces, setSpaces] = useState<Space[]>([]);

  useEffect(() => {
    if (!siteId) return;
    spacesApi.getAll(siteId).then(setSpaces).catch(() => {});
  }, [siteId]);

  return spaces;
}
