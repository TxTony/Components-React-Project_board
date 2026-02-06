/**
 * SelectEditor Component
 * Dropdown selector for single-select fields
 * Positioned on top of the table with proper z-index
 */

import React, { useState, useRef, useEffect } from 'react';
import type { CellValue, FieldOption } from '@/types';

export interface SelectEditorProps {
  value: CellValue;
  options: FieldOption[];
  onCommit: (value: CellValue) => void;
  onCancel: () => void;
  autoFocus?: boolean;
}

export const SelectEditor: React.FC<SelectEditorProps> = ({
  value,
  options,
  onCommit,
  onCancel,
  autoFocus = true,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedValue, setSelectedValue] = useState<string>(value?.toString() || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
    if (autoFocus && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [autoFocus]);

  const filteredOptions = options
    .filter(o => o.label.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.label.localeCompare(b.label));

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
      className="gitboard-table__select-dropdown fixed bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg min-w-[200px] z-50"
      style={position ? { top: `${position.top}px`, left: `${position.left}px` } : undefined}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="listbox"
    >
      <div className="p-1.5">
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          onKeyDown={(e) => {
            if (e.key === 'Escape') { e.preventDefault(); onCancel(); setIsOpen(false); }
            e.stopPropagation();
          }}
        />
      </div>
      <div className="max-h-[250px] overflow-y-auto py-1">
        <div
          className="gitboard-table__select-option px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-500 dark:text-gray-400"
          onClick={() => handleSelect('')}
        >
          <span className="gitboard-table__select-option-label">Clear selection</span>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
        {filteredOptions.map((option) => {
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
              className={`gitboard-table__select-option px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2 ${
                selectedValue === option.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
              onClick={() => handleSelect(option.id)}
              role="option"
              aria-selected={selectedValue === option.id}
            >
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
                  <div className="gitboard-table__select-option-description text-xs text-gray-500 dark:text-gray-400">
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
          );
        })}
        {filteredOptions.length === 0 && (
          <div className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500 italic">No matches</div>
        )}
      </div>
    </div>
  );
};

SelectEditor.displayName = 'SelectEditor';
