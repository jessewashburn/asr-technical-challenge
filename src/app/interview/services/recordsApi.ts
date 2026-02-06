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
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'RecordsApiError';
  }
}

/**
 * Fetches all records from the API
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
 * Updates a record's status and/or note
 */
export async function updateRecord(
  id: string,
  updates: { status?: RecordStatus; note?: string }
): Promise<RecordItem> {
  try {
    const response = await fetch(API_BASE, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
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
