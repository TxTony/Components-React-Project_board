/**
 * IterationEditor Component
 * Dropdown selector for iteration/sprint fields
 * Positioned on top of the table with proper z-index
 */

import React, { useState, useRef, useEffect } from 'react';
import type { CellValue, FieldOption } from '@/types';

export interface IterationEditorProps {
  value: CellValue;
  options: FieldOption[];
  onCommit: (value: CellValue) => void;
  onCancel: () => void;
  autoFocus?: boolean;
}

export const IterationEditor: React.FC<IterationEditorProps> = ({
  value,
  options,
  onCommit,
  onCancel,
  autoFocus = true,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedValue, setSelectedValue] = useState<string>(value?.toString() || '');
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate position relative to the viewport (fixed positioning)
  useEffect(() => {
    if (dropdownRef.current) {
      const parentCell = dropdownRef.current.closest('td');
      if (parentCell) {
        const rect = parentCell.getBoundingClientRect();
        // Using fixed positioning, so no need to add scroll offsets
        // getBoundingClientRect() already returns viewport-relative coordinates
        setPosition({
          top: rect.bottom,
          left: rect.left,
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
  }, [isOpen, selectedValue]);

  const handleCommit = () => {
    onCommit(selectedValue || null);
    setIsOpen(false);
  };

  const handleSelect = (optionId: string) => {
    setSelectedValue(optionId);
    onCommit(optionId);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={dropdownRef}
      className="gitboard-table__iteration-dropdown fixed bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg py-1 min-w-[200px] max-h-[300px] overflow-y-auto z-50"
      style={position ? { top: `${position.top}px`, left: `${position.left}px` } : undefined}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="listbox"
    >
      <div
        className="gitboard-table__iteration-option px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-500 dark:text-gray-400"
        onClick={() => handleSelect('')}
      >
        <span className="gitboard-table__iteration-option-label">Clear selection</span>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
      {options.map((option) => (
        <div
          key={option.id}
          className={`gitboard-table__iteration-option px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2 ${
            selectedValue === option.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
          }`}
          onClick={() => handleSelect(option.id)}
          role="option"
          aria-selected={selectedValue === option.id}
        >
          <div className="flex-1 min-w-0">
            <div className="gitboard-table__iteration-option-label font-medium text-gray-900 dark:text-gray-100">
              {option.label}
            </div>
            {option.description && (
              <div className="gitboard-table__iteration-option-description text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {option.description}
              </div>
            )}
          </div>
          {selectedValue === option.id && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
};

IterationEditor.displayName = 'IterationEditor';
