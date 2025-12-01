/**
 * ColumnVisibilityMenu Component
 * Allows users to show/hide columns in the table
 */

import React, { useState, useRef, useEffect } from 'react';
import type { FieldDefinition } from '@/types';

export interface ColumnVisibilityMenuProps {
  fields: FieldDefinition[];
  onToggleVisibility: (fieldId: string) => void;
}

export const ColumnVisibilityMenu: React.FC<ColumnVisibilityMenuProps> = ({
  fields,
  onToggleVisibility,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  const handleToggle = (fieldId: string) => {
    onToggleVisibility(fieldId);
  };

  const visibleCount = fields.filter((f) => f.visible).length;
  const totalCount = fields.length;

  return (
    <div className="gitboard-column-visibility">
      <button
        ref={buttonRef}
        type="button"
        className="gitboard-column-visibility__button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle column visibility"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path
            fillRule="evenodd"
            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
            clipRule="evenodd"
          />
        </svg>
        <span className="ml-1">
          {visibleCount}/{totalCount}
        </span>
      </button>

      {isOpen && (
        <div ref={menuRef} className="gitboard-column-visibility__menu" role="menu">
          <div className="gitboard-column-visibility__header">
            <span className="text-sm font-semibold">Show/Hide Columns</span>
            <span className="text-xs text-gray-500">
              {visibleCount} of {totalCount} visible
            </span>
          </div>
          <div className="gitboard-column-visibility__list">
            {fields.map((field) => (
              <label
                key={field.id}
                className="gitboard-column-visibility__item"
                role="menuitemcheckbox"
                aria-checked={field.visible}
              >
                <input
                  type="checkbox"
                  checked={field.visible}
                  onChange={() => handleToggle(field.id)}
                  className="gitboard-column-visibility__checkbox"
                />
                <span className="gitboard-column-visibility__label">{field.name}</span>
                <span className="gitboard-column-visibility__type text-xs text-gray-500">
                  {field.type}
                </span>
              </label>
            ))}
          </div>
          <div className="gitboard-column-visibility__footer">
            <button
              type="button"
              className="gitboard-column-visibility__close"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

ColumnVisibilityMenu.displayName = 'ColumnVisibilityMenu';
