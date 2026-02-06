/**
 * ConfirmationDialog Component
 * Simple confirmation dialog for destructive/important actions
 */

import React, { useRef, useEffect } from 'react';

export interface ConfirmationDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onCancel]);

  return (
    <div className="gitboard-confirmation-dialog-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={dialogRef}
        className="gitboard-confirmation-dialog bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full mx-4"
        role="alertdialog"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-message"
      >
        <div className="p-6">
          <h2
            id="dialog-title"
            className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2"
          >
            {title}
          </h2>
          <p id="dialog-message" className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {message}
          </p>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                isDestructive
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ConfirmationDialog.displayName = 'ConfirmationDialog';
