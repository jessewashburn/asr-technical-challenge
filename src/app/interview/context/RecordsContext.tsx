'use client';

/**
 * RecordsContext - Global State Management
 * 
 * Provides centralized state management for record data, including:
 * - Fetching and caching records
 * - Updating record status and notes
 * - Tracking history of status changes
 * 
 * Uses the service layer for API calls to maintain separation of concerns.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { RecordItem, RecordStatus, RecordHistoryEntry } from '../types';
import { 
  fetchRecords, 
  fetchPaginatedRecords, 
  updateRecord as updateRecordApi,
  type PaginatedResponse 
} from '../services/recordsApi';

interface RecordsContextValue {
  records: RecordItem[];
  loading: boolean;
  error: string | null;
  // Pagination state
  currentPage: number;
  totalCount: number;
  pageSize: number;
  totalPages: number;
  usePagination: boolean;
  /**
   * Update a record's status and/or note via the API with version-based concurrency
   * Updates local state on success and adds history entry for status changes
   * Throws RecordsApiError on version conflict (409)
   */
  updateRecord: (id: string, updates: { status?: RecordStatus; note?: string; version: number }) => Promise<void>;
  /**
   * Refresh the list of records from the API
   */
  refresh: () => Promise<void>;
  /**
   * Navigate to a specific page (only when pagination is enabled)
   */
  goToPage: (page: number) => Promise<void>;
  /**
   * Toggle pagination mode
   */
  setPaginationEnabled: (enabled: boolean) => void;
  /**
   * History log of all status changes during this session
   */
  history: RecordHistoryEntry[];
  /**
   * Clear the history log (in-memory only)
   */
  clearHistory: () => void;
}

const RecordsContext = createContext<RecordsContextValue | undefined>(undefined);

export function RecordsProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<RecordHistoryEntry[]>([]);
  
  // Pagination state
  const [usePagination, setUsePagination] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageSize] = useState<number>(5); // Fixed page size
  
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const loadRecords = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      if (usePagination) {
        const response: PaginatedResponse = await fetchPaginatedRecords(page, pageSize);
        setRecords(response.records);
        setTotalCount(response.totalCount);
        setCurrentPage(response.page);
      } else {
        const fetchedRecords = await fetchRecords();
        setRecords(fetchedRecords);
        setTotalCount(fetchedRecords.length);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [usePagination, pageSize]);

  useEffect(() => {
    loadRecords(currentPage);
  }, [loadRecords, currentPage, usePagination]);

  const updateRecord = useCallback(async (
    id: string, 
    updates: { status?: RecordStatus; note?: string; version: number }
  ) => {
    setError(null);
    
    try {
      // Find the record before updating to compare status
      const previousRecord = records.find((r) => r.id === id);
      
      // Call API to update (includes version for concurrency check)
      const updatedRecord = await updateRecordApi(id, updates);
      
      // Update local state
      setRecords((prev) => prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r)));

      // Add history entry if status changed
      if (previousRecord && updates.status && previousRecord.status !== updates.status) {
        const entry: RecordHistoryEntry = {
          id,
          previousStatus: previousRecord.status,
          newStatus: updates.status,
          note: updates.note,
          timestamp: new Date().toISOString(),
        };
        setHistory((prev) => [...prev, entry]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err; // Re-throw so caller can handle version conflicts
    }
  }, [records]);

  const refresh = useCallback(async () => {
    await loadRecords(currentPage);
  }, [loadRecords, currentPage]);
  
  const goToPage = useCallback(async (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);
  
  const setPaginationEnabled = useCallback((enabled: boolean) => {
    setUsePagination(enabled);
    setCurrentPage(1); // Reset to page 1 when toggling
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const value = {
    records,
    loading,
    error,
    currentPage,
    totalCount,
    pageSize,
    totalPages,
    usePagination,
    updateRecord,
    refresh,
    goToPage,
    setPaginationEnabled,
    history,
    clearHistory,
  };
  
  return <RecordsContext.Provider value={value}>{children}</RecordsContext.Provider>;
}

export function useRecords() {
  const context = useContext(RecordsContext);
  if (!context) {
    throw new Error('useRecords must be used within a RecordsProvider');
  }
  return context;
}
