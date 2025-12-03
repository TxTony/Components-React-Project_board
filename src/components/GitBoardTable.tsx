/**
 * GitBoardTable Component
 * Main table component with GitHub Projects-style interface
 */

import React, { useState, useEffect, useMemo } from 'react';
import { TableHeader } from './Table/TableHeader';
import { TableBody } from './Table/TableBody';
import { FilterBar } from './Toolbar/FilterBar';
import { Toolbar } from './Toolbar/Toolbar';
import { ViewTabs } from './Toolbar/ViewTabs';
import { sortRows } from '../utils/sorting';
import { applyAllFilters } from '../utils/filtering';
import { generateRowId } from '../utils/uid';
import { saveTableState, loadTableState } from '../utils/persistence';
import type { GitBoardTableProps, CellValue, Row, SortConfig, FilterConfig, BulkUpdateEvent, ViewConfig } from '@/types';

export const GitBoardTable: React.FC<GitBoardTableProps> = ({
  fields,
  rows: initialRows,
  theme = 'light',
  tableId,
  onChange,
  onRowOpen: _onRowOpen,
  onFieldChange: _onFieldChange,
  onBulkUpdate,
  contentResolver: _contentResolver,
  users: _users = [],
  iterations: _iterations = [],
  initialView,
  views = [],
  onViewChange,
}) => {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [currentView, setCurrentView] = useState<ViewConfig | null>(
    initialView || (views.length > 0 ? views[0] : null)
  );
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(
    initialView?.sortBy || (currentView?.sortBy || null)
  );
  const [filters, setFilters] = useState<FilterConfig[]>(
    initialView?.filters || (currentView?.filters || [])
  );
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectedCell, setSelectedCell] = useState<{ rowId: string; fieldId: string } | null>(null);
  const [fieldOrder, setFieldOrder] = useState<string[]>(fields.map((f) => f.id));
  const [fieldWidths, setFieldWidths] = useState<Record<string, number>>({});
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());

  // Update internal state when props change
  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  // Load state from localStorage on mount
  useEffect(() => {
    if (tableId) {
      const savedState = loadTableState(tableId);
      if (savedState) {
        if (savedState.fieldOrder) {
          setFieldOrder(savedState.fieldOrder);
        }
        if (savedState.sortConfig !== undefined) {
          setSortConfig(savedState.sortConfig);
        }
        if (savedState.filters) {
          setFilters(savedState.filters);
        }
        if (savedState.fieldWidths) {
          setFieldWidths(savedState.fieldWidths);
        }
        if (savedState.hiddenColumns) {
          setHiddenColumns(new Set(savedState.hiddenColumns));
        }
      }
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update field order when fields prop changes
  useEffect(() => {
    setFieldOrder(fields.map((f) => f.id));
  }, [fields]);

  // Save state to localStorage when it changes
  useEffect(() => {
    if (tableId) {
      saveTableState(tableId, {
        fieldOrder,
        sortConfig,
        filters,
        fieldWidths,
        hiddenColumns: Array.from(hiddenColumns),
      });
    }
  }, [tableId, fieldOrder, sortConfig, filters, fieldWidths, hiddenColumns]);

  const handleCellEdit = (edit: { rowId: string; fieldId: string; value: CellValue }) => {
    const updatedRows = rows.map((row) => {
      if (row.id === edit.rowId) {
        return {
          ...row,
          values: {
            ...row.values,
            [edit.fieldId]: edit.value,
          },
        };
      }
      return row;
    });

    setRows(updatedRows);

    // Call parent onChange callback
    if (onChange) {
      onChange(updatedRows);
    }
  };

  const handleBulkUpdate = (event: BulkUpdateEvent) => {
    // Apply bulk update to internal state
    const updatedRows = rows.map((row) => {
      const target = event.targetCells.find((t) => t.rowId === row.id);
      if (target) {
        return {
          ...row,
          values: {
            ...row.values,
            [event.sourceCell.fieldId]: event.sourceCell.value,
          },
        };
      }
      return row;
    });

    // Update internal state
    setRows(updatedRows);

    // Call parent onChange callback (for consistency with cell edits)
    if (onChange) {
      onChange(updatedRows);
    }

    // Call parent onBulkUpdate callback (for custom logic/analytics)
    if (onBulkUpdate) {
      onBulkUpdate(event);
    }
  };

  const handleSort = (fieldId: string) => {
    setSortConfig((current) => {
      // If not currently sorting by this field, start with ascending
      if (!current || current.field !== fieldId) {
        return { field: fieldId, direction: 'asc' };
      }

      // If currently ascending, switch to descending
      if (current.direction === 'asc') {
        return { field: fieldId, direction: 'desc' };
      }

      // If currently descending, remove sort
      return null;
    });
  };

  const handleSelectRow = (rowId: string, selected: boolean) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(rowId);
      } else {
        newSet.delete(rowId);
      }
      return newSet;
    });
  };

  const handleCellSelect = (rowId: string, fieldId: string) => {
    setSelectedCell({ rowId, fieldId });
  };

  const handleFieldReorder = (fromIndex: number, toIndex: number) => {
    const newOrder = [...fieldOrder];
    const [movedField] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedField);
    setFieldOrder(newOrder);
  };

  const handleFieldResize = (fieldId: string, width: number) => {
    setFieldWidths((prev) => ({
      ...prev,
      [fieldId]: width,
    }));
  };

  const handleToggleVisibility = (fieldId: string) => {
    setHiddenColumns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fieldId)) {
        newSet.delete(fieldId);
      } else {
        newSet.add(fieldId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedRows(new Set(processedRows.map((r) => r.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleAddRow = () => {
    const newRow: Row = {
      id: generateRowId(),
      values: {},
    };

    const updatedRows = [...rows, newRow];
    setRows(updatedRows);

    if (onChange) {
      onChange(updatedRows);
    }
  };

  const handleAddItem = (title: string) => {
    // Find the title field (first visible field or field with type 'title')
    const titleField = orderedFields.find((f) => f.type === 'title') || orderedFields[0];

    if (!titleField) return;

    const newRow: Row = {
      id: generateRowId(),
      values: {
        [titleField.id]: title,
      },
    };

    const updatedRows = [...rows, newRow];
    setRows(updatedRows);

    if (onChange) {
      onChange(updatedRows);
    }
  };

  const handleDeleteSelected = () => {
    const updatedRows = rows.filter((row) => !selectedRows.has(row.id));
    setRows(updatedRows);
    setSelectedRows(new Set());

    if (onChange) {
      onChange(updatedRows);
    }
  };

  const handleViewChange = (view: ViewConfig) => {
    // Update current view
    setCurrentView(view);

    // Apply view's filters
    setFilters(view.filters);

    // Apply view's sort configuration
    setSortConfig(view.sortBy);

    // Call parent callback if provided
    if (onViewChange) {
      onViewChange(view);
    }
  };

  // Reorder fields based on fieldOrder state and apply widths and visibility
  const orderedFields = useMemo(() => {
    // Create a map of field IDs to fields for quick lookup
    const fieldMap = new Map(fields.map((f) => [f.id, f]));

    // Reorder fields according to fieldOrder, filtering out any that don't exist
    // Apply custom widths and visibility from state
    return fieldOrder
      .map((id) => {
        const field = fieldMap.get(id);
        if (!field) return undefined;

        // Apply visibility state (hidden if in hiddenColumns set)
        const visible = !hiddenColumns.has(id);

        // Apply custom width if set
        if (fieldWidths[id] !== undefined) {
          return { ...field, width: fieldWidths[id], visible };
        }

        return { ...field, visible };
      })
      .filter((f): f is typeof fields[number] => f !== undefined);
  }, [fields, fieldOrder, fieldWidths, hiddenColumns]);

  // Apply filtering and sorting to rows
  const processedRows = useMemo(() => {
    // First apply filters
    let filtered = applyAllFilters(rows, '', filters, orderedFields);

    // Then apply sorting
    filtered = sortRows(filtered, sortConfig, orderedFields);

    return filtered;
  }, [rows, filters, sortConfig, orderedFields]);

  const allSelected = processedRows.length > 0 && processedRows.every((r) => selectedRows.has(r.id));

  return (
    <div
      className={`gitboard-table ${theme}`}
      data-testid="gitboard-table"
      role="grid"
      aria-label="GitBoard Table"
    >
      {views.length > 0 && currentView && (
        <ViewTabs
          views={views}
          currentViewId={currentView.id}
          onViewChange={handleViewChange}
        />
      )}
      <FilterBar
        fields={orderedFields}
        filters={filters}
        onFiltersChange={setFilters}
      />
      <Toolbar
        selectedCount={selectedRows.size}
        onAddRow={handleAddRow}
        onDeleteSelected={handleDeleteSelected}
        fields={orderedFields}
        onToggleVisibility={handleToggleVisibility}
      />
      {filters.length > 0 ? (
        <div className="gitboard-table__stats">
          Showing {processedRows.length} of {rows.length} rows
        </div>
      ) : null}
      <div className="gitboard-table__wrapper">
        <table className="gitboard-table__table">
          <TableHeader
            fields={orderedFields}
            sortConfig={sortConfig}
            onSort={handleSort}
            onReorder={handleFieldReorder}
            onResize={handleFieldResize}
            showSelection
            allSelected={allSelected}
            onSelectAll={handleSelectAll}
          />
          <TableBody
            fields={orderedFields}
            rows={processedRows}
            onEdit={handleCellEdit}
            showSelection
            selectedRows={selectedRows}
            onSelectRow={handleSelectRow}
            selectedCell={selectedCell}
            onSelectCell={handleCellSelect}
            onAddItem={handleAddItem}
            onBulkUpdate={handleBulkUpdate}
          />
        </table>
      </div>
    </div>
  );
};

GitBoardTable.displayName = 'GitBoardTable';
