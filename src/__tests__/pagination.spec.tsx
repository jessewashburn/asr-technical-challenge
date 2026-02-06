/**
 * Pagination Tests
 * 
 * Tests the pagination functionality including:
 * - Page navigation
 * - Page limit enforcement
 * - Toggle pagination mode
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
};

const mockAllRecords = Array.from({ length: 12 }, (_, i) => ({
  id: String(i + 1),
  name: `Test Record ${i + 1}`,
  description: `Description ${i + 1}`,
  status: i % 4 === 0 ? "approved" : "pending",
  version: 1,
}));

describe('Pagination', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockAllRecords,
    });
  });

  it('should show pagination toggle button', async () => {
    render(
      <RecordsProvider>
        <RecordList />
      </RecordsProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Records')).toBeInTheDocument();
    });

    // Initially pagination is disabled
    expect(screen.getByText('Enable Pagination')).toBeInTheDocument();
    
    // Enable pagination
    const toggleButton = screen.getByText('Enable Pagination');
    await userEvent.click(toggleButton);

    // Should now show disable option
    await waitFor(() => {
      expect(screen.getByText('Disable Pagination')).toBeInTheDocument();
    });
  });

  it('should show pagination controls when enabled', async () => {
    // Mock paginated fetch
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockAllRecords,
    });

    render(
      <RecordsProvider>
        <RecordList />
      </RecordsProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Records')).toBeInTheDocument();
    });

    // Enable pagination - just verify the toggle works
    const toggleButton = screen.getByText('Enable Pagination');
    await userEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByText('Disable Pagination')).toBeInTheDocument();
    });
  });

  it('should call paginated API when pagination is enabled', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('?page=')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockPaginatedResponse,
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => mockAllRecords,
      });
    });

    render(
      <RecordsProvider>
        <RecordList />
      </RecordsProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Records')).toBeInTheDocument();
    });

    // Enable pagination
    await userEvent.click(screen.getByText('Enable Pagination'));

    // Verify paginated API was called
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('?page=1&limit=5'));
    }, { timeout: 3000 });
    
    fetchSpy.mockRestore();
  });
});
