/**
 * FilterMenu Component
 * Menu for applying filters to columns
 */

import React, { useState, useRef, useEffect } from 'react';
import type { FieldDefinition, FilterConfig } from '@/types';
import { Button } from '../../Shared';

export interface FilterMenuProps {
  field: FieldDefinition;
  position: { x: number; y: number };
  currentFilter?: FilterConfig;
  onClose: () => void;
  onApply: (filter: FilterConfig) => void;
  onClear: () => void;
}

export const FilterMenu: React.FC<FilterMenuProps> = ({
  field,
  position,
  currentFilter,
  onClose,
  onApply,
  onClear,
}) => {
  const [operator, setOperator] = useState<FilterConfig['operator']>(
    currentFilter?.operator || 'contains'
  );
  const [value, setValue] = useState<string>(currentFilter?.value?.toString() || '');
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

  const handleApply = () => {
    onApply({
      field: field.id,
      operator,
      value: operator === 'is-empty' || operator === 'is-not-empty' ? undefined : value,
    });
    onClose();
  };

  const handleClear = () => {
    onClear();
    onClose();
  };

  const operators: Array<{ value: FilterConfig['operator']; label: string }> = [
    { value: 'contains', label: 'Contains' },
    { value: 'equals', label: 'Equals' },
    { value: 'not-equals', label: 'Not equals' },
    { value: 'is-empty', label: 'Is empty' },
    { value: 'is-not-empty', label: 'Is not empty' },
  ];

  const needsValue = operator !== 'is-empty' && operator !== 'is-not-empty';

  return (
    <div
      ref={menuRef}
      className="gitboard-filter-menu fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-4 min-w-[280px]"
      style={{ top: position.y, left: position.x }}
      role="dialog"
      aria-label="Filter menu"
    >
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Filter by {field.name}
        </label>
      </div>

      <div className="mb-3">
        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
          Operator
        </label>
        <select
          value={operator}
          onChange={(e) => setOperator(e.target.value as FilterConfig['operator'])}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700"
        >
          {operators.map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>
      </div>

      {needsValue && (
        <div className="mb-3">
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            Value
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter value..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700"
          />
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <Button variant="primary" size="sm" onClick={handleApply} className="flex-1">
          Apply
        </Button>
        <Button variant="secondary" size="sm" onClick={handleClear} className="flex-1">
          Clear
        </Button>
      </div>
    </div>
  );
};

FilterMenu.displayName = 'FilterMenu';
