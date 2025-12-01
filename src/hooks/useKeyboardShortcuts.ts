/**
 * useKeyboardShortcuts Hook
 * Custom hook for managing keyboard shortcuts
 */

import { useEffect } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: (event: KeyboardEvent) => void;
  description?: string;
}

export interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export const useKeyboardShortcuts = ({
  shortcuts,
  enabled = true,
}: UseKeyboardShortcutsOptions): void => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl === undefined || event.ctrlKey === shortcut.ctrl;
        const shiftMatch = shortcut.shift === undefined || event.shiftKey === shortcut.shift;
        const altMatch = shortcut.alt === undefined || event.altKey === shortcut.alt;
        const metaMatch = shortcut.meta === undefined || event.metaKey === shortcut.meta;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
          event.preventDefault();
          shortcut.handler(event);
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts, enabled]);
};

/**
 * Common keyboard shortcuts for table interactions
 */
export const createTableShortcuts = ({
  onSelectAll,
  onDeleteSelected,
  onAddRow,
  onEscape,
  onSearch,
}: {
  onSelectAll?: () => void;
  onDeleteSelected?: () => void;
  onAddRow?: () => void;
  onEscape?: () => void;
  onSearch?: () => void;
}): KeyboardShortcut[] => {
  const shortcuts: KeyboardShortcut[] = [];

  if (onSelectAll) {
    shortcuts.push({
      key: 'a',
      ctrl: true,
      handler: onSelectAll,
      description: 'Select all rows',
    });
  }

  if (onDeleteSelected) {
    shortcuts.push({
      key: 'Delete',
      handler: onDeleteSelected,
      description: 'Delete selected rows',
    });
    shortcuts.push({
      key: 'Backspace',
      ctrl: true,
      handler: onDeleteSelected,
      description: 'Delete selected rows',
    });
  }

  if (onAddRow) {
    shortcuts.push({
      key: 'n',
      ctrl: true,
      handler: onAddRow,
      description: 'Add new row',
    });
  }

  if (onEscape) {
    shortcuts.push({
      key: 'Escape',
      handler: onEscape,
      description: 'Clear selection/Close dialogs',
    });
  }

  if (onSearch) {
    shortcuts.push({
      key: 'f',
      ctrl: true,
      handler: onSearch,
      description: 'Focus search',
    });
  }

  return shortcuts;
};
