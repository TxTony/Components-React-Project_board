/**
 * Row Selection Tests
 * Tests for single, multi, and range selection features
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GitBoardTable } from '@/components/GitBoardTable';
import type { FieldDefinition, Row, RowSelectionEvent } from '@/types';

const mockFields: FieldDefinition[] = [
  {
    id: 'title',
    name: 'Title',
    type: 'title',
    visible: true,
  },
  {
    id: 'status',
    name: 'Status',
    type: 'single-select',
    visible: true,
    options: [
      { id: 'todo', label: 'To Do', color: 'gray' },
      { id: 'in-progress', label: 'In Progress', color: 'blue' },
      { id: 'done', label: 'Done', color: 'green' },
    ],
  },
];

const mockRows: Row[] = [
  { id: 'row-1', values: { title: 'Task 1', status: 'todo' } },
  { id: 'row-2', values: { title: 'Task 2', status: 'in-progress' } },
  { id: 'row-3', values: { title: 'Task 3', status: 'todo' } },
  { id: 'row-4', values: { title: 'Task 4', status: 'done' } },
  { id: 'row-5', values: { title: 'Task 5', status: 'todo' } },
];

describe('Row Selection', () => {
  describe('Single Selection', () => {
    it('should select a single row when clicked', () => {
      const onRowSelect = vi.fn();
      render(
        <GitBoardTable
          fields={mockFields}
          rows={mockRows}
          onRowSelect={onRowSelect}
        />
      );

      // Find and click the first row number
      const rowNumbers = screen.getAllByText('1');
      const firstRowNumber = rowNumbers.find(el =>
        el.parentElement?.classList.contains('gitboard-table__row-number')
      );

      if (firstRowNumber) {
        fireEvent.click(firstRowNumber.parentElement!);
      }

      // Verify onRowSelect was called with correct data
      expect(onRowSelect).toHaveBeenCalled();
      const lastCall = onRowSelect.mock.calls[onRowSelect.mock.calls.length - 1][0] as RowSelectionEvent;
      expect(lastCall.selectedRowIds).toEqual(['row-1']);
      expect(lastCall.selectedRows).toHaveLength(1);
      expect(lastCall.selectedRows[0].id).toBe('row-1');
      expect(lastCall.lastAction).toBe('select');
    });

    it('should deselect a row when clicking it again', () => {
      const onRowSelect = vi.fn();
      render(
        <GitBoardTable
          fields={mockFields}
          rows={mockRows}
          onRowSelect={onRowSelect}
        />
      );

      const rowNumbers = screen.getAllByText('1');
      const firstRowNumber = rowNumbers.find(el =>
        el.parentElement?.classList.contains('gitboard-table__row-number')
      );

      if (firstRowNumber) {
        // First click to select
        fireEvent.click(firstRowNumber.parentElement!);
        // Second click to deselect
        fireEvent.click(firstRowNumber.parentElement!);
      }

      // Verify last call was deselect
      const lastCall = onRowSelect.mock.calls[onRowSelect.mock.calls.length - 1][0] as RowSelectionEvent;
      expect(lastCall.selectedRowIds).toEqual([]);
      expect(lastCall.lastAction).toBe('deselect');
    });

    it('should clear previous selection when clicking another row without modifiers', () => {
      const onRowSelect = vi.fn();
      render(
        <GitBoardTable
          fields={mockFields}
          rows={mockRows}
          onRowSelect={onRowSelect}
        />
      );

      // Click first row
      const firstRowNumber = screen.getAllByText('1').find(el =>
        el.parentElement?.classList.contains('gitboard-table__row-number')
      );
      if (firstRowNumber) {
        fireEvent.click(firstRowNumber.parentElement!);
      }

      // Click second row
      const secondRowNumber = screen.getAllByText('2').find(el =>
        el.parentElement?.classList.contains('gitboard-table__row-number')
      );
      if (secondRowNumber) {
        fireEvent.click(secondRowNumber.parentElement!);
      }

      // Verify only second row is selected
      const lastCall = onRowSelect.mock.calls[onRowSelect.mock.calls.length - 1][0] as RowSelectionEvent;
      expect(lastCall.selectedRowIds).toEqual(['row-2']);
      expect(lastCall.lastAction).toBe('select');
    });
  });

  describe('Multi-Selection (Ctrl+Click)', () => {
    it('should add row to selection when Ctrl+Click', () => {
      const onRowSelect = vi.fn();
      render(
        <GitBoardTable
          fields={mockFields}
          rows={mockRows}
          onRowSelect={onRowSelect}
        />
      );

      // Click first row
      const firstRowNumber = screen.getAllByText('1').find(el =>
        el.parentElement?.classList.contains('gitboard-table__row-number')
      );
      if (firstRowNumber) {
        fireEvent.click(firstRowNumber.parentElement!);
      }

      // Ctrl+Click second row
      const secondRowNumber = screen.getAllByText('2').find(el =>
        el.parentElement?.classList.contains('gitboard-table__row-number')
      );
      if (secondRowNumber) {
        fireEvent.click(secondRowNumber.parentElement!, { ctrlKey: true });
      }

      // Verify both rows are selected
      const lastCall = onRowSelect.mock.calls[onRowSelect.mock.calls.length - 1][0] as RowSelectionEvent;
      expect(lastCall.selectedRowIds).toContain('row-1');
      expect(lastCall.selectedRowIds).toContain('row-2');
      expect(lastCall.selectedRowIds).toHaveLength(2);
      expect(lastCall.lastAction).toBe('multi');
    });

    it('should work with Cmd+Click on Mac', () => {
      const onRowSelect = vi.fn();
      render(
        <GitBoardTable
          fields={mockFields}
          rows={mockRows}
          onRowSelect={onRowSelect}
        />
      );

      // Click first row
      const firstRowNumber = screen.getAllByText('1').find(el =>
        el.parentElement?.classList.contains('gitboard-table__row-number')
      );
      if (firstRowNumber) {
        fireEvent.click(firstRowNumber.parentElement!);
      }

      // Cmd+Click second row (metaKey for Mac)
      const secondRowNumber = screen.getAllByText('2').find(el =>
        el.parentElement?.classList.contains('gitboard-table__row-number')
      );
      if (secondRowNumber) {
        fireEvent.click(secondRowNumber.parentElement!, { metaKey: true });
      }

      // Verify both rows are selected
      const lastCall = onRowSelect.mock.calls[onRowSelect.mock.calls.length - 1][0] as RowSelectionEvent;
      expect(lastCall.selectedRowIds).toContain('row-1');
      expect(lastCall.selectedRowIds).toContain('row-2');
    });
  });

  describe('Range Selection (Shift+Click)', () => {
    it('should select range of rows when Shift+Click', () => {
      const onRowSelect = vi.fn();
      render(
        <GitBoardTable
          fields={mockFields}
          rows={mockRows}
          onRowSelect={onRowSelect}
        />
      );

      // Click first row (row 1)
      const firstRowNumber = screen.getAllByText('1').find(el =>
        el.parentElement?.classList.contains('gitboard-table__row-number')
      );
      if (firstRowNumber) {
        fireEvent.click(firstRowNumber.parentElement!);
      }

      // Shift+Click third row (row 3)
      const thirdRowNumber = screen.getAllByText('3').find(el =>
        el.parentElement?.classList.contains('gitboard-table__row-number')
      );
      if (thirdRowNumber) {
        fireEvent.click(thirdRowNumber.parentElement!, { shiftKey: true });
      }

      // Verify rows 1, 2, 3 are selected
      const lastCall = onRowSelect.mock.calls[onRowSelect.mock.calls.length - 1][0] as RowSelectionEvent;
      expect(lastCall.selectedRowIds).toContain('row-1');
      expect(lastCall.selectedRowIds).toContain('row-2');
      expect(lastCall.selectedRowIds).toContain('row-3');
      expect(lastCall.selectedRowIds).toHaveLength(3);
      expect(lastCall.lastAction).toBe('range');
    });

    it('should select range in reverse order (bottom to top)', () => {
      const onRowSelect = vi.fn();
      render(
        <GitBoardTable
          fields={mockFields}
          rows={mockRows}
          onRowSelect={onRowSelect}
        />
      );

      // Click fourth row (row 4)
      const fourthRowNumber = screen.getAllByText('4').find(el =>
        el.parentElement?.classList.contains('gitboard-table__row-number')
      );
      if (fourthRowNumber) {
        fireEvent.click(fourthRowNumber.parentElement!);
      }

      // Shift+Click second row (row 2)
      const secondRowNumber = screen.getAllByText('2').find(el =>
        el.parentElement?.classList.contains('gitboard-table__row-number')
      );
      if (secondRowNumber) {
        fireEvent.click(secondRowNumber.parentElement!, { shiftKey: true });
      }

      // Verify rows 2, 3, 4 are selected
      const lastCall = onRowSelect.mock.calls[onRowSelect.mock.calls.length - 1][0] as RowSelectionEvent;
      expect(lastCall.selectedRowIds).toContain('row-2');
      expect(lastCall.selectedRowIds).toContain('row-3');
      expect(lastCall.selectedRowIds).toContain('row-4');
      expect(lastCall.selectedRowIds).toHaveLength(3);
      expect(lastCall.lastAction).toBe('range');
    });

    it('should select all rows when Shift+Click from first to last', () => {
      const onRowSelect = vi.fn();
      render(
        <GitBoardTable
          fields={mockFields}
          rows={mockRows}
          onRowSelect={onRowSelect}
        />
      );

      // Click first row
      const firstRowNumber = screen.getAllByText('1').find(el =>
        el.parentElement?.classList.contains('gitboard-table__row-number')
      );
      if (firstRowNumber) {
        fireEvent.click(firstRowNumber.parentElement!);
      }

      // Shift+Click last row (row 5)
      const fifthRowNumber = screen.getAllByText('5').find(el =>
        el.parentElement?.classList.contains('gitboard-table__row-number')
      );
      if (fifthRowNumber) {
        fireEvent.click(fifthRowNumber.parentElement!, { shiftKey: true });
      }

      // Verify all 5 rows are selected
      const lastCall = onRowSelect.mock.calls[onRowSelect.mock.calls.length - 1][0] as RowSelectionEvent;
      expect(lastCall.selectedRowIds).toHaveLength(5);
      expect(lastCall.lastAction).toBe('range');
    });

    it('should maintain anchor point when extending range with Shift+Click', () => {
      const onRowSelect = vi.fn();
      render(
        <GitBoardTable
          fields={mockFields}
          rows={mockRows}
          onRowSelect={onRowSelect}
        />
      );

      // Click second row (anchor)
      const secondRowNumber = screen.getAllByText('2').find(el =>
        el.parentElement?.classList.contains('gitboard-table__row-number')
      );
      if (secondRowNumber) {
        fireEvent.click(secondRowNumber.parentElement!);
      }

      // Shift+Click fourth row (select 2-4)
      const fourthRowNumber = screen.getAllByText('4').find(el =>
        el.parentElement?.classList.contains('gitboard-table__row-number')
      );
      if (fourthRowNumber) {
        fireEvent.click(fourthRowNumber.parentElement!, { shiftKey: true });
      }

      // Verify rows 2, 3, 4 selected
      let lastCall = onRowSelect.mock.calls[onRowSelect.mock.calls.length - 1][0] as RowSelectionEvent;
      expect(lastCall.selectedRowIds).toHaveLength(3);

      // Shift+Click first row (should select 1-2 from anchor)
      const firstRowNumber = screen.getAllByText('1').find(el =>
        el.parentElement?.classList.contains('gitboard-table__row-number')
      );
      if (firstRowNumber) {
        fireEvent.click(firstRowNumber.parentElement!, { shiftKey: true });
      }

      // Verify rows 1, 2 selected (anchor maintained at 2)
      lastCall = onRowSelect.mock.calls[onRowSelect.mock.calls.length - 1][0] as RowSelectionEvent;
      expect(lastCall.selectedRowIds).toContain('row-1');
      expect(lastCall.selectedRowIds).toContain('row-2');
    });
  });

  describe('Combined Selection Modes', () => {
    it('should combine Ctrl+Click and Shift+Click for complex selections', () => {
      const onRowSelect = vi.fn();
      render(
        <GitBoardTable
          fields={mockFields}
          rows={mockRows}
          onRowSelect={onRowSelect}
        />
      );

      // Select row 1
      const firstRowNumber = screen.getAllByText('1').find(el =>
        el.parentElement?.classList.contains('gitboard-table__row-number')
      );
      if (firstRowNumber) {
        fireEvent.click(firstRowNumber.parentElement!);
      }

      // Shift+Click row 2 (select range 1-2)
      const secondRowNumber = screen.getAllByText('2').find(el =>
        el.parentElement?.classList.contains('gitboard-table__row-number')
      );
      if (secondRowNumber) {
        fireEvent.click(secondRowNumber.parentElement!, { shiftKey: true });
      }

      // Ctrl+Click row 4 (add to selection)
      const fourthRowNumber = screen.getAllByText('4').find(el =>
        el.parentElement?.classList.contains('gitboard-table__row-number')
      );
      if (fourthRowNumber) {
        fireEvent.click(fourthRowNumber.parentElement!, { ctrlKey: true });
      }

      // Verify rows 1, 2, 4 are selected
      const lastCall = onRowSelect.mock.calls[onRowSelect.mock.calls.length - 1][0] as RowSelectionEvent;
      expect(lastCall.selectedRowIds).toContain('row-1');
      expect(lastCall.selectedRowIds).toContain('row-2');
      expect(lastCall.selectedRowIds).toContain('row-4');
      expect(lastCall.selectedRowIds).toHaveLength(3);
    });
  });

  describe('Event Payload', () => {
    it('should include full row objects in selection event', () => {
      const onRowSelect = vi.fn();
      render(
        <GitBoardTable
          fields={mockFields}
          rows={mockRows}
          onRowSelect={onRowSelect}
        />
      );

      // Select first row
      const firstRowNumber = screen.getAllByText('1').find(el =>
        el.parentElement?.classList.contains('gitboard-table__row-number')
      );
      if (firstRowNumber) {
        fireEvent.click(firstRowNumber.parentElement!);
      }

      const event = onRowSelect.mock.calls[onRowSelect.mock.calls.length - 1][0] as RowSelectionEvent;

      // Verify full row object is included
      expect(event.selectedRows).toHaveLength(1);
      expect(event.selectedRows[0]).toMatchObject({
        id: 'row-1',
        values: { title: 'Task 1', status: 'todo' },
      });
    });

    it('should include correct action type in event', () => {
      const onRowSelect = vi.fn();
      render(
        <GitBoardTable
          fields={mockFields}
          rows={mockRows}
          onRowSelect={onRowSelect}
        />
      );

      // Test each action type
      const firstRowNumber = screen.getAllByText('1').find(el =>
        el.parentElement?.classList.contains('gitboard-table__row-number')
      );

      // Select
      if (firstRowNumber) {
        fireEvent.click(firstRowNumber.parentElement!);
      }
      expect((onRowSelect.mock.calls[onRowSelect.mock.calls.length - 1][0] as RowSelectionEvent).lastAction).toBe('select');

      // Multi
      const secondRowNumber = screen.getAllByText('2').find(el =>
        el.parentElement?.classList.contains('gitboard-table__row-number')
      );
      if (secondRowNumber) {
        fireEvent.click(secondRowNumber.parentElement!, { ctrlKey: true });
      }
      expect((onRowSelect.mock.calls[onRowSelect.mock.calls.length - 1][0] as RowSelectionEvent).lastAction).toBe('multi');

      // Range
      const thirdRowNumber = screen.getAllByText('3').find(el =>
        el.parentElement?.classList.contains('gitboard-table__row-number')
      );
      if (thirdRowNumber) {
        fireEvent.click(thirdRowNumber.parentElement!, { shiftKey: true });
      }
      expect((onRowSelect.mock.calls[onRowSelect.mock.calls.length - 1][0] as RowSelectionEvent).lastAction).toBe('range');
    });
  });
});
