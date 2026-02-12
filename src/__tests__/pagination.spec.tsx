/**
 * Pagination Tests
 * 
 * Tests the pagination functionality including:
 * - Page navigation
 * - Pagination controls display
 * - Paginated API calls
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RecordList from '../app/interview/components/RecordList';
import { RecordsProvider } from '../app/interview/context/RecordsContext';

// Mock fetch
global.fetch = vi.fn();

const mockPaginatedResponse = {
  records: [
    {
      id: "1",
      name: "Test Record 1",
      description: "Description 1",
      status: "pending",
      version: 1,
    },
    {
      id: "2",
      name: "Test Record 2",
      description: "Description 2",
      status: "approved",
      version: 1,
    },
  ],
  totalCount: 12,
  page: 1,
  limit: 5,
  statusCounts: {
    pending: 8,
    approved: 3,
    flagged: 1,
    needs_revision: 0,
  },
};

const mockPage2Response = {
  records: [
    {
      id: "6",
      name: "Test Record 6",
      description: "Description 6",
      status: "pending",
      version: 1,
    },
  ],
  totalCount: 12,
  page: 2,
  limit: 5,
  statusCounts: {
    pending: 8,
    approved: 3,
    flagged: 1,
    needs_revision: 0,
  },
};

describe('Pagination', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockPaginatedResponse,
    } as Response);
  });

  it('should call paginated API on mount', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');

    render(
      <RecordsProvider>
        <RecordList />
      </RecordsProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Records')).toBeInTheDocument();
    });

    // Verify paginated API was called
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('?page=1&limit=5'));
    });
    
    fetchSpy.mockRestore();
  });

  it('should show pagination info in header', async () => {
    render(
      <RecordsProvider>
        <RecordList />
      </RecordsProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/12/)).toBeInTheDocument(); // total count
      expect(screen.getByText(/Page 1 of/)).toBeInTheDocument();
    });
  });

  it('should navigate to next page when Next button clicked', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    
    vi.mocked(global.fetch).mockImplementation((input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      if (url.includes('page=2')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockPage2Response,
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: async () => mockPaginatedResponse,
      } as Response);
    });

    render(
      <RecordsProvider>
        <RecordList />
      </RecordsProvider>
    );

    // Wait for data to load and Next button to appear
    await waitFor(() => {
      expect(screen.getByText('Next →')).toBeInTheDocument();
    });

    // Click next button
    const nextButton = screen.getByText('Next →');
    await userEvent.click(nextButton);

    // Verify page 2 API was called
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('?page=2&limit=5'));
    });
    
    fetchSpy.mockRestore();
  });
});
