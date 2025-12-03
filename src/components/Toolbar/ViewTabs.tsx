/**
 * ViewTabs Component
 * Displays tabs for switching between saved views (filters + sorting + columns)
 * Features:
 * - Click to switch views
 * - Double-click to edit view name
 * - "+ Add view" button to create new views
 * - Save button appears when filters have unsaved changes
 */

import React, { useState, useRef, useEffect } from 'react';
import type { ViewConfig, FilterConfig } from '@/types';
import { generateRowId } from '../../utils/uid';

export interface ViewTabsProps {
  views: ViewConfig[];
  currentViewId: string;
  currentFilters: FilterConfig[];
  onViewChange: (view: ViewConfig) => void;
  onCreateView?: (view: ViewConfig) => void;
  onUpdateView?: (view: ViewConfig) => void;
}

export const ViewTabs: React.FC<ViewTabsProps> = ({
  views,
  currentViewId,
  currentFilters,
  onViewChange,
  onCreateView,
  onUpdateView,
}) => {
  const [editingViewId, setEditingViewId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (editingViewId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingViewId]);

  // Check if current view has unsaved filter changes
  const currentView = views.find((v) => v.id === currentViewId);
  const hasUnsavedChanges = currentView && (
    JSON.stringify(currentView.filters) !== JSON.stringify(currentFilters)
  );

  const handleAddView = () => {
    if (!onCreateView) return;

    const newView: ViewConfig = {
      id: `view_${generateRowId()}`,
      name: 'New View',
      columns: [],
      sortBy: null,
      filters: [],
      groupBy: null,
    };

    onCreateView(newView);
    onViewChange(newView);
  };

  const handleDoubleClick = (view: ViewConfig) => {
    if (!onUpdateView) return;
    setEditingViewId(view.id);
    setEditingName(view.name);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingName(e.target.value);
  };

  const handleNameSave = () => {
    if (!editingViewId || !onUpdateView) {
      setEditingViewId(null);
      return;
    }

    const view = views.find((v) => v.id === editingViewId);
    if (!view) {
      setEditingViewId(null);
      return;
    }

    const updatedView = {
      ...view,
      name: editingName.trim() || view.name,
    };

    onUpdateView(updatedView);
    setEditingViewId(null);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      setEditingViewId(null);
    }
  };

  const handleSaveView = () => {
    if (!currentView || !onUpdateView) return;

    const updatedView = {
      ...currentView,
      filters: currentFilters,
    };

    onUpdateView(updatedView);
  };

  return (
    <div className="gitboard-view-tabs" role="tablist">
      {views.map((view) => {
        const isActive = view.id === currentViewId;
        const isEditing = editingViewId === view.id;

        return (
          <div
            key={view.id}
            className={`gitboard-view-tabs__tab-wrapper ${
              isActive ? 'gitboard-view-tabs__tab-wrapper--active' : ''
            }`}
          >
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={editingName}
                onChange={handleNameChange}
                onBlur={handleNameSave}
                onKeyDown={handleNameKeyDown}
                className="gitboard-view-tabs__input"
                aria-label="Edit view name"
              />
            ) : (
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`view-${view.id}`}
                className={`gitboard-view-tabs__tab ${
                  isActive ? 'gitboard-view-tabs__tab--active' : ''
                }`}
                onClick={() => onViewChange(view)}
                onDoubleClick={() => handleDoubleClick(view)}
              >
                {view.name}
                {view.filters.length > 0 && (
                  <span className="gitboard-view-tabs__badge">
                    {view.filters.length}
                  </span>
                )}
              </button>
            )}
          </div>
        );
      })}

      {/* Add View Button */}
      {onCreateView && (
        <button
          type="button"
          className="gitboard-view-tabs__add-button"
          onClick={handleAddView}
          aria-label="Add new view"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M7.75 2a.75.75 0 01.75.75V7h4.25a.75.75 0 010 1.5H8.5v4.25a.75.75 0 01-1.5 0V8.5H2.75a.75.75 0 010-1.5H7V2.75A.75.75 0 017.75 2z" />
          </svg>
          Add view
        </button>
      )}

      {/* Save Button */}
      {hasUnsavedChanges && onUpdateView && (
        <button
          type="button"
          className="gitboard-view-tabs__save-button"
          onClick={handleSaveView}
          aria-label="Save view changes"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
          </svg>
          Save
        </button>
      )}
    </div>
  );
};

ViewTabs.displayName = 'ViewTabs';
