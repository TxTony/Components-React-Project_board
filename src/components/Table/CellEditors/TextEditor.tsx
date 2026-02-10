/**
 * TextEditor Component
 * Inline text editor for text and title fields
 */

import React, { useState, useRef, useEffect } from 'react';
import type { CellValue } from '@/types';

export interface TextEditorProps {
  value: CellValue;
  onCommit: (value: CellValue) => void;
  onCancel: () => void;
  autoFocus?: boolean;
}

export const TextEditor: React.FC<TextEditorProps> = ({
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
    // Only commit if value has changed
    const originalValue = value?.toString() || '';
    if (editValue !== originalValue) {
      onCommit(editValue);
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
      type="text"
      value={editValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className="gitboard-table__cell-input"
    />
  );
};

TextEditor.displayName = 'TextEditor';
