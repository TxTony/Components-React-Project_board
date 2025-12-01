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
  onSelect?: (rowId: string, selected: boolean) => void;
  selectedCell?: { rowId: string; fieldId: string } | null;
  onSelectCell?: (rowId: string, fieldId: string) => void;
  onDragFillStart?: (rowId: string, fieldId: string) => void;
  onDragFillMove?: (rowId: string, fieldId: string) => void;
  dragFillTargets?: Set<string>;
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
}) => {
  const visibleFields = fields.filter((field) => field.visible);

  return (
    <tr
      className={`gitboard-table__row ${isSelected ? 'gitboard-table__row--selected' : ''}`}
      data-row-id={row.id}
    >
      {showSelection && (
        <td className="gitboard-table__cell gitboard-table__cell--checkbox">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect?.(row.id, e.target.checked)}
            className="gitboard-table__checkbox"
            aria-label={`Select row ${row.id}`}
          />
        </td>
      )}
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
          />
        );
      })}
    </tr>
  );
};

Row.displayName = 'Row';
