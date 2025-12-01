/**
 * NumberEditor Component
 * Inline number editor with validation
 */

import React, { useState, useRef, useEffect } from 'react';
import type { CellValue } from '@/types';

export interface NumberEditorProps {
  value: CellValue;
  onCommit: (value: CellValue) => void;
  onCancel: () => void;
  autoFocus?: boolean;
}

export const NumberEditor: React.FC<NumberEditorProps> = ({
  value,
  onCommit,
  onCancel,
  autoFocus = true,
}) => {
  const [editValue, setEditValue] = useState<string>(value?.toString() || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [autoFocus]);

  const handleCommit = () => {
    // Parse and validate number
    let newValue: number | null;
    if (editValue === '' || editValue === null) {
      newValue = null;
    } else {
      const num = parseFloat(editValue);
      newValue = isNaN(num) ? null : num;
    }

    // Only commit if value has changed
    const originalValue = value === null || value === undefined ? null : value;
    if (newValue !== originalValue) {
      onCommit(newValue);
    } else {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommit();
    } else if (e.key === 'Escape') {
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
      type="number"
      value={editValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className="gitboard-table__cell-input"
    />
  );
};

NumberEditor.displayName = 'NumberEditor';
