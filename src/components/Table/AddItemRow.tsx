/**
 * AddItemRow Component
 * Renders an input row at the bottom of the table for adding new items
 */

import React, { useState } from 'react';
import type { FieldDefinition } from '@/types';

export interface AddItemRowProps {
  fields: FieldDefinition[];
  showSelection?: boolean;
  onAddItem?: (title: string) => void;
}

export const AddItemRow: React.FC<AddItemRowProps> = ({
  fields,
  showSelection = false,
  onAddItem,
}) => {
  const [title, setTitle] = useState('');
  const visibleFields = fields.filter((field) => field.visible);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && title.trim()) {
      e.preventDefault();
      onAddItem?.(title.trim());
      setTitle('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  // Calculate colspan: all visible fields + drag handle column + checkbox column if present
  const colspan = visibleFields.length + 1 + (showSelection ? 1 : 0);

  return (
    <tr className="gitboard-table__add-item-row">
      <td colSpan={colspan} className="gitboard-table__cell">
        <div className="gitboard-table__add-item-input-wrapper">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="gitboard-table__add-item-icon"
          >
            <path d="M7.75 2a.75.75 0 01.75.75V7h4.25a.75.75 0 010 1.5H8.5v4.25a.75.75 0 01-1.5 0V8.5H2.75a.75.75 0 010-1.5H7V2.75A.75.75 0 017.75 2z" />
          </svg>
          <input
            type="text"
            value={title}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Add item"
            className="gitboard-table__add-item-input"
            aria-label="Add new item"
          />
        </div>
      </td>
    </tr>
  );
};

AddItemRow.displayName = 'AddItemRow';
