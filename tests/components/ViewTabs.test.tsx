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
});
