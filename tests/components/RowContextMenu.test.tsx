/**
 * Tests for RowContextMenu Component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { RowContextMenu } from '../../src/components/Table/Menu/RowContextMenu';
import type { Row, CustomAction } from '../../src/types';

describe('RowContextMenu', () => {
  const mockRow: Row = {
    id: 'row-1',
    values: {
      title: 'Test Row',
      status: 'in-progress',
    },
  };

  const defaultProps = {
    row: mockRow,
    position: { x: 100, y: 200 },
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render the context menu at the specified position', () => {
      const { container } = render(<RowContextMenu {...defaultProps} />);
      const menu = container.querySelector('.gitboard-context-menu');

      expect(menu).toBeInTheDocument();
      expect(menu).toHaveStyle({ top: '200px', left: '100px' });
    });

    it('should have proper ARIA attributes', () => {
      const { container } = render(<RowContextMenu {...defaultProps} />);
      const menu = container.querySelector('.gitboard-context-menu');

      expect(menu).toHaveAttribute('role', 'menu');
    });

    it('should not render Show action when onOpen is not provided', () => {
      render(<RowContextMenu {...defaultProps} />);

      expect(screen.queryByText('Show')).not.toBeInTheDocument();
    });

    it('should not render Delete action when onDelete is not provided', () => {
      render(<RowContextMenu {...defaultProps} />);

      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });
  });

  describe('Show Action', () => {
    it('should render Show action when onOpen is provided', () => {
      const onOpen = vi.fn();
      render(<RowContextMenu {...defaultProps} onOpen={onOpen} />);

      expect(screen.getByText('Show')).toBeInTheDocument();
    });

    it('should call onOpen with row id when Show is clicked', () => {
      const onOpen = vi.fn();
      const onClose = vi.fn();
      render(<RowContextMenu {...defaultProps} onOpen={onOpen} onClose={onClose} />);

      const showButton = screen.getByText('Show');
      fireEvent.click(showButton);

      expect(onOpen).toHaveBeenCalledWith('row-1');
      expect(onClose).toHaveBeenCalled();
    });

    it('should have eye icon for Show action', () => {
      const onOpen = vi.fn();
      render(<RowContextMenu {...defaultProps} onOpen={onOpen} />);

      const showButton = screen.getByText('Show').closest('button');
      const svg = showButton?.querySelector('svg');

      expect(svg).toBeInTheDocument();
    });
  });

  describe('Delete Action', () => {
    it('should render Delete action when onDelete is provided', () => {
      const onDelete = vi.fn();
      render(<RowContextMenu {...defaultProps} onDelete={onDelete} />);

      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should show confirmation dialog when Delete is clicked', () => {
      const onDelete = vi.fn();
      render(<RowContextMenu {...defaultProps} onDelete={onDelete} />);

      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);

      expect(screen.getByText('Delete row?')).toBeInTheDocument();
      expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have proper ARIA attributes for confirmation dialog', () => {
      const onDelete = vi.fn();
      render(<RowContextMenu {...defaultProps} onDelete={onDelete} />);

      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'delete-confirm-title');
    });

    it('should call onDelete when confirmation is confirmed', () => {
      const onDelete = vi.fn();
      const onClose = vi.fn();
      render(<RowContextMenu {...defaultProps} onDelete={onDelete} onClose={onClose} />);

      // Click Delete to show confirmation
      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);

      // Click Delete again in confirmation dialog
      const confirmButtons = screen.getAllByText('Delete');
      const confirmButton = confirmButtons.find(btn => btn.closest('.bg-red-600'));
      fireEvent.click(confirmButton!);

      expect(onDelete).toHaveBeenCalledWith('row-1');
      expect(onClose).toHaveBeenCalled();
    });

    it('should hide confirmation dialog when Cancel is clicked', () => {
      const onDelete = vi.fn();
      render(<RowContextMenu {...defaultProps} onDelete={onDelete} />);

      // Click Delete to show confirmation
      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);

      expect(screen.getByText('Delete row?')).toBeInTheDocument();

      // Click Cancel
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      // Should return to normal menu
      expect(screen.queryByText('Delete row?')).not.toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should have trash icon for Delete action', () => {
      const onDelete = vi.fn();
      render(<RowContextMenu {...defaultProps} onDelete={onDelete} />);

      const deleteButton = screen.getByText('Delete').closest('button');
      const svg = deleteButton?.querySelector('svg');

      expect(svg).toBeInTheDocument();
    });

    it('should not call onDelete when only Delete button is clicked without confirmation', () => {
      const onDelete = vi.fn();
      render(<RowContextMenu {...defaultProps} onDelete={onDelete} />);

      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);

      // Should show confirmation, but onDelete should not be called yet
      expect(onDelete).not.toHaveBeenCalled();
    });
  });

  describe('Custom Actions', () => {
    const customActions: CustomAction[] = [
      { name: 'archive', label: 'Archive', icon: '📦' },
      { name: 'duplicate', label: 'Duplicate', icon: '📋' },
      { name: 'export', label: 'Export' }, // No icon
    ];

    it('should render custom actions when provided', () => {
      const onCustomAction = vi.fn();
      render(
        <RowContextMenu
          {...defaultProps}
          customActions={customActions}
          onCustomAction={onCustomAction}
        />
      );

      expect(screen.getByText('Archive')).toBeInTheDocument();
      expect(screen.getByText('Duplicate')).toBeInTheDocument();
      expect(screen.getByText('Export')).toBeInTheDocument();
    });

    it('should render custom action icons when provided', () => {
      const onCustomAction = vi.fn();
      render(
        <RowContextMenu
          {...defaultProps}
          customActions={customActions}
          onCustomAction={onCustomAction}
        />
      );

      expect(screen.getByText('📦')).toBeInTheDocument();
      expect(screen.getByText('📋')).toBeInTheDocument();
    });

    it('should call onCustomAction with action name and row when clicked', () => {
      const onCustomAction = vi.fn();
      const onClose = vi.fn();
      render(
        <RowContextMenu
          {...defaultProps}
          customActions={customActions}
          onCustomAction={onCustomAction}
          onClose={onClose}
        />
      );

      const archiveButton = screen.getByText('Archive');
      fireEvent.click(archiveButton);

      expect(onCustomAction).toHaveBeenCalledWith('archive', mockRow);
      expect(onClose).toHaveBeenCalled();
    });

    it('should render divider before custom actions', () => {
      const onCustomAction = vi.fn();
      const { container } = render(
        <RowContextMenu
          {...defaultProps}
          customActions={customActions}
          onCustomAction={onCustomAction}
        />
      );

      const divider = container.querySelector('.gitboard-context-menu__divider');
      expect(divider).toBeInTheDocument();
    });

    it('should not render divider when no custom actions', () => {
      const { container } = render(<RowContextMenu {...defaultProps} />);

      const divider = container.querySelector('.gitboard-context-menu__divider');
      expect(divider).not.toBeInTheDocument();
    });

    it('should handle multiple custom actions correctly', () => {
      const onCustomAction = vi.fn();
      render(
        <RowContextMenu
          {...defaultProps}
          customActions={customActions}
          onCustomAction={onCustomAction}
        />
      );

      // Click different custom actions
      fireEvent.click(screen.getByText('Archive'));
      expect(onCustomAction).toHaveBeenCalledWith('archive', mockRow);

      // Re-render to test another action
      vi.clearAllMocks();

      fireEvent.click(screen.getByText('Duplicate'));
      expect(onCustomAction).toHaveBeenCalledWith('duplicate', mockRow);
    });
  });

  describe('Legacy Duplicate Action', () => {
    it('should render duplicate action when onDuplicate is provided', () => {
      const onDuplicate = vi.fn();
      render(<RowContextMenu {...defaultProps} onDuplicate={onDuplicate} />);

      expect(screen.getByText('Duplicate row')).toBeInTheDocument();
    });

    it('should call onDuplicate with row id when clicked', () => {
      const onDuplicate = vi.fn();
      const onClose = vi.fn();
      render(<RowContextMenu {...defaultProps} onDuplicate={onDuplicate} onClose={onClose} />);

      const duplicateButton = screen.getByText('Duplicate row');
      fireEvent.click(duplicateButton);

      expect(onDuplicate).toHaveBeenCalledWith('row-1');
      expect(onClose).toHaveBeenCalled();
    });

    it('should render divider before duplicate when no custom actions', () => {
      const onDuplicate = vi.fn();
      const { container } = render(<RowContextMenu {...defaultProps} onDuplicate={onDuplicate} />);

      const divider = container.querySelector('.gitboard-context-menu__divider');
      expect(divider).toBeInTheDocument();
    });

    it('should not render duplicate divider when custom actions exist', () => {
      const onDuplicate = vi.fn();
      const customActions: CustomAction[] = [{ name: 'test', label: 'Test' }];
      const { container } = render(
        <RowContextMenu
          {...defaultProps}
          onDuplicate={onDuplicate}
          customActions={customActions}
          onCustomAction={vi.fn()}
        />
      );

      // Should only have one divider (before custom actions)
      const dividers = container.querySelectorAll('.gitboard-context-menu__divider');
      expect(dividers).toHaveLength(1);
    });
  });

  describe('Closing Behavior', () => {
    it('should call onClose when clicking outside the menu', async () => {
      const onClose = vi.fn();
      const { container } = render(
        <div>
          <RowContextMenu {...defaultProps} onClose={onClose} />
          <div data-testid="outside">Outside</div>
        </div>
      );

      // Wait for the mousedown listener to be attached (setTimeout 0 in component)
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      const outside = screen.getByTestId('outside');
      fireEvent.mouseDown(outside);

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('should not call onClose when clicking inside the menu', async () => {
      const onClose = vi.fn();
      const { container } = render(<RowContextMenu {...defaultProps} onClose={onClose} />);

      // Wait for the mousedown listener to be attached (setTimeout 0 in component)
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      const menu = container.querySelector('.gitboard-context-menu');
      fireEvent.mouseDown(menu!);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('should call onClose when Escape key is pressed', async () => {
      const onClose = vi.fn();
      render(<RowContextMenu {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('should hide delete confirmation and stay open when Escape is pressed in confirmation', async () => {
      const onDelete = vi.fn();
      const onClose = vi.fn();
      render(<RowContextMenu {...defaultProps} onDelete={onDelete} onClose={onClose} />);

      // Open delete confirmation
      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);
      expect(screen.getByText('Delete row?')).toBeInTheDocument();

      // Press Escape
      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        // Should hide confirmation but not close menu
        expect(screen.queryByText('Delete row?')).not.toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
        expect(onClose).not.toHaveBeenCalled();
      });
    });
  });

  describe('Combined Actions', () => {
    it('should render all action types together', () => {
      const customActions: CustomAction[] = [{ name: 'test', label: 'Test Action' }];
      render(
        <RowContextMenu
          {...defaultProps}
          onOpen={vi.fn()}
          onDelete={vi.fn()}
          onDuplicate={vi.fn()}
          customActions={customActions}
          onCustomAction={vi.fn()}
        />
      );

      expect(screen.getByText('Show')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
      expect(screen.getByText('Test Action')).toBeInTheDocument();
      expect(screen.getByText('Duplicate row')).toBeInTheDocument();
    });

    it('should handle actions in correct order', () => {
      const customActions: CustomAction[] = [{ name: 'test', label: 'Test Action' }];
      const { container } = render(
        <RowContextMenu
          {...defaultProps}
          onOpen={vi.fn()}
          onDelete={vi.fn()}
          customActions={customActions}
          onCustomAction={vi.fn()}
        />
      );

      const buttons = container.querySelectorAll('.gitboard-context-menu__item');
      const buttonTexts = Array.from(buttons).map(btn => btn.textContent?.trim());

      // Expected order: Show, Delete, [divider], Test Action
      expect(buttonTexts[0]).toContain('Show');
      expect(buttonTexts[1]).toContain('Delete');
      expect(buttonTexts[2]).toContain('Test Action');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty custom actions array', () => {
      render(
        <RowContextMenu
          {...defaultProps}
          customActions={[]}
          onCustomAction={vi.fn()}
        />
      );

      const { container } = render(<RowContextMenu {...defaultProps} customActions={[]} />);
      const divider = container.querySelector('.gitboard-context-menu__divider');
      expect(divider).not.toBeInTheDocument();
    });

    it('should handle menu at edge of viewport', () => {
      const edgePosition = { x: 0, y: 0 };
      const { container } = render(
        <RowContextMenu {...defaultProps} position={edgePosition} />
      );

      const menu = container.querySelector('.gitboard-context-menu');
      expect(menu).toHaveStyle({ top: '0px', left: '0px' });
    });

    it('should clean up event listeners on unmount', () => {
      const onClose = vi.fn();
      const { unmount } = render(<RowContextMenu {...defaultProps} onClose={onClose} />);

      unmount();

      // These should not call onClose after unmount
      fireEvent.keyDown(document, { key: 'Escape' });
      fireEvent.mouseDown(document.body);

      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
