/**
 * TableHeader Component
 * Renders the table header with column names and sorting controls
 * Supports drag-and-drop column reordering
 */

import React, { useState } from 'react';
import type { FieldDefinition, SortConfig } from '@/types';

export interface TableHeaderProps {
  fields: FieldDefinition[];
  sortConfig?: SortConfig | null;
  onSort?: (fieldId: string) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  onResize?: (fieldId: string, width: number) => void;
  showSelection?: boolean;
  allSelected?: boolean;
  onSelectAll?: (selected: boolean) => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  fields,
  sortConfig,
  onSort,
  onReorder,
  onResize,
  showSelection = false,
  allSelected = false,
  onSelectAll,
}) => {
  const visibleFields = fields.filter((field) => field.visible);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [resizingField, setResizingField] = useState<{ fieldId: string; startX: number; startWidth: number } | null>(null);

  const handleHeaderClick = (fieldId: string) => {
    if (onSort) {
      onSort(fieldId);
    }
  };

  const getSortIndicator = (fieldId: string) => {
    if (!sortConfig || sortConfig.field !== fieldId) {
      return null;
    }

    return (
      <span className="gitboard-table__sort-indicator">
        {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
      </span>
    );
  };

  const handleDragStart = (index: number) => (e: React.DragEvent) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Set a transparent drag image for better UX
    if (e.dataTransfer.setDragImage) {
      const img = new Image();
      img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
      e.dataTransfer.setDragImage(img, 0, 0);
    }
  };

  const handleDragOver = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (toIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();

    if (draggedIndex !== null && draggedIndex !== toIndex && onReorder) {
      onReorder(draggedIndex, toIndex);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Resize handlers
  const handleResizeStart = (field: FieldDefinition, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent header click (sort)
    const startWidth = field.width || 150; // Default width
    setResizingField({
      fieldId: field.id,
      startX: e.clientX,
      startWidth,
    });
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!resizingField || !onResize) return;

    const deltaX = e.clientX - resizingField.startX;
    const newWidth = Math.max(80, resizingField.startWidth + deltaX); // Min width 80px

    onResize(resizingField.fieldId, newWidth);
  };

  const handleResizeEnd = () => {
    setResizingField(null);
  };

  // Global mouse event listeners for resize
  React.useEffect(() => {
    if (resizingField) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);

      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizingField]);

  return (
    <thead className="gitboard-table__thead">
      <tr>
        {showSelection && (
          <th className="gitboard-table__th gitboard-table__th--checkbox">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => onSelectAll?.(e.target.checked)}
              className="gitboard-table__checkbox"
              aria-label="Select all rows"
            />
          </th>
        )}
        {visibleFields.map((field, index) => {
          const isDragging = draggedIndex === index;
          const isDragOver = dragOverIndex === index;

          return (
            <th
              key={field.id}
              draggable={!!onReorder}
              className={`gitboard-table__th ${onSort ? 'gitboard-table__th--sortable' : ''} ${
                onReorder ? 'gitboard-table__th--draggable' : ''
              } ${isDragging ? 'gitboard-table__th--dragging' : ''} ${
                isDragOver ? 'gitboard-table__th--drag-over' : ''
              }`}
              style={field.width ? { width: `${field.width}px` } : undefined}
              onClick={() => handleHeaderClick(field.id)}
              onDragStart={onReorder ? handleDragStart(index) : undefined}
              onDragOver={onReorder ? handleDragOver(index) : undefined}
              onDragLeave={onReorder ? handleDragLeave : undefined}
              onDrop={onReorder ? handleDrop(index) : undefined}
              onDragEnd={onReorder ? handleDragEnd : undefined}
            >
              <div className="gitboard-table__th-content">
                <span>{field.name}</span>
                {getSortIndicator(field.id)}
              </div>
              {onResize && (
                <div
                  className="gitboard-table__resize-handle"
                  onMouseDown={(e) => handleResizeStart(field, e)}
                  title="Drag to resize column"
                />
              )}
            </th>
          );
        })}
      </tr>
    </thead>
  );
};

TableHeader.displayName = 'TableHeader';
