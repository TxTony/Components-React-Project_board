/**
 * MultiSelectEditor Component
 * Multi-select dropdown for tag and multi-select fields
 * Positioned on top of the table with proper z-index
 */

import React, { useState, useRef, useEffect } from 'react';
import type { CellValue, FieldOption } from '@/types';

export interface MultiSelectEditorProps {
  value: CellValue;
  options: FieldOption[];
  onCommit: (value: CellValue) => void;
  onCancel: () => void;
  autoFocus?: boolean;
}

export const MultiSelectEditor: React.FC<MultiSelectEditorProps> = ({
  value,
  options,
  onCommit,
  onCancel,
  autoFocus = true,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedValues, setSelectedValues] = useState<string[]>(
    Array.isArray(value) ? value : value ? [String(value)] : []
  );
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate position relative to the cell
  useEffect(() => {
    if (dropdownRef.current) {
      const parentCell = dropdownRef.current.closest('td');
      if (parentCell) {
        const rect = parentCell.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
        });
      }
    }
  }, []);

  useEffect(() => {
    if (autoFocus && dropdownRef.current) {
      dropdownRef.current.focus();
    }
  }, [autoFocus]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        handleCommit();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, selectedValues]);

  const handleCommit = () => {
    onCommit(selectedValues.length > 0 ? selectedValues : null);
    setIsOpen(false);
  };

  const handleToggle = (optionId: string) => {
    setSelectedValues((prev) => {
      if (prev.includes(optionId)) {
        // Remove from selection
        const newValues = prev.filter((id) => id !== optionId);
        // Immediately commit the change
        onCommit(newValues.length > 0 ? newValues : null);
        return newValues;
      } else {
        // Add to selection
        const newValues = [...prev, optionId];
        // Immediately commit the change
        onCommit(newValues);
        return newValues;
      }
    });
  };

  const handleClearAll = () => {
    setSelectedValues([]);
    onCommit(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
      setIsOpen(false);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleCommit();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={dropdownRef}
      className="gitboard-table__multiselect-dropdown fixed bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg py-1 min-w-[200px] max-h-[300px] overflow-y-auto z-50"
      style={position ? { top: `${position.top}px`, left: `${position.left}px` } : undefined}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="listbox"
      aria-multiselectable="true"
    >
      <div
        className="gitboard-table__multiselect-option px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-500 dark:text-gray-400"
        onClick={handleClearAll}
      >
        <span className="gitboard-table__multiselect-option-label">Clear all</span>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
      {options.map((option) => {
        const isSelected = selectedValues.includes(option.id);

        // Helper function to convert hex to rgba
        const hexToRgba = (hex: string, alpha: number) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        return (
          <div
            key={option.id}
            className={`gitboard-table__multiselect-option px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2 ${
              isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
            }`}
            onClick={() => handleToggle(option.id)}
            role="option"
            aria-selected={isSelected}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => {}}
              className="gitboard-table__multiselect-checkbox w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 flex-shrink-0"
            />
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <span
                className="gitboard-table__badge inline-flex items-center px-2 py-0.5 text-xs font-medium w-fit"
                style={
                  option.color
                    ? {
                        backgroundColor: hexToRgba(option.color, 0.1),
                        borderWidth: '1.5px',
                        borderStyle: 'solid',
                        borderColor: option.color,
                        color: option.color,
                        borderRadius: '6px',
                      }
                    : {
                        borderRadius: '6px',
                      }
                }
              >
                {option.label}
              </span>
              {option.description && (
                <div className="gitboard-table__multiselect-option-description text-xs text-gray-500 dark:text-gray-400">
                  {option.description}
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
      <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
        {selectedValues.length} selected
      </div>
    </div>
  );
};

MultiSelectEditor.displayName = 'MultiSelectEditor';
