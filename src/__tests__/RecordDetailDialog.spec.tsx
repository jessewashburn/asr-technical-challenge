import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RecordDetailDialog from '@/app/interview/components/RecordDetailDialog';
import { RecordsProvider } from '@/app/interview/context/RecordsContext';
import type { RecordItem } from '@/app/interview/types';
import * as recordsApi from '@/app/interview/services/recordsApi';

vi.mock('@/app/interview/services/recordsApi');

const mockRecord: RecordItem = {
  id: '1',
  name: 'Test Specimen',
  description: 'Test description',
  status: 'pending',
  version: 1,
};

function TestWrapper({ record, onClose }: { record: RecordItem, onClose: () => void }) {
  return (
    <RecordsProvider>
      <RecordDetailDialog 
        record={record}
        onClose={onClose}
      />
    </RecordsProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  // Mock fetchPaginatedRecords to prevent act() warnings from RecordsProvider useEffect
  vi.mocked(recordsApi.fetchPaginatedRecords).mockResolvedValue({
    records: [mockRecord],
    totalCount: 1,
    page: 1,
    limit: 5,
    statusCounts: {
      pending: 1,
      approved: 0,
      flagged: 0,
      needs_revision: 0,
    },
  });
  vi.mocked(recordsApi.updateRecord).mockResolvedValue({ ...mockRecord, status: 'approved', version: 2 });
});

describe('RecordDetailDialog', () => {
  it('should render the dialog when open', async () => {
    render(<TestWrapper record={mockRecord} onClose={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    expect(screen.getByText(mockRecord.name)).toBeInTheDocument();
    expect(screen.getByText(mockRecord.description)).toBeInTheDocument();
  });

  it('should display current status', async () => {
    render(<TestWrapper record={mockRecord} onClose={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText('pending')).toBeInTheDocument();
    });
  });

  it('should display character count for note', async () => {
    render(<TestWrapper record={mockRecord} onClose={() => {}} />);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const noteTextarea = screen.getByPlaceholderText(/add a note/i);
    fireEvent.change(noteTextarea, { target: { value: 'Test note' } });

    expect(screen.getByText(/9 characters/i)).toBeInTheDocument();
  });

  it('should display save and cancel buttons', async () => {
    render(<TestWrapper record={mockRecord} onClose={() => {}} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });
    
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should call onClose when cancel is clicked', async () => {
    const onClose = vi.fn();
    render(<TestWrapper record={mockRecord} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should show note textarea', async () => {
    render(<TestWrapper record={mockRecord} onClose={() => {}} />);

    await waitFor(() => {
      const noteTextarea = screen.getByPlaceholderText(/add a note/i);
      expect(noteTextarea).toBeInTheDocument();
    });
  });

  it('should show status select and labels', async () => {
    render(<TestWrapper record={mockRecord} onClose={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Status')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Reviewer note')).toBeInTheDocument();
  });
});
