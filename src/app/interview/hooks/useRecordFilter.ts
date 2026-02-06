/**
 * Custom Hooks for Derived State
 * 
 * These hooks encapsulate business logic and derived state calculations,
 * keeping components focused on presentation.
 */

import { useMemo, useState } from 'react';
import type { RecordItem, RecordStatus } from '../types';

/**
 * Filter type - "all" or a specific status
 */
export type RecordFilter = 'all' | RecordStatus;

/**
 * Hook for filtering records by status
 * Returns the filtered records and filter controls
 */
export function useRecordFilter(records: RecordItem[]) {
  const [filter, setFilter] = useState<RecordFilter>('all');

  const filteredRecords = useMemo(() => {
    if (filter === 'all') {
      return records;
    }
    return records.filter((record) => record.status === filter);
  }, [records, filter]);

  return {
    filter,
    setFilter,
    filteredRecords,
  };
}

/**
 * Status counts for summary display
 */
export interface StatusCounts {
  pending: number;
  approved: number;
  flagged: number;
  needs_revision: number;
}

/**
 * Hook for calculating summary counts by status
 * Recalculates whenever records change
 */
export function useStatusCounts(records: RecordItem[]): StatusCounts {
  return useMemo(() => {
    const counts: StatusCounts = {
      pending: 0,
      approved: 0,
      flagged: 0,
      needs_revision: 0,
    };

    records.forEach((record) => {
      counts[record.status] += 1;
    });

    return counts;
  }, [records]);
}
