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
import { fetchRecords, updateRecord as updateRecordApi } from '../services/recordsApi';

interface RecordsContextValue {
  records: RecordItem[];
  loading: boolean;
  error: string | null;
  /**
   * Update a record's status and/or note via the API
   * Updates local state on success and adds history entry for status changes
   */
  updateRecord: (id: string, updates: { status?: RecordStatus; note?: string }) => Promise<void>;
  /**
   * Refresh the list of records from the API
   */
  refresh: () => Promise<void>;
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

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedRecords = await fetchRecords();
      setRecords(fetchedRecords);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const updateRecord = useCallback(async (
    id: string, 
    updates: { status?: RecordStatus; note?: string }
  ) => {
    setError(null);
    
    try {
      // Find the record before updating to compare status
      const previousRecord = records.find((r) => r.id === id);
      
      // Call API to update
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
      throw err;
    }
  }, [records]);

  const refresh = useCallback(async () => {
    await loadRecords();
  }, [loadRecords]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const value = {
    records,
    loading,
    error,
    updateRecord,
    refresh,
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
