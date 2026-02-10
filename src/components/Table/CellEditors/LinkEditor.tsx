/**
 * LinkEditor Component
 * Inline URL editor for link fields
 */

import React, { useState, useRef, useEffect } from 'react';
import type { CellValue } from '@/types';

export interface LinkEditorProps {
  value: CellValue;
  onCommit: (value: CellValue) => void;
  onCancel: () => void;
  autoFocus?: boolean;
}

export const LinkEditor: React.FC<LinkEditorProps> = ({
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
    const trimmedValue = editValue.trim();

    if (trimmedValue !== originalValue) {
      // No auto-prepend - save the link as entered by the user
      onCommit(trimmedValue);
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
      type="url"
      value={editValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      placeholder="https://example.com"
      className="gitboard-table__cell-input"
    />
  );
};

LinkEditor.displayName = 'LinkEditor';
