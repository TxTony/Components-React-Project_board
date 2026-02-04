/**
 * GroupByChange Event Tests
 * Tests for verifying onGroupByChange event emission
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GitBoardTable } from '../../src/components/GitBoardTable';
import type { FieldDefinition, Row, GroupByChangeEvent } from '../../src/types';

describe('GitBoardTable - onGroupByChange Event', () => {
  const testFields: FieldDefinition[] = [
    { id: 'fld_title', name: 'Title', type: 'title', visible: true },
    {
      id: 'fld_status',
      name: 'Status',
      type: 'single-select',
      visible: true,
      options: [
        { id: 'opt_todo', label: 'To Do' },
        { id: 'opt_progress', label: 'In Progress' },
        { id: 'opt_done', label: 'Done' },
      ],
    },
    {
      id: 'fld_assignee',
      name: 'Assignee',
      type: 'assignee',
      visible: true,
      options: [
        { id: 'user_1', label: 'Alice' },
        { id: 'user_2', label: 'Bob' },
      ],
    },
  ];

  const testRows: Row[] = [
    { id: 'row_1', values: { fld_title: 'Task 1', fld_status: 'opt_todo', fld_assignee: 'user_1' } },
    { id: 'row_2', values: { fld_title: 'Task 2', fld_status: 'opt_progress', fld_assignee: 'user_2' } },
    { id: 'row_3', values: { fld_title: 'Task 3', fld_status: 'opt_done', fld_assignee: 'user_1' } },
  ];

  it('calls onGroupByChange when a group by field is selected', async () => {
    const user = userEvent.setup();
    const onGroupByChange = vi.fn();

    render(
      <GitBoardTable
        fields={testFields}
        rows={testRows}
        onGroupByChange={onGroupByChange}
      />
    );

    // Find and click the "Group by" button to open the dropdown
    const groupByButton = screen.getByRole('button', { name: /group by/i });
    await user.click(groupByButton);

    // Click on the "Status" option to group by status
    const statusOption = screen.getByRole('menuitem', { name: /status/i });
    await user.click(statusOption);

    // Verify onGroupByChange was called with correct event
    expect(onGroupByChange).toHaveBeenCalledTimes(1);
    expect(onGroupByChange).toHaveBeenCalledWith({
      fieldId: 'fld_status',
      field: expect.objectContaining({
        id: 'fld_status',
        name: 'Status',
        type: 'single-select',
      }),
    });
  });

  it('calls onGroupByChange with null when grouping is removed', async () => {
    const user = userEvent.setup();
    const onGroupByChange = vi.fn();

    const { container } = render(
      <GitBoardTable
        fields={testFields}
        rows={testRows}
        onGroupByChange={onGroupByChange}
      />
    );

    // First, set a group by
    const groupByButton = screen.getByRole('button', { name: /group by/i });
    await user.click(groupByButton);

    const statusOption = screen.getByRole('menuitem', { name: /status/i });
    await user.click(statusOption);

    // Reset mock to track only the next call
    onGroupByChange.mockClear();

    // Open group by menu again - find the button by the group-by-menu class
    const groupByMenuButton = container.querySelector('.gitboard-table__group-by-menu button');
    expect(groupByMenuButton).not.toBeNull();
    await user.click(groupByMenuButton as HTMLElement);

    const noGroupingOption = screen.getByRole('menuitem', { name: /no grouping/i });
    await user.click(noGroupingOption);

    // Verify onGroupByChange was called with null
    expect(onGroupByChange).toHaveBeenCalledTimes(1);
    expect(onGroupByChange).toHaveBeenCalledWith({
      fieldId: null,
      field: null,
    });
  });

  it('calls onGroupByChange when switching between different group by fields', async () => {
    const user = userEvent.setup();
    const onGroupByChange = vi.fn();

    const { container } = render(
      <GitBoardTable
        fields={testFields}
        rows={testRows}
        onGroupByChange={onGroupByChange}
      />
    );

    // Group by Status first
    const groupByButton = screen.getByRole('button', { name: /group by/i });
    await user.click(groupByButton);

    const statusOption = screen.getByRole('menuitem', { name: /status/i });
    await user.click(statusOption);

    expect(onGroupByChange).toHaveBeenCalledWith({
      fieldId: 'fld_status',
      field: expect.objectContaining({ id: 'fld_status' }),
    });

    // Now switch to group by Assignee - find the button by the group-by-menu class
    const groupByMenuButton = container.querySelector('.gitboard-table__group-by-menu button');
    expect(groupByMenuButton).not.toBeNull();
    await user.click(groupByMenuButton as HTMLElement);

    const assigneeOption = screen.getByRole('menuitem', { name: /assignee/i });
    await user.click(assigneeOption);

    expect(onGroupByChange).toHaveBeenCalledTimes(2);
    expect(onGroupByChange).toHaveBeenLastCalledWith({
      fieldId: 'fld_assignee',
      field: expect.objectContaining({
        id: 'fld_assignee',
        name: 'Assignee',
        type: 'assignee',
      }),
    });
  });

  it('does not throw when onGroupByChange is not provided', async () => {
    const user = userEvent.setup();

    // Render without onGroupByChange callback
    render(
      <GitBoardTable
        fields={testFields}
        rows={testRows}
      />
    );

    // Should not throw when changing group by
    const groupByButton = screen.getByRole('button', { name: /group by/i });
    await user.click(groupByButton);

    const statusOption = screen.getByRole('menuitem', { name: /status/i });

    // This should not throw
    await expect(user.click(statusOption)).resolves.not.toThrow();
  });

  it('emits event with correct field definition including options', async () => {
    const user = userEvent.setup();
    const onGroupByChange = vi.fn();

    render(
      <GitBoardTable
        fields={testFields}
        rows={testRows}
        onGroupByChange={onGroupByChange}
      />
    );

    const groupByButton = screen.getByRole('button', { name: /group by/i });
    await user.click(groupByButton);

    const statusOption = screen.getByRole('menuitem', { name: /status/i });
    await user.click(statusOption);

    // Verify the full field definition is included
    const event: GroupByChangeEvent = onGroupByChange.mock.calls[0][0];
    expect(event.field).not.toBeNull();
    expect(event.field!.options).toBeDefined();
    expect(event.field!.options).toHaveLength(3);
    expect(event.field!.options).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'opt_todo', label: 'To Do' }),
        expect.objectContaining({ id: 'opt_progress', label: 'In Progress' }),
        expect.objectContaining({ id: 'opt_done', label: 'Done' }),
      ])
    );
  });

  it('renders grouped view after group by change', async () => {
    const user = userEvent.setup();
    const onGroupByChange = vi.fn();

    const { container } = render(
      <GitBoardTable
        fields={testFields}
        rows={testRows}
        onGroupByChange={onGroupByChange}
      />
    );

    // Initially, no group headers should be visible (look for group header rows)
    expect(container.querySelector('.gitboard-table__group-header')).toBeNull();

    // Group by Status
    const groupByButton = screen.getByRole('button', { name: /group by/i });
    await user.click(groupByButton);

    const statusOption = screen.getByRole('menuitem', { name: /status/i });
    await user.click(statusOption);

    // After grouping, group headers should be visible
    const groupHeaders = container.querySelectorAll('.gitboard-table__group-header');
    expect(groupHeaders.length).toBeGreaterThan(0);

    // Verify the onGroupByChange callback was called
    expect(onGroupByChange).toHaveBeenCalledWith({
      fieldId: 'fld_status',
      field: expect.objectContaining({ id: 'fld_status' }),
    });
  });
});
