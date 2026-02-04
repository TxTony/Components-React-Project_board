/**
 * GroupByMenu Component
 * Dropdown menu for selecting a field to group by
 */

import React, { useState, useRef, useEffect } from 'react';
import type { FieldDefinition } from '@/types';

export interface GroupByMenuProps {
  fields: FieldDefinition[];
  currentGroupBy: string | null;
  onGroupByChange: (fieldId: string | null) => void;
}

export const GroupByMenu: React.FC<GroupByMenuProps> = ({
  fields,
  currentGroupBy,
  onGroupByChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Get the current field name for display
  const currentField = fields.find((f) => f.id === currentGroupBy);
  const buttonLabel = currentField ? `Grouped by: ${currentField.name}` : 'Group by';

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleFieldSelect = (fieldId: string | null) => {
    onGroupByChange(fieldId);
    setIsOpen(false);
  };

  // Filter to only groupable field types
  const groupableFields = fields.filter(
    (f) =>
      f.type === 'single-select' ||
      f.type === 'multi-select' ||
      f.type === 'assignee' ||
      f.type === 'iteration' ||
      f.type === 'text' ||
      f.type === 'title' ||
      f.type === 'link' ||
      f.type === 'date'
  );

  return (
    <div className="gitboard-table__group-by-menu" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`gitboard-table__button ${currentGroupBy ? 'gitboard-table__button--active' : ''}`}
        aria-label="Group by field"
        aria-expanded={isOpen}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M0 2.75A.75.75 0 01.75 2h14.5a.75.75 0 010 1.5H.75A.75.75 0 010 2.75zm0 5A.75.75 0 01.75 7h14.5a.75.75 0 010 1.5H.75A.75.75 0 010 7.75zM.75 12a.75.75 0 000 1.5h14.5a.75.75 0 000-1.5H.75z" />
        </svg>
        <span>{buttonLabel}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="currentColor"
          style={{
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" fill="none" strokeWidth="1.5" />
        </svg>
      </button>

      {isOpen && (
        <div className="gitboard-table__dropdown-menu" role="menu">
          {/* No grouping option */}
          <button
            className={`gitboard-table__dropdown-item ${!currentGroupBy ? 'gitboard-table__dropdown-item--active' : ''}`}
            onClick={() => handleFieldSelect(null)}
            role="menuitem"
          >
            <span>No grouping</span>
            {!currentGroupBy && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
              </svg>
            )}
          </button>

          <div className="gitboard-table__dropdown-divider" />

          {/* Field options */}
          {groupableFields.map((field) => (
            <button
              key={field.id}
              className={`gitboard-table__dropdown-item ${currentGroupBy === field.id ? 'gitboard-table__dropdown-item--active' : ''}`}
              onClick={() => handleFieldSelect(field.id)}
              role="menuitem"
            >
              <span>{field.name}</span>
              {currentGroupBy === field.id && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                </svg>
              )}
            </button>
          ))}

          {groupableFields.length === 0 && (
            <div className="gitboard-table__dropdown-empty">
              No groupable fields available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

GroupByMenu.displayName = 'GroupByMenu';
