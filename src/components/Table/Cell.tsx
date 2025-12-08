/**
 * Cell Component
 * Renders individual table cells with inline editing support
 * Supports all field types with specialized editors
 */

import React, { useState, useRef } from 'react';
import { TextEditor } from './CellEditors/TextEditor';
import { NumberEditor } from './CellEditors/NumberEditor';
import { DateEditor } from './CellEditors/DateEditor';
import { SelectEditor } from './CellEditors/SelectEditor';
import { MultiSelectEditor } from './CellEditors/MultiSelectEditor';
import { IterationEditor } from './CellEditors/IterationEditor';
import type { FieldDefinition, CellValue } from '@/types';

export interface CellProps {
  field: FieldDefinition;
  value: CellValue;
  rowId: string;
  readOnly?: boolean;
  onEdit?: (edit: { rowId: string; fieldId: string; value: CellValue }) => void;
  isSelected?: boolean;
  onSelect?: (rowId: string, fieldId: string) => void;
  onDragFillStart?: (rowId: string, fieldId: string) => void;
  onDragFillMove?: (rowId: string, fieldId: string) => void;
  onDragFillEnd?: () => void;
  isDragFillHovered?: boolean;
  onTitleClick?: (rowId: string) => void;
}

export const Cell: React.FC<CellProps> = ({
  field,
  value,
  rowId,
  readOnly = false,
  onEdit,
  isSelected = false,
  onSelect,
  onDragFillStart,
  onDragFillMove,
  onDragFillEnd,
  isDragFillHovered = false,
  onTitleClick,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  const renderValue = () => {
    // Handle null/undefined
    if (value === null || value === undefined) {
      return '';
    }

    // Handle arrays (multi-select, tags)
    if (Array.isArray(value)) {
      if (value.length === 0) return '';

      // For multi-select, show option labels with colors
      if (field.type === 'multi-select' && field.options) {
        return (
          <div className="flex flex-wrap gap-1">
            {value.map((optId) => {
              const option = field.options?.find((opt) => opt.id === optId);
              if (!option) return null;

              // Convert hex to rgba for background
              const hexToRgba = (hex: string, alpha: number) => {
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
              };

              return (
                <span
                  key={optId}
                  className="gitboard-table__badge inline-flex items-center px-2 py-0.5 text-xs font-medium"
                  style={
                    option.color
                      ? {
                          backgroundColor: hexToRgba(option.color, 0.1),
                          borderWidth: '1.5px',
                          borderStyle: 'solid',
                          borderColor: option.color,
                          color: option.color,
                          borderRadius: '6px',
                        }
                      : {
                          borderRadius: '6px',
                        }
                  }
                >
                  {option.label}
                </span>
              );
            })}
          </div>
        );
      }

      return value.join(', ');
    }

    // Helper function to convert hex to rgba
    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // Handle single-select - show label with color
    if (field.type === 'single-select' && field.options) {
      const option = field.options.find((opt) => opt.id === value);
      if (!option) return value;
      return (
        <span
          className="gitboard-table__badge inline-flex items-center px-2 py-0.5 text-xs font-medium"
          style={
            option.color
              ? {
                  backgroundColor: hexToRgba(option.color, 0.1),
                  borderWidth: '1.5px',
                  borderStyle: 'solid',
                  borderColor: option.color,
                  color: option.color,
                  borderRadius: '6px',
                }
              : {
                  borderRadius: '6px',
                }
          }
        >
          {option.label}
        </span>
      );
    }

    // Handle assignee - show label with color
    if (field.type === 'assignee' && field.options) {
      const option = field.options.find((opt) => opt.id === value);
      if (!option) return value;
      return (
        <span
          className="gitboard-table__badge inline-flex items-center px-2 py-0.5 text-xs font-medium"
          style={
            option.color
              ? {
                  backgroundColor: hexToRgba(option.color, 0.1),
                  borderWidth: '1.5px',
                  borderStyle: 'solid',
                  borderColor: option.color,
                  color: option.color,
                  borderRadius: '6px',
                }
              : {
                  borderRadius: '6px',
                }
          }
        >
          {option.label}
        </span>
      );
    }

    // Handle iteration - show label with color
    if (field.type === 'iteration' && field.options) {
      const option = field.options.find((opt) => opt.id === value);
      if (!option) return value;
      return (
        <span
          className="gitboard-table__badge inline-flex items-center px-2 py-0.5 text-xs font-medium"
          style={
            option.color
              ? {
                  backgroundColor: hexToRgba(option.color, 0.1),
                  borderWidth: '1.5px',
                  borderStyle: 'solid',
                  borderColor: option.color,
                  color: option.color,
                  borderRadius: '6px',
                }
              : {
                  borderRadius: '6px',
                }
          }
        >
          {option.label}
        </span>
      );
    }

    // Handle primitives
    return String(value);
  };

  // Check if this field type should show a caret
  const shouldShowCaret = () => {
    return ['single-select', 'multi-select', 'assignee', 'iteration'].includes(field.type);
  };

  // Single click - ONLY select the cell (no edit mode)
  const handleClick = () => {
    if (readOnly) return;
    
    // If this is a title field and onTitleClick is provided, call it
    if (field.type === 'title' && onTitleClick) {
      onTitleClick(rowId);
      return;
    }
    
    onSelect?.(rowId, field.id);
  };

  // Double click - enter edit mode for all field types
  const handleDoubleClick = () => {
    if (readOnly) return;
    setIsEditing(true);
  };

  // Click on caret - enter edit mode for dropdown fields
  const handleCaretClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering handleClick
    if (readOnly) return;
    setIsEditing(true);
  };

  const handleCommit = (newValue: CellValue) => {
    if (onEdit) {
      onEdit({
        rowId,
        fieldId: field.id,
        value: newValue,
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const renderEditor = () => {
    const fieldType = field.type;

    switch (fieldType) {
      case 'title':
      case 'text':
        return (
          <TextEditor
            value={value}
            onCommit={handleCommit}
            onCancel={handleCancel}
          />
        );

      case 'number':
        return (
          <NumberEditor
            value={value}
            onCommit={handleCommit}
            onCancel={handleCancel}
          />
        );

      case 'date':
        return (
          <DateEditor
            value={value}
            onCommit={handleCommit}
            onCancel={handleCancel}
          />
        );

      case 'single-select':
        return (
          <SelectEditor
            value={value}
            options={field.options || []}
            onCommit={handleCommit}
            onCancel={handleCancel}
          />
        );

      case 'multi-select':
        return (
          <MultiSelectEditor
            value={value}
            options={field.options || []}
            onCommit={handleCommit}
            onCancel={handleCancel}
          />
        );

      case 'assignee':
        return (
          <SelectEditor
            value={value}
            options={field.options || []}
            onCommit={handleCommit}
            onCancel={handleCancel}
          />
        );

      case 'iteration':
        return (
          <IterationEditor
            value={value}
            options={field.options || []}
            onCommit={handleCommit}
            onCancel={handleCancel}
          />
        );

      default:
        return (
          <TextEditor
            value={value}
            onCommit={handleCommit}
            onCancel={handleCancel}
          />
        );
    }
  };

  // Drag fill handle handlers
  const handleDragHandleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onDragFillStart) {
      onDragFillStart(rowId, field.id);
    }
  };

  const handleCellMouseEnter = () => {
    if (onDragFillMove) {
      onDragFillMove(rowId, field.id);
    }
  };

  return (
    <td
      className={`gitboard-table__cell relative ${isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''} ${isDragFillHovered ? 'ring-2 ring-green-500 ring-inset bg-green-50 dark:bg-green-900/20' : ''}`}
      onMouseEnter={handleCellMouseEnter}
    >
      {isEditing ? (
        <div className="gitboard-table__cell-editor">
          {renderEditor()}
        </div>
      ) : (
        <div
          className="gitboard-table__cell-content flex items-center justify-between gap-2"
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          style={{ cursor: readOnly ? 'default' : 'pointer' }}
        >
          <span className="flex-1">{renderValue()}</span>
          {shouldShowCaret() && !readOnly && (
            <button
              type="button"
              onClick={handleCaretClick}
              className="gitboard-table__cell-caret p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded flex-shrink-0"
              aria-label="Open dropdown"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
          {/* Drag fill handle - shows on selected cell */}
          {isSelected && !readOnly && !isEditing && onDragFillStart && (
            <div
              ref={dragHandleRef}
              className="gitboard-table__drag-handle"
              onMouseDown={handleDragHandleMouseDown}
              title="Drag to fill cells below"
            />
          )}
        </div>
      )}
    </td>
  );
};

Cell.displayName = 'Cell';
