/**
 * Concurrency Tests
 * 
 * Tests optimistic concurrency control:
 * - Version conflict detection (409)
 * - Conflict resolution UI
 * - Refresh and retry
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RecordDetailDialog from '../app/interview/components/RecordDetailDialog';
import { RecordsProvider } from '../app/interview/context/RecordsContext';

// Mock fetch
global.fetch = vi.fn();

const mockRecord = {
  id: "1",
  name: "Test Record",
  description: "Test Description",
  status: "pending" as const,
  version: 1,
};

const mockRecords = [mockRecord];

describe('Optimistic Concurrency Control', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockRecords,
    });
  });

  it('should send version with update request', async () => {
    const onClose = vi.fn();

    render(
      <RecordsProvider>
        <RecordDetailDialog record={mockRecord} onClose={onClose} />
      </RecordsProvider>
    );

    // Mock the PATCH request
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockRecord, status: 'approved', version: 2 }),
    });

    // Click save (status is already pending, we just want to verify version is sent)
    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);

    // Wait for the PATCH request
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/mock/records',
        expect.objectContaining({
          method: 'PATCH',
          body: expect.stringContaining('"version":1'),
        })
      );
    });
  });

  it('should detect version conflict (409)', async () => {
    const onClose = vi.fn();

    render(
      <RecordsProvider>
        <RecordDetailDialog record={mockRecord} onClose={onClose} />
      </RecordsProvider>
    );

    // Mock 409 conflict response
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({
        error: 'Version conflict',
        serverRecord: { ...mockRecord, version: 2, status: 'approved' },
      }),
    });

    // Click save (will trigger 409 error)
    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);

    // Should show conflict error and UI
    await waitFor(() => {
      expect(screen.getAllByText(/This record was modified by another user/i).length).toBeGreaterThan(0);
    });

    // Should show conflict warning UI
    expect(screen.getByText(/Conflict Detected/i)).toBeInTheDocument();
  });

  it('should show refresh and retry button on conflict', async () => {
    const onClose = vi.fn();

    render(
      <RecordsProvider>
        <RecordDetailDialog record={mockRecord} onClose={onClose} />
      </RecordsProvider>
    );

    // Mock 409 conflict
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({
        error: 'Version conflict',
        serverRecord: { ...mockRecord, version: 2 },
      }),
    });

    // Trigger save
    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);

    // Wait for conflict UI
    await waitFor(() => {
      expect(screen.getByText(/Conflict Detected/i)).toBeInTheDocument();
    });

    // Should show refresh button instead of save
    expect(screen.getByText('Refresh & Try Again')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^save$/i })).not.toBeInTheDocument();
  });

  it('should close dialog when clicking refresh button', async () => {
    const onClose = vi.fn();

    render(
      <RecordsProvider>
        <RecordDetailDialog record={mockRecord} onClose={onClose} />
      </RecordsProvider>
    );

    // Mock 409 conflict
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({
        error: 'Version conflict',
        serverRecord: { ...mockRecord, version: 2 },
      }),
    });

    // Trigger conflict
    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/Conflict Detected/i)).toBeInTheDocument();
    });

    // Mock refresh
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ ...mockRecord, version: 2 }],
    });

    // Click refresh & try again
    const refreshButton = screen.getByText('Refresh & Try Again');
    await userEvent.click(refreshButton);

    // Dialog should close
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });
});
