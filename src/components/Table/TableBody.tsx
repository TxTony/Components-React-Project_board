/**
 * TableBody Component
 * Renders the table body with all rows
 */

import React, { useState, useRef } from 'react';
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
  const dragFillSourceRef = useRef<{ rowId: string; fieldId: string } | null>(null);
  const dragFillTargetsRef = useRef<Set<string>>(new Set());

  const handleDragFillStart = (rowId: string, fieldId: string) => {
    const source = { rowId, fieldId };
    const initialTargets = new Set([`${rowId}:${fieldId}`]);

    // Update both state (for UI) and ref (for immediate access)
    setDragFillSource(source);
    setDragFillTargets(initialTargets);
    dragFillSourceRef.current = source;
    dragFillTargetsRef.current = initialTargets;

    // Add global mouse event listeners
    const handleMouseUp = () => {
      emitBulkUpdate();

      // Clear both state and refs
      setDragFillSource(null);
      setDragFillTargets(new Set());
      dragFillSourceRef.current = null;
      dragFillTargetsRef.current = new Set();

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

    // Update both state and ref
    setDragFillTargets(targets);
    dragFillTargetsRef.current = targets;
  };

  const emitBulkUpdate = () => {
    // Use refs for immediate access (no async state issues)
    const source = dragFillSourceRef.current;
    const targets = dragFillTargetsRef.current;

    if (!source) return;

    const field = fields.find((f) => f.id === source.fieldId);
    if (!field) return;

    const sourceRow = rows.find((r) => r.id === source.rowId);
    if (!sourceRow) return;

    const sourceValue = sourceRow.values[source.fieldId];

    // Build target cells (excluding the source)
    const targetCells = Array.from(targets)
      .filter((key) => key !== `${source.rowId}:${source.fieldId}`)
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
        rowId: source.rowId,
        fieldId: source.fieldId,
        value: sourceValue,
      },
      targetCells,
      field,
    };

    // Call the handler which will update internal state and notify parent
    if (!onBulkUpdate) return;

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
