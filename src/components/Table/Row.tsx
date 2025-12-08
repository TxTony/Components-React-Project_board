/**
 * Row Component
 * Renders a table row with cells
 */

import React from 'react';
import { Cell } from './Cell';
import type { FieldDefinition, Row as RowType, CellValue } from '@/types';

export interface RowProps {
  row: RowType;
  fields: FieldDefinition[];
  onEdit?: (edit: { rowId: string; fieldId: string; value: CellValue }) => void;
  showSelection?: boolean;
  isSelected?: boolean;
  onSelect?: (rowId: string, selected: boolean, ctrlKey?: boolean) => void;
  selectedCell?: { rowId: string; fieldId: string } | null;
  onSelectCell?: (rowId: string, fieldId: string) => void;
  onDragFillStart?: (rowId: string, fieldId: string) => void;
  onDragFillMove?: (rowId: string, fieldId: string) => void;
  dragFillTargets?: Set<string>;
  rowIndex?: number;
  isDragging?: boolean;
  isDragOver?: boolean;
  onRowDragStart?: (index: number) => void;
  onRowDragOver?: (e: React.DragEvent, index: number) => void;
  onRowDrop?: (e: React.DragEvent, index: number) => void;
  onRowDragEnd?: () => void;
  onTitleClick?: (rowId: string) => void;
}

export const Row: React.FC<RowProps> = ({
  row,
  fields,
  onEdit,
  showSelection = false,
  isSelected = false,
  onSelect,
  selectedCell = null,
  onSelectCell,
  onDragFillStart,
  onDragFillMove,
  dragFillTargets = new Set(),
  rowIndex,
  isDragging = false,
  isDragOver = false,
  onRowDragStart,
  onRowDragOver,
  onRowDrop,
  onRowDragEnd,
  onTitleClick,
}) => {
  const visibleFields = fields.filter((field) => field.visible);

  const handleDragStart = (e: React.DragEvent) => {
    if (rowIndex !== undefined && onRowDragStart) {
      onRowDragStart(rowIndex);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (rowIndex !== undefined && onRowDragOver) {
      onRowDragOver(e, rowIndex);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (rowIndex !== undefined && onRowDrop) {
      onRowDrop(e, rowIndex);
    }
  };

  const rowClassName = [
    'gitboard-table__row',
    isSelected && 'gitboard-table__row--selected',
    isDragging && 'gitboard-table__row--dragging',
    isDragOver && 'gitboard-table__row--drag-over',
  ].filter(Boolean).join(' ');

  return (
    <tr
      className={rowClassName}
      data-row-id={row.id}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={onRowDragEnd}
    >
      {/* Drag handle */}
      <td className="gitboard-table__cell gitboard-table__cell--drag-handle">
        <div className="gitboard-table__drag-handle" title="Drag to reorder">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="5" cy="4" r="1.5" />
            <circle cx="5" cy="8" r="1.5" />
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="11" cy="4" r="1.5" />
            <circle cx="11" cy="8" r="1.5" />
            <circle cx="11" cy="12" r="1.5" />
          </svg>
        </div>
      </td>
      {/* Row number - clickable for selection */}
      <td
        className={`gitboard-table__cell gitboard-table__cell--row-number ${isSelected ? 'gitboard-table__cell--selected' : ''}`}
        onClick={(e) => {
          const isCtrlClick = e.ctrlKey || e.metaKey;
          // Support Ctrl+Click for multi-selection
          if (isCtrlClick) {
            // Multi-select: toggle this row
            onSelect?.(row.id, !isSelected, true);
          } else {
            // Single select: this is handled in GitBoardTable to clear others
            onSelect?.(row.id, true, false);
          }
        }}
        style={{ cursor: 'pointer' }}
        title={isSelected ? 'Click to deselect • Ctrl+Click to multi-select' : 'Click to select • Ctrl+Click to multi-select'}
      >
        <div className="gitboard-table__row-number">
          {rowIndex !== undefined ? rowIndex + 1 : ''}
        </div>
      </td>
      {visibleFields.map((field) => {
        const value = row.values[field.id];
        const isCellSelected =
          selectedCell?.rowId === row.id && selectedCell?.fieldId === field.id;
        const isDragFillHovered = dragFillTargets.has(`${row.id}:${field.id}`);

        return (
          <Cell
            key={field.id}
            field={field}
            value={value}
            rowId={row.id}
            onEdit={onEdit}
            isSelected={isCellSelected}
            onSelect={onSelectCell}
            onDragFillStart={onDragFillStart}
            onDragFillMove={onDragFillMove}
            isDragFillHovered={isDragFillHovered}
            onTitleClick={onTitleClick}
          />
        );
      })}
    </tr>
  );
};

Row.displayName = 'Row';
