/**
 * RowContextMenu Component
 * Context menu for row actions (show, delete, and custom actions)
 */

import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import type { Row, CustomAction } from '@/types';

export interface RowContextMenuProps {
  row: Row;
  position: { x: number; y: number };
  onClose: () => void;
  onDelete?: (rowId: string) => void;
  onDuplicate?: (rowId: string) => void;
  onOpen?: (rowId: string) => void;
  customActions?: CustomAction[];
  onCustomAction?: (actionName: string, row: Row) => void;
}

export const RowContextMenu: React.FC<RowContextMenuProps> = ({
  row,
  position,
  onClose,
  onDelete,
  onDuplicate,
  onOpen,
  customActions = [],
  onCustomAction,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  // Adjust position based on viewport - if cursor is below center, open menu above cursor
  // Use useLayoutEffect for synchronous measurement before paint
  useLayoutEffect(() => {
    if (!menuRef.current) return;

    const viewportHeight = window.innerHeight;
    const viewportCenterY = viewportHeight / 2;
    const isBelowCenter = position.y > viewportCenterY;

    if (isBelowCenter) {
      const menuHeight = menuRef.current.offsetHeight;
      setAdjustedPosition({
        x: position.x,
        y: position.y - menuHeight,
      });
    } else {
      setAdjustedPosition(position);
    }
  }, [position, showDeleteConfirm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
        } else {
          onClose();
        }
      }
    };

    // Delay adding mousedown listener to avoid catching the initial right-click
    // that triggered the context menu
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);
    document.addEventListener('keydown', handleEscape);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose, showDeleteConfirm]);

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete(row.id);
    }
    onClose();
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  const handleCustomAction = (actionName: string) => {
    if (onCustomAction) {
      onCustomAction(actionName, row);
    }
    onClose();
  };

  // If showing delete confirmation, render confirmation dialog
  if (showDeleteConfirm) {
    return (
      <div
        ref={menuRef}
        className="gitboard-context-menu fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-4 min-w-[240px]"
        style={{ top: adjustedPosition.y, left: adjustedPosition.x }}
        role="dialog"
        aria-labelledby="delete-confirm-title"
      >
        <h3 id="delete-confirm-title" className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Delete row?
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
          This action cannot be undone.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="flex-1 px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
            onClick={handleDeleteConfirm}
          >
            Delete
          </button>
          <button
            type="button"
            className="flex-1 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
            onClick={handleDeleteCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Normal context menu
  return (
    <div
      ref={menuRef}
      className="gitboard-context-menu fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1 min-w-[180px]"
      style={{ top: adjustedPosition.y, left: adjustedPosition.x }}
      role="menu"
    >
      {/* Show action */}
      {onOpen && (
        <button
          type="button"
          className="gitboard-context-menu__item w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          onClick={() => handleAction(() => onOpen(row.id))}
          role="menuitem"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Show
        </button>
      )}

      {/* Delete action */}
      {onDelete && (
        <button
          type="button"
          className="gitboard-context-menu__item w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          onClick={handleDeleteClick}
          role="menuitem"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </button>
      )}

      {/* Divider before custom actions */}
      {customActions && customActions.length > 0 && (
        <div className="gitboard-context-menu__divider h-px bg-gray-200 dark:bg-gray-700 my-1" />
      )}

      {/* Custom actions */}
      {customActions && customActions.map((action) => (
        <button
          key={action.name}
          type="button"
          className="gitboard-context-menu__item w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          onClick={() => handleCustomAction(action.name)}
          role="menuitem"
        >
          {action.icon && <span className="w-4 h-4 flex items-center justify-center">{action.icon}</span>}
          {action.label}
        </button>
      ))}

      {/* Legacy: Keep duplicate if provided (for backward compatibility) */}
      {onDuplicate && (
        <>
          {customActions && customActions.length === 0 && (
            <div className="gitboard-context-menu__divider h-px bg-gray-200 dark:bg-gray-700 my-1" />
          )}
          <button
            type="button"
            className="gitboard-context-menu__item w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            onClick={() => handleAction(() => onDuplicate(row.id))}
            role="menuitem"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Duplicate row
          </button>
        </>
      )}
    </div>
  );
};

RowContextMenu.displayName = 'RowContextMenu';
