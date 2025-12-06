/**
 * TableHeader Component Tests
 * Tests for column headers rendering and display
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TableHeader } from '../../src/components/Table/TableHeader';
import { fields } from '../../src/mocks/mockData';

describe('TableHeader', () => {
  describe('Rendering', () => {
    it('renders all visible field names as column headers', () => {
      render(
        <table>
          <TableHeader fields={fields} />
        </table>
      );

      // Check that all visible fields are rendered
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Owner')).toBeInTheDocument();
      expect(screen.getByText('Tags')).toBeInTheDocument();
      expect(screen.getByText('Due Date')).toBeInTheDocument();
      expect(screen.getByText('Points')).toBeInTheDocument();
      expect(screen.getByText('Iteration')).toBeInTheDocument();
    });

    it('renders headers in correct order', () => {
      render(
        <table>
          <TableHeader fields={fields} />
        </table>
      );

      const headers = screen.getAllByRole('columnheader');
      // Skip drag handle (index 0) and row number (index 1) columns
      expect(headers[2]).toHaveTextContent('Title');
      expect(headers[3]).toHaveTextContent('Status');
      expect(headers[4]).toHaveTextContent('Owner');
    });

    it('only renders visible fields', () => {
      const fieldsWithHidden = [
        ...fields,
        {
          id: 'fld_hidden_123',
          name: 'Hidden Field',
          type: 'text' as const,
          visible: false,
        },
      ];

      render(
        <table>
          <TableHeader fields={fieldsWithHidden} />
        </table>
      );

      expect(screen.queryByText('Hidden Field')).not.toBeInTheDocument();
    });

    it('renders with empty fields array', () => {
      render(
        <table>
          <TableHeader fields={[]} />
        </table>
      );

      const headers = screen.queryAllByRole('columnheader');
      expect(headers).toHaveLength(2); // Drag handle + row number columns (no fields, no showSelection)
    });

    it('has proper table header structure', () => {
      const { container } = render(
        <table>
          <TableHeader fields={fields} />
        </table>
      );

      const thead = container.querySelector('thead');
      expect(thead).toBeInTheDocument();

      const tr = thead?.querySelector('tr');
      expect(tr).toBeInTheDocument();
    });
  });

  describe('Column attributes', () => {
    it('applies custom width to columns when specified', () => {
      const fieldsWithWidth = [
        {
          id: 'fld_1',
          name: 'Custom Width',
          type: 'text' as const,
          visible: true,
          width: 300,
        },
      ];

      const { container } = render(
        <table>
          <TableHeader fields={fieldsWithWidth} />
        </table>
      );

      // Get the field column (skip drag handle and row number columns)
      const headers = container.querySelectorAll('th');
      const fieldHeader = headers[2]; // Drag handle (0), row number (1), field (2)
      expect(fieldHeader).toHaveStyle({ width: '300px' });
    });

    it('uses default width when not specified', () => {
      const fieldsNoWidth = [
        {
          id: 'fld_1',
          name: 'Default Width',
          type: 'text' as const,
          visible: true,
        },
      ];

      render(
        <table>
          <TableHeader fields={fieldsNoWidth} />
        </table>
      );

      expect(screen.getByText('Default Width')).toBeInTheDocument();
    });
  });

  describe('Column Resizing', () => {
    it('renders resize handle when onResize prop is provided', () => {
      const onResize = vi.fn();
      const { container } = render(
        <table>
          <TableHeader fields={fields} onResize={onResize} />
        </table>
      );

      const resizeHandles = container.querySelectorAll('.gitboard-table__resize-handle');
      expect(resizeHandles.length).toBeGreaterThan(0);
    });

    it('does not render resize handle when onResize prop is not provided', () => {
      const { container } = render(
        <table>
          <TableHeader fields={fields} />
        </table>
      );

      const resizeHandles = container.querySelectorAll('.gitboard-table__resize-handle');
      expect(resizeHandles).toHaveLength(0);
    });

    it('calls onResize with correct values when dragging', () => {
      const onResize = vi.fn();
      const fieldsWithWidth = [
        {
          id: 'fld_test',
          name: 'Test Field',
          type: 'text' as const,
          visible: true,
          width: 150,
        },
      ];

      const { container } = render(
        <table>
          <TableHeader fields={fieldsWithWidth} onResize={onResize} />
        </table>
      );

      const resizeHandle = container.querySelector('.gitboard-table__resize-handle');
      expect(resizeHandle).toBeInTheDocument();

      // Start resize
      fireEvent.mouseDown(resizeHandle!, { clientX: 100 });

      // Move mouse
      fireEvent.mouseMove(document, { clientX: 150 });

      // Should call onResize with new width
      expect(onResize).toHaveBeenCalled();
      const lastCall = onResize.mock.calls[onResize.mock.calls.length - 1];
      expect(lastCall[0]).toBe('fld_test');
      expect(lastCall[1]).toBe(200); // 150 + (150 - 100)

      // End resize
      fireEvent.mouseUp(document);
    });

    it('enforces minimum column width of 80px', () => {
      const onResize = vi.fn();
      const fieldsWithWidth = [
        {
          id: 'fld_test',
          name: 'Test Field',
          type: 'text' as const,
          visible: true,
          width: 100,
        },
      ];

      const { container } = render(
        <table>
          <TableHeader fields={fieldsWithWidth} onResize={onResize} />
        </table>
      );

      const resizeHandle = container.querySelector('.gitboard-table__resize-handle');

      // Start resize
      fireEvent.mouseDown(resizeHandle!, { clientX: 100 });

      // Try to resize below minimum (drag left)
      fireEvent.mouseMove(document, { clientX: 50 });

      // Should call onResize with minimum width (80px)
      expect(onResize).toHaveBeenCalled();
      const lastCall = onResize.mock.calls[onResize.mock.calls.length - 1];
      expect(lastCall[1]).toBe(80); // Minimum width

      // End resize
      fireEvent.mouseUp(document);
    });
  });
});
