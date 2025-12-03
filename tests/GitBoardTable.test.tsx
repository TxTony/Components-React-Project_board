/**
 * GitBoardTable Component Tests
 * TDD approach - tests define expected behavior
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GitBoardTable } from '../src/components/GitBoardTable';
import { fields, rows } from '../src/mocks/mockData';

describe('GitBoardTable', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<GitBoardTable fields={fields} rows={rows} />);
      const table = screen.getByTestId('gitboard-table');
      expect(table).toBeInTheDocument();
    });

    it('has proper ARIA role', () => {
      render(<GitBoardTable fields={fields} rows={rows} />);
      const table = screen.getByRole('grid');
      expect(table).toBeInTheDocument();
    });

    it('renders table with correct number of column headers', () => {
      const { container } = render(<GitBoardTable fields={fields} rows={rows} />);
      const headers = container.querySelectorAll('th');
      expect(headers).toHaveLength(8); // All visible fields + selection checkbox column
    });

    it('renders table with correct number of data rows', () => {
      const { container } = render(<GitBoardTable fields={fields} rows={rows} />);
      const tbody = container.querySelector('tbody');
      const dataRows = tbody?.querySelectorAll('tr');
      expect(dataRows).toHaveLength(4); // 3 data rows + 1 add item row
    });

    it('applies light theme by default', () => {
      render(<GitBoardTable fields={fields} rows={rows} />);
      const table = screen.getByTestId('gitboard-table');
      expect(table).toHaveClass('light');
    });

    it('applies dark theme when specified', () => {
      render(<GitBoardTable fields={fields} rows={rows} theme="dark" />);
      const table = screen.getByTestId('gitboard-table');
      expect(table).toHaveClass('dark');
    });
  });

  describe('Props validation', () => {
    it('accepts empty fields array', () => {
      const { container } = render(<GitBoardTable fields={[]} rows={[]} />);
      const headers = container.querySelectorAll('th');
      expect(headers).toHaveLength(1); // Selection checkbox column
    });

    it('accepts empty rows array', () => {
      const { container } = render(<GitBoardTable fields={fields} rows={[]} />);
      const tbody = container.querySelector('tbody');
      const dataRows = tbody?.querySelectorAll('tr');
      expect(dataRows).toHaveLength(1); // Only add item row
    });

    it('renders with minimal required props', () => {
      const minimalFields = [
        {
          id: 'fld_1',
          name: 'Test Field',
          type: 'text' as const,
          visible: true,
        },
      ];
      const minimalRows = [
        {
          id: 'row_1',
          values: { fld_1: 'Test Value' },
        },
      ];

      render(<GitBoardTable fields={minimalFields} rows={minimalRows} />);
      expect(screen.getByTestId('gitboard-table')).toBeInTheDocument();
    });
  });

  describe('Cell Selection', () => {
    it('only allows one cell to be selected at a time', async () => {
      const user = userEvent.setup();
      const testFields = [
        {
          id: 'fld_status',
          name: 'Status',
          type: 'single-select' as const,
          visible: true,
          options: [
            { id: 'opt_todo', label: 'To Do' },
            { id: 'opt_done', label: 'Done' },
          ],
        },
        {
          id: 'fld_priority',
          name: 'Priority',
          type: 'single-select' as const,
          visible: true,
          options: [
            { id: 'opt_high', label: 'High' },
            { id: 'opt_low', label: 'Low' },
          ],
        },
      ];
      const testRows = [
        {
          id: 'row_1',
          values: { fld_status: 'opt_todo', fld_priority: 'opt_high' },
        },
        {
          id: 'row_2',
          values: { fld_status: 'opt_done', fld_priority: 'opt_low' },
        },
      ];

      const { container } = render(
        <GitBoardTable fields={testFields} rows={testRows} />
      );

      // Click on first cell (row 1, status column)
      const firstCell = screen.getAllByText('To Do')[0];
      await user.click(firstCell);

      // Verify first cell is selected
      let selectedCells = container.querySelectorAll('.ring-2');
      expect(selectedCells).toHaveLength(1);

      // Click on second cell (row 1, priority column)
      const secondCell = screen.getAllByText('High')[0];
      await user.click(secondCell);

      // Verify only second cell is selected (first cell should be deselected)
      selectedCells = container.querySelectorAll('.ring-2');
      expect(selectedCells).toHaveLength(1);

      // Click on third cell (row 2, status column)
      const thirdCell = screen.getAllByText('Done')[0];
      await user.click(thirdCell);

      // Verify only third cell is selected (previous cells should be deselected)
      selectedCells = container.querySelectorAll('.ring-2');
      expect(selectedCells).toHaveLength(1);
    });
  });

  describe('Column Reordering', () => {
    it('columns are draggable with reorder handler', () => {
      const testFields = [
        { id: 'fld_1', name: 'First', type: 'text' as const, visible: true },
        { id: 'fld_2', name: 'Second', type: 'text' as const, visible: true },
        { id: 'fld_3', name: 'Third', type: 'text' as const, visible: true },
      ];
      const testRows = [
        { id: 'row_1', values: { fld_1: 'A', fld_2: 'B', fld_3: 'C' } },
      ];

      const { container } = render(
        <GitBoardTable fields={testFields} rows={testRows} />
      );

      // Get initial column order
      const initialHeaders = Array.from(container.querySelectorAll('.gitboard-table__th'))
        .slice(1) // Skip checkbox column
        .map((th) => th.textContent);
      expect(initialHeaders).toEqual(['First', 'Second', 'Third']);

      // Verify columns have drag handlers attached
      const headers = container.querySelectorAll('.gitboard-table__th');
      const firstColumn = headers[1]; // Skip checkbox column

      expect(firstColumn.getAttribute('draggable')).toBe('true');
      expect(firstColumn.className).toContain('gitboard-table__th--draggable');
    });

  });

  describe('localStorage Persistence', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    afterEach(() => {
      localStorage.clear();
    });

    it('saves state to localStorage when tableId is provided', () => {
      const tableId = 'test-persistence';
      const testFields = [
        { id: 'fld_1', name: 'First', type: 'text' as const, visible: true },
        { id: 'fld_2', name: 'Second', type: 'text' as const, visible: true },
      ];

      render(<GitBoardTable fields={testFields} rows={[]} tableId={tableId} />);

      // Check that something was saved to localStorage
      const savedState = localStorage.getItem(`gitboard-table-${tableId}`);
      expect(savedState).toBeTruthy();

      // Parse and verify it contains expected structure
      const parsed = JSON.parse(savedState!);
      expect(parsed).toHaveProperty('fieldOrder');
      expect(parsed.fieldOrder).toEqual(['fld_1', 'fld_2']);
    });

    it('persists and restores sort configuration', async () => {
      const user = userEvent.setup();
      const tableId = 'test-sort-persistence';
      const testFields = [
        { id: 'fld_1', name: 'Name', type: 'text' as const, visible: true },
      ];
      const testRows = [
        { id: 'row_1', values: { fld_1: 'Zebra' } },
        { id: 'row_2', values: { fld_1: 'Apple' } },
      ];

      // First render - set sort
      const { unmount } = render(
        <GitBoardTable fields={testFields} rows={testRows} tableId={tableId} />
      );

      // Click header to sort
      const header = screen.getByText('Name');
      await user.click(header);

      unmount();

      // Second render - should restore sort
      const { container } = render(
        <GitBoardTable fields={testFields} rows={testRows} tableId={tableId} />
      );

      // Check for sort indicator
      const sortIndicator = container.querySelector('.gitboard-table__sort-indicator');
      expect(sortIndicator).not.toBeNull();
    });

    it('works without tableId (no persistence)', () => {
      const testFields = [
        { id: 'fld_1', name: 'Test', type: 'text' as const, visible: true },
      ];

      // Should not throw error when tableId is not provided
      expect(() => {
        render(<GitBoardTable fields={testFields} rows={[]} />);
      }).not.toThrow();

      // Should not save anything to localStorage
      const keys = Object.keys(localStorage);
      const gitboardKeys = keys.filter((k) => k.startsWith('gitboard-table-'));
      expect(gitboardKeys).toHaveLength(0);
    });
  });

  describe('View Management', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    afterEach(() => {
      localStorage.clear();
    });

    it('applies column visibility from view', async () => {
      const user = userEvent.setup();
      const testFields = [
        { id: 'fld_title', name: 'Title', type: 'text' as const, visible: true },
        { id: 'fld_status', name: 'Status', type: 'text' as const, visible: true },
        { id: 'fld_owner', name: 'Owner', type: 'text' as const, visible: true },
        { id: 'fld_points', name: 'Points', type: 'number' as const, visible: true },
      ];

      const testRows = [
        {
          id: 'row_1',
          values: {
            fld_title: 'Task 1',
            fld_status: 'In Progress',
            fld_owner: 'Alice',
            fld_points: 5,
          },
        },
      ];

      const testViews = [
        {
          id: 'view_all',
          name: 'All Columns',
          columns: ['fld_title', 'fld_status', 'fld_owner', 'fld_points'],
          sortBy: null,
          filters: [],
          groupBy: null,
        },
        {
          id: 'view_minimal',
          name: 'Minimal View',
          columns: ['fld_title', 'fld_status'], // Only 2 columns visible
          sortBy: null,
          filters: [],
          groupBy: null,
        },
      ];

      const { container } = render(
        <GitBoardTable
          fields={testFields}
          rows={testRows}
          views={testViews}
        />
      );

      // Initially, all columns should be visible (first view is default)
      let headers = Array.from(container.querySelectorAll('th'))
        .map((th) => th.textContent)
        .filter((text) => text && text !== ''); // Filter out empty checkbox column

      expect(headers).toContain('Title');
      expect(headers).toContain('Status');
      expect(headers).toContain('Owner');
      expect(headers).toContain('Points');

      // Switch to minimal view (only Title and Status should be visible)
      const minimalViewTab = screen.getByRole('tab', { name: /Minimal View/i });
      await user.click(minimalViewTab);

      // Re-query headers after view change
      headers = Array.from(container.querySelectorAll('th'))
        .map((th) => th.textContent)
        .filter((text) => text && text !== '');

      // Only Title and Status should be visible
      expect(headers).toContain('Title');
      expect(headers).toContain('Status');
      expect(headers).not.toContain('Owner');
      expect(headers).not.toContain('Points');
    });

    it('applies filters from view', async () => {
      const user = userEvent.setup();
      const testFields = [
        {
          id: 'fld_title',
          name: 'Title',
          type: 'text' as const,
          visible: true,
        },
        {
          id: 'fld_status',
          name: 'Status',
          type: 'single-select' as const,
          visible: true,
          options: [
            { id: 'opt_todo', label: 'Todo' },
            { id: 'opt_progress', label: 'In Progress' },
            { id: 'opt_done', label: 'Done' },
          ],
        },
      ];

      const testRows = [
        {
          id: 'row_1',
          values: { fld_title: 'Task 1', fld_status: 'opt_progress' },
        },
        {
          id: 'row_2',
          values: { fld_title: 'Task 2', fld_status: 'opt_done' },
        },
        {
          id: 'row_3',
          values: { fld_title: 'Task 3', fld_status: 'opt_progress' },
        },
      ];

      const testViews = [
        {
          id: 'view_all',
          name: 'All Tasks',
          columns: ['fld_title', 'fld_status'],
          sortBy: null,
          filters: [],
          groupBy: null,
        },
        {
          id: 'view_in_progress',
          name: 'In Progress',
          columns: ['fld_title', 'fld_status'],
          sortBy: null,
          filters: [
            { field: 'fld_status', operator: 'equals', value: 'opt_progress' },
          ],
          groupBy: null,
        },
      ];

      render(
        <GitBoardTable
          fields={testFields}
          rows={testRows}
          views={testViews}
        />
      );

      // Initially, should show all 3 rows
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
      expect(screen.getByText('Task 3')).toBeInTheDocument();

      // Should show "Showing 3 of 3 rows" or not show stats when no filters
      // (depends on implementation, but all rows should be visible)

      // Switch to "In Progress" view
      const inProgressTab = screen.getByRole('tab', { name: /In Progress/i });
      await user.click(inProgressTab);

      // Now should only show rows with status "In Progress" (Task 1 and Task 3)
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.queryByText('Task 2')).not.toBeInTheDocument(); // Task 2 is Done
      expect(screen.getByText('Task 3')).toBeInTheDocument();

      // Should show filter stats
      expect(screen.getByText(/Showing 2 of 3 rows/i)).toBeInTheDocument();
    });

    it('applies both column visibility and filters together', async () => {
      const user = userEvent.setup();
      const testFields = [
        { id: 'fld_title', name: 'Title', type: 'text' as const, visible: true },
        { id: 'fld_status', name: 'Status', type: 'single-select' as const, visible: true,
          options: [
            { id: 'opt_todo', label: 'Todo' },
            { id: 'opt_done', label: 'Done' },
          ],
        },
        { id: 'fld_owner', name: 'Owner', type: 'text' as const, visible: true },
      ];

      const testRows = [
        { id: 'row_1', values: { fld_title: 'Task 1', fld_status: 'opt_todo', fld_owner: 'Alice' } },
        { id: 'row_2', values: { fld_title: 'Task 2', fld_status: 'opt_done', fld_owner: 'Bob' } },
      ];

      const testViews = [
        {
          id: 'view_all',
          name: 'All',
          columns: ['fld_title', 'fld_status', 'fld_owner'],
          sortBy: null,
          filters: [],
          groupBy: null,
        },
        {
          id: 'view_filtered',
          name: 'Filtered',
          columns: ['fld_title', 'fld_status'], // Hide Owner column
          sortBy: null,
          filters: [{ field: 'fld_status', operator: 'equals', value: 'opt_todo' }],
          groupBy: null,
        },
      ];

      const { container } = render(
        <GitBoardTable fields={testFields} rows={testRows} views={testViews} />
      );

      // Switch to filtered view
      const filteredTab = screen.getByRole('tab', { name: /Filtered/i });
      await user.click(filteredTab);

      // Verify column visibility: Owner column should be hidden
      const headers = Array.from(container.querySelectorAll('th'))
        .map((th) => th.textContent)
        .filter((text) => text && text !== '');

      expect(headers).toContain('Title');
      expect(headers).toContain('Status');
      expect(headers).not.toContain('Owner');

      // Verify filters applied: only Task 1 (todo) should be visible
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.queryByText('Task 2')).not.toBeInTheDocument();
    });

    it('switches between views with different column configurations', async () => {
      const user = userEvent.setup();
      const testFields = [
        { id: 'fld_1', name: 'Column 1', type: 'text' as const, visible: true },
        { id: 'fld_2', name: 'Column 2', type: 'text' as const, visible: true },
        { id: 'fld_3', name: 'Column 3', type: 'text' as const, visible: true },
      ];

      const testRows = [
        { id: 'row_1', values: { fld_1: 'A', fld_2: 'B', fld_3: 'C' } },
      ];

      const testViews = [
        {
          id: 'view_1_2',
          name: 'View 1+2',
          columns: ['fld_1', 'fld_2'],
          sortBy: null,
          filters: [],
          groupBy: null,
        },
        {
          id: 'view_2_3',
          name: 'View 2+3',
          columns: ['fld_2', 'fld_3'],
          sortBy: null,
          filters: [],
          groupBy: null,
        },
      ];

      const { container } = render(
        <GitBoardTable fields={testFields} rows={testRows} views={testViews} />
      );

      // Initially: View 1+2 (Column 1 and Column 2 visible, Column 3 hidden)
      let headers = Array.from(container.querySelectorAll('th'))
        .map((th) => th.textContent)
        .filter((text) => text && text !== '');

      expect(headers).toContain('Column 1');
      expect(headers).toContain('Column 2');
      expect(headers).not.toContain('Column 3');

      // Switch to View 2+3
      const view23Tab = screen.getByRole('tab', { name: /View 2\+3/i });
      await user.click(view23Tab);

      // Now: Column 1 should be hidden, Column 2 and Column 3 visible
      headers = Array.from(container.querySelectorAll('th'))
        .map((th) => th.textContent)
        .filter((text) => text && text !== '');

      expect(headers).not.toContain('Column 1');
      expect(headers).toContain('Column 2');
      expect(headers).toContain('Column 3');
    });

    it('calls onViewChange callback when view is changed', async () => {
      const user = userEvent.setup();
      const onViewChange = vi.fn();

      const testFields = [
        { id: 'fld_1', name: 'Field 1', type: 'text' as const, visible: true },
      ];

      const testViews = [
        {
          id: 'view_a',
          name: 'View A',
          columns: ['fld_1'],
          sortBy: null,
          filters: [],
          groupBy: null,
        },
        {
          id: 'view_b',
          name: 'View B',
          columns: ['fld_1'],
          sortBy: null,
          filters: [],
          groupBy: null,
        },
      ];

      render(
        <GitBoardTable
          fields={testFields}
          rows={[]}
          views={testViews}
          onViewChange={onViewChange}
        />
      );

      // Click on View B
      const viewBTab = screen.getByRole('tab', { name: /View B/i });
      await user.click(viewBTab);

      // Verify callback was called with the view object
      expect(onViewChange).toHaveBeenCalledTimes(1);
      expect(onViewChange).toHaveBeenCalledWith(testViews[1]);
    });
  });
});
