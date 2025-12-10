/**
 * GroupedTableBody Component
 * Renders table rows grouped by a field with collapsible sections
 */

import React, { useState } from 'react';
import { Row } from './Row';
import { AddItemRow } from './AddItemRow';
import { LoadingIndicator } from '../Shared/LoadingIndicator';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import type { FieldDefinition, CellValue, BulkUpdateEvent } from '@/types';
import type { RowGroup } from '../../utils/grouping';

export interface GroupedTableBodyProps {
  fields: FieldDefinition[];
  groups: RowGroup[];
  onEdit?: (edit: { rowId: string; fieldId: string; value: CellValue }) => void;
  showSelection?: boolean;
  selectedRows?: Set<string>;
  onSelectRow?: (rowId: string, selected: boolean, ctrlKey?: boolean, shiftKey?: boolean) => void;
  selectedCell?: { rowId: string; fieldId: string } | null;
  onSelectCell?: (rowId: string, fieldId: string) => void;
  onAddItem?: (title: string) => void;
  onBulkUpdate?: (event: BulkUpdateEvent) => void;
  onRowReorder?: (fromIndex: number, toIndex: number) => void;
  onTitleClick?: (rowId: string) => void;
  onRowNumberDoubleClick?: (rowId: string) => void;

  // Infinite scroll props
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  loadingMessage?: string;
}

