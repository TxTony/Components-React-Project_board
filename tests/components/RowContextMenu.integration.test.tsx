/**
 * Integration Tests for Row Context Menu in GitBoardTable
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GitBoardTable } from '../../src/components/GitBoardTable';
import type { FieldDefinition, Row, CustomAction, ContextMenuClickEvent } from '../../src/types';

describe('GitBoardTable - Row Context Menu Integration', () => {
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
        { id: 'todo', label: 'Todo', color: 'gray' },
        { id: 'in-progress', label: 'In Progress', color: 'blue' },
        { id: 'done', label: 'Done', color: 'green' },
      ],
    },
  ];

  const mockRows: Row[] = [
    {
      id: 'row-1',
      values: {
        title: 'First Task',
        status: 'todo',
      },
    },
    {
      id: 'row-2',
      values: {
        title: 'Second Task',
        status: 'in-progress',
      },
    },
    {
      id: 'row-3',
      values: {
        title: 'Third Task',
        status: 'done',
      },
    },
  ];

  const defaultProps = {
    fields: mockFields,
    rows: mockRows,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Opening Context Menu', () => {
    it('should open context menu on row right-click', async () => {
      render(<GitBoardTable {...defaultProps} />);

      const rows = document.querySelectorAll('.gitboard-table__row');
      const firstRow = rows[0];

      fireEvent.contextMenu(firstRow);

      await waitFor(() => {
        const menu = document.querySelector('.gitboard-context-menu');
        expect(menu).toBeInTheDocument();
      });
    });

    it('should position context menu at mouse coordinates', async () => {
      render(<GitBoardTable {...defaultProps} />);

      const rows = document.querySelectorAll('.gitboard-table__row');
      const firstRow = rows[0];

      fireEvent.contextMenu(firstRow, { clientX: 150, clientY: 250 });

      await waitFor(() => {
        const menu = document.querySelector('.gitboard-context-menu');
        expect(menu).toHaveStyle({ left: '150px', top: '250px' });
      });
    });

    it('should prevent default context menu behavior', () => {
      render(<GitBoardTable {...defaultProps} />);

      const rows = document.querySelectorAll('.gitboard-table__row');
      const firstRow = rows[0];

      const event = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        clientX: 100,
        clientY: 100,
      });

      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      firstRow.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should close previous menu when opening new one', async () => {
      render(<GitBoardTable {...defaultProps} />);

      const rows = document.querySelectorAll('.gitboard-table__row');

      // Open menu on first row
      fireEvent.contextMenu(rows[0]);
      await waitFor(() => {
        expect(document.querySelector('.gitboard-context-menu')).toBeInTheDocument();
      });

      // Open menu on second row
      fireEvent.contextMenu(rows[1]);

      // Should still have only one menu
      const menus = document.querySelectorAll('.gitboard-context-menu');
      expect(menus).toHaveLength(1);
    });
  });

  describe('Show Action', () => {
    it('should open detail panel when Show is clicked', async () => {
      render(<GitBoardTable {...defaultProps} />);

      const rows = document.querySelectorAll('.gitboard-table__row');
      fireEvent.contextMenu(rows[0]);

      await waitFor(() => {
        expect(screen.getByText('Show')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Show'));

      await waitFor(() => {
        // Detail panel should be visible
        expect(screen.getByLabelText('Row details panel')).toBeInTheDocument();
      });
    });

    it('should close context menu after Show is clicked', async () => {
      render(<GitBoardTable {...defaultProps} />);

      const rows = document.querySelectorAll('.gitboard-table__row');
      fireEvent.contextMenu(rows[0]);

      await waitFor(() => {
        expect(screen.getByText('Show')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Show'));

      await waitFor(() => {
        expect(document.querySelector('.gitboard-context-menu')).not.toBeInTheDocument();
      });
    });

    it('should show correct row details when Show is clicked', async () => {
      render(<GitBoardTable {...defaultProps} />);

      const rows = document.querySelectorAll('.gitboard-table__row');
      fireEvent.contextMenu(rows[1]); // Second row

      await waitFor(() => {
        expect(screen.getByText('Show')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Show'));

      await waitFor(() => {
        // Should show details for second row - check for unique ID
        expect(screen.getByText('ID: row-2')).toBeInTheDocument();
        // Also verify the panel is actually open
        expect(screen.getByLabelText('Row details panel')).toBeInTheDocument();
      });
    });
  });

  describe('Delete Action', () => {
    it('should show confirmation dialog when Delete is clicked', async () => {
      render(<GitBoardTable {...defaultProps} />);

      const rows = document.querySelectorAll('.gitboard-table__row');
      fireEvent.contextMenu(rows[0]);

      await waitFor(() => {
        expect(screen.getByText('Delete')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Delete'));

      await waitFor(() => {
        expect(screen.getByText('Delete row?')).toBeInTheDocument();
        expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
      });
    });

    it('should delete row when confirmed', async () => {
      const onChange = vi.fn();
      render(<GitBoardTable {...defaultProps} onChange={onChange} />);

      // Initial row count
      let rows = document.querySelectorAll('.gitboard-table__row');
      expect(rows).toHaveLength(3);

      // Open context menu on first row
      fireEvent.contextMenu(rows[0]);

      await waitFor(() => {
        expect(screen.getByText('Delete')).toBeInTheDocument();
      });

      // Click Delete
      fireEvent.click(screen.getByText('Delete'));

      await waitFor(() => {
        expect(screen.getByText('Delete row?')).toBeInTheDocument();
      });

      // Confirm deletion
      const deleteButtons = screen.getAllByText('Delete');
      const confirmButton = deleteButtons.find(btn => btn.closest('.bg-red-600'));
      fireEvent.click(confirmButton!);

      // Row should be deleted
      await waitFor(() => {
        rows = document.querySelectorAll('.gitboard-table__row');
        expect(rows).toHaveLength(2);
      });

      // onChange should be called with updated rows
      expect(onChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 'row-2' }),
          expect.objectContaining({ id: 'row-3' }),
        ])
      );
    });

    it('should not delete row when cancelled', async () => {
      render(<GitBoardTable {...defaultProps} />);

      const rows = document.querySelectorAll('.gitboard-table__row');
      expect(rows).toHaveLength(3);

      // Open context menu
      fireEvent.contextMenu(rows[0]);

      await waitFor(() => {
        expect(screen.getByText('Delete')).toBeInTheDocument();
      });

      // Click Delete
      fireEvent.click(screen.getByText('Delete'));

      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });

      // Click Cancel
      fireEvent.click(screen.getByText('Cancel'));

      // Row should still exist
      await waitFor(() => {
        const updatedRows = document.querySelectorAll('.gitboard-table__row');
        expect(updatedRows).toHaveLength(3);
      });
    });

    it('should close context menu after deletion', async () => {
      render(<GitBoardTable {...defaultProps} />);

      const rows = document.querySelectorAll('.gitboard-table__row');
      fireEvent.contextMenu(rows[0]);

      await waitFor(() => {
        expect(screen.getByText('Delete')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Delete'));

      await waitFor(() => {
        expect(screen.getByText('Delete row?')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText('Delete');
      const confirmButton = deleteButtons.find(btn => btn.closest('.bg-red-600'));
      fireEvent.click(confirmButton!);

      await waitFor(() => {
        expect(document.querySelector('.gitboard-context-menu')).not.toBeInTheDocument();
      });
    });
  });

  describe('Custom Actions', () => {
    const customActions: CustomAction[] = [
      { name: 'archive', label: 'Archive', icon: '📦' },
      { name: 'duplicate', label: 'Duplicate', icon: '📋' },
      { name: 'export', label: 'Export' },
    ];

    it('should render custom actions in context menu', async () => {
      const onContextMenuClick = vi.fn();
      render(
        <GitBoardTable
          {...defaultProps}
          customActions={customActions}
          onContextMenuClick={onContextMenuClick}
        />
      );

      const rows = document.querySelectorAll('.gitboard-table__row');
      fireEvent.contextMenu(rows[0]);

      await waitFor(() => {
        expect(screen.getByText('Archive')).toBeInTheDocument();
        expect(screen.getByText('Duplicate')).toBeInTheDocument();
        expect(screen.getByText('Export')).toBeInTheDocument();
      });
    });

    it('should dispatch context-menu-click event when custom action is clicked', async () => {
      const onContextMenuClick = vi.fn();
      render(
        <GitBoardTable
          {...defaultProps}
          customActions={customActions}
          onContextMenuClick={onContextMenuClick}
        />
      );

      const rows = document.querySelectorAll('.gitboard-table__row');
      fireEvent.contextMenu(rows[0]);

      await waitFor(() => {
        expect(screen.getByText('Archive')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Archive'));

      expect(onContextMenuClick).toHaveBeenCalledWith({
        type: 'context-menu-click',
        actionName: 'archive',
        row: expect.objectContaining({ id: 'row-1' }),
      });
    });

    it('should pass correct row data for different rows', async () => {
      const onContextMenuClick = vi.fn();
      render(
        <GitBoardTable
          {...defaultProps}
          customActions={customActions}
          onContextMenuClick={onContextMenuClick}
        />
      );

      const rows = document.querySelectorAll('.gitboard-table__row');

      // Test first row
      fireEvent.contextMenu(rows[0]);
      await waitFor(() => expect(screen.getByText('Archive')).toBeInTheDocument());
      fireEvent.click(screen.getByText('Archive'));

      expect(onContextMenuClick).toHaveBeenCalledWith(
        expect.objectContaining({
          row: expect.objectContaining({ id: 'row-1' }),
        })
      );

      vi.clearAllMocks();

      // Test second row
      fireEvent.contextMenu(rows[1]);
      await waitFor(() => expect(screen.getByText('Archive')).toBeInTheDocument());
      fireEvent.click(screen.getByText('Archive'));

      expect(onContextMenuClick).toHaveBeenCalledWith(
        expect.objectContaining({
          row: expect.objectContaining({ id: 'row-2' }),
        })
      );
    });

    it('should close context menu after custom action is clicked', async () => {
      const onContextMenuClick = vi.fn();
      render(
        <GitBoardTable
          {...defaultProps}
          customActions={customActions}
          onContextMenuClick={onContextMenuClick}
        />
      );

      const rows = document.querySelectorAll('.gitboard-table__row');
      fireEvent.contextMenu(rows[0]);

      await waitFor(() => {
        expect(screen.getByText('Archive')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Archive'));

      await waitFor(() => {
        expect(document.querySelector('.gitboard-context-menu')).not.toBeInTheDocument();
      });
    });

    it('should handle multiple custom actions correctly', async () => {
      const onContextMenuClick = vi.fn();
      render(
        <GitBoardTable
          {...defaultProps}
          customActions={customActions}
          onContextMenuClick={onContextMenuClick}
        />
      );

      const rows = document.querySelectorAll('.gitboard-table__row');
      fireEvent.contextMenu(rows[0]);

      // Click Archive
      await waitFor(() => expect(screen.getByText('Archive')).toBeInTheDocument());
      fireEvent.click(screen.getByText('Archive'));

      expect(onContextMenuClick).toHaveBeenCalledWith(
        expect.objectContaining({ actionName: 'archive' })
      );

      vi.clearAllMocks();

      // Open menu again and click Duplicate
      fireEvent.contextMenu(rows[0]);
      await waitFor(() => expect(screen.getByText('Duplicate')).toBeInTheDocument());
      fireEvent.click(screen.getByText('Duplicate'));

      expect(onContextMenuClick).toHaveBeenCalledWith(
        expect.objectContaining({ actionName: 'duplicate' })
      );
    });

    it('should show divider between default and custom actions', async () => {
      const onContextMenuClick = vi.fn();
      const { container } = render(
        <GitBoardTable
          {...defaultProps}
          customActions={customActions}
          onContextMenuClick={onContextMenuClick}
        />
      );

      const rows = document.querySelectorAll('.gitboard-table__row');
      fireEvent.contextMenu(rows[0]);

      await waitFor(() => {
        const divider = container.querySelector('.gitboard-context-menu__divider');
        expect(divider).toBeInTheDocument();
      });
    });
  });

  describe('Context Menu Closing', () => {
    it('should close menu when clicking outside', async () => {
      render(<GitBoardTable {...defaultProps} />);

      const rows = document.querySelectorAll('.gitboard-table__row');
      fireEvent.contextMenu(rows[0]);

      await waitFor(() => {
        expect(document.querySelector('.gitboard-context-menu')).toBeInTheDocument();
      });

      // Click outside
      fireEvent.mouseDown(document.body);

      await waitFor(() => {
        expect(document.querySelector('.gitboard-context-menu')).not.toBeInTheDocument();
      });
    });

    it('should close menu when pressing Escape', async () => {
      render(<GitBoardTable {...defaultProps} />);

      const rows = document.querySelectorAll('.gitboard-table__row');
      fireEvent.contextMenu(rows[0]);

      await waitFor(() => {
        expect(document.querySelector('.gitboard-context-menu')).toBeInTheDocument();
      });

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(document.querySelector('.gitboard-context-menu')).not.toBeInTheDocument();
      });
    });
  });

  describe('With Grouped View', () => {
    it('should open context menu on grouped rows', async () => {
      render(<GitBoardTable {...defaultProps} groupByFieldId="status" />);

      // Wait for grouped view to render
      await waitFor(() => {
        expect(screen.getByText('Todo')).toBeInTheDocument();
      });

      const rows = document.querySelectorAll('.gitboard-table__row');
      fireEvent.contextMenu(rows[0]);

      await waitFor(() => {
        expect(document.querySelector('.gitboard-context-menu')).toBeInTheDocument();
      });
    });

    it('should handle custom actions in grouped view', async () => {
      const customActions: CustomAction[] = [{ name: 'test', label: 'Test' }];
      const onContextMenuClick = vi.fn();

      render(
        <GitBoardTable
          {...defaultProps}
          groupByFieldId="status"
          customActions={customActions}
          onContextMenuClick={onContextMenuClick}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Todo')).toBeInTheDocument();
      });

      const rows = document.querySelectorAll('.gitboard-table__row');
      fireEvent.contextMenu(rows[0]);

      await waitFor(() => {
        expect(screen.getByText('Test')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Test'));

      expect(onContextMenuClick).toHaveBeenCalledWith(
        expect.objectContaining({ actionName: 'test' })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle no custom actions gracefully', async () => {
      render(<GitBoardTable {...defaultProps} customActions={[]} />);

      const rows = document.querySelectorAll('.gitboard-table__row');
      fireEvent.contextMenu(rows[0]);

      await waitFor(() => {
        // Should still show default actions
        expect(screen.getByText('Show')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
      });
    });

    it('should handle context menu on last row', async () => {
      render(<GitBoardTable {...defaultProps} />);

      const rows = document.querySelectorAll('.gitboard-table__row');
      const lastRow = rows[rows.length - 1];

      fireEvent.contextMenu(lastRow);

      await waitFor(() => {
        expect(document.querySelector('.gitboard-context-menu')).toBeInTheDocument();
      });
    });

    it('should handle rapid context menu opening', async () => {
      render(<GitBoardTable {...defaultProps} />);

      const rows = document.querySelectorAll('.gitboard-table__row');

      // Rapidly open context menus on different rows
      fireEvent.contextMenu(rows[0]);
      fireEvent.contextMenu(rows[1]);
      fireEvent.contextMenu(rows[2]);

      await waitFor(() => {
        // Should only have one menu open
        const menus = document.querySelectorAll('.gitboard-context-menu');
        expect(menus).toHaveLength(1);
      });
    });
  });
});
