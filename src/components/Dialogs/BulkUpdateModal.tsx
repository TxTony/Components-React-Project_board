/**
 * BulkUpdateModal Component
 * Modal for bulk updating a column value for selected rows
 */

import React, { useState, useRef, useEffect } from 'react';
import type { FieldDefinition, CellValue, User, Iteration } from '@/types';

export interface BulkUpdateModalProps {
  field: FieldDefinition;
  selectedRowCount: number;
  onConfirm: (value: CellValue) => void;
  onCancel: () => void;
  users?: User[];
  iterations?: Iteration[];
}

export const BulkUpdateModal: React.FC<BulkUpdateModalProps> = ({
  field,
  selectedRowCount,
  onConfirm,
  onCancel,
  users = [],
  iterations = [],
}) => {
  const [value, setValue] = useState<CellValue>(null);
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

  const handleConfirm = () => {
    onConfirm(value);
  };

  const renderEditor = () => {
    switch (field.type) {
      case 'text':
      case 'title':
      case 'link':
        return (
          <input
            type="text"
            value={value?.toString() || ''}
            onChange={(e) => setValue(e.target.value || null)}
            placeholder="Enter text"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            autoFocus
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value?.toString() || ''}
            onChange={(e) => setValue(e.target.value ? Number(e.target.value) : null)}
            placeholder="Enter number"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            autoFocus
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value?.toString() || ''}
            onChange={(e) => setValue(e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            autoFocus
          />
        );

      case 'single-select':
      case 'assignee': {
        const options = field.type === 'assignee' ? users.map((u) => ({ id: u.id, label: u.name })) : field.options || [];
        return (
          <select
            value={value?.toString() || ''}
            onChange={(e) => setValue(e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">-- Clear --</option>
            {options.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      }

      case 'multi-select': {
        const selectedIds = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedIds.map((id) => {
                const option = field.options?.find((opt) => opt.id === id);
                if (!option) return null;
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md"
                  >
                    {option.label}
                    <button
                      type="button"
                      onClick={() => setValue(selectedIds.filter((sid) => sid !== id))}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      ✕
                    </button>
                  </span>
                );
              })}
            </div>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  const newValue = [...selectedIds, e.target.value];
                  setValue(newValue);
                  e.target.value = '';
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">+ Add option</option>
              {field.options?.map((opt) => (
                <option key={opt.id} value={opt.id} disabled={selectedIds.includes(opt.id)}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        );
      }

      case 'iteration': {
        return (
          <select
            value={value?.toString() || ''}
            onChange={(e) => setValue(e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">-- Clear --</option>
            {iterations.map((it) => (
              <option key={it.id} value={it.id}>
                {it.label}
              </option>
            ))}
          </select>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="gitboard-bulk-update-modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={dialogRef}
        className="gitboard-bulk-update-modal bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full mx-4"
        role="dialog"
        aria-labelledby="bulk-update-title"
      >
        <div className="p-6">
          <h2
            id="bulk-update-title"
            className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4"
          >
            Update "{field.name}"
          </h2>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Updating <strong>{selectedRowCount}</strong>{' '}
            {selectedRowCount === 1 ? 'row' : 'rows'}
          </p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Value
            </label>
            <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
              {renderEditor()}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <span className="text-sm text-blue-800 dark:text-blue-300">
              💡 Leave empty to clear the value for selected rows
            </span>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              onClick={handleConfirm}
            >
              Update {selectedRowCount} {selectedRowCount === 1 ? 'row' : 'rows'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

BulkUpdateModal.displayName = 'BulkUpdateModal';