export const GroupedTableBody: React.FC<GroupedTableBodyProps> = ({
  fields,
  groups,
  onEdit,
  showSelection = false,
  selectedRows = new Set(),
  onSelectRow,
  selectedCell = null,
  onSelectCell,
  onAddItem,
  onBulkUpdate,
  onRowReorder,
  onTitleClick,
  onRowNumberDoubleClick,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  loadingMessage,
}) => {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [dragFillSource, setDragFillSource] = useState<{ rowId: string; fieldId: string } | null>(null);
  const [dragFillTargets, setDragFillTargets] = useState<Set<string>>(new Set());
  const [draggedRowIndex, setDraggedRowIndex] = useState<number | null>(null);
  const [dragOverRowIndex, setDragOverRowIndex] = useState<number | null>(null);

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const handleDragFillStart = (rowId: string, fieldId: string) => {
    setDragFillSource({ rowId, fieldId });
    setDragFillTargets(new Set([`${rowId}:${fieldId}`]));

    const handleMouseUp = () => {
      emitBulkUpdate();
      setDragFillSource(null);
      setDragFillTargets(new Set());
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleDragFillMove = (rowId: string, fieldId: string) => {
    if (!dragFillSource) return;
    if (fieldId !== dragFillSource.fieldId) return;

    // Build flattened row list from all groups
    const allRows = groups.flatMap((g) => g.rows);
    const sourceRowIndex = allRows.findIndex((r) => r.id === dragFillSource.rowId);
    const targetRowIndex = allRows.findIndex((r) => r.id === rowId);

    if (sourceRowIndex === -1 || targetRowIndex === -1) return;
    if (targetRowIndex <= sourceRowIndex) return;

    const targets = new Set<string>();
    for (let i = sourceRowIndex; i <= targetRowIndex; i++) {
      targets.add(`${allRows[i].id}:${fieldId}`);
    }

    setDragFillTargets(targets);
  };

  const emitBulkUpdate = () => {
    if (!dragFillSource || !onBulkUpdate) return;

    const field = fields.find((f) => f.id === dragFillSource.fieldId);
    if (!field) return;

    const allRows = groups.flatMap((g) => g.rows);
    const sourceRow = allRows.find((r) => r.id === dragFillSource.rowId);
    if (!sourceRow) return;

    const sourceValue = sourceRow.values[dragFillSource.fieldId];

    const targetCells = Array.from(dragFillTargets)
      .filter((key) => key !== `${dragFillSource.rowId}:${dragFillSource.fieldId}`)
      .map((key) => {
        const [rowId, fieldId] = key.split(':');
        const row = allRows.find((r) => r.id === rowId);
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

  const handleRowDragStart = (index: number) => {
    setDraggedRowIndex(index);
  };

  const handleRowDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedRowIndex === null || draggedRowIndex === index) return;
    setDragOverRowIndex(index);
  };

  const handleRowDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedRowIndex === null || draggedRowIndex === dropIndex) {
      setDraggedRowIndex(null);
      setDragOverRowIndex(null);
      return;
    }

    if (onRowReorder) {
      onRowReorder(draggedRowIndex, dropIndex);
    }

    setDraggedRowIndex(null);
    setDragOverRowIndex(null);
  };

  const handleRowDragEnd = () => {
    setDraggedRowIndex(null);
    setDragOverRowIndex(null);
  };

  // Infinite scroll setup
  const triggerRef = useInfiniteScroll({
    onLoadMore: onLoadMore || (() => {}),
    hasMore,
    isLoading: isLoadingMore,
    threshold: 200,
  });

  // Calculate column count for group header row
  const columnCount = fields.filter((f) => f.visible).length + (showSelection ? 1 : 0) + 1; // +1 for row number

  return (
    <tbody className="gitboard-table__tbody gitboard-table__tbody--grouped">
      {groups.map((group, groupIndex) => {
        const isCollapsed = collapsedGroups.has(group.id);
        const hasRows = group.rows.length > 0;

        return (
          <React.Fragment key={group.id}>
            {/* Group Header Row */}
            <tr className="gitboard-table__group-header">
              <td
                colSpan={columnCount}
                className="gitboard-table__group-header-cell"
                onClick={() => toggleGroupCollapse(group.id)}
              >
                <div className="gitboard-table__group-header-content">
                  <div className="gitboard-table__group-header-left">
                    <button
                      className="gitboard-table__group-toggle"
                      aria-label={isCollapsed ? 'Expand group' : 'Collapse group'}
                      aria-expanded={!isCollapsed}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="gitboard-table__group-toggle-icon"
                        style={{
                          transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                        }}
                      >
                        <path d="M4.427 7.427l3.396 3.396a.25.25 0 00.354 0l3.396-3.396A.25.25 0 0011.396 7H4.604a.25.25 0 00-.177.427z" />
                      </svg>
                    </button>
                    <h3 className="gitboard-table__group-label">{group.label}</h3>
                    <span className="gitboard-table__group-count">{group.count}</span>
                  </div>
                  <div className="gitboard-table__group-header-right">
                    {/* Optional: Add group actions here */}
                  </div>
                </div>
              </td>
            </tr>

            {/* Group Rows */}
            {!isCollapsed && hasRows && (
              <>
                {group.rows.map((row, index) => (
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
                    rowIndex={index}
                    isDragging={draggedRowIndex === index}
                    isDragOver={dragOverRowIndex === index}
                    onRowDragStart={handleRowDragStart}
                    onRowDragOver={handleRowDragOver}
                    onRowDrop={handleRowDrop}
                    onRowDragEnd={handleRowDragEnd}
                    onTitleClick={onTitleClick}
                    onRowNumberDoubleClick={onRowNumberDoubleClick}
                  />
                ))}
              </>
            )}
          </React.Fragment>
        );
      })}

      {/* Add Item Row */}
      <AddItemRow fields={fields} showSelection={showSelection} onAddItem={onAddItem} />

      {/* Infinite scroll loading indicator */}
      {isLoadingMore && (
        <tr className="gitboard-table__loading-row">
          <td colSpan={columnCount} className="gitboard-table__loading-cell">
            <LoadingIndicator
              size="small"
              message={loadingMessage || 'Loading more items...'}
              inline
            />
          </td>
        </tr>
      )}

      {/* Infinite scroll trigger */}
      {hasMore && onLoadMore && !isLoadingMore && (
        <tr ref={triggerRef as any} className="gitboard-table__scroll-trigger">
          <td colSpan={columnCount} style={{ height: '1px', padding: 0 }} />
        </tr>
      )}
    </tbody>
  );
};

GroupedTableBody.displayName = 'GroupedTableBody';
