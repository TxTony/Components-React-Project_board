/**
 * ViewTabs Component Tests
 * Tests for view tab navigation and switching
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ViewTabs } from '../../src/components/Toolbar/ViewTabs';
import type { ViewConfig } from '../../src/types';

describe('ViewTabs', () => {
  const mockViews: ViewConfig[] = [
    {
      id: 'view_all',
      name: 'All Tasks',
      columns: ['fld_1', 'fld_2'],
      sortBy: null,
      filters: [],
      groupBy: null,
    },
    {
      id: 'view_filtered',
      name: 'In Progress',
      columns: ['fld_1'],
      sortBy: { field: 'fld_1', direction: 'asc' },
      filters: [
        { field: 'fld_status', operator: 'equals', value: 'in_progress' },
      ],
      groupBy: null,
    },
    {
      id: 'view_multiple_filters',
      name: 'My Tasks',
      columns: ['fld_1', 'fld_2'],
      sortBy: null,
      filters: [
        { field: 'fld_owner', operator: 'equals', value: 'user_1' },
        { field: 'fld_status', operator: 'not-equals', value: 'done' },
      ],
      groupBy: null,
    },
  ];

  describe('Rendering', () => {
    it('renders all view tabs', () => {
      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          onViewChange={vi.fn()}
        />
      );

      expect(screen.getByText('All Tasks')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('My Tasks')).toBeInTheDocument();
    });

    it('renders with correct ARIA role', () => {
      const { container } = render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          onViewChange={vi.fn()}
        />
      );

      const tablist = container.querySelector('[role="tablist"]');
      expect(tablist).toBeInTheDocument();
    });

    it('renders tabs with ARIA tab role', () => {
      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          onViewChange={vi.fn()}
        />
      );

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(3);
    });

    it('renders with empty views array', () => {
      const { container } = render(
        <ViewTabs
          views={[]}
          currentViewId=""
          onViewChange={vi.fn()}
        />
      );

      const tablist = container.querySelector('[role="tablist"]');
      expect(tablist).toBeInTheDocument();
      expect(tablist?.children).toHaveLength(0);
    });

    it('renders with single view', () => {
      render(
        <ViewTabs
          views={[mockViews[0]]}
          currentViewId="view_all"
          onViewChange={vi.fn()}
        />
      );

      expect(screen.getByText('All Tasks')).toBeInTheDocument();
      expect(screen.queryByText('In Progress')).not.toBeInTheDocument();
    });
  });

  describe('Active Tab', () => {
    it('marks the current view as active', () => {
      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_filtered"
          onViewChange={vi.fn()}
        />
      );

      const inProgressTab = screen.getByText('In Progress').closest('button');
      expect(inProgressTab).toHaveClass('gitboard-view-tabs__tab--active');
      expect(inProgressTab).toHaveAttribute('aria-selected', 'true');
    });

    it('does not mark inactive views as active', () => {
      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_filtered"
          onViewChange={vi.fn()}
        />
      );

      const allTasksTab = screen.getByText('All Tasks').closest('button');
      expect(allTasksTab).not.toHaveClass('gitboard-view-tabs__tab--active');
      expect(allTasksTab).toHaveAttribute('aria-selected', 'false');
    });

    it('updates active tab when currentViewId changes', () => {
      const { rerender } = render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          onViewChange={vi.fn()}
        />
      );

      let allTasksTab = screen.getByText('All Tasks').closest('button');
      expect(allTasksTab).toHaveClass('gitboard-view-tabs__tab--active');

      rerender(
        <ViewTabs
          views={mockViews}
          currentViewId="view_filtered"
          onViewChange={vi.fn()}
        />
      );

      allTasksTab = screen.getByText('All Tasks').closest('button');
      const inProgressTab = screen.getByText('In Progress').closest('button');

      expect(allTasksTab).not.toHaveClass('gitboard-view-tabs__tab--active');
      expect(inProgressTab).toHaveClass('gitboard-view-tabs__tab--active');
    });

    it('sets correct aria-controls attribute', () => {
      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          onViewChange={vi.fn()}
        />
      );

      const allTasksTab = screen.getByText('All Tasks').closest('button');
      expect(allTasksTab).toHaveAttribute('aria-controls', 'view-view_all');
    });
  });

  describe('Filter Count Badge', () => {
    it('does not show badge when view has no filters', () => {
      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          onViewChange={vi.fn()}
        />
      );

      const allTasksTab = screen.getByText('All Tasks').closest('button');
      const badge = allTasksTab?.querySelector('.gitboard-view-tabs__badge');
      expect(badge).not.toBeInTheDocument();
    });

    it('shows badge with filter count when view has filters', () => {
      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          onViewChange={vi.fn()}
        />
      );

      const inProgressTab = screen.getByText('In Progress').closest('button');
      const badge = inProgressTab?.querySelector('.gitboard-view-tabs__badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('1');
    });

    it('shows correct count for multiple filters', () => {
      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          onViewChange={vi.fn()}
        />
      );

      const myTasksTab = screen.getByText('My Tasks').closest('button');
      const badge = myTasksTab?.querySelector('.gitboard-view-tabs__badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('2');
    });

    it('applies active class to badge when tab is active', () => {
      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_filtered"
          onViewChange={vi.fn()}
        />
      );

      const inProgressTab = screen.getByText('In Progress').closest('button');
      expect(inProgressTab).toHaveClass('gitboard-view-tabs__tab--active');

      const badge = inProgressTab?.querySelector('.gitboard-view-tabs__badge');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Click Handling', () => {
    it('calls onViewChange when tab is clicked', async () => {
      const user = userEvent.setup();
      const onViewChange = vi.fn();

      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          onViewChange={onViewChange}
        />
      );

      const inProgressTab = screen.getByText('In Progress');
      await user.click(inProgressTab);

      expect(onViewChange).toHaveBeenCalledTimes(1);
      expect(onViewChange).toHaveBeenCalledWith(mockViews[1]);
    });

    it('calls onViewChange with correct view object', async () => {
      const user = userEvent.setup();
      const onViewChange = vi.fn();

      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          onViewChange={onViewChange}
        />
      );

      const myTasksTab = screen.getByText('My Tasks');
      await user.click(myTasksTab);

      expect(onViewChange).toHaveBeenCalledWith(mockViews[2]);
      expect(onViewChange).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'view_multiple_filters',
          name: 'My Tasks',
          filters: expect.arrayContaining([
            expect.objectContaining({
              field: 'fld_owner',
              operator: 'equals',
            }),
          ]),
        })
      );
    });

    it('can click active tab (no-op but allowed)', async () => {
      const user = userEvent.setup();
      const onViewChange = vi.fn();

      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          onViewChange={onViewChange}
        />
      );

      const allTasksTab = screen.getByText('All Tasks');
      await user.click(allTasksTab);

      expect(onViewChange).toHaveBeenCalledTimes(1);
      expect(onViewChange).toHaveBeenCalledWith(mockViews[0]);
    });

    it('handles multiple rapid clicks', async () => {
      const user = userEvent.setup();
      const onViewChange = vi.fn();

      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          onViewChange={onViewChange}
        />
      );

      const inProgressTab = screen.getByText('In Progress');
      await user.click(inProgressTab);
      await user.click(inProgressTab);
      await user.click(inProgressTab);

      expect(onViewChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('Keyboard Navigation', () => {
    it('tabs are keyboard focusable', async () => {
      const user = userEvent.setup();

      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          onViewChange={vi.fn()}
        />
      );

      const allTasksTab = screen.getByText('All Tasks').closest('button');

      // Tab should be focusable
      await user.tab();
      expect(allTasksTab).toHaveFocus();
    });

    it('can activate tab with Enter key', async () => {
      const user = userEvent.setup();
      const onViewChange = vi.fn();

      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          onViewChange={onViewChange}
        />
      );

      const inProgressTab = screen.getByText('In Progress').closest('button');
      inProgressTab?.focus();

      await user.keyboard('{Enter}');

      expect(onViewChange).toHaveBeenCalledWith(mockViews[1]);
    });

    it('can activate tab with Space key', async () => {
      const user = userEvent.setup();
      const onViewChange = vi.fn();

      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          onViewChange={onViewChange}
        />
      );

      const myTasksTab = screen.getByText('My Tasks').closest('button');
      myTasksTab?.focus();

      await user.keyboard(' ');

      expect(onViewChange).toHaveBeenCalledWith(mockViews[2]);
    });
  });

  describe('Accessibility', () => {
    it('has proper button type attribute', () => {
      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          onViewChange={vi.fn()}
        />
      );

      const tabs = screen.getAllByRole('tab');
      tabs.forEach((tab) => {
        expect(tab).toHaveAttribute('type', 'button');
      });
    });

    it('maintains tab order in DOM', () => {
      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          onViewChange={vi.fn()}
        />
      );

      const tabs = screen.getAllByRole('tab');
      expect(tabs[0]).toHaveTextContent('All Tasks');
      expect(tabs[1]).toHaveTextContent('In Progress');
      expect(tabs[2]).toHaveTextContent('My Tasks');
    });

    it('has descriptive aria-controls for each tab', () => {
      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          onViewChange={vi.fn()}
        />
      );

      const tabs = screen.getAllByRole('tab');
      expect(tabs[0]).toHaveAttribute('aria-controls', 'view-view_all');
      expect(tabs[1]).toHaveAttribute('aria-controls', 'view-view_filtered');
      expect(tabs[2]).toHaveAttribute('aria-controls', 'view-view_multiple_filters');
    });
  });

  describe('Edge Cases', () => {
    it('handles view with empty name', () => {
      const viewWithEmptyName: ViewConfig[] = [
        {
          id: 'view_empty_name',
          name: '',
          columns: [],
          sortBy: null,
          filters: [],
          groupBy: null,
        },
      ];

      render(
        <ViewTabs
          views={viewWithEmptyName}
          currentViewId="view_empty_name"
          onViewChange={vi.fn()}
        />
      );

      const tab = screen.getByRole('tab');
      expect(tab).toBeInTheDocument();
      expect(tab).toHaveTextContent('');
    });

    it('handles currentViewId that does not match any view', () => {
      render(
        <ViewTabs
          views={mockViews}
          currentViewId="non_existent_view"
          onViewChange={vi.fn()}
        />
      );

      const tabs = screen.getAllByRole('tab');
      tabs.forEach((tab) => {
        expect(tab).not.toHaveClass('gitboard-view-tabs__tab--active');
        expect(tab).toHaveAttribute('aria-selected', 'false');
      });
    });

    it('handles view with very long name', () => {
      const viewWithLongName: ViewConfig[] = [
        {
          id: 'view_long',
          name: 'This is a very long view name that might cause layout issues',
          columns: [],
          sortBy: null,
          filters: [],
          groupBy: null,
        },
      ];

      render(
        <ViewTabs
          views={viewWithLongName}
          currentViewId="view_long"
          onViewChange={vi.fn()}
        />
      );

      expect(
        screen.getByText('This is a very long view name that might cause layout issues')
      ).toBeInTheDocument();
    });

    it('handles large number of filters (> 9)', () => {
      const viewWithManyFilters: ViewConfig[] = [
        {
          id: 'view_many_filters',
          name: 'Complex View',
          columns: [],
          sortBy: null,
          filters: Array.from({ length: 15 }, (_, i) => ({
            field: `field_${i}`,
            operator: 'equals' as const,
            value: `value_${i}`,
          })),
          groupBy: null,
        },
      ];

      render(
        <ViewTabs
          views={viewWithManyFilters}
          currentViewId="view_many_filters"
          onViewChange={vi.fn()}
        />
      );

      const tab = screen.getByText('Complex View').closest('button');
      const badge = tab?.querySelector('.gitboard-view-tabs__badge');
      expect(badge).toHaveTextContent('15');
    });
  });

  describe('Styling Classes', () => {
    it('applies base tab class to all tabs', () => {
      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          onViewChange={vi.fn()}
        />
      );

      const tabs = screen.getAllByRole('tab');
      tabs.forEach((tab) => {
        expect(tab).toHaveClass('gitboard-view-tabs__tab');
      });
    });

    it('applies active class only to active tab', () => {
      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_filtered"
          onViewChange={vi.fn()}
        />
      );

      const allTasksTab = screen.getByText('All Tasks').closest('button');
      const inProgressTab = screen.getByText('In Progress').closest('button');
      const myTasksTab = screen.getByText('My Tasks').closest('button');

      expect(allTasksTab).not.toHaveClass('gitboard-view-tabs__tab--active');
      expect(inProgressTab).toHaveClass('gitboard-view-tabs__tab--active');
      expect(myTasksTab).not.toHaveClass('gitboard-view-tabs__tab--active');
    });

    it('applies badge class to filter count elements', () => {
      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          onViewChange={vi.fn()}
        />
      );

      const inProgressTab = screen.getByText('In Progress').closest('button');
      const badge = inProgressTab?.querySelector('.gitboard-view-tabs__badge');
      expect(badge).toHaveClass('gitboard-view-tabs__badge');
    });
  });

  describe('Add View Button', () => {
    it('renders add view button when onCreateView is provided', () => {
      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          currentFilters={[]}
          onViewChange={vi.fn()}
          onCreateView={vi.fn()}
        />
      );

      const addButton = screen.getByLabelText('Add new view');
      expect(addButton).toBeInTheDocument();
      expect(addButton).toHaveTextContent('Add view');
    });

    it('does not render add view button when onCreateView is undefined', () => {
      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          currentFilters={[]}
          onViewChange={vi.fn()}
        />
      );

      const addButton = screen.queryByLabelText('Add new view');
      expect(addButton).not.toBeInTheDocument();
    });

    it('calls onCreateView with new view when clicked', async () => {
      const user = userEvent.setup();
      const onCreateView = vi.fn();
      const onViewChange = vi.fn();

      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          currentFilters={[]}
          onViewChange={onViewChange}
          onCreateView={onCreateView}
        />
      );

      const addButton = screen.getByLabelText('Add new view');
      await user.click(addButton);

      expect(onCreateView).toHaveBeenCalledTimes(1);
      expect(onCreateView).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.stringContaining('view_'),
          name: 'New View',
          columns: [],
          sortBy: null,
          filters: [],
          groupBy: null,
        })
      );
    });

    it('switches to new view after creation', async () => {
      const user = userEvent.setup();
      const onCreateView = vi.fn();
      const onViewChange = vi.fn();

      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          currentFilters={[]}
          onViewChange={onViewChange}
          onCreateView={onCreateView}
        />
      );

      const addButton = screen.getByLabelText('Add new view');
      await user.click(addButton);

      expect(onViewChange).toHaveBeenCalledTimes(1);
      expect(onViewChange).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New View',
        })
      );
    });

    it('generates unique view ID for each new view', async () => {
      const user = userEvent.setup();
      const onCreateView = vi.fn();

      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          currentFilters={[]}
          onViewChange={vi.fn()}
          onCreateView={onCreateView}
        />
      );

      const addButton = screen.getByLabelText('Add new view');
      await user.click(addButton);
      await user.click(addButton);

      expect(onCreateView).toHaveBeenCalledTimes(2);
      const firstId = onCreateView.mock.calls[0][0].id;
      const secondId = onCreateView.mock.calls[1][0].id;
      expect(firstId).not.toBe(secondId);
    });

    it('has proper button type attribute', () => {
      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          currentFilters={[]}
          onViewChange={vi.fn()}
          onCreateView={vi.fn()}
        />
      );

      const addButton = screen.getByLabelText('Add new view');
      expect(addButton).toHaveAttribute('type', 'button');
    });

    it('applies correct CSS class to add button', () => {
      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          currentFilters={[]}
          onViewChange={vi.fn()}
          onCreateView={vi.fn()}
        />
      );

      const addButton = screen.getByLabelText('Add new view');
      expect(addButton).toHaveClass('gitboard-view-tabs__add-button');
    });
  });

  describe('Edit View Name', () => {
    it('shows input field when tab is double-clicked', async () => {
      const user = userEvent.setup();

      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          currentFilters={[]}
          onViewChange={vi.fn()}
          onUpdateView={vi.fn()}
        />
      );

      const allTasksTab = screen.getByText('All Tasks');
      await user.dblClick(allTasksTab);

      const input = screen.getByLabelText('Edit view name');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('All Tasks');
    });

    it('focuses and selects text when editing starts', async () => {
      const user = userEvent.setup();

      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          currentFilters={[]}
          onViewChange={vi.fn()}
          onUpdateView={vi.fn()}
        />
      );

      const allTasksTab = screen.getByText('All Tasks');
      await user.dblClick(allTasksTab);

      const input = screen.getByLabelText('Edit view name');
      expect(input).toHaveFocus();
    });

    it('saves name on Enter key', async () => {
      const user = userEvent.setup();
      const onUpdateView = vi.fn();

      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          currentFilters={[]}
          onViewChange={vi.fn()}
          onUpdateView={onUpdateView}
        />
      );

      const allTasksTab = screen.getByText('All Tasks');
      await user.dblClick(allTasksTab);

      const input = screen.getByLabelText('Edit view name');
      await user.clear(input);
      await user.type(input, 'Updated Name{Enter}');

      expect(onUpdateView).toHaveBeenCalledTimes(1);
      expect(onUpdateView).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'view_all',
          name: 'Updated Name',
        })
      );
    });

    it('cancels editing on Escape key', async () => {
      const user = userEvent.setup();
      const onUpdateView = vi.fn();

      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          currentFilters={[]}
          onViewChange={vi.fn()}
          onUpdateView={onUpdateView}
        />
      );

      const allTasksTab = screen.getByText('All Tasks');
      await user.dblClick(allTasksTab);

      const input = screen.getByLabelText('Edit view name');
      await user.clear(input);
      await user.type(input, 'Updated Name{Escape}');

      expect(onUpdateView).not.toHaveBeenCalled();
      expect(screen.queryByLabelText('Edit view name')).not.toBeInTheDocument();
    });

    it('saves name on blur (click away)', async () => {
      const user = userEvent.setup();
      const onUpdateView = vi.fn();

      render(
        <div>
          <ViewTabs
            views={mockViews}
            currentViewId="view_all"
            currentFilters={[]}
            onViewChange={vi.fn()}
            onUpdateView={onUpdateView}
          />
          <button>Outside Button</button>
        </div>
      );

      const allTasksTab = screen.getByText('All Tasks');
      await user.dblClick(allTasksTab);

      const input = screen.getByLabelText('Edit view name');
      await user.clear(input);
      await user.type(input, 'Updated Name');

      // Click outside to trigger blur
      const outsideButton = screen.getByText('Outside Button');
      await user.click(outsideButton);

      expect(onUpdateView).toHaveBeenCalledTimes(1);
      expect(onUpdateView).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'view_all',
          name: 'Updated Name',
        })
      );
    });

    it('does not save if name is empty (preserves original name)', async () => {
      const user = userEvent.setup();
      const onUpdateView = vi.fn();

      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          currentFilters={[]}
          onViewChange={vi.fn()}
          onUpdateView={onUpdateView}
        />
      );

      const allTasksTab = screen.getByText('All Tasks');
      await user.dblClick(allTasksTab);

      const input = screen.getByLabelText('Edit view name');
      await user.clear(input);
      await user.keyboard('{Enter}');

      expect(onUpdateView).toHaveBeenCalledTimes(1);
      expect(onUpdateView).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'view_all',
          name: 'All Tasks', // Original name preserved
        })
      );
    });

    it('trims whitespace from edited name', async () => {
      const user = userEvent.setup();
      const onUpdateView = vi.fn();

      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          currentFilters={[]}
          onViewChange={vi.fn()}
          onUpdateView={onUpdateView}
        />
      );

      const allTasksTab = screen.getByText('All Tasks');
      await user.dblClick(allTasksTab);

      const input = screen.getByLabelText('Edit view name');
      await user.clear(input);
      await user.type(input, '  Trimmed Name  {Enter}');

      expect(onUpdateView).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Trimmed Name',
        })
      );
    });

    it('does not call onUpdateView when onUpdateView is undefined', async () => {
      const user = userEvent.setup();

      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          currentFilters={[]}
          onViewChange={vi.fn()}
        />
      );

      const allTasksTab = screen.getByText('All Tasks');
      // Double-click should not trigger editing without onUpdateView
      await user.dblClick(allTasksTab);

      const input = screen.queryByLabelText('Edit view name');
      expect(input).not.toBeInTheDocument();
    });

    it('preserves all view properties except name when updating', async () => {
      const user = userEvent.setup();
      const onUpdateView = vi.fn();

      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_filtered"
          currentFilters={[]}
          onViewChange={vi.fn()}
          onUpdateView={onUpdateView}
        />
      );

      const inProgressTab = screen.getByText('In Progress');
      await user.dblClick(inProgressTab);

      const input = screen.getByLabelText('Edit view name');
      await user.clear(input);
      await user.type(input, 'New Name{Enter}');

      expect(onUpdateView).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'view_filtered',
          name: 'New Name',
          columns: ['fld_1'],
          sortBy: { field: 'fld_1', direction: 'asc' },
          filters: [{ field: 'fld_status', operator: 'equals', value: 'in_progress' }],
          groupBy: null,
        })
      );
    });

    it('applies correct CSS class to edit input', async () => {
      const user = userEvent.setup();

      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          currentFilters={[]}
          onViewChange={vi.fn()}
          onUpdateView={vi.fn()}
        />
      );

      const allTasksTab = screen.getByText('All Tasks');
      await user.dblClick(allTasksTab);

      const input = screen.getByLabelText('Edit view name');
      expect(input).toHaveClass('gitboard-view-tabs__input');
    });
  });

  describe('Save Button', () => {
    it('shows save button when filters differ from view filters', () => {
      const viewFilters = [
        { field: 'fld_status', operator: 'equals' as const, value: 'in_progress' },
      ];

      const currentFilters = [
        { field: 'fld_status', operator: 'equals' as const, value: 'done' },
      ];

      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_filtered"
          currentFilters={currentFilters}
          onViewChange={vi.fn()}
          onUpdateView={vi.fn()}
        />
      );

      const saveButton = screen.getByLabelText('Save view changes');
      expect(saveButton).toBeInTheDocument();
      expect(saveButton).toHaveTextContent('Save');
    });

    it('hides save button when filters match view filters', () => {
      const viewFilters = [
        { field: 'fld_status', operator: 'equals' as const, value: 'in_progress' },
      ];

      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_filtered"
          currentFilters={viewFilters}
          onViewChange={vi.fn()}
          onUpdateView={vi.fn()}
        />
      );

      const saveButton = screen.queryByLabelText('Save view changes');
      expect(saveButton).not.toBeInTheDocument();
    });

    it('hides save button when onUpdateView is undefined', () => {
      const currentFilters = [
        { field: 'fld_status', operator: 'equals' as const, value: 'done' },
      ];

      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_filtered"
          currentFilters={currentFilters}
          onViewChange={vi.fn()}
        />
      );

      const saveButton = screen.queryByLabelText('Save view changes');
      expect(saveButton).not.toBeInTheDocument();
    });

    it('calls onUpdateView with current filters when clicked', async () => {
      const user = userEvent.setup();
      const onUpdateView = vi.fn();

      const currentFilters = [
        { field: 'fld_status', operator: 'equals' as const, value: 'done' },
        { field: 'fld_owner', operator: 'equals' as const, value: 'user_2' },
      ];

      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_filtered"
          currentFilters={currentFilters}
          onViewChange={vi.fn()}
          onUpdateView={onUpdateView}
        />
      );

      const saveButton = screen.getByLabelText('Save view changes');
      await user.click(saveButton);

      expect(onUpdateView).toHaveBeenCalledTimes(1);
      expect(onUpdateView).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'view_filtered',
          filters: currentFilters,
        })
      );
    });

    it('preserves all view properties except filters when saving', async () => {
      const user = userEvent.setup();
      const onUpdateView = vi.fn();

      const currentFilters = [
        { field: 'fld_status', operator: 'equals' as const, value: 'done' },
      ];

      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_filtered"
          currentFilters={currentFilters}
          onViewChange={vi.fn()}
          onUpdateView={onUpdateView}
        />
      );

      const saveButton = screen.getByLabelText('Save view changes');
      await user.click(saveButton);

      expect(onUpdateView).toHaveBeenCalledWith({
        id: 'view_filtered',
        name: 'In Progress',
        columns: ['fld_1'],
        sortBy: { field: 'fld_1', direction: 'asc' },
        filters: currentFilters,
        groupBy: null,
      });
    });

    it('applies correct CSS class to save button', () => {
      const currentFilters = [
        { field: 'fld_status', operator: 'equals' as const, value: 'done' },
      ];

      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_filtered"
          currentFilters={currentFilters}
          onViewChange={vi.fn()}
          onUpdateView={vi.fn()}
        />
      );

      const saveButton = screen.getByLabelText('Save view changes');
      expect(saveButton).toHaveClass('gitboard-view-tabs__save-button');
    });

    it('has proper button type attribute', () => {
      const currentFilters = [
        { field: 'fld_status', operator: 'equals' as const, value: 'done' },
      ];

      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_filtered"
          currentFilters={currentFilters}
          onViewChange={vi.fn()}
          onUpdateView={vi.fn()}
        />
      );

      const saveButton = screen.getByLabelText('Save view changes');
      expect(saveButton).toHaveAttribute('type', 'button');
    });

    it('detects changes when filter is added', () => {
      const currentFilters = [
        { field: 'fld_status', operator: 'equals' as const, value: 'in_progress' },
        { field: 'fld_owner', operator: 'equals' as const, value: 'user_1' },
      ];

      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_filtered"
          currentFilters={currentFilters}
          onViewChange={vi.fn()}
          onUpdateView={vi.fn()}
        />
      );

      const saveButton = screen.getByLabelText('Save view changes');
      expect(saveButton).toBeInTheDocument();
    });

    it('detects changes when filter is removed', () => {
      const currentFilters: any[] = [];

      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_filtered"
          currentFilters={currentFilters}
          onViewChange={vi.fn()}
          onUpdateView={vi.fn()}
        />
      );

      const saveButton = screen.getByLabelText('Save view changes');
      expect(saveButton).toBeInTheDocument();
    });

    it('detects changes when filter value is modified', () => {
      const currentFilters = [
        { field: 'fld_status', operator: 'equals' as const, value: 'done' }, // Different value
      ];

      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_filtered"
          currentFilters={currentFilters}
          onViewChange={vi.fn()}
          onUpdateView={vi.fn()}
        />
      );

      const saveButton = screen.getByLabelText('Save view changes');
      expect(saveButton).toBeInTheDocument();
    });

    it('detects changes when filter operator is modified', () => {
      const currentFilters = [
        { field: 'fld_status', operator: 'not-equals' as const, value: 'in_progress' },
      ];

      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_filtered"
          currentFilters={currentFilters}
          onViewChange={vi.fn()}
          onUpdateView={vi.fn()}
        />
      );

      const saveButton = screen.getByLabelText('Save view changes');
      expect(saveButton).toBeInTheDocument();
    });
  });

  describe('Delete View', () => {
    it('renders caret icon when onDeleteView is provided', () => {
      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          currentFilters={[]}
          onViewChange={vi.fn()}
          onDeleteView={vi.fn()}
        />
      );

      const carets = screen.getAllByLabelText('Tab options');
      expect(carets).toHaveLength(3);
    });

    it('does not render caret when onDeleteView is not provided', () => {
      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          currentFilters={[]}
          onViewChange={vi.fn()}
        />
      );

      const carets = screen.queryAllByLabelText('Tab options');
      expect(carets).toHaveLength(0);
    });

    it('opens dropdown menu when caret is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          currentFilters={[]}
          onViewChange={vi.fn()}
          onDeleteView={vi.fn()}
        />
      );

      const carets = screen.getAllByLabelText('Tab options');
      await user.click(carets[0]);

      const deleteButton = screen.getByText('Delete');
      expect(deleteButton).toBeInTheDocument();
    });

    it('calls onDeleteView when delete menu item is clicked', async () => {
      const user = userEvent.setup();
      const handleDeleteView = vi.fn();

      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          currentFilters={[]}
          onViewChange={vi.fn()}
          onDeleteView={handleDeleteView}
        />
      );

      // Open dropdown for second tab (In Progress)
      const carets = screen.getAllByLabelText('Tab options');
      await user.click(carets[1]);

      // Click delete
      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);

      expect(handleDeleteView).toHaveBeenCalledWith('view_filtered');
      expect(handleDeleteView).toHaveBeenCalledTimes(1);
    });

    it('does not call onViewChange when deleting non-active tab', async () => {
      const user = userEvent.setup();
      const handleViewChange = vi.fn();

      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          currentFilters={[]}
          onViewChange={handleViewChange}
          onDeleteView={vi.fn()}
        />
      );

      // Open dropdown for second tab
      const carets = screen.getAllByLabelText('Tab options');
      await user.click(carets[1]);

      // Click delete
      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);

      expect(handleViewChange).not.toHaveBeenCalled();
    });

    it('switches to another view before deleting when deleting active view', async () => {
      const user = userEvent.setup();
      const handleViewChange = vi.fn();
      const handleDeleteView = vi.fn();

      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_filtered"
          currentFilters={[]}
          onViewChange={handleViewChange}
          onDeleteView={handleDeleteView}
        />
      );

      // Open dropdown for active tab (In Progress)
      const carets = screen.getAllByLabelText('Tab options');
      await user.click(carets[1]);

      // Click delete
      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);

      // Should switch to the first view before deleting
      expect(handleViewChange).toHaveBeenCalledWith(mockViews[0]);
      expect(handleDeleteView).toHaveBeenCalledWith('view_filtered');
    });

    it('does not render caret when only one view exists', () => {
      const singleView = [mockViews[0]];

      render(
        <ViewTabs
          views={singleView}
          currentViewId="view_all"
          currentFilters={[]}
          onViewChange={vi.fn()}
          onDeleteView={vi.fn()}
        />
      );

      const carets = screen.queryAllByLabelText('Tab options');
      expect(carets).toHaveLength(0);
    });

    it('closes dropdown when clicking outside', async () => {
      const user = userEvent.setup();

      const { container } = render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          currentFilters={[]}
          onViewChange={vi.fn()}
          onDeleteView={vi.fn()}
        />
      );

      // Open dropdown
      const carets = screen.getAllByLabelText('Tab options');
      await user.click(carets[0]);

      expect(screen.getByText('Delete')).toBeInTheDocument();

      // Click outside
      await user.click(container);

      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });

    it('caret click does not trigger tab click', async () => {
      const user = userEvent.setup();
      const handleViewChange = vi.fn();

      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          currentFilters={[]}
          onViewChange={handleViewChange}
          onDeleteView={vi.fn()}
        />
      );

      const carets = screen.getAllByLabelText('Tab options');
      await user.click(carets[1]);

      // Should not switch to the view
      expect(handleViewChange).not.toHaveBeenCalled();
    });

    it('delete menu item has danger styling class', async () => {
      const user = userEvent.setup();

      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          currentFilters={[]}
          onViewChange={vi.fn()}
          onDeleteView={vi.fn()}
        />
      );

      const carets = screen.getAllByLabelText('Tab options');
      await user.click(carets[0]);

      const deleteButton = screen.getByText('Delete');
      expect(deleteButton).toHaveClass('gitboard-view-tabs__dropdown-item--danger');
    });

    it('delete menu item renders with trash icon', async () => {
      const user = userEvent.setup();

      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          currentFilters={[]}
          onViewChange={vi.fn()}
          onDeleteView={vi.fn()}
        />
      );

      const carets = screen.getAllByLabelText('Tab options');
      await user.click(carets[0]);

      const deleteButton = screen.getByText('Delete');
      const svg = deleteButton.querySelector('svg');
      
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '14');
      expect(svg).toHaveAttribute('height', '14');
    });

    it('handles deletion of last active view correctly', async () => {
      const user = userEvent.setup();
      const handleViewChange = vi.fn();
      const handleDeleteView = vi.fn();

      const twoViews = [mockViews[0], mockViews[1]];

      render(
        <ViewTabs
          views={twoViews}
          currentViewId="view_filtered"
          currentFilters={[]}
          onViewChange={handleViewChange}
          onDeleteView={handleDeleteView}
        />
      );

      // Open dropdown for active view
      const carets = screen.getAllByLabelText('Tab options');
      await user.click(carets[1]);

      // Click delete
      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);

      // Should switch to the remaining view
      expect(handleViewChange).toHaveBeenCalledWith(twoViews[0]);
      expect(handleDeleteView).toHaveBeenCalledWith('view_filtered');
    });
  });

  describe('View Reordering', () => {
    it('allows dragging view tabs when onViewsReorder is provided', () => {
      const { container } = render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          currentFilters={[]}
          onViewChange={vi.fn()}
          onViewsReorder={vi.fn()}
        />
      );

      const wrappers = container.querySelectorAll('.gitboard-view-tabs__tab-wrapper');
      expect(wrappers[0]).toHaveAttribute('draggable', 'true');
      expect(wrappers[1]).toHaveAttribute('draggable', 'true');
      expect(wrappers[2]).toHaveAttribute('draggable', 'true');
    });

    it('renders all tab wrappers with drag handlers', () => {
      const { container } = render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          currentFilters={[]}
          onViewChange={vi.fn()}
          onViewsReorder={vi.fn()}
        />
      );

      const wrappers = container.querySelectorAll('.gitboard-view-tabs__tab-wrapper');
      expect(wrappers).toHaveLength(3);

      wrappers.forEach((wrapper) => {
        expect(wrapper).toHaveAttribute('draggable');
      });
    });

    it('disables dragging when editing view name', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          currentFilters={[]}
          onViewChange={vi.fn()}
          onUpdateView={vi.fn()}
          onViewsReorder={vi.fn()}
        />
      );

      const allTasksTab = screen.getByText('All Tasks');
      await user.dblClick(allTasksTab);

      // Find the wrapper containing the input
      const wrapper = container.querySelector('.gitboard-view-tabs__tab-wrapper');

      // Should not be draggable while editing
      expect(wrapper).toHaveAttribute('draggable', 'false');
    });

    it('onViewsReorder callback is provided to component', () => {
      const onViewsReorder = vi.fn();
      render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          currentFilters={[]}
          onViewChange={vi.fn()}
          onViewsReorder={onViewsReorder}
        />
      );

      // Component should render without errors with onViewsReorder provided
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(3);
    });

    it('renders draggable wrappers even without onViewsReorder', () => {
      const { container } = render(
        <ViewTabs
          views={mockViews}
          currentViewId="view_all"
          currentFilters={[]}
          onViewChange={vi.fn()}
        />
      );

      const wrappers = container.querySelectorAll('.gitboard-view-tabs__tab-wrapper');
      expect(wrappers).toHaveLength(3);

      // Tabs are still rendered with draggable attribute
      wrappers.forEach((wrapper) => {
        expect(wrapper).toHaveAttribute('draggable');
      });
    });
  });
});
