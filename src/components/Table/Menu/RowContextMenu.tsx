/**
 * RowContextMenu Component
 * Context menu for row actions (delete, duplicate, etc.)
 */

import React, { useRef, useEffect } from 'react';
import type { Row } from '@/types';

export interface RowContextMenuProps {
  row: Row;
  position: { x: number; y: number };
  onClose: () => void;
  onDelete?: (rowId: string) => void;
  onDuplicate?: (rowId: string) => void;
  onOpen?: (rowId: string) => void;
}

export const RowContextMenu: React.FC<RowContextMenuProps> = ({
  row,
  position,
  onClose,
  onDelete,
  onDuplicate,
  onOpen,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="gitboard-context-menu fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1 min-w-[160px]"
      style={{ top: position.y, left: position.x }}
      role="menu"
    >
      {onOpen && (
        <button
          type="button"
          className="gitboard-context-menu__item w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => handleAction(() => onOpen(row.id))}
          role="menuitem"
        >
          Open details
        </button>
      )}
      {onDuplicate && (
        <button
          type="button"
          className="gitboard-context-menu__item w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => handleAction(() => onDuplicate(row.id))}
          role="menuitem"
        >
          Duplicate row
        </button>
      )}
      {onDelete && (
        <>
          <div className="gitboard-context-menu__divider h-px bg-gray-200 dark:bg-gray-700 my-1" />
          <button
            type="button"
            className="gitboard-context-menu__item w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={() => handleAction(() => onDelete(row.id))}
            role="menuitem"
          >
            Delete row
          </button>
        </>
      )}
    </div>
  );
};

RowContextMenu.displayName = 'RowContextMenu';
