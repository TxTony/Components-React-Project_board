/**
 * ViewTabs Component
 * Displays tabs for switching between saved views (filters + sorting + columns)
 * Features:
 * - Click to switch views
 * - Double-click to edit view name
 * - "+ Add view" button to create new views
 * - Delete button (X) to remove views (visible on hover, disabled when only 1 view remains)
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
  onDeleteView?: (viewId: string) => void;
  onViewsReorder?: (views: ViewConfig[]) => void;
}

export const ViewTabs: React.FC<ViewTabsProps> = ({
  views,
  currentViewId,
  currentFilters,
  onViewChange,
  onCreateView,
  onUpdateView,
  onDeleteView,
  onViewsReorder,
}) => {
  const [editingViewId, setEditingViewId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [draggingViewId, setDraggingViewId] = useState<string | null>(null);
  const [dragOverViewId, setDragOverViewId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (editingViewId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingViewId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };

    if (openDropdownId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openDropdownId]);

  // Check if current view has unsaved filter changes
  const currentView = views.find((v) => v.id === currentViewId);
  const hasUnsavedChanges = currentView && (
    JSON.stringify(currentView.filters) !== JSON.stringify(currentFilters)
  );

  const toggleDropdown = (viewId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === viewId ? null : viewId);
  };

  const handleDeleteFromMenu = (viewId: string) => {
    if (!onDeleteView) return;

    // Close dropdown
    setOpenDropdownId(null);

    // If deleting the current view, switch to another view first
    if (viewId === currentViewId && views.length > 1) {
      const remainingViews = views.filter((v) => v.id !== viewId);
      if (remainingViews.length > 0) {
        onViewChange(remainingViews[0]);
      }
    }

    onDeleteView(viewId);
  };

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

  // Drag & Drop handlers for view reordering
  const handleDragStart = (viewId: string, e: React.DragEvent) => {
    setDraggingViewId(viewId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', viewId);
  };

  const handleDragOver = (viewId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggingViewId && draggingViewId !== viewId) {
      setDragOverViewId(viewId);
    }
  };

  const handleDragLeave = () => {
    setDragOverViewId(null);
  };

  const handleDrop = (targetViewId: string, e: React.DragEvent) => {
    e.preventDefault();

    if (!draggingViewId || !onViewsReorder || draggingViewId === targetViewId) {
      setDraggingViewId(null);
      setDragOverViewId(null);
      return;
    }

    // Reorder views
    const fromIndex = views.findIndex((v) => v.id === draggingViewId);
    const toIndex = views.findIndex((v) => v.id === targetViewId);

    if (fromIndex === -1 || toIndex === -1) {
      setDraggingViewId(null);
      setDragOverViewId(null);
      return;
    }

    const newViews = [...views];
    const [movedView] = newViews.splice(fromIndex, 1);
    newViews.splice(toIndex, 0, movedView);

    onViewsReorder(newViews);
    setDraggingViewId(null);
    setDragOverViewId(null);
  };

  const handleDragEnd = () => {
    setDraggingViewId(null);
    setDragOverViewId(null);
  };

  return (
    <div className="gitboard-view-tabs" role="tablist">
      {views.map((view) => {
        const isActive = view.id === currentViewId;
        const isEditing = editingViewId === view.id;
        const isDragging = draggingViewId === view.id;
        const isDragOver = dragOverViewId === view.id;

        return (
          <div
            key={view.id}
            className={`gitboard-view-tabs__tab-wrapper ${
              isActive ? 'gitboard-view-tabs__tab-wrapper--active' : ''
            } ${isDragging ? 'gitboard-view-tabs__tab-wrapper--dragging' : ''} ${
              isDragOver ? 'gitboard-view-tabs__tab-wrapper--drag-over' : ''
            }`}
            draggable={!isEditing}
            onDragStart={(e) => handleDragStart(view.id, e)}
            onDragOver={(e) => handleDragOver(view.id, e)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(view.id, e)}
            onDragEnd={handleDragEnd}
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
              <>
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
                  {onDeleteView && views.length > 1 && (
                    <span
                      className="gitboard-view-tabs__caret"
                      onClick={(e) => toggleDropdown(view.id, e)}
                      aria-label="Tab options"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="10"
                        height="10"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <path d="M4.427 7.427l3.396 3.396a.25.25 0 00.354 0l3.396-3.396A.25.25 0 0011.396 7H4.604a.25.25 0 00-.177.427z" />
                      </svg>
                    </span>
                  )}
                </button>
                {onDeleteView && views.length > 1 && openDropdownId === view.id && (
                  <div
                    ref={dropdownRef}
                    className="gitboard-view-tabs__dropdown"
                  >
                    <button
                      type="button"
                      className="gitboard-view-tabs__dropdown-item gitboard-view-tabs__dropdown-item--danger"
                      onClick={() => handleDeleteFromMenu(view.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <path d="M11 1.75V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675a.75.75 0 10-1.492.15l.66 6.6A1.75 1.75 0 005.405 15h5.19c.9 0 1.652-.681 1.741-1.576l.66-6.6a.75.75 0 00-1.492-.149l-.66 6.6a.25.25 0 01-.249.225h-5.19a.25.25 0 01-.249-.225l-.66-6.6z" />
                      </svg>
                      Delete
                    </button>
                  </div>
                )}
              </>
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
