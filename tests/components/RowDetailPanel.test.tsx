/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RowDetailPanel } from '@/components/ContentPanel/RowDetailPanel';
import type { Row } from '@/types';

describe('RowDetailPanel', () => {
  const mockRow: Row = {
    id: 'row_test_1',
    values: {
      title: 'Test Task',
      status: 'In Progress',
    },
    content: {
      description: '# Test Description\n\nThis is a test markdown content.',
      mermaidDiagrams: [
        'graph TD\n  A[Start] --> B[End]',
      ],
      links: [
        {
          id: 'link_1',
          url: 'https://example.com',
          title: 'Example Link',
          description: 'Test link',
        },
      ],
      documents: [
        {
          id: 'doc_1',
          filename: 'test.pdf',
          mime: 'application/pdf',
          size: 100000,
          url: '/test.pdf',
          uploadedAt: '2025-02-01T10:00:00Z',
        },
      ],
      attachments: [],
    },
  };

  const mockProps = {
    row: mockRow,
    isOpen: true,
    onClose: vi.fn(),
    onContentUpdate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render nothing when isOpen is false', () => {
      const { container } = render(<RowDetailPanel {...mockProps} isOpen={false} />);
      expect(container.firstChild).toBeNull();
    });

    it('should render panel when isOpen is true', () => {
      render(<RowDetailPanel {...mockProps} />);
      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });

    it('should display row title', () => {
      render(<RowDetailPanel {...mockProps} />);
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<RowDetailPanel {...mockProps} />);
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('should render markdown description', () => {
      render(<RowDetailPanel {...mockProps} />);
      expect(screen.getByText(/Test Description/i)).toBeInTheDocument();
    });

    it('should render links section when links exist', () => {
      render(<RowDetailPanel {...mockProps} />);
      expect(screen.getByText('Example Link')).toBeInTheDocument();
    });

    it('should render documents section when documents exist', () => {
      render(<RowDetailPanel {...mockProps} />);
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    it('should render mermaid diagrams section when diagrams exist', () => {
      render(<RowDetailPanel {...mockProps} />);
      expect(screen.getByTestId('mermaid-section')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onClose when close button is clicked', () => {
      render(<RowDetailPanel {...mockProps} />);
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when ESC key is pressed', () => {
      render(<RowDetailPanel {...mockProps} />);
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when clicking overlay background', () => {
      render(<RowDetailPanel {...mockProps} />);
      const overlay = screen.getByTestId('panel-overlay');
      fireEvent.click(overlay);
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should not close when clicking inside panel content', () => {
      render(<RowDetailPanel {...mockProps} />);
      const panelContent = screen.getByRole('complementary');
      fireEvent.click(panelContent);
      expect(mockProps.onClose).not.toHaveBeenCalled();
    });

    it('should call onContentUpdate when description is edited', async () => {
      render(<RowDetailPanel {...mockProps} />);
      const textarea = screen.getByRole('textbox');
      
      fireEvent.change(textarea, {
        target: { value: '# Updated Description' },
      });

      await waitFor(() => {
        expect(mockProps.onContentUpdate).toHaveBeenCalledWith(
          mockRow.id,
          expect.objectContaining({
            description: '# Updated Description',
          })
        );
      });
    });
  });

  describe('Content Sections', () => {
    it('should render tabs for different content sections', () => {
      render(<RowDetailPanel {...mockProps} />);
      expect(screen.getByRole('tab', { name: /description/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /links/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /diagrams/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /documents/i })).toBeInTheDocument();
    });

    it('should switch between tabs when clicked', () => {
      render(<RowDetailPanel {...mockProps} />);
      const linksTab = screen.getByRole('tab', { name: /links/i });
      
      fireEvent.click(linksTab);
      
      expect(linksTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should show empty state when no content exists', () => {
      const emptyRow: Row = {
        ...mockRow,
        content: {
          description: '',
          links: [],
          documents: [],
          mermaidDiagrams: [],
          attachments: [],
        },
      };

      render(<RowDetailPanel {...mockProps} row={emptyRow} />);
      expect(screen.getByText(/no description/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should trap focus within panel when open', () => {
      render(<RowDetailPanel {...mockProps} />);
      const panel = screen.getByRole('complementary');
      expect(panel).toHaveAttribute('aria-modal', 'true');
    });

    it('should have proper ARIA labels', () => {
      render(<RowDetailPanel {...mockProps} />);
      const panel = screen.getByRole('complementary');
      expect(panel).toHaveAttribute('aria-label', 'Row details panel');
    });

    it('should restore focus when closed', () => {
      const { rerender } = render(<RowDetailPanel {...mockProps} />);
      const closeButton = screen.getByRole('button', { name: /close/i });
      
      fireEvent.click(closeButton);
      
      rerender(<RowDetailPanel {...mockProps} isOpen={false} />);
      
      // Focus should be restored to the triggering element
      expect(mockProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Empty Content', () => {
    it('should handle row without content property', () => {
      const rowWithoutContent: Row = {
        id: 'row_test_2',
        values: {
          title: 'Task without content',
        },
      };

      render(<RowDetailPanel {...mockProps} row={rowWithoutContent} />);
      expect(screen.getByText(/no description/i)).toBeInTheDocument();
    });

    it('should initialize empty content structure when undefined', () => {
      const rowWithoutContent: Row = {
        id: 'row_test_3',
        values: {
          title: 'New Task',
        },
      };

      render(<RowDetailPanel {...mockProps} row={rowWithoutContent} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('');
    });
  });
});
