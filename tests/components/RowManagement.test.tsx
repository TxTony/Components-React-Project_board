/**
 * Row Management Tests
 * Tests for adding and deleting rows
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GitBoardTable } from '../../src/components/GitBoardTable';
import { fields, rows } from '../../src/mocks/mockData';

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
