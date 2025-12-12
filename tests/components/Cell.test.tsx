/**
 * Cell Component Tests
 * Tests for cell rendering and inline editing behavior
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Cell } from '../../src/components/Table/Cell';

describe('Cell', () => {
  describe('Display mode', () => {
    it('renders text value correctly', () => {
      const field = { id: 'fld_1', name: 'Title', type: 'text' as const, visible: true };
      render(
        <table>
          <tbody>
            <tr>
              <Cell field={field} value="Test Value" rowId="row_1" />
            </tr>
          </tbody>
        </table>
      );

      expect(screen.getByText('Test Value')).toBeInTheDocument();
    });

    it('renders number value correctly', () => {
      const field = { id: 'fld_1', name: 'Points', type: 'number' as const, visible: true };
      render(
        <table>
          <tbody>
            <tr>
              <Cell field={field} value={42} rowId="row_1" />
            </tr>
          </tbody>
        </table>
      );

      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('renders null as em dash placeholder', () => {
      const field = { id: 'fld_1', name: 'Title', type: 'text' as const, visible: true };
      const { container } = render(
        <table>
          <tbody>
            <tr>
              <Cell field={field} value={null} rowId="row_1" />
            </tr>
          </tbody>
        </table>
      );

      const cell = container.querySelector('td');
      expect(cell?.textContent).toBe('—');
    });

    it('renders select option label instead of ID', () => {
      const field = {
        id: 'fld_1',
        name: 'Status',
        type: 'single-select' as const,
        visible: true,
        options: [
          { id: 'opt_1', label: 'In Progress' },
          { id: 'opt_2', label: 'Done' },
        ],
      };

      render(
        <table>
          <tbody>
            <tr>
              <Cell field={field} value="opt_1" rowId="row_1" />
            </tr>
          </tbody>
        </table>
      );

      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });
  });

  describe('Edit mode - Text fields', () => {
    it('enters edit mode when double-clicked', async () => {
      const user = userEvent.setup();
      const field = { id: 'fld_1', name: 'Title', type: 'text' as const, visible: true };
      const onEdit = vi.fn();

      render(
        <table>
          <tbody>
            <tr>
              <Cell field={field} value="Original" rowId="row_1" onEdit={onEdit} />
            </tr>
          </tbody>
        </table>
      );

      const cellContent = screen.getByText('Original');
      await user.dblClick(cellContent);

      // Should show an input field
      const input = screen.getByDisplayValue('Original');
      expect(input).toBeInTheDocument();
      expect(input).toHaveFocus();
    });

    it('commits value on Enter key', async () => {
      const user = userEvent.setup();
      const field = { id: 'fld_1', name: 'Title', type: 'text' as const, visible: true };
      const onEdit = vi.fn();

      render(
        <table>
          <tbody>
            <tr>
              <Cell field={field} value="Original" rowId="row_1" onEdit={onEdit} />
            </tr>
          </tbody>
        </table>
      );

      const cellContent = screen.getByText('Original');
      await user.dblClick(cellContent);

      const input = screen.getByDisplayValue('Original');
      await user.clear(input);
      await user.type(input, 'New Value');
      await user.keyboard('{Enter}');

      expect(onEdit).toHaveBeenCalledWith({
        rowId: 'row_1',
        fieldId: 'fld_1',
        value: 'New Value',
      });
    });

    it('cancels edit on Escape key', async () => {
      const user = userEvent.setup();
      const field = { id: 'fld_1', name: 'Title', type: 'text' as const, visible: true };
      const onEdit = vi.fn();

      render(
        <table>
          <tbody>
            <tr>
              <Cell field={field} value="Original" rowId="row_1" onEdit={onEdit} />
            </tr>
          </tbody>
        </table>
      );

      const cellContent = screen.getByText('Original');
      await user.dblClick(cellContent);

      const input = screen.getByDisplayValue('Original');
      await user.clear(input);
      await user.type(input, 'Changed');
      await user.keyboard('{Escape}');

      // Should not call onEdit
      expect(onEdit).not.toHaveBeenCalled();

      // Should show original value
      expect(screen.getByText('Original')).toBeInTheDocument();
    });

    it('commits value on blur', async () => {
      const user = userEvent.setup();
      const field = { id: 'fld_1', name: 'Title', type: 'text' as const, visible: true };
      const onEdit = vi.fn();

      render(
        <div>
          <table>
            <tbody>
              <tr>
                <Cell field={field} value="Original" rowId="row_1" onEdit={onEdit} />
              </tr>
            </tbody>
          </table>
          <button>Outside</button>
        </div>
      );

      const cellContent = screen.getByText('Original');
      await user.dblClick(cellContent);

      const input = screen.getByDisplayValue('Original');
      await user.clear(input);
      await user.type(input, 'Modified');

      // Click outside to trigger blur
      const outsideButton = screen.getByText('Outside');
      await user.click(outsideButton);

      expect(onEdit).toHaveBeenCalledWith({
        rowId: 'row_1',
        fieldId: 'fld_1',
        value: 'Modified',
      });
    });

    it('does not commit if value unchanged', async () => {
      const user = userEvent.setup();
      const field = { id: 'fld_1', name: 'Title', type: 'text' as const, visible: true };
      const onEdit = vi.fn();

      render(
        <table>
          <tbody>
            <tr>
              <Cell field={field} value="Original" rowId="row_1" onEdit={onEdit} />
            </tr>
          </tbody>
        </table>
      );

      const cellContent = screen.getByText('Original');
      await user.dblClick(cellContent);

      const input = screen.getByDisplayValue('Original');
      await user.keyboard('{Enter}');

      // Should not call onEdit if value didn't change
      expect(onEdit).not.toHaveBeenCalled();
    });
  });

  describe('Edit mode - Number fields', () => {
    it('only allows numeric input', async () => {
      const user = userEvent.setup();
      const field = { id: 'fld_1', name: 'Points', type: 'number' as const, visible: true };
      const onEdit = vi.fn();

      render(
        <table>
          <tbody>
            <tr>
              <Cell field={field} value={5} rowId="row_1" onEdit={onEdit} />
            </tr>
          </tbody>
        </table>
      );

      const cellContent = screen.getByText('5');
      await user.dblClick(cellContent);

      const input = screen.getByDisplayValue('5') as HTMLInputElement;
      expect(input.type).toBe('number');
    });

    it('commits numeric value', async () => {
      const user = userEvent.setup();
      const field = { id: 'fld_1', name: 'Points', type: 'number' as const, visible: true };
      const onEdit = vi.fn();

      render(
        <table>
          <tbody>
            <tr>
              <Cell field={field} value={5} rowId="row_1" onEdit={onEdit} />
            </tr>
          </tbody>
        </table>
      );

      const cellContent = screen.getByText('5');
      await user.dblClick(cellContent);

      const input = screen.getByDisplayValue('5');
      await user.clear(input);
      await user.type(input, '10');
      await user.keyboard('{Enter}');

      expect(onEdit).toHaveBeenCalledWith({
        rowId: 'row_1',
        fieldId: 'fld_1',
        value: 10,
      });
    });

    it('allows empty value for numbers', async () => {
      const user = userEvent.setup();
      const field = { id: 'fld_1', name: 'Points', type: 'number' as const, visible: true };
      const onEdit = vi.fn();

      render(
        <table>
          <tbody>
            <tr>
              <Cell field={field} value={5} rowId="row_1" onEdit={onEdit} />
            </tr>
          </tbody>
        </table>
      );

      const cellContent = screen.getByText('5');
      await user.dblClick(cellContent);

      const input = screen.getByDisplayValue('5');
      await user.clear(input);
      await user.keyboard('{Enter}');

      expect(onEdit).toHaveBeenCalledWith({
        rowId: 'row_1',
        fieldId: 'fld_1',
        value: null,
      });
    });
  });

  describe('Read-only behavior', () => {
    it('does not enter edit mode when readOnly is true', async () => {
      const user = userEvent.setup();
      const field = { id: 'fld_1', name: 'Title', type: 'text' as const, visible: true };

      render(
        <table>
          <tbody>
            <tr>
              <Cell field={field} value="Read Only" rowId="row_1" readOnly />
            </tr>
          </tbody>
        </table>
      );

      const cellContent = screen.getByText('Read Only');
      await user.click(cellContent);

      // Should not show input
      expect(screen.queryByDisplayValue('Read Only')).not.toBeInTheDocument();
    });
  });

  describe('Click behavior - Select fields', () => {
    it('single click selects cell without opening dropdown for single-select', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      const field = {
        id: 'fld_status',
        name: 'Status',
        type: 'single-select' as const,
        visible: true,
        options: [
          { id: 'opt_todo', label: 'To Do' },
          { id: 'opt_done', label: 'Done' },
        ],
      };

      const { rerender, container } = render(
        <table>
          <tbody>
            <tr>
              <Cell field={field} value="opt_todo" rowId="row_1" onSelect={onSelect} />
            </tr>
          </tbody>
        </table>
      );

      const cellContent = screen.getByText('To Do');
      await user.click(cellContent);

      // onSelect should be called with correct parameters
      expect(onSelect).toHaveBeenCalledWith('row_1', 'fld_status');

      // Dropdown should NOT be open (no listbox role visible)
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

      // Re-render with isSelected=true to verify visual feedback
      rerender(
        <table>
          <tbody>
            <tr>
              <Cell field={field} value="opt_todo" rowId="row_1" onSelect={onSelect} isSelected={true} />
            </tr>
          </tbody>
        </table>
      );

      // Cell should now have ring class
      const cell = container.querySelector('td');
      expect(cell?.className).toContain('ring');
    });

    it('double click opens dropdown for single-select', async () => {
      const user = userEvent.setup();
      const field = {
        id: 'fld_status',
        name: 'Status',
        type: 'single-select' as const,
        visible: true,
        options: [
          { id: 'opt_todo', label: 'To Do' },
          { id: 'opt_done', label: 'Done' },
        ],
      };

      render(
        <table>
          <tbody>
            <tr>
              <Cell field={field} value="opt_todo" rowId="row_1" />
            </tr>
          </tbody>
        </table>
      );

      const cellContent = screen.getByText('To Do');
      await user.dblClick(cellContent);

      // Dropdown should be open
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
    });

    it('click on caret opens dropdown for single-select', async () => {
      const user = userEvent.setup();
      const field = {
        id: 'fld_status',
        name: 'Status',
        type: 'single-select' as const,
        visible: true,
        options: [
          { id: 'opt_todo', label: 'To Do' },
          { id: 'opt_done', label: 'Done' },
        ],
      };

      render(
        <table>
          <tbody>
            <tr>
              <Cell field={field} value="opt_todo" rowId="row_1" />
            </tr>
          </tbody>
        </table>
      );

      // Click on the caret button
      const caretButton = screen.getByLabelText('Open dropdown');
      await user.click(caretButton);

      // Dropdown should be open
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
    });

    it('single click selects cell without opening dropdown for multi-select', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      const field = {
        id: 'fld_tags',
        name: 'Tags',
        type: 'multi-select' as const,
        visible: true,
        options: [
          { id: 'tag_bug', label: 'Bug' },
          { id: 'tag_feature', label: 'Feature' },
        ],
      };

      const { rerender, container } = render(
        <table>
          <tbody>
            <tr>
              <Cell field={field} value={['tag_bug']} rowId="row_1" onSelect={onSelect} />
            </tr>
          </tbody>
        </table>
      );

      const cellContent = screen.getByText('Bug');
      await user.click(cellContent);

      // onSelect should be called with correct parameters
      expect(onSelect).toHaveBeenCalledWith('row_1', 'fld_tags');

      // Dropdown should NOT be open
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

      // Re-render with isSelected=true to verify visual feedback
      rerender(
        <table>
          <tbody>
            <tr>
              <Cell field={field} value={['tag_bug']} rowId="row_1" onSelect={onSelect} isSelected={true} />
            </tr>
          </tbody>
        </table>
      );

      // Cell should now have ring class
      const cell = container.querySelector('td');
      expect(cell?.className).toContain('ring');
    });

    it('shows caret for assignee fields', () => {
      const field = {
        id: 'fld_assignee',
        name: 'Assignee',
        type: 'assignee' as const,
        visible: true,
        options: [
          { id: 'user_1', label: 'John Doe' },
        ],
      };

      render(
        <table>
          <tbody>
            <tr>
              <Cell field={field} value="user_1" rowId="row_1" />
            </tr>
          </tbody>
        </table>
      );

      // Caret button should be present
      expect(screen.getByLabelText('Open dropdown')).toBeInTheDocument();
    });

    it('shows caret for iteration fields', () => {
      const field = {
        id: 'fld_iteration',
        name: 'Sprint',
        type: 'iteration' as const,
        visible: true,
        options: [
          { id: 'sprint_1', label: 'Sprint 1' },
        ],
      };

      render(
        <table>
          <tbody>
            <tr>
              <Cell field={field} value="sprint_1" rowId="row_1" />
            </tr>
          </tbody>
        </table>
      );

      // Caret button should be present
      expect(screen.getByLabelText('Open dropdown')).toBeInTheDocument();
    });
  });

  describe('Link fields', () => {
    it('renders link as clickable URL', () => {
      const field = { id: 'fld_1', name: 'Website', type: 'link' as const, visible: true };
      render(
        <table>
          <tbody>
            <tr>
              <Cell field={field} value="https://example.com" rowId="row_1" />
            </tr>
          </tbody>
        </table>
      );

      const link = screen.getByRole('link', { name: 'https://example.com' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://example.com');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('renders empty link with em dash placeholder', () => {
      const field = { id: 'fld_1', name: 'Website', type: 'link' as const, visible: true };
      const { container } = render(
        <table>
          <tbody>
            <tr>
              <Cell field={field} value={null} rowId="row_1" />
            </tr>
          </tbody>
        </table>
      );

      const cell = container.querySelector('td');
      expect(cell?.textContent).toBe('—');
    });

    it('enters edit mode when double-clicked', async () => {
      const user = userEvent.setup();
      const field = { id: 'fld_1', name: 'Website', type: 'link' as const, visible: true };
      const onEdit = vi.fn();

      render(
        <table>
          <tbody>
            <tr>
              <Cell field={field} value="https://example.com" rowId="row_1" onEdit={onEdit} />
            </tr>
          </tbody>
        </table>
      );

      const link = screen.getByRole('link');
      await user.dblClick(link);

      // Should show an input field
      const input = screen.getByDisplayValue('https://example.com');
      expect(input).toBeInTheDocument();
      expect(input).toHaveFocus();
      expect(input).toHaveAttribute('type', 'url');
    });

    it('auto-prepends https:// to URLs without protocol', async () => {
      const user = userEvent.setup();
      const field = { id: 'fld_1', name: 'Website', type: 'link' as const, visible: true };
      const onEdit = vi.fn();

      render(
        <table>
          <tbody>
            <tr>
              <Cell field={field} value="" rowId="row_1" onEdit={onEdit} />
            </tr>
          </tbody>
        </table>
      );

      const placeholder = screen.getByText('—');
      await user.dblClick(placeholder);

      const input = screen.getByPlaceholderText('https://example.com');
      await user.type(input, 'example.com');
      await user.keyboard('{Enter}');

      expect(onEdit).toHaveBeenCalledWith({
        rowId: 'row_1',
        fieldId: 'fld_1',
        value: 'https://example.com',
      });
    });

    it('preserves https:// protocol when already present', async () => {
      const user = userEvent.setup();
      const field = { id: 'fld_1', name: 'Website', type: 'link' as const, visible: true };
      const onEdit = vi.fn();

      render(
        <table>
          <tbody>
            <tr>
              <Cell field={field} value="" rowId="row_1" onEdit={onEdit} />
            </tr>
          </tbody>
        </table>
      );

      const placeholder = screen.getByText('—');
      await user.dblClick(placeholder);

      const input = screen.getByPlaceholderText('https://example.com');
      await user.type(input, 'https://example.com');
      await user.keyboard('{Enter}');

      expect(onEdit).toHaveBeenCalledWith({
        rowId: 'row_1',
        fieldId: 'fld_1',
        value: 'https://example.com',
      });
    });

    it('preserves http:// protocol when present', async () => {
      const user = userEvent.setup();
      const field = { id: 'fld_1', name: 'Website', type: 'link' as const, visible: true };
      const onEdit = vi.fn();

      render(
        <table>
          <tbody>
            <tr>
              <Cell field={field} value="" rowId="row_1" onEdit={onEdit} />
            </tr>
          </tbody>
        </table>
      );

      const placeholder = screen.getByText('—');
      await user.dblClick(placeholder);

      const input = screen.getByPlaceholderText('https://example.com');
      await user.type(input, 'http://example.com');
      await user.keyboard('{Enter}');

      expect(onEdit).toHaveBeenCalledWith({
        rowId: 'row_1',
        fieldId: 'fld_1',
        value: 'http://example.com',
      });
    });

    it('cancels edit on Escape key', async () => {
      const user = userEvent.setup();
      const field = { id: 'fld_1', name: 'Website', type: 'link' as const, visible: true };
      const onEdit = vi.fn();

      render(
        <table>
          <tbody>
            <tr>
              <Cell field={field} value="https://original.com" rowId="row_1" onEdit={onEdit} />
            </tr>
          </tbody>
        </table>
      );

      const link = screen.getByRole('link');
      await user.dblClick(link);

      const input = screen.getByDisplayValue('https://original.com');
      await user.clear(input);
      await user.type(input, 'https://changed.com');
      await user.keyboard('{Escape}');

      // Should not call onEdit
      expect(onEdit).not.toHaveBeenCalled();

      // Should show original value
      expect(screen.getByRole('link', { name: 'https://original.com' })).toBeInTheDocument();
    });

    it('commits value on blur', async () => {
      const user = userEvent.setup();
      const field = { id: 'fld_1', name: 'Website', type: 'link' as const, visible: true };
      const onEdit = vi.fn();

      render(
        <div>
          <table>
            <tbody>
              <tr>
                <Cell field={field} value="https://original.com" rowId="row_1" onEdit={onEdit} />
              </tr>
            </tbody>
          </table>
          <button>Outside</button>
        </div>
      );

      const link = screen.getByRole('link');
      await user.dblClick(link);

      const input = screen.getByDisplayValue('https://original.com');
      await user.clear(input);
      await user.type(input, 'modified.com');

      // Click outside to trigger blur
      const outsideButton = screen.getByText('Outside');
      await user.click(outsideButton);

      expect(onEdit).toHaveBeenCalledWith({
        rowId: 'row_1',
        fieldId: 'fld_1',
        value: 'https://modified.com',
      });
    });

    it('does not show caret for link fields', () => {
      const field = { id: 'fld_1', name: 'Website', type: 'link' as const, visible: true };

      render(
        <table>
          <tbody>
            <tr>
              <Cell field={field} value="https://example.com" rowId="row_1" />
            </tr>
          </tbody>
        </table>
      );

      // Caret button should NOT be present
      expect(screen.queryByLabelText('Open dropdown')).not.toBeInTheDocument();
    });

    it('single click on cell selects cell for link fields', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      const field = { id: 'fld_1', name: 'Website', type: 'link' as const, visible: true };

      const { container } = render(
        <table>
          <tbody>
            <tr>
              <Cell field={field} value="https://example.com" rowId="row_1" onSelect={onSelect} />
            </tr>
          </tbody>
        </table>
      );

      // Click on the cell content container (not the link itself, which has stopPropagation)
      const cellContent = container.querySelector('.gitboard-table__cell-content');
      if (cellContent) {
        await user.click(cellContent as HTMLElement);
      }

      // Should call onSelect
      expect(onSelect).toHaveBeenCalledWith('row_1', 'fld_1');
    });
  });

  describe('Click behavior - Text/Number/Date fields', () => {
    it('single click selects cell for text fields', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      const field = { id: 'fld_1', name: 'Title', type: 'text' as const, visible: true };

      render(
        <table>
          <tbody>
            <tr>
              <Cell field={field} value="Test" rowId="row_1" onSelect={onSelect} />
            </tr>
          </tbody>
        </table>
      );

      const cellContent = screen.getByText('Test');
      await user.click(cellContent);

      // Should call onSelect, not open editor
      expect(onSelect).toHaveBeenCalledWith('row_1', 'fld_1');
      expect(screen.queryByDisplayValue('Test')).not.toBeInTheDocument();
    });

    it('double click opens editor for text fields', async () => {
      const user = userEvent.setup();
      const field = { id: 'fld_1', name: 'Title', type: 'text' as const, visible: true };

      render(
        <table>
          <tbody>
            <tr>
              <Cell field={field} value="Test" rowId="row_1" />
            </tr>
          </tbody>
        </table>
      );

      const cellContent = screen.getByText('Test');
      await user.dblClick(cellContent);

      // Should show input after double click
      expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
    });

    it('single click selects cell for number fields', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      const field = { id: 'fld_1', name: 'Points', type: 'number' as const, visible: true };

      render(
        <table>
          <tbody>
            <tr>
              <Cell field={field} value={5} rowId="row_1" onSelect={onSelect} />
            </tr>
          </tbody>
        </table>
      );

      const cellContent = screen.getByText('5');
      await user.click(cellContent);

      // Should call onSelect, not open editor
      expect(onSelect).toHaveBeenCalledWith('row_1', 'fld_1');
      expect(screen.queryByDisplayValue('5')).not.toBeInTheDocument();
    });

    it('double click opens editor for number fields', async () => {
      const user = userEvent.setup();
      const field = { id: 'fld_1', name: 'Points', type: 'number' as const, visible: true };

      render(
        <table>
          <tbody>
            <tr>
              <Cell field={field} value={5} rowId="row_1" />
            </tr>
          </tbody>
        </table>
      );

      const cellContent = screen.getByText('5');
      await user.dblClick(cellContent);

      // Should show input after double click
      expect(screen.getByDisplayValue('5')).toBeInTheDocument();
    });

    it('does not show caret for text fields', () => {
      const field = { id: 'fld_1', name: 'Title', type: 'text' as const, visible: true };

      render(
        <table>
          <tbody>
            <tr>
              <Cell field={field} value="Test" rowId="row_1" />
            </tr>
          </tbody>
        </table>
      );

      // Caret button should NOT be present
      expect(screen.queryByLabelText('Open dropdown')).not.toBeInTheDocument();
    });

    it('does not show caret for number fields', () => {
      const field = { id: 'fld_1', name: 'Points', type: 'number' as const, visible: true };

      render(
        <table>
          <tbody>
            <tr>
              <Cell field={field} value={5} rowId="row_1" />
            </tr>
          </tbody>
        </table>
      );

      // Caret button should NOT be present
      expect(screen.queryByLabelText('Open dropdown')).not.toBeInTheDocument();
    });

    it('does not show caret for date fields', () => {
      const field = { id: 'fld_1', name: 'Due Date', type: 'date' as const, visible: true };

      render(
        <table>
          <tbody>
            <tr>
              <Cell field={field} value="2024-01-01" rowId="row_1" />
            </tr>
          </tbody>
        </table>
      );

      // Caret button should NOT be present
      expect(screen.queryByLabelText('Open dropdown')).not.toBeInTheDocument();
    });
  });
});
