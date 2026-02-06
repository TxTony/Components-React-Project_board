/**
 * ColumnMenu Component
 * Context menu for column actions (hide, sort, resize, etc.)
 */

import React, { useRef, useEffect } from 'react';
import type { FieldDefinition } from '@/types';

export interface ColumnMenuProps {
  field: FieldDefinition;
  position: { x: number; y: number };
  onClose: () => void;
  onHide?: (fieldId: string) => void;
  onSortAsc?: (fieldId: string) => void;
  onSortDesc?: (fieldId: string) => void;
  onRename?: (fieldId: string) => void;
  onBulkUpdate?: (fieldId: string) => void;
  selectedRowCount?: number;
}

export const ColumnMenu: React.FC<ColumnMenuProps> = ({
  field,
  position,
  onClose,
  onHide,
  onSortAsc,
  onSortDesc,
  onRename,
  onBulkUpdate,
  selectedRowCount = 0,
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
      className="gitboard-column-menu fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1 min-w-[160px]"
      style={{ top: position.y, left: position.x }}
      role="menu"
    >
      {onSortAsc && (
        <button
          type="button"
          className="gitboard-column-menu__item w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => handleAction(() => onSortAsc(field.id))}
          role="menuitem"
        >
          Sort ascending
        </button>
      )}
      {onSortDesc && (
        <button
          type="button"
          className="gitboard-column-menu__item w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => handleAction(() => onSortDesc(field.id))}
          role="menuitem"
        >
          Sort descending
        </button>
      )}
      {(onSortAsc || onSortDesc) && (onRename || onHide) && (
        <div className="gitboard-column-menu__divider h-px bg-gray-200 dark:bg-gray-700 my-1" />
      )}
      {onRename && (
        <button
          type="button"
          className="gitboard-column-menu__item w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => handleAction(() => onRename(field.id))}
          role="menuitem"
        >
          Rename column
        </button>
      )}
      {onBulkUpdate && selectedRowCount > 0 && field.type !== 'title' && (
        <>
          {(onRename || onHide) && (
            <div className="gitboard-column-menu__divider h-px bg-gray-200 dark:bg-gray-700 my-1" />
          )}
          <button
            type="button"
            className="gitboard-column-menu__item w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => handleAction(() => onBulkUpdate(field.id))}
            role="menuitem"
          >
            Update {selectedRowCount} {selectedRowCount === 1 ? 'row' : 'rows'}
          </button>
        </>
      )}
      {onHide && (
        <button
          type="button"
          className="gitboard-column-menu__item w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => handleAction(() => onHide(field.id))}
          role="menuitem"
        >
          Hide column
        </button>
      )}
    </div>
  );
};

ColumnMenu.displayName = 'ColumnMenu';
