/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GitBoardTable } from '@/components/GitBoardTable';
import { fields, rows } from '@/mocks/mockData';

describe('Row Detail Panel Integration', () => {
  const mockOnChange = vi.fn();
  const mockOnContentUpdate = vi.fn();

  const defaultProps = {
    fields,
    rows,
    onChange: mockOnChange,
    onContentUpdate: mockOnContentUpdate,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Opening Panel', () => {
    it('should open detail panel when clicking title cell', async () => {
      render(<GitBoardTable {...defaultProps} />);

      // Find and click the first row's title cell
      const titleCell = screen.getByText('Add login page');
      fireEvent.click(titleCell);

      // Panel should be visible
      await waitFor(() => {
        expect(screen.getByRole('complementary')).toBeInTheDocument();
      });
    });

    it('should display row content in panel', async () => {
      render(<GitBoardTable {...defaultProps} />);

      // Click title to open panel
      const titleCell = screen.getByText('Add login page');
      fireEvent.click(titleCell);

      // Check if content is displayed
      await waitFor(() => {
        expect(screen.getByText(/Login Page Implementation/i)).toBeInTheDocument();
      });
    });

    it('should show all content tabs', async () => {
      render(<GitBoardTable {...defaultProps} />);

      const titleCell = screen.getByText('Add login page');
      fireEvent.click(titleCell);

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /description/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /links/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /diagrams/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /documents/i })).toBeInTheDocument();
      });
    });
  });

  describe('Closing Panel', () => {
    it('should close panel when close button is clicked', async () => {
      render(<GitBoardTable {...defaultProps} />);

      // Open panel
      const titleCell = screen.getByText('Add login page');
      fireEvent.click(titleCell);

      await waitFor(() => {
        expect(screen.getByRole('complementary')).toBeInTheDocument();
      });

      // Close panel
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
      });
    });

    it('should close panel when ESC key is pressed', async () => {
      render(<GitBoardTable {...defaultProps} />);

      // Open panel
      const titleCell = screen.getByText('Add login page');
      fireEvent.click(titleCell);

      await waitFor(() => {
        expect(screen.getByRole('complementary')).toBeInTheDocument();
      });

      // Press ESC
      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
      });
    });

    it('should close panel when clicking overlay', async () => {
      render(<GitBoardTable {...defaultProps} />);

      // Open panel
      const titleCell = screen.getByText('Add login page');
      fireEvent.click(titleCell);

      await waitFor(() => {
        expect(screen.getByRole('complementary')).toBeInTheDocument();
      });

      // Click overlay
      const overlay = screen.getByTestId('panel-overlay');
      fireEvent.click(overlay);

      await waitFor(() => {
        expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
      });
    });
  });

  describe('Content Editing', () => {
    it('should update description and call onContentUpdate', async () => {
      render(<GitBoardTable {...defaultProps} />);

      // Open panel
      const titleCell = screen.getByText('Add login page');
      fireEvent.click(titleCell);

      await waitFor(() => {
        expect(screen.getByRole('complementary')).toBeInTheDocument();
      });

      // Edit description
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, {
        target: { value: '# Updated Description\n\nNew content here' },
      });

      await waitFor(() => {
        expect(mockOnContentUpdate).toHaveBeenCalledWith(
          'row_1_d1a9f',
          expect.objectContaining({
            description: '# Updated Description\n\nNew content here',
          })
        );
      });
    });

    it('should persist content changes in table state', async () => {
      render(<GitBoardTable {...defaultProps} />);

      // Open panel
      const titleCell = screen.getByText('Add login page');
      fireEvent.click(titleCell);

      await waitFor(() => {
        expect(screen.getByRole('complementary')).toBeInTheDocument();
      });

      // Edit description
      const textarea = screen.getByRole('textbox');
      const newDescription = '# Updated Task';
      fireEvent.change(textarea, { target: { value: newDescription } });

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              id: 'row_1_d1a9f',
              content: expect.objectContaining({
                description: newDescription,
              }),
            }),
          ])
        );
      });
    });
  });

  describe('Tab Navigation', () => {
    it('should switch between content tabs', async () => {
      render(<GitBoardTable {...defaultProps} />);

      // Open panel
      const titleCell = screen.getByText('Add login page');
      fireEvent.click(titleCell);

      await waitFor(() => {
        expect(screen.getByRole('complementary')).toBeInTheDocument();
      });

      // Click links tab
      const linksTab = screen.getByRole('tab', { name: /links/i });
      fireEvent.click(linksTab);

      // Links content should be visible
      await waitFor(() => {
        expect(screen.getByText('Auth0 Quickstart Guide')).toBeInTheDocument();
      });

      // Click diagrams tab
      const diagramsTab = screen.getByRole('tab', { name: /diagrams/i });
      fireEvent.click(diagramsTab);

      // Diagrams content should be visible
      await waitFor(() => {
        expect(screen.getByTestId('mermaid-section')).toBeInTheDocument();
      });
    });
  });

  describe('Multiple Rows', () => {
    it('should open different panels for different rows', async () => {
      render(<GitBoardTable {...defaultProps} />);

      // Open first row
      const firstTitle = screen.getByText('Add login page');
      fireEvent.click(firstTitle);

      await waitFor(() => {
        expect(screen.getByText(/Login Page Implementation/i)).toBeInTheDocument();
      });

      // Close panel
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
      });

      // Open second row
      const secondTitle = screen.getByText('Refactor API client');
      fireEvent.click(secondTitle);

      await waitFor(() => {
        expect(screen.getByText(/API Client Refactoring/i)).toBeInTheDocument();
      });
    });
  });

  describe('Empty Content', () => {
    it('should handle rows without content property', async () => {
      const rowsWithoutContent = rows.map((row) => ({
        ...row,
        content: undefined,
      }));

      render(<GitBoardTable {...defaultProps} rows={rowsWithoutContent} />);

      // Open panel
      const titleCell = screen.getByText('Add login page');
      fireEvent.click(titleCell);

      await waitFor(() => {
        expect(screen.getByRole('complementary')).toBeInTheDocument();
      });

      // Should show empty description
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('');
    });
  });
});
