/**
 * API Service Layer
 * 
 * Centralizes all API calls for records. This separation allows for:
 * - Consistent error handling
 * - Easy mocking in tests
 * - Single source of truth for API endpoints
 * - Potential for request/response transformation
 */

import type { RecordItem, RecordStatus } from '../types';

const API_BASE = '/api/mock/records';

export class RecordsApiError extends Error {
  constructor(
    message: string, 
    public statusCode?: number,
    public serverRecord?: RecordItem
  ) {
    super(message);
    this.name = 'RecordsApiError';
  }
}

export interface StatusCounts {
  pending: number;
  approved: number;
  flagged: number;
  needs_revision: number;
}

export interface PaginatedResponse {
  records: RecordItem[];
  totalCount: number;
  page: number;
  limit: number;
  statusCounts: StatusCounts;
}

/**
 * Fetches all records from the API (no pagination)
 */
export async function fetchRecords(): Promise<RecordItem[]> {
  try {
    const response = await fetch(API_BASE);
    
    if (!response.ok) {
      throw new RecordsApiError(
        `Failed to fetch records: ${response.statusText}`,
        response.status
      );
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof RecordsApiError) throw error;
    throw new RecordsApiError(
      error instanceof Error ? error.message : 'Unknown error fetching records'
    );
  }
}

/**
 * Fetches paginated records from the API
 */
export async function fetchPaginatedRecords(
  page: number = 1, 
  limit: number = 10
): Promise<PaginatedResponse> {
  try {
    const url = `${API_BASE}?page=${page}&limit=${limit}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new RecordsApiError(
        `Failed to fetch paginated records: ${response.statusText}`,
        response.status
      );
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof RecordsApiError) throw error;
    throw new RecordsApiError(
      error instanceof Error ? error.message : 'Unknown error fetching paginated records'
    );
  }
}

/**
 * Updates a record's status and/or note with optimistic concurrency control
 */
export async function updateRecord(
  id: string,
  updates: { status?: RecordStatus; note?: string; version: number }
): Promise<RecordItem> {
  try {
    const response = await fetch(API_BASE, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle version conflict (409)
      if (response.status === 409) {
        throw new RecordsApiError(
          errorData.message || 'This record has been modified. Please refresh.',
          response.status,
          errorData.serverRecord
        );
      }
      
      throw new RecordsApiError(
        errorData.error || `Failed to update record: ${response.statusText}`,
        response.status
      );
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof RecordsApiError) throw error;
    throw new RecordsApiError(
      error instanceof Error ? error.message : 'Unknown error updating record'
    );
  }
}
