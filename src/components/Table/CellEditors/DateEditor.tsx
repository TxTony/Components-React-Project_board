/**
 * DateEditor Component
 * Inline date picker for date fields
 */

import React, { useState, useRef, useEffect } from 'react';
import type { CellValue } from '@/types';

export interface DateEditorProps {
  value: CellValue;
  onCommit: (value: CellValue) => void;
  onCancel: () => void;
  autoFocus?: boolean;
}

export const DateEditor: React.FC<DateEditorProps> = ({
  value,
  onCommit,
  onCancel,
  autoFocus = true,
}) => {
  // Initialize with proper format for HTML date input
  // Empty string or null should remain empty for the date picker to work
  const initialValue = value ? value.toString() : '';
  const [editValue, setEditValue] = useState<string>(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleCommit = () => {
    // If empty, commit null
    if (editValue === '' || editValue === null) {
      onCommit(null);
      return;
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRegex.test(editValue)) {
      onCommit(editValue);
    } else {
      onCommit(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    } else if (e.key === 'z' && e.ctrlKey) {
      e.preventDefault();
      onCancel();
    }
  };

  const handleBlur = () => {
    handleCommit();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  return (
    <input
      ref={inputRef}
      type="date"
      value={editValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className="gitboard-table__cell-input"
    />
  );
};

DateEditor.displayName = 'DateEditor';
