/**
 * SearchBar Component
 * Global search input for filtering across all fields
 */

import React, { useState, useEffect } from 'react';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
}) => {
  const [localValue, setLocalValue] = useState(value);

  // Sync with external value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce the onChange callback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, value, onChange, debounceMs]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className="gitboard-table__search-bar">
      <div className="gitboard-table__search-input-wrapper">
        <svg
          className="gitboard-table__search-icon"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M11.5 7a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm-.82 4.74a6 6 0 111.06-1.06l3.04 3.04a.75.75 0 11-1.06 1.06l-3.04-3.04z"
          />
        </svg>
        <input
          type="text"
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="gitboard-table__search-input"
          aria-label="Search table"
        />
        {localValue && (
          <button
            type="button"
            onClick={handleClear}
            className="gitboard-table__search-clear"
            aria-label="Clear search"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M1.757 10.243a1 1 0 101.415 1.414L6 8.828l2.828 2.829a1 1 0 101.415-1.414L7.414 7.414l2.829-2.828a1 1 0 10-1.415-1.415L6 6l-2.828-2.829a1 1 0 10-1.415 1.415l2.829 2.828-2.829 2.829z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

SearchBar.displayName = 'SearchBar';
