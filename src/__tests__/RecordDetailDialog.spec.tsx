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
  vi.mocked(recordsApi.updateRecord).mockResolvedValue({ ...mockRecord, status: 'approved' });
});

describe('RecordDetailDialog', () => {
  it('should render the dialog when open', () => {
    render(<TestWrapper record={mockRecord} onClose={() => {}} />);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(mockRecord.name)).toBeInTheDocument();
    expect(screen.getByText(mockRecord.description)).toBeInTheDocument();
  });

  it('should display current status', () => {
    render(<TestWrapper record={mockRecord} onClose={() => {}} />);
    
    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  it('should display character count for note', () => {
    render(<TestWrapper record={mockRecord} onClose={() => {}} />);

    const noteTextarea = screen.getByPlaceholderText(/add a note/i);
    fireEvent.change(noteTextarea, { target: { value: 'Test note' } });

    expect(screen.getByText(/9 characters/i)).toBeInTheDocument();
  });

  it('should display save and cancel buttons', () => {
    render(<TestWrapper record={mockRecord} onClose={() => {}} />);

    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should call onClose when cancel is clicked', () => {
    const onClose = vi.fn();
    render(<TestWrapper record={mockRecord} onClose={onClose} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should show note textarea', () => {
    render(<TestWrapper record={mockRecord} onClose={() => {}} />);

    const noteTextarea = screen.getByPlaceholderText(/add a note/i);
    expect(noteTextarea).toBeInTheDocument();
  });

  it('should show status select and labels', () => {
    render(<TestWrapper record={mockRecord} onClose={() => {}} />);

    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Reviewer note')).toBeInTheDocument();
  });
});
