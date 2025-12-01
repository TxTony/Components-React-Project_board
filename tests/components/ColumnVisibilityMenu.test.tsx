/**
 * ColumnVisibilityMenu Component Tests
 * Tests for showing/hiding columns functionality
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColumnVisibilityMenu } from '../../src/components/Toolbar/ColumnVisibilityMenu';
import type { FieldDefinition } from '../../src/types';

describe('ColumnVisibilityMenu', () => {
  const mockFields: FieldDefinition[] = [
    {
      id: 'fld_title_aa12e',
      name: 'Title',
      type: 'title',
      visible: true,
    },
    {
      id: 'fld_status_77de',
      name: 'Status',
      type: 'single-select',
      visible: true,
      options: [
        { id: 'opt_todo', label: 'To Do' },
        { id: 'opt_done', label: 'Done' },
      ],
    },
    {
      id: 'fld_points_88ff',
      name: 'Points',
      type: 'number',
      visible: false,
    },
    {
      id: 'fld_tags_99aa',
      name: 'Tags',
      type: 'multi-select',
      visible: true,
      options: [
        { id: 'opt_bug', label: 'Bug' },
        { id: 'opt_feature', label: 'Feature' },
      ],
    },
  ];

  describe('Rendering', () => {
    it('renders toggle button with eye icon', () => {
      const onToggle = vi.fn();
      render(<ColumnVisibilityMenu fields={mockFields} onToggleVisibility={onToggle} />);

      const button = screen.getByLabelText('Toggle column visibility');
      expect(button).toBeInTheDocument();
    });

    it('shows visible count on button', () => {
      const onToggle = vi.fn();
      render(<ColumnVisibilityMenu fields={mockFields} onToggleVisibility={onToggle} />);

      // 3 out of 4 fields are visible
      expect(screen.getByText('3/4')).toBeInTheDocument();
    });

    it('menu is hidden by default', () => {
      const onToggle = vi.fn();
      render(<ColumnVisibilityMenu fields={mockFields} onToggleVisibility={onToggle} />);

      expect(screen.queryByText('Show/Hide Columns')).not.toBeInTheDocument();
    });

    it('opens menu when button is clicked', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      render(<ColumnVisibilityMenu fields={mockFields} onToggleVisibility={onToggle} />);

      const button = screen.getByLabelText('Toggle column visibility');
      await user.click(button);

      expect(screen.getByText('Show/Hide Columns')).toBeInTheDocument();
    });
  });

  describe('Menu Content', () => {
    it('displays all fields in the menu', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      render(<ColumnVisibilityMenu fields={mockFields} onToggleVisibility={onToggle} />);

      const button = screen.getByLabelText('Toggle column visibility');
      await user.click(button);

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Points')).toBeInTheDocument();
      expect(screen.getByText('Tags')).toBeInTheDocument();
    });

    it('displays field types', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      render(<ColumnVisibilityMenu fields={mockFields} onToggleVisibility={onToggle} />);

      const button = screen.getByLabelText('Toggle column visibility');
      await user.click(button);

      expect(screen.getByText('title')).toBeInTheDocument();
      expect(screen.getByText('single-select')).toBeInTheDocument();
      expect(screen.getByText('number')).toBeInTheDocument();
      expect(screen.getByText('multi-select')).toBeInTheDocument();
    });

    it('shows correct checkbox states', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      const { container } = render(
        <ColumnVisibilityMenu fields={mockFields} onToggleVisibility={onToggle} />
      );

      const button = screen.getByLabelText('Toggle column visibility');
      await user.click(button);

      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes).toHaveLength(4);

      // First 3 should be checked (visible), last should be unchecked
      expect(checkboxes[0]).toBeChecked(); // Title
      expect(checkboxes[1]).toBeChecked(); // Status
      expect(checkboxes[2]).not.toBeChecked(); // Points (hidden)
      expect(checkboxes[3]).toBeChecked(); // Tags
    });

    it('displays correct visible count in header', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      render(<ColumnVisibilityMenu fields={mockFields} onToggleVisibility={onToggle} />);

      const button = screen.getByLabelText('Toggle column visibility');
      await user.click(button);

      expect(screen.getByText('3 of 4 visible')).toBeInTheDocument();
    });
  });

  describe('Toggle Functionality', () => {
    it('calls onToggleVisibility when checkbox is clicked', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      const { container } = render(
        <ColumnVisibilityMenu fields={mockFields} onToggleVisibility={onToggle} />
      );

      const button = screen.getByLabelText('Toggle column visibility');
      await user.click(button);

      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      await user.click(checkboxes[0]); // Click Title checkbox

      expect(onToggle).toHaveBeenCalledWith('fld_title_aa12e');
    });

    it('calls onToggleVisibility for hidden field', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      const { container } = render(
        <ColumnVisibilityMenu fields={mockFields} onToggleVisibility={onToggle} />
      );

      const button = screen.getByLabelText('Toggle column visibility');
      await user.click(button);

      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      await user.click(checkboxes[2]); // Click Points checkbox (hidden)

      expect(onToggle).toHaveBeenCalledWith('fld_points_88ff');
    });

    it('can toggle multiple fields', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      const { container } = render(
        <ColumnVisibilityMenu fields={mockFields} onToggleVisibility={onToggle} />
      );

      const button = screen.getByLabelText('Toggle column visibility');
      await user.click(button);

      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      await user.click(checkboxes[0]); // Toggle Title
      await user.click(checkboxes[1]); // Toggle Status

      expect(onToggle).toHaveBeenCalledTimes(2);
      expect(onToggle).toHaveBeenNthCalledWith(1, 'fld_title_aa12e');
      expect(onToggle).toHaveBeenNthCalledWith(2, 'fld_status_77de');
    });
  });

  describe('Menu Interactions', () => {
    it('closes menu when Close button is clicked', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      render(<ColumnVisibilityMenu fields={mockFields} onToggleVisibility={onToggle} />);

      // Open menu
      const button = screen.getByLabelText('Toggle column visibility');
      await user.click(button);
      expect(screen.getByText('Show/Hide Columns')).toBeInTheDocument();

      // Close menu
      const closeButton = screen.getByText('Close');
      await user.click(closeButton);

      expect(screen.queryByText('Show/Hide Columns')).not.toBeInTheDocument();
    });

    it('closes menu when clicking outside', async () => {
      const onToggle = vi.fn();
      const { container } = render(
        <div>
          <div data-testid="outside">Outside</div>
          <ColumnVisibilityMenu fields={mockFields} onToggleVisibility={onToggle} />
        </div>
      );

      // Open menu
      const button = screen.getByLabelText('Toggle column visibility');
      fireEvent.click(button);
      expect(screen.getByText('Show/Hide Columns')).toBeInTheDocument();

      // Click outside
      const outside = screen.getByTestId('outside');
      fireEvent.mouseDown(outside);

      expect(screen.queryByText('Show/Hide Columns')).not.toBeInTheDocument();
    });

    it('closes menu when pressing Escape', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      render(<ColumnVisibilityMenu fields={mockFields} onToggleVisibility={onToggle} />);

      // Open menu
      const button = screen.getByLabelText('Toggle column visibility');
      await user.click(button);
      expect(screen.getByText('Show/Hide Columns')).toBeInTheDocument();

      // Press Escape
      fireEvent.keyDown(document, { key: 'Escape' });

      expect(screen.queryByText('Show/Hide Columns')).not.toBeInTheDocument();
    });

    it('toggles menu open/closed on button click', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      render(<ColumnVisibilityMenu fields={mockFields} onToggleVisibility={onToggle} />);

      const button = screen.getByLabelText('Toggle column visibility');

      // Open
      await user.click(button);
      expect(screen.getByText('Show/Hide Columns')).toBeInTheDocument();

      // Close
      await user.click(button);
      expect(screen.queryByText('Show/Hide Columns')).not.toBeInTheDocument();

      // Open again
      await user.click(button);
      expect(screen.getByText('Show/Hide Columns')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes on button', () => {
      const onToggle = vi.fn();
      render(<ColumnVisibilityMenu fields={mockFields} onToggleVisibility={onToggle} />);

      const button = screen.getByLabelText('Toggle column visibility');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('aria-haspopup', 'true');
    });

    it('updates aria-expanded when menu opens', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      render(<ColumnVisibilityMenu fields={mockFields} onToggleVisibility={onToggle} />);

      const button = screen.getByLabelText('Toggle column visibility');
      await user.click(button);

      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('has role="menu" on menu element', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      render(<ColumnVisibilityMenu fields={mockFields} onToggleVisibility={onToggle} />);

      const button = screen.getByLabelText('Toggle column visibility');
      await user.click(button);

      const menu = screen.getByRole('menu');
      expect(menu).toBeInTheDocument();
    });

    it('menu items have proper ARIA attributes', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      const { container } = render(
        <ColumnVisibilityMenu fields={mockFields} onToggleVisibility={onToggle} />
      );

      const button = screen.getByLabelText('Toggle column visibility');
      await user.click(button);

      const menuItems = container.querySelectorAll('[role="menuitemcheckbox"]');
      expect(menuItems.length).toBeGreaterThan(0);

      // Check aria-checked attributes
      expect(menuItems[0]).toHaveAttribute('aria-checked', 'true'); // Title (visible)
      expect(menuItems[2]).toHaveAttribute('aria-checked', 'false'); // Points (hidden)
    });
  });

  describe('Edge Cases', () => {
    it('handles empty fields array', () => {
      const onToggle = vi.fn();
      render(<ColumnVisibilityMenu fields={[]} onToggleVisibility={onToggle} />);

      expect(screen.getByText('0/0')).toBeInTheDocument();
    });

    it('handles all fields visible', async () => {
      const user = userEvent.setup();
      const allVisibleFields = mockFields.map((f) => ({ ...f, visible: true }));
      const onToggle = vi.fn();
      render(<ColumnVisibilityMenu fields={allVisibleFields} onToggleVisibility={onToggle} />);

      expect(screen.getByText('4/4')).toBeInTheDocument();

      const button = screen.getByLabelText('Toggle column visibility');
      await user.click(button);

      expect(screen.getByText('4 of 4 visible')).toBeInTheDocument();
    });

    it('handles all fields hidden', async () => {
      const user = userEvent.setup();
      const allHiddenFields = mockFields.map((f) => ({ ...f, visible: false }));
      const onToggle = vi.fn();
      render(<ColumnVisibilityMenu fields={allHiddenFields} onToggleVisibility={onToggle} />);

      expect(screen.getByText('0/4')).toBeInTheDocument();

      const button = screen.getByLabelText('Toggle column visibility');
      await user.click(button);

      expect(screen.getByText('0 of 4 visible')).toBeInTheDocument();
    });
  });
});
