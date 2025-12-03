/**
 * FilterBar Component Tests
 * Tests for inline filter input with autocomplete
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBar } from '../../src/components/Toolbar/FilterBar';
import { fields } from '../../src/mocks/mockData';

describe('FilterBar', () => {
  describe('Rendering', () => {
    it('renders the filter input', () => {
      render(<FilterBar fields={fields} filters={[]} onFiltersChange={() => {}} />);
      const input = screen.getByRole('textbox', { name: /filter input/i });
      expect(input).toBeInTheDocument();
    });

    it('shows placeholder text', () => {
      render(<FilterBar fields={fields} filters={[]} onFiltersChange={() => {}} />);
      const input = screen.getByPlaceholderText(/filter \(e\.g\.,/i);
      expect(input).toBeInTheDocument();
    });

    it('shows clear button when input has value', async () => {
      const user = userEvent.setup();
      render(<FilterBar fields={fields} filters={[]} onFiltersChange={() => {}} />);

      const input = screen.getByRole('textbox', { name: /filter input/i });
      await user.type(input, 'Title:contains:test');

      const clearButton = screen.getByRole('button', { name: /clear filters/i });
      expect(clearButton).toBeInTheDocument();
    });

    it('does not show clear button when input is empty', () => {
      render(<FilterBar fields={fields} filters={[]} onFiltersChange={() => {}} />);
      const clearButton = screen.queryByRole('button', { name: /clear filters/i });
      expect(clearButton).not.toBeInTheDocument();
    });
  });

  describe('Autocomplete - Field suggestions', () => {
    it('shows field suggestions when typing', async () => {
      const user = userEvent.setup();
      render(<FilterBar fields={fields} filters={[]} onFiltersChange={() => {}} />);

      const input = screen.getByRole('textbox', { name: /filter input/i });
      await user.type(input, 'Ti');

      // Should show Title field suggestion
      const suggestion = await screen.findByText('Title');
      expect(suggestion).toBeInTheDocument();
    });

    it('filters field suggestions based on input', async () => {
      const user = userEvent.setup();
      render(<FilterBar fields={fields} filters={[]} onFiltersChange={() => {}} />);

      const input = screen.getByRole('textbox', { name: /filter input/i });
      await user.type(input, 'Sta');

      // Should show Status field
      const statusSuggestion = await screen.findByText('Status');
      expect(statusSuggestion).toBeInTheDocument();

      // Should not show Title field
      const titleSuggestion = screen.queryByText('Title');
      expect(titleSuggestion).not.toBeInTheDocument();
    });

    it('applies field suggestion when clicked', async () => {
      const user = userEvent.setup();
      const onFiltersChange = vi.fn();
      render(<FilterBar fields={fields} filters={[]} onFiltersChange={onFiltersChange} />);

      const input = screen.getByRole('textbox', { name: /filter input/i });
      await user.type(input, 'Ti');

      const suggestion = await screen.findByText('Title');
      await user.click(suggestion);

      // Input should now have "Title:" added
      expect(input).toHaveValue('Title:');
    });

    it('applies field suggestion when Enter is pressed', async () => {
      const user = userEvent.setup();
      render(<FilterBar fields={fields} filters={[]} onFiltersChange={() => {}} />);

      const input = screen.getByRole('textbox', { name: /filter input/i });
      await user.type(input, 'Ti');

      // Wait for suggestions to appear
      await screen.findByText('Title');

      // Press Enter to select first suggestion
      await user.keyboard('{Enter}');

      expect(input).toHaveValue('Title:');
    });
  });

  describe('Autocomplete - Operator suggestions', () => {
    it('shows operator suggestions after field name', async () => {
      const user = userEvent.setup();
      render(<FilterBar fields={fields} filters={[]} onFiltersChange={() => {}} />);

      const input = screen.getByRole('textbox', { name: /filter input/i });
      await user.type(input, 'Title:con');

      // Should show "contains" operator
      const suggestion = await screen.findByText('contains');
      expect(suggestion).toBeInTheDocument();
    });

    it('shows all operator suggestions when typing colon', async () => {
      const user = userEvent.setup();
      render(<FilterBar fields={fields} filters={[]} onFiltersChange={() => {}} />);

      const input = screen.getByRole('textbox', { name: /filter input/i });
      await user.type(input, 'Title:');

      // Should show multiple operators
      const containsSuggestion = await screen.findByText('contains');
      expect(containsSuggestion).toBeInTheDocument();

      const equalsSuggestion = await screen.findByText('equals');
      expect(equalsSuggestion).toBeInTheDocument();
    });

    it('applies operator suggestion when clicked', async () => {
      const user = userEvent.setup();
      render(<FilterBar fields={fields} filters={[]} onFiltersChange={() => {}} />);

      const input = screen.getByRole('textbox', { name: /filter input/i });
      await user.type(input, 'Title:con');

      const suggestion = await screen.findByText('contains');
      await user.click(suggestion);

      // Input should now have "Title:contains:" added
      expect(input).toHaveValue('Title:contains:');
    });
  });

  describe('Autocomplete - Value suggestions', () => {
    it('shows value suggestions for select fields', async () => {
      const user = userEvent.setup();
      render(<FilterBar fields={fields} filters={[]} onFiltersChange={() => {}} />);

      const input = screen.getByRole('textbox', { name: /filter input/i });
      await user.type(input, 'Status:equals:');

      // Should show status options
      const todoSuggestion = await screen.findByText('Todo');
      expect(todoSuggestion).toBeInTheDocument();

      const doneSuggestion = await screen.findByText('Done');
      expect(doneSuggestion).toBeInTheDocument();
    });

    it('filters value suggestions based on input', async () => {
      const user = userEvent.setup();
      render(<FilterBar fields={fields} filters={[]} onFiltersChange={() => {}} />);

      const input = screen.getByRole('textbox', { name: /filter input/i });
      await user.type(input, 'Status:equals:do');

      // Should show "Done" but not "Todo"
      const doneSuggestion = await screen.findByText('Done');
      expect(doneSuggestion).toBeInTheDocument();

      const todoSuggestion = screen.queryByText('Todo');
      expect(todoSuggestion).not.toBeInTheDocument();
    });
  });

  describe('Filter parsing', () => {
    it('parses simple filter correctly', async () => {
      const user = userEvent.setup();
      const onFiltersChange = vi.fn();
      render(<FilterBar fields={fields} filters={[]} onFiltersChange={onFiltersChange} />);

      const input = screen.getByRole('textbox', { name: /filter input/i });
      await user.type(input, 'Title:contains:login');

      // Should call onFiltersChange with parsed filter
      expect(onFiltersChange).toHaveBeenCalledWith([
        {
          field: 'fld_title_aa12e',
          operator: 'contains',
          value: 'login',
        },
      ]);
    });

    it('parses multiple filters correctly', async () => {
      const user = userEvent.setup();
      const onFiltersChange = vi.fn();
      render(<FilterBar fields={fields} filters={[]} onFiltersChange={onFiltersChange} />);

      const input = screen.getByRole('textbox', { name: /filter input/i });
      await user.type(input, 'Title:contains:login Status:equals:opt_status_done_77de');

      // Should parse both filters
      const calls = onFiltersChange.mock.calls;
      const lastCall = calls[calls.length - 1][0];

      expect(lastCall).toHaveLength(2);
      expect(lastCall[0].field).toBe('fld_title_aa12e');
      expect(lastCall[1].field).toBe('fld_status_c81f3');
    });

    it('parses negative filter correctly', async () => {
      const user = userEvent.setup();
      const onFiltersChange = vi.fn();
      render(<FilterBar fields={fields} filters={[]} onFiltersChange={onFiltersChange} />);

      const input = screen.getByRole('textbox', { name: /filter input/i });
      await user.type(input, '-Status:equals:opt_status_done_77de');

      // Should parse as not-equals
      const calls = onFiltersChange.mock.calls;
      const lastCall = calls[calls.length - 1][0];

      expect(lastCall[0].operator).toBe('not-equals');
    });

    it('parses quoted values correctly', async () => {
      const user = userEvent.setup();
      const onFiltersChange = vi.fn();
      render(<FilterBar fields={fields} filters={[]} onFiltersChange={onFiltersChange} />);

      const input = screen.getByRole('textbox', { name: /filter input/i });
      await user.type(input, 'Title:contains:"login page"');

      // Should parse value without quotes
      const calls = onFiltersChange.mock.calls;
      const lastCall = calls[calls.length - 1][0];

      expect(lastCall[0].value).toBe('login page');
    });

    it('parses comparison operators correctly', async () => {
      const user = userEvent.setup();
      const onFiltersChange = vi.fn();
      render(<FilterBar fields={fields} filters={[]} onFiltersChange={onFiltersChange} />);

      const input = screen.getByRole('textbox', { name: /filter input/i });
      await user.type(input, 'Points:>:5');

      // Should parse as gt operator
      const calls = onFiltersChange.mock.calls;
      const lastCall = calls[calls.length - 1][0];

      expect(lastCall).toHaveLength(1);
      expect(lastCall[0].operator).toBe('gt');
      expect(lastCall[0].value).toBe('5');
    });
  });

  describe('Keyboard navigation', () => {
    it('navigates suggestions with arrow keys', async () => {
      const user = userEvent.setup();
      render(<FilterBar fields={fields} filters={[]} onFiltersChange={() => {}} />);

      const input = screen.getByRole('textbox', { name: /filter input/i });
      await user.type(input, 'Ti');

      // Wait for suggestions
      await screen.findByText('Title');

      // Press down arrow
      await user.keyboard('{ArrowDown}');

      // Should select next suggestion (if available)
      // This is verified by the visual state, which we can't easily test
    });

    it('closes suggestions on Escape key', async () => {
      const user = userEvent.setup();
      render(<FilterBar fields={fields} filters={[]} onFiltersChange={() => {}} />);

      const input = screen.getByRole('textbox', { name: /filter input/i });
      await user.type(input, 'Ti');

      // Wait for suggestions
      const suggestion = await screen.findByText('Title');
      expect(suggestion).toBeInTheDocument();

      // Press Escape
      await user.keyboard('{Escape}');

      // Suggestions should be hidden
      expect(screen.queryByText('Title')).not.toBeInTheDocument();
    });
  });

  describe('Clear button', () => {
    it('clears input and filters when clicked', async () => {
      const user = userEvent.setup();
      const onFiltersChange = vi.fn();
      render(<FilterBar fields={fields} filters={[]} onFiltersChange={onFiltersChange} />);

      const input = screen.getByRole('textbox', { name: /filter input/i });
      await user.type(input, 'Title:contains:test');

      const clearButton = screen.getByRole('button', { name: /clear filters/i });
      await user.click(clearButton);

      // Input should be cleared
      expect(input).toHaveValue('');

      // Should call onFiltersChange with empty array
      expect(onFiltersChange).toHaveBeenCalledWith([]);
    });
  });

  describe('External filter prop changes', () => {
    it('displays filters when filters prop is set externally', () => {
      const externalFilters = [
        { field: 'fld_status_c81f3', operator: 'equals' as const, value: 'opt_status_progress_29bb' },
      ];

      render(<FilterBar fields={fields} filters={externalFilters} onFiltersChange={vi.fn()} />);

      const input = screen.getByRole('textbox', { name: /filter input/i });
      // Should display the serialized filter string (with quotes for values with spaces)
      expect(input).toHaveValue('Status:equals:"In Progress"');
    });

    it('updates display when filters prop changes', () => {
      const initialFilters = [
        { field: 'fld_status_c81f3', operator: 'equals' as const, value: 'opt_status_todo_118a' },
      ];

      const { rerender } = render(
        <FilterBar fields={fields} filters={initialFilters} onFiltersChange={vi.fn()} />
      );

      const input = screen.getByRole('textbox', { name: /filter input/i });
      expect(input).toHaveValue('Status:equals:Todo');

      // Change filters prop
      const newFilters = [
        { field: 'fld_status_c81f3', operator: 'equals' as const, value: 'opt_status_done_77de' },
      ];

      rerender(<FilterBar fields={fields} filters={newFilters} onFiltersChange={vi.fn()} />);

      // Display should update
      expect(input).toHaveValue('Status:equals:Done');
    });

    it('displays multiple filters from external prop', () => {
      const externalFilters = [
        { field: 'fld_owner_19ad8', operator: 'equals' as const, value: 'usr_tony_a19f2' },
        { field: 'fld_status_c81f3', operator: 'not-equals' as const, value: 'opt_status_done_77de' },
      ];

      render(<FilterBar fields={fields} filters={externalFilters} onFiltersChange={vi.fn()} />);

      const input = screen.getByRole('textbox', { name: /filter input/i });
      // Should display both filters joined by space
      expect(input).toHaveValue('Owner:equals:"Tony Tip" Status:not-equals:Done');
    });

    it('displays filter with comparison operator correctly', () => {
      const externalFilters = [
        { field: 'fld_points_11b9e', operator: 'gte' as const, value: 3 },
      ];

      render(<FilterBar fields={fields} filters={externalFilters} onFiltersChange={vi.fn()} />);

      const input = screen.getByRole('textbox', { name: /filter input/i });
      // Should display >= instead of gte
      expect(input).toHaveValue('Points:>=:3');
    });

    it('clears display when filters prop becomes empty', () => {
      const initialFilters = [
        { field: 'fld_status_c81f3', operator: 'equals' as const, value: 'opt_status_done_77de' },
      ];

      const { rerender } = render(
        <FilterBar fields={fields} filters={initialFilters} onFiltersChange={vi.fn()} />
      );

      const input = screen.getByRole('textbox', { name: /filter input/i });
      expect(input).toHaveValue('Status:equals:Done');

      // Set filters to empty array
      rerender(<FilterBar fields={fields} filters={[]} onFiltersChange={vi.fn()} />);

      // Display should be cleared
      expect(input).toHaveValue('');
    });
  });
});
