/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RowDetailPanel } from '@/components/ContentPanel/RowDetailPanel';
import type { Row, FieldDefinition } from '@/types';

describe('RowDetailPanel', () => {
  const mockRow: Row = {
    id: 'row_test_1',
    values: {
      fld_title: 'Test Task Title',
      fld_status: 'In Progress',
    },
    content: {
      description: `# Test Description

This is a test markdown content with a [link](https://example.com).

\`\`\`mermaid
graph TD
  A[Start] --> B[End]
\`\`\``,
      mermaidDiagrams: [],
      links: [],
      documents: [],
      attachments: [],
    },
  };

  const mockFields: FieldDefinition[] = [
    {
      id: 'fld_title',
      type: 'text',
      name: 'Title',
      visible: true,
    },
    {
      id: 'fld_status',
      type: 'single-select',
      name: 'Status',
      visible: true,
      options: [
        { id: 'todo', label: 'Todo' },
        { id: 'progress', label: 'In Progress' },
        { id: 'done', label: 'Done' },
      ],
    },
  ];

  const defaultProps = {
    row: mockRow,
    fields: mockFields,
    isOpen: true,
    onClose: vi.fn(),
    onContentUpdate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Props - isOpen', () => {
    it('should render nothing when isOpen is false', () => {
      const { container } = render(
        <RowDetailPanel {...defaultProps} isOpen={false} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should render panel when isOpen is true', () => {
      render(<RowDetailPanel {...defaultProps} isOpen={true} />);
      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });
  });

  describe('Props - row', () => {
    it('should display row title from first value', () => {
      render(<RowDetailPanel {...defaultProps} />);
      expect(screen.getByText('Test Task Title')).toBeInTheDocument();
    });

    it('should display row ID', () => {
      render(<RowDetailPanel {...defaultProps} />);
      expect(screen.getByText(/ID: row_test_1/i)).toBeInTheDocument();
    });

    it('should render description content', () => {
      render(<RowDetailPanel {...defaultProps} />);
      expect(screen.getByText(/Test Description/i)).toBeInTheDocument();
    });

    it('should handle row without content', () => {
      const rowWithoutContent = {
        ...mockRow,
        content: undefined,
      };
      render(<RowDetailPanel {...defaultProps} row={rowWithoutContent} />);
      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });

    it('should display "Untitled" when row has no title', () => {
      const rowWithoutTitle = {
        ...mockRow,
        values: {},
      };
      render(<RowDetailPanel {...defaultProps} row={rowWithoutTitle} />);
      expect(screen.getByText('Untitled')).toBeInTheDocument();
    });
  });

  describe('Props - onClose', () => {
    it('should call onClose when close button is clicked', () => {
      const onClose = vi.fn();
      render(<RowDetailPanel {...defaultProps} onClose={onClose} />);
      
      const closeButton = screen.getByLabelText(/close panel/i);
      fireEvent.click(closeButton);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when overlay is clicked', () => {
      const onClose = vi.fn();
      render(<RowDetailPanel {...defaultProps} onClose={onClose} />);
      
      const overlay = screen.getByTestId('panel-overlay');
      fireEvent.click(overlay);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when ESC key is pressed', () => {
      const onClose = vi.fn();
      render(<RowDetailPanel {...defaultProps} onClose={onClose} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when panel content is clicked', () => {
      const onClose = vi.fn();
      render(<RowDetailPanel {...defaultProps} onClose={onClose} />);
      
      const panel = screen.getByRole('complementary');
      fireEvent.click(panel);
      
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Props - onContentUpdate', () => {
    it('should call onContentUpdate when description changes', () => {
      const onContentUpdate = vi.fn();
      render(<RowDetailPanel {...defaultProps} onContentUpdate={onContentUpdate} />);
      
      // Switch to edit mode
      const editButton = screen.getByText(/✏️ Edit/i);
      fireEvent.click(editButton);
      
      // Edit textarea
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Updated content' } });
      
      expect(onContentUpdate).toHaveBeenCalled();
      expect(onContentUpdate).toHaveBeenCalledWith(
        'row_test_1',
        expect.objectContaining({
          description: 'Updated content',
        })
      );
    });

    it('should include extracted metadata in onContentUpdate', () => {
      const onContentUpdate = vi.fn();
      render(<RowDetailPanel {...defaultProps} onContentUpdate={onContentUpdate} />);
      
      // Switch to edit mode
      const editButton = screen.getByText(/✏️ Edit/i);
      fireEvent.click(editButton);
      
      // Add content with links and mermaid
      const textarea = screen.getByRole('textbox');
      const newContent = `# Updated
      
[Test Link](https://test.com)

\`\`\`mermaid
graph LR
  A --> B
\`\`\``;
      fireEvent.change(textarea, { target: { value: newContent } });
      
      expect(onContentUpdate).toHaveBeenCalledWith(
        'row_test_1',
        expect.objectContaining({
          description: newContent,
          links: expect.arrayContaining([
            expect.objectContaining({
              url: 'https://test.com',
              title: 'Test Link',
            }),
          ]),
          mermaidDiagrams: expect.arrayContaining([
            expect.stringContaining('graph LR'),
          ]),
        })
      );
    });

    it('should not crash when onContentUpdate is not provided', () => {
      render(<RowDetailPanel {...defaultProps} onContentUpdate={undefined} />);
      
      const editButton = screen.getByText(/✏️ Edit/i);
      fireEvent.click(editButton);
      
      const textarea = screen.getByRole('textbox');
      expect(() => {
        fireEvent.change(textarea, { target: { value: 'New content' } });
      }).not.toThrow();
    });
  });

  describe('Rendering - Basic Structure', () => {
    it('should render panel overlay with correct attributes', () => {
      render(<RowDetailPanel {...defaultProps} />);
      
      const overlay = screen.getByTestId('panel-overlay');
      expect(overlay).toHaveClass('gitboard-row-detail-panel-overlay');
    });

    it('should render panel with correct ARIA attributes', () => {
      render(<RowDetailPanel {...defaultProps} />);
      
      const panel = screen.getByRole('complementary');
      expect(panel).toHaveAttribute('aria-label', 'Row details panel');
      expect(panel).toHaveAttribute('aria-modal', 'true');
    });

    it('should render header with title and ID', () => {
      render(<RowDetailPanel {...defaultProps} />);
      
      expect(screen.getByText('Test Task Title')).toBeInTheDocument();
      expect(screen.getByText(/ID: row_test_1/i)).toBeInTheDocument();
    });

    it('should render close button in header', () => {
      render(<RowDetailPanel {...defaultProps} />);
      
      const closeButton = screen.getByLabelText(/close panel/i);
      expect(closeButton).toBeInTheDocument();
    });

    it('should render UnifiedDescriptionEditor', () => {
      render(<RowDetailPanel {...defaultProps} />);
      
      // Should show edit and preview buttons from UnifiedDescriptionEditor
      expect(screen.getByText(/✏️ Edit/i)).toBeInTheDocument();
      expect(screen.getByText(/👁️ Preview/i)).toBeInTheDocument();
    });
  });
});
