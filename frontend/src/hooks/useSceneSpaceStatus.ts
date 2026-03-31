'use client';

import { useEffect, useState } from 'react';
import { bookingsApi } from '@/lib/api/bookings';
import { siteSpaces } from '@/components/scene/sceneConfig';

export type SpaceStatus = 'available' | 'booked';

/**
 * Derives availability of all spaces in a site for a given date.
 * Returns a map of spaceId → 'available' | 'booked'.
 */
export function useSceneSpaceStatus(
  siteId: string,
  date: string,
): Record<string, SpaceStatus> {
  const [statuses, setStatuses] = useState<Record<string, SpaceStatus>>({});

  useEffect(() => {
    if (!siteId || !date) {
      setStatuses({});
      return;
    }

    bookingsApi.getAll({ pageSize: 200 }).then(({ data }) => {
      const booked = new Set(
        data
          .filter((b) => b.bookingDate.slice(0, 10) === date && b.siteId === siteId)
          .map((b) => b.spaceId),
      );
      const result: Record<string, SpaceStatus> = {};
      (siteSpaces[siteId] ?? []).forEach((id) => {
        result[id] = booked.has(id) ? 'booked' : 'available';
      });
      setStatuses(result);
    }).catch(() => {});
  }, [siteId, date]);

  return statuses;
}
