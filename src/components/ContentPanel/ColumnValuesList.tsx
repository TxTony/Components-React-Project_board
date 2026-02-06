/**
 * ColumnValuesList Component
 * Displays and allows editing of all column values for a row
 * Shows in the detail panel to provide quick access to all fields
 */

import React, { useState, useCallback } from 'react';
import type { Row, FieldDefinition, FieldOption, CellValue } from '@/types';

export interface ColumnValuesListProps {
  row: Row;
  fields: FieldDefinition[];
  onValueChange?: (fieldId: string, value: CellValue) => void;
}

export const ColumnValuesList: React.FC<ColumnValuesListProps> = ({
  row,
  fields,
  onValueChange,
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const visibleFields = fields.filter(f => f.visible);

  const handleStartEdit = useCallback((field: FieldDefinition) => {
    const currentValue = row.values[field.id];
    setEditingField(field.id);
    setEditValue(currentValue?.toString() || '');
  }, [row.values]);

  const handleSaveEdit = useCallback((fieldId: string) => {
    if (onValueChange) {
      const field = fields.find(f => f.id === fieldId);
      let finalValue: CellValue = editValue;

      // Convert value based on field type
      if (field?.type === 'number') {
        finalValue = editValue ? parseFloat(editValue) : null;
      } else if (field?.type === 'date') {
        finalValue = editValue || null;
      } else if (field?.type === 'link') {
        const trimmed = editValue.trim();
        if (trimmed && !trimmed.match(/^https?:\/\//i)) {
          finalValue = `https://${trimmed}`;
        } else {
          finalValue = trimmed || null;
        }
      }

      onValueChange(fieldId, finalValue);
    }
    setEditingField(null);
    setEditValue('');
  }, [editValue, fields, onValueChange]);

  const handleCancelEdit = useCallback(() => {
    setEditingField(null);
    setEditValue('');
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, fieldId: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(fieldId);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  }, [handleSaveEdit, handleCancelEdit]);

  const handleSelectChange = useCallback((fieldId: string, value: string) => {
    if (onValueChange) {
      onValueChange(fieldId, value);
    }
  }, [onValueChange]);

  const renderFieldValue = (field: FieldDefinition) => {
    const value = row.values[field.id];
    const isEditing = editingField === field.id;

    // Text and number fields
    if (field.type === 'text' || field.type === 'number' || field.type === 'title') {
      if (isEditing) {
        return (
          <input
            type={field.type === 'number' ? 'number' : 'text'}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => handleSaveEdit(field.id)}
            onKeyDown={(e) => handleKeyDown(e, field.id)}
            className="gitboard-column-value__input flex-1 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        );
      }
      return (
        <div
          onClick={() => handleStartEdit(field)}
          className="gitboard-column-value__display flex-1 px-2 py-1 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          {value || <span className="text-gray-400 italic">Empty</span>}
        </div>
      );
    }

    // Date field
    if (field.type === 'date') {
      if (isEditing) {
        return (
          <input
            type="date"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => handleSaveEdit(field.id)}
            onKeyDown={(e) => handleKeyDown(e, field.id)}
            className="gitboard-column-value__input flex-1 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        );
      }
      return (
        <div
          onClick={() => handleStartEdit(field)}
          className="gitboard-column-value__display flex-1 px-2 py-1 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          {value ? new Date(value as string).toLocaleDateString() : <span className="text-gray-400 italic">No date</span>}
        </div>
      );
    }

    // Single-select field
    if (field.type === 'single-select') {
      return (
        <select
          value={value as string || ''}
          onChange={(e) => handleSelectChange(field.id, e.target.value)}
          className="gitboard-column-value__select flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 cursor-pointer hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select...</option>
          {field.options?.map((option: FieldOption) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    // Multi-select field
    if (field.type === 'multi-select') {
      const selectedValues = Array.isArray(value) ? value : [];

      return (
        <div className="gitboard-column-value__display flex-1 px-2 py-1 text-sm">
          <div className="flex flex-wrap gap-1 mb-1">
            {selectedValues.length > 0 ? (
              selectedValues.map((v: string) => {
                const opt = field.options?.find((o: FieldOption) => o.id === v);
                if (!opt) return null;

                const hexToRgba = (hex: string, alpha: number) => {
                  const r = parseInt(hex.slice(1, 3), 16);
                  const g = parseInt(hex.slice(3, 5), 16);
                  const b = parseInt(hex.slice(5, 7), 16);
                  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                };

                return (
                  <span
                    key={opt.id}
                    className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md"
                    style={opt.color ? {
                      backgroundColor: hexToRgba(opt.color, 0.1),
                      borderWidth: '1.5px',
                      borderStyle: 'solid',
                      borderColor: opt.color,
                      color: opt.color,
                    } : undefined}
                  >
                    {opt.label}
                  </span>
                );
              })
            ) : (
              <span className="text-gray-400 italic">None selected</span>
            )}
          </div>
          <div className="mt-1 space-y-0.5">
            {field.options?.map((option: FieldOption) => {
              const isSelected = selectedValues.includes(option.id);
              return (
                <label
                  key={option.id}
                  className="flex items-center gap-2 px-1 py-0.5 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {
                      const newValues = isSelected
                        ? selectedValues.filter((id: string) => id !== option.id)
                        : [...selectedValues, option.id];
                      if (onValueChange) {
                        onValueChange(field.id, newValues.length > 0 ? newValues : null);
                      }
                    }}
                    className="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-700 dark:text-gray-300">{option.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      );
    }

    // Assignee field
    if (field.type === 'assignee') {
      if (field.options && field.options.length > 0) {
        return (
          <select
            value={value as string || ''}
            onChange={(e) => handleSelectChange(field.id, e.target.value)}
            className="gitboard-column-value__select flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 cursor-pointer hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Unassigned</option>
            {field.options.map((option: FieldOption) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        );
      }
      // Fallback to text input when no options defined
      if (isEditing) {
        return (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => handleSaveEdit(field.id)}
            onKeyDown={(e) => handleKeyDown(e, field.id)}
            className="gitboard-column-value__input flex-1 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter assignee..."
            autoFocus
          />
        );
      }
      return (
        <div
          onClick={() => handleStartEdit(field)}
          className="gitboard-column-value__display flex-1 px-2 py-1 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          {value || <span className="text-gray-400 italic">Unassigned</span>}
        </div>
      );
    }

    // Iteration field
    if (field.type === 'iteration') {
      if (field.options && field.options.length > 0) {
        return (
          <select
            value={value as string || ''}
            onChange={(e) => handleSelectChange(field.id, e.target.value)}
            className="gitboard-column-value__select flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 cursor-pointer hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No iteration</option>
            {field.options.map((option: FieldOption) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        );
      }
      // Fallback to text input when no options defined
      if (isEditing) {
        return (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => handleSaveEdit(field.id)}
            onKeyDown={(e) => handleKeyDown(e, field.id)}
            className="gitboard-column-value__input flex-1 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter iteration..."
            autoFocus
          />
        );
      }
      return (
        <div
          onClick={() => handleStartEdit(field)}
          className="gitboard-column-value__display flex-1 px-2 py-1 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          {value || <span className="text-gray-400 italic">No iteration</span>}
        </div>
      );
    }

    // Link field
    if (field.type === 'link') {
      if (isEditing) {
        return (
          <input
            type="url"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => handleSaveEdit(field.id)}
            onKeyDown={(e) => handleKeyDown(e, field.id)}
            className="gitboard-column-value__input flex-1 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com"
            autoFocus
          />
        );
      }
      return (
        <div
          onClick={() => handleStartEdit(field)}
          className="gitboard-column-value__display flex-1 px-2 py-1 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          {value ? (
            <a
              href={value.toString()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {value.toString()}
            </a>
          ) : (
            <span className="text-gray-400 italic">No link</span>
          )}
        </div>
      );
    }

    return (
      <div className="gitboard-column-value__display flex-1 px-2 py-1 text-sm text-gray-500">
        {value?.toString() || '—'}
      </div>
    );
  };

  return (
    <div className="gitboard-column-values-list space-y-2">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Column Values
      </h3>
      <div className="space-y-1">
        {visibleFields.map((field) => (
          <div
            key={field.id}
            className="gitboard-column-value-item flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-800"
          >
            <div className="gitboard-column-value__label w-32 flex-shrink-0 text-sm font-medium text-gray-600 dark:text-gray-400">
              {field.name}
            </div>
            <div className="gitboard-column-value__value flex-1 flex items-center">
              {renderFieldValue(field)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
