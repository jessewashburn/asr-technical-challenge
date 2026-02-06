import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useRecordFilter, useStatusCounts } from '@/app/interview/hooks/useRecordFilter';
import type { RecordItem } from '@/app/interview/types';

const mockRecords: RecordItem[] = [
  {
    id: '1',
    name: 'Record 1',
    description: 'Description 1',
    status: 'pending',
  },
  {
    id: '2',
    name: 'Record 2',
    description: 'Description 2',
    status: 'approved',
  },
  {
    id: '3',
    name: 'Record 3',
    description: 'Description 3',
    status: 'flagged',
  },
  {
    id: '4',
    name: 'Record 4',
    description: 'Description 4',
    status: 'needs_revision',
  },
  {
    id: '5',
    name: 'Record 5',
    description: 'Description 5',
    status: 'approved',
  },
];

describe('useRecordFilter hook', () => {
  it('should initialize with "all" filter', () => {
    const { result } = renderHook(() => useRecordFilter(mockRecords));
    
    expect(result.current.filter).toBe('all');
    expect(result.current.filteredRecords).toHaveLength(5);
  });

  it('should filter by pending status', () => {
    const { result } = renderHook(() => useRecordFilter(mockRecords));
    
    act(() => {
      result.current.setFilter('pending');
    });
    
    expect(result.current.filter).toBe('pending');
    expect(result.current.filteredRecords).toHaveLength(1);
    expect(result.current.filteredRecords[0].status).toBe('pending');
  });

  it('should filter by approved status', () => {
    const { result } = renderHook(() => useRecordFilter(mockRecords));
    
    act(() => {
      result.current.setFilter('approved');
    });
    
    expect(result.current.filter).toBe('approved');
    expect(result.current.filteredRecords).toHaveLength(2);
    expect(result.current.filteredRecords.every(r => r.status === 'approved')).toBe(true);
  });

  it('should filter by flagged status', () => {
    const { result } = renderHook(() => useRecordFilter(mockRecords));
    
    act(() => {
      result.current.setFilter('flagged');
    });
    
    expect(result.current.filteredRecords).toHaveLength(1);
    expect(result.current.filteredRecords[0].status).toBe('flagged');
  });

  it('should return all records when filter is "all"', () => {
    const { result } = renderHook(() => useRecordFilter(mockRecords));
    
    act(() => {
      result.current.setFilter('needs_revision');
    });
    act(() => {
      result.current.setFilter('all');
    });
    
    expect(result.current.filteredRecords).toHaveLength(5);
  });

  it('should handle empty records array', () => {
    const { result } = renderHook(() => useRecordFilter([]));
    
    expect(result.current.filteredRecords).toHaveLength(0);
  });
});

describe('useStatusCounts hook', () => {
  it('should calculate correct counts for all statuses', () => {
    const { result } = renderHook(() => useStatusCounts(mockRecords));
    
    expect(result.current.pending).toBe(1);
    expect(result.current.approved).toBe(2);
    expect(result.current.flagged).toBe(1);
    expect(result.current.needs_revision).toBe(1);
  });

  it('should return zero counts for empty array', () => {
    const { result } = renderHook(() => useStatusCounts([]));
    
    expect(result.current.pending).toBe(0);
    expect(result.current.approved).toBe(0);
    expect(result.current.flagged).toBe(0);
    expect(result.current.needs_revision).toBe(0);
  });

  it('should handle records with only one status', () => {
    const singleStatus: RecordItem[] = [
      { id: '1', name: 'R1', description: 'D1', status: 'pending' },
      { id: '2', name: 'R2', description: 'D2', status: 'pending' },
      { id: '3', name: 'R3', description: 'D3', status: 'pending' },
    ];
    
    const { result } = renderHook(() => useStatusCounts(singleStatus));
    
    expect(result.current.pending).toBe(3);
    expect(result.current.approved).toBe(0);
    expect(result.current.flagged).toBe(0);
    expect(result.current.needs_revision).toBe(0);
  });
});
