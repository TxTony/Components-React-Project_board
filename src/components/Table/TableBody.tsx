/**
 * TableBody Component
 * Renders the table body with all rows
 */

import React, { useState, useEffect } from 'react';
import { Row } from './Row';
import { AddItemRow } from './AddItemRow';
import type { FieldDefinition, Row as RowType, CellValue, BulkUpdateEvent } from '@/types';

export interface TableBodyProps {
  fields: FieldDefinition[];
  rows: RowType[];
  onEdit?: (edit: { rowId: string; fieldId: string; value: CellValue }) => void;
  showSelection?: boolean;
  selectedRows?: Set<string>;
  onSelectRow?: (rowId: string, selected: boolean) => void;
  selectedCell?: { rowId: string; fieldId: string } | null;
  onSelectCell?: (rowId: string, fieldId: string) => void;
  onAddItem?: (title: string) => void;
  onBulkUpdate?: (event: BulkUpdateEvent) => void;
}

export const TableBody: React.FC<TableBodyProps> = ({
  fields,
  rows,
  onEdit,
  showSelection = false,
  selectedRows = new Set(),
  onSelectRow,
  selectedCell = null,
  onSelectCell,
  onAddItem,
  onBulkUpdate,
}) => {
  const [dragFillSource, setDragFillSource] = useState<{ rowId: string; fieldId: string } | null>(null);
  const [dragFillTargets, setDragFillTargets] = useState<Set<string>>(new Set());

  const handleDragFillStart = (rowId: string, fieldId: string) => {
    setDragFillSource({ rowId, fieldId });
    setDragFillTargets(new Set([`${rowId}:${fieldId}`]));

    // Add global mouse event listeners
    const handleMouseUp = () => {
      if (dragFillSource) {
        emitBulkUpdate();
      }
      setDragFillSource(null);
      setDragFillTargets(new Set());
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleDragFillMove = (rowId: string, fieldId: string) => {
    if (!dragFillSource) return;

    // Only allow dragging down in the same column
    if (fieldId !== dragFillSource.fieldId) return;

    // Find the source row index
    const sourceRowIndex = rows.findIndex((r) => r.id === dragFillSource.rowId);
    const targetRowIndex = rows.findIndex((r) => r.id === rowId);

    if (sourceRowIndex === -1 || targetRowIndex === -1) return;

    // Only allow dragging downwards
    if (targetRowIndex <= sourceRowIndex) return;

    // Build the set of target cells (from source to current)
    const targets = new Set<string>();
    for (let i = sourceRowIndex; i <= targetRowIndex; i++) {
      targets.add(`${rows[i].id}:${fieldId}`);
    }

    setDragFillTargets(targets);
  };

  const emitBulkUpdate = () => {
    if (!dragFillSource || !onBulkUpdate) return;

    const field = fields.find((f) => f.id === dragFillSource.fieldId);
    if (!field) return;

    const sourceRow = rows.find((r) => r.id === dragFillSource.rowId);
    if (!sourceRow) return;

    const sourceValue = sourceRow.values[dragFillSource.fieldId];

    // Build target cells (excluding the source)
    const targetCells = Array.from(dragFillTargets)
      .filter((key) => key !== `${dragFillSource.rowId}:${dragFillSource.fieldId}`)
      .map((key) => {
        const [rowId, fieldId] = key.split(':');
        const row = rows.find((r) => r.id === rowId);
        return {
          rowId,
          fieldId,
          currentValue: row?.values[fieldId] ?? null,
        };
      });

    if (targetCells.length === 0) return;

    const bulkUpdateEvent: BulkUpdateEvent = {
      sourceCell: {
        rowId: dragFillSource.rowId,
        fieldId: dragFillSource.fieldId,
        value: sourceValue,
      },
      targetCells,
      field,
    };

    onBulkUpdate(bulkUpdateEvent);
  };

  return (
    <tbody className="gitboard-table__tbody">
      {rows.map((row) => (
        <Row
          key={row.id}
          row={row}
          fields={fields}
          onEdit={onEdit}
          showSelection={showSelection}
          isSelected={selectedRows.has(row.id)}
          onSelect={onSelectRow}
          selectedCell={selectedCell}
          onSelectCell={onSelectCell}
          onDragFillStart={handleDragFillStart}
          onDragFillMove={handleDragFillMove}
          dragFillTargets={dragFillTargets}
        />
      ))}
      <AddItemRow
        fields={fields}
        showSelection={showSelection}
        onAddItem={onAddItem}
      />
    </tbody>
  );
};

TableBody.displayName = 'TableBody';
