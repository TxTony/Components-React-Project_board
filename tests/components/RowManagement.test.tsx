/**
 * Row Management Tests
 * Tests for adding and deleting rows
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GitBoardTable } from '../../src/components/GitBoardTable';
import { fields, rows } from '../../src/mocks/mockData';
import type { FilterConfig } from '../../src/types';

describe('Row Management', () => {
  describe('Add Item', () => {
    it('displays add item input at bottom of table', () => {
      render(<GitBoardTable fields={fields} rows={rows} />);

      const addInput = screen.getByPlaceholderText(/add item/i);
      expect(addInput).toBeInTheDocument();
    });

    it('adds new row when Enter pressed in add item input', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<GitBoardTable fields={fields} rows={rows} onChange={onChange} />);

      const addInput = screen.getByPlaceholderText(/add item/i);
      await user.type(addInput, 'New Task{Enter}');

      expect(onChange).toHaveBeenCalled();
      const updatedRows = onChange.mock.calls[0]?.[0];
      expect(updatedRows).toHaveLength(4); // Original 3 + 1 new
    });

    it('creates row with title from input', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<GitBoardTable fields={fields} rows={rows} onChange={onChange} />);

      const addInput = screen.getByPlaceholderText(/add item/i);
      await user.type(addInput, 'New Task{Enter}');

      const updatedRows = onChange.mock.calls[0]?.[0];
      const newRow = updatedRows[updatedRows.length - 1];

      expect(newRow).toBeDefined();
      expect(newRow?.id).toBeDefined();
      // Should have title field populated
      const titleField = fields.find((f) => f.type === 'title');
      if (titleField) {
        expect(newRow?.values[titleField.id]).toBe('New Task');
      }
    });

    it('clears input after adding row', async () => {
      const user = userEvent.setup();

      render(<GitBoardTable fields={fields} rows={rows} />);

      const addInput = screen.getByPlaceholderText(/add item/i) as HTMLInputElement;
      await user.type(addInput, 'New Task{Enter}');

      expect(addInput.value).toBe('');
    });

    it('does not add row when input is empty', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<GitBoardTable fields={fields} rows={rows} onChange={onChange} />);

      const addInput = screen.getByPlaceholderText(/add item/i);
      await user.type(addInput, '{Enter}');

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Add Item with Filter Auto-Fill', () => {
    it('auto-fills single-select field when filter with equals operator is active', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      // Set up a filter for Status field with equals operator
      const filters: FilterConfig[] = [
        { field: 'fld_status_c81f3', operator: 'equals', value: 'opt_status_done_77de' }
      ];

      // Find the status field to get its initial view configuration
      const statusField = fields.find((f) => f.id === 'fld_status_c81f3');
      
      render(
        <GitBoardTable 
          fields={fields} 
          rows={rows} 
          onChange={onChange}
          initialView={{ 
            id: 'view1', 
            name: 'Test View', 
            filters 
          }}
        />
      );

      const addInput = screen.getByPlaceholderText(/add item/i);
      await user.type(addInput, 'New Task{Enter}');

      expect(onChange).toHaveBeenCalled();
      const updatedRows = onChange.mock.calls[0]?.[0];
      const newRow = updatedRows[updatedRows.length - 1];

      // Check that the status field was auto-filled with the filter value
      expect(newRow?.values['fld_status_c81f3']).toBe('opt_status_done_77de');
      
      // Title should still be set
      const titleField = fields.find((f) => f.type === 'title');
      if (titleField) {
        expect(newRow?.values[titleField.id]).toBe('New Task');
      }
    });

    it('auto-fills assignee field when filter with contains operator is active', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      // Set up a filter for Owner/Assignee field with contains operator
      // Note: 'contains' operator uses label, not ID
      const filters: FilterConfig[] = [
        { field: 'fld_owner_19ad8', operator: 'contains', value: 'Tony Tip' }
      ];

      render(
        <GitBoardTable 
          fields={fields} 
          rows={rows} 
          onChange={onChange}
          initialView={{ 
            id: 'view1', 
            name: 'Test View', 
            filters 
          }}
        />
      );

      const addInput = screen.getByPlaceholderText(/add item/i);
      await user.type(addInput, 'New Task{Enter}');

      expect(onChange).toHaveBeenCalled();
      const updatedRows = onChange.mock.calls[0]?.[0];
      const newRow = updatedRows[updatedRows.length - 1];

      // Check that the owner field was auto-filled with the ID
      expect(newRow?.values['fld_owner_19ad8']).toBe('usr_tony_a19f2');
    });

    it('auto-fills multiple fields when multiple filters are active', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      // Set up multiple filters
      const filters: FilterConfig[] = [
        { field: 'fld_status_c81f3', operator: 'equals', value: 'opt_status_progress_29bb' },
        { field: 'fld_owner_19ad8', operator: 'equals', value: 'usr_tony_a19f2' }
      ];

      render(
        <GitBoardTable 
          fields={fields} 
          rows={rows} 
          onChange={onChange}
          initialView={{ 
            id: 'view1', 
            name: 'Test View', 
            filters 
          }}
        />
      );

      const addInput = screen.getByPlaceholderText(/add item/i);
      await user.type(addInput, 'New Task{Enter}');

      expect(onChange).toHaveBeenCalled();
      const updatedRows = onChange.mock.calls[0]?.[0];
      const newRow = updatedRows[updatedRows.length - 1];

      // Check that both fields were auto-filled
      expect(newRow?.values['fld_status_c81f3']).toBe('opt_status_progress_29bb');
      expect(newRow?.values['fld_owner_19ad8']).toBe('usr_tony_a19f2');
    });

    it('does not auto-fill when filter uses non-autofill operator', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      // Set up a filter with 'not-equals' operator (should not auto-fill)
      const filters: FilterConfig[] = [
        { field: 'fld_status_c81f3', operator: 'not-equals', value: 'opt_status_done_77de' }
      ];

      render(
        <GitBoardTable 
          fields={fields} 
          rows={rows} 
          onChange={onChange}
          initialView={{ 
            id: 'view1', 
            name: 'Test View', 
            filters 
          }}
        />
      );

      const addInput = screen.getByPlaceholderText(/add item/i);
      await user.type(addInput, 'New Task{Enter}');

      expect(onChange).toHaveBeenCalled();
      const updatedRows = onChange.mock.calls[0]?.[0];
      const newRow = updatedRows[updatedRows.length - 1];

      // Status field should NOT be auto-filled (undefined or not set)
      expect(newRow?.values['fld_status_c81f3']).toBeUndefined();
    });

    it('auto-fills select field with contains operator using label', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      // Test that 'contains' operator with label works for single-select fields
      const filters: FilterConfig[] = [
        { field: 'fld_status_c81f3', operator: 'contains', value: 'Done' }
      ];

      render(
        <GitBoardTable 
          fields={fields} 
          rows={rows} 
          onChange={onChange}
          initialView={{ 
            id: 'view1', 
            name: 'Test View', 
            filters 
          }}
        />
      );

      const addInput = screen.getByPlaceholderText(/add item/i);
      await user.type(addInput, 'New Task{Enter}');

      expect(onChange).toHaveBeenCalled();
      const updatedRows = onChange.mock.calls[0]?.[0];
      const newRow = updatedRows[updatedRows.length - 1];

      // Status field should be auto-filled with the option ID
      expect(newRow?.values['fld_status_c81f3']).toBe('opt_status_done_77de');
      // Title should still be from user input
      const titleField = fields.find((f) => f.type === 'title' || f.id === 'fld_title_aa12e');
      if (titleField) {
        expect(newRow?.values[titleField.id]).toBe('New Task');
      }
    });

    it('title field takes precedence over auto-fill from filter', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      // Get the title field
      const titleField = fields.find((f) => f.type === 'title');
      
      if (titleField) {
        // Try to auto-fill the title field via filter
        const filters: FilterConfig[] = [
          { field: titleField.id, operator: 'contains', value: 'filter value' }
        ];

        render(
          <GitBoardTable 
            fields={fields} 
            rows={rows} 
            onChange={onChange}
            initialView={{ 
              id: 'view1', 
              name: 'Test View', 
              filters 
            }}
          />
        );

        const addInput = screen.getByPlaceholderText(/add item/i);
        await user.type(addInput, 'New Task{Enter}');

        expect(onChange).toHaveBeenCalled();
        const updatedRows = onChange.mock.calls[0]?.[0];
        const newRow = updatedRows[updatedRows.length - 1];

        // Title should be from user input, not filter
        expect(newRow?.values[titleField.id]).toBe('New Task');
      }
    });

    it('uses first filter when multiple filters exist for same field', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      // Set up multiple filters for the same field
      const filters: FilterConfig[] = [
        { field: 'fld_status_c81f3', operator: 'equals', value: 'opt_status_done_77de' },
        { field: 'fld_status_c81f3', operator: 'equals', value: 'opt_status_todo_118a' }
      ];

      render(
        <GitBoardTable 
          fields={fields} 
          rows={rows} 
          onChange={onChange}
          initialView={{ 
            id: 'view1', 
            name: 'Test View', 
            filters 
          }}
        />
      );

      const addInput = screen.getByPlaceholderText(/add item/i);
      await user.type(addInput, 'New Task{Enter}');

      expect(onChange).toHaveBeenCalled();
      const updatedRows = onChange.mock.calls[0]?.[0];
      const newRow = updatedRows[updatedRows.length - 1];

      // Should use the first filter's value
      expect(newRow?.values['fld_status_c81f3']).toBe('opt_status_done_77de');
    });

    it('auto-fills number field when filter is active', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      // Find a number field
      const numberField = fields.find((f) => f.type === 'number');
      
      if (numberField) {
        const filters: FilterConfig[] = [
          { field: numberField.id, operator: 'equals', value: 5 }
        ];

        render(
          <GitBoardTable 
            fields={fields} 
            rows={rows} 
            onChange={onChange}
            initialView={{ 
              id: 'view1', 
              name: 'Test View', 
              filters 
            }}
          />
        );

        const addInput = screen.getByPlaceholderText(/add item/i);
        await user.type(addInput, 'New Task{Enter}');

        expect(onChange).toHaveBeenCalled();
        const updatedRows = onChange.mock.calls[0]?.[0];
        const newRow = updatedRows[updatedRows.length - 1];

        // Number field should be auto-filled
        expect(newRow?.values[numberField.id]).toBe(5);
      }
    });

    it('does not auto-fill when filter value is empty', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      
      // Set up a filter with empty value
      const filters: FilterConfig[] = [
        { field: 'fld_status_c81f3', operator: 'equals', value: '' }
      ];

      render(
        <GitBoardTable 
          fields={fields} 
          rows={rows} 
          onChange={onChange}
          initialView={{ 
            id: 'view1', 
            name: 'Test View', 
            filters 
          }}
        />
      );

      const addInput = screen.getByPlaceholderText(/add item/i);
      await user.type(addInput, 'New Task{Enter}');

      expect(onChange).toHaveBeenCalled();
      const updatedRows = onChange.mock.calls[0]?.[0];
      const newRow = updatedRows[updatedRows.length - 1];

      // Status field should NOT be auto-filled
      expect(newRow?.values['fld_status_c81f3']).toBeUndefined();
    });
  });

  describe('Row Selection', () => {
    it('displays clickable row numbers for row selection', () => {
      const { container } = render(<GitBoardTable fields={fields} rows={rows} />);

      const rowNumbers = container.querySelectorAll('.gitboard-table__cell--row-number');
      // 3 row number cells (one for each row)
      expect(rowNumbers.length).toBe(3);
    });

    it('selects individual row when row number clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(<GitBoardTable fields={fields} rows={rows} />);

      const rowNumbers = container.querySelectorAll('.gitboard-table__cell--row-number');
      const firstRowNumber = rowNumbers[0] as HTMLElement;

      await user.click(firstRowNumber);

      // Check if the row is selected by looking for selected class
      const firstRow = container.querySelector('[data-row-id="row_1_d1a9f"]');
      expect(firstRow).toHaveClass('gitboard-table__row--selected');
    });

    it('deselects row when row number clicked again', async () => {
      const user = userEvent.setup();
      const { container } = render(<GitBoardTable fields={fields} rows={rows} />);

      const rowNumbers = container.querySelectorAll('.gitboard-table__cell--row-number');
      const firstRowNumber = rowNumbers[0] as HTMLElement;

      // Select
      await user.click(firstRowNumber);
      // Deselect
      await user.click(firstRowNumber);

      const firstRow = container.querySelector('[data-row-id="row_1_d1a9f"]');
      expect(firstRow).not.toHaveClass('gitboard-table__row--selected');
    });
  });

  describe('Delete Rows', () => {
    it('displays delete button when rows selected', async () => {
      const user = userEvent.setup();
      const { container } = render(<GitBoardTable fields={fields} rows={rows} />);

      const rowNumbers = container.querySelectorAll('.gitboard-table__cell--row-number');
      await user.click(rowNumbers[0] as HTMLElement);

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton).toBeInTheDocument();
    });

    it('hides delete button when no rows selected', () => {
      render(<GitBoardTable fields={fields} rows={rows} />);

      const deleteButton = screen.queryByRole('button', { name: /delete/i });
      expect(deleteButton).not.toBeInTheDocument();
    });

    it('deletes selected rows when delete clicked', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(<GitBoardTable fields={fields} rows={rows} onChange={onChange} />);

      // Select first row
      const rowNumbers = container.querySelectorAll('.gitboard-table__cell--row-number');
      await user.click(rowNumbers[0] as HTMLElement);

      // Click delete
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      expect(onChange).toHaveBeenCalled();
      const updatedRows = onChange.mock.calls[0]?.[0];
      expect(updatedRows).toHaveLength(2); // 3 - 1 = 2
    });

    it('deletes multiple selected rows', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(<GitBoardTable fields={fields} rows={rows} onChange={onChange} />);

      // Select first two rows (use Ctrl+Click for multi-selection)
      const rowNumbers = container.querySelectorAll('.gitboard-table__cell--row-number');
      await user.click(rowNumbers[0] as HTMLElement);
      await user.click(rowNumbers[1] as HTMLElement, { ctrlKey: true });

      // Click delete
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      expect(onChange).toHaveBeenCalled();
      const updatedRows = onChange.mock.calls[0]?.[0];
      expect(updatedRows).toHaveLength(1); // 3 - 2 = 1
    });

    it('clears selection after deletion', async () => {
      const user = userEvent.setup();
      const { container } = render(<GitBoardTable fields={fields} rows={rows} />);

      // Select and delete
      const rowNumbers = container.querySelectorAll('.gitboard-table__cell--row-number');
      await user.click(rowNumbers[0] as HTMLElement);

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      // Delete button should disappear
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    });
  });

  describe('Selection count', () => {
    it('displays count of selected rows', async () => {
      const user = userEvent.setup();
      const { container } = render(<GitBoardTable fields={fields} rows={rows} />);

      const rowNumbers = container.querySelectorAll('.gitboard-table__cell--row-number');
      await user.click(rowNumbers[0] as HTMLElement);
      await user.click(rowNumbers[1] as HTMLElement, { ctrlKey: true });

      expect(screen.getByText(/2 selected/i)).toBeInTheDocument();
    });
  });
});
