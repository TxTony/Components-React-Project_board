/**
 * Toolbar Component
 * Contains table actions like Add Row, Delete, etc.
 */

import React from 'react';
import { GroupByMenu } from './GroupByMenu';
import type { FieldDefinition } from '@/types';

export interface ToolbarProps {
  selectedCount: number;
  onDeleteSelected?: () => void;
  fields?: FieldDefinition[];
  currentGroupBy?: string | null;
  onGroupByChange?: (fieldId: string | null) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  selectedCount,
  onDeleteSelected,
  fields = [],
  currentGroupBy = null,
  onGroupByChange,
}) => {
  return (
    <div className="gitboard-table__toolbar">
      <div className="gitboard-table__toolbar-left">
        {selectedCount > 0 ? (
          <>
            <span className="gitboard-table__selection-count">
              {selectedCount} selected
            </span>
            {onDeleteSelected && (
              <button
                onClick={onDeleteSelected}
                className="gitboard-table__button gitboard-table__button--danger"
                aria-label="Delete selected rows"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M11 1.75V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675a.75.75 0 10-1.492.15l.66 6.6A1.75 1.75 0 005.405 15h5.19c.9 0 1.652-.681 1.741-1.576l.66-6.6a.75.75 0 00-1.492-.149l-.66 6.6a.25.25 0 01-.249.225h-5.19a.25.25 0 01-.249-.225l-.66-6.6z" />
                </svg>
                Delete
              </button>
            )}
          </>
        ) : null}
      </div>

      <div className="gitboard-table__toolbar-right">
        {fields.length > 0 && onGroupByChange && (
          <GroupByMenu
            fields={fields}
            currentGroupBy={currentGroupBy}
            onGroupByChange={onGroupByChange}
          />
        )}
      </div>
    </div>
  );
};

Toolbar.displayName = 'Toolbar';
