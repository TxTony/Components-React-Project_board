/**
 * GitBoardTable Component
 * Main table component with GitHub Projects-style interface
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TableHeader } from './Table/TableHeader';
import { TableBody } from './Table/TableBody';
import { FilterBar } from './Toolbar/FilterBar';
import { Toolbar } from './Toolbar/Toolbar';
import { ViewTabs } from './Toolbar/ViewTabs';
import { RowDetailPanel } from './ContentPanel/RowDetailPanel';
import { sortRows } from '../utils/sorting';
import { applyAllFilters, extractAutoFillValues } from '../utils/filtering';
import { generateRowId } from '../utils/uid';
import { saveTableState, loadTableState } from '../utils/persistence';
import type { GitBoardTableProps, CellValue, Row, SortConfig, FilterConfig, BulkUpdateEvent, ViewConfig, RowContent } from '@/types';

export const GitBoardTable: React.FC<GitBoardTableProps> = ({
  fields,
  rows: initialRows,
  theme = 'light',
  tableId,
  onChange,
  onRowOpen: _onRowOpen,
  onFieldChange: _onFieldChange,
  onBulkUpdate,
  onRowsReorder,
  onContentUpdate,
  contentResolver: _contentResolver,
  users: _users = [],
  iterations: _iterations = [],
  initialView,
  views: initialViews = [],
  onViewChange,
  onCreateView,
  onUpdateView,
  onDeleteView,
}) => {
  // Memoize field IDs to prevent unnecessary re-renders
  const fieldIds = useMemo(() => fields.map((f) => f.id).join(','), [fields]);
  
  // Memoize initial views stringified to detect actual changes
  const initialViewsKey = useMemo(() => JSON.stringify(initialViews), [initialViews]);
  
  const [views, setViews] = useState<ViewConfig[]>(initialViews);
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
  
  // Row detail panel state
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [detailPanelRow, setDetailPanelRow] = useState<Row | null>(null);
  
  // Ref to track previous initialRows to avoid unnecessary updates
  const prevInitialRowsRef = useRef<Row[]>();

  // Update internal state when props change
  useEffect(() => {
    // Deep comparison using JSON.stringify is expensive, so we only do it if reference changed
    if (prevInitialRowsRef.current !== initialRows) {
      const prevString = JSON.stringify(prevInitialRowsRef.current);
      const currentString = JSON.stringify(initialRows);
      
      if (prevString !== currentString) {
        setRows(initialRows);
        prevInitialRowsRef.current = initialRows;
      } else {
        // Reference changed but content is same, just update ref
        prevInitialRowsRef.current = initialRows;
      }
    }
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

  // Update field order when fields prop changes (using memoized fieldIds)
  useEffect(() => {
    setFieldOrder(fields.map((f) => f.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldIds]); // Only re-run when the stringified field IDs change

  // Apply initial view configuration on mount
  useEffect(() => {
    if (currentView && currentView.columns && currentView.columns.length > 0) {
      // Get all field IDs
      const allFieldIds = fields.map(f => f.id);

      // Fields not in currentView.columns should be hidden
      const fieldsToHide = allFieldIds.filter(fieldId => !currentView.columns.includes(fieldId));
      setHiddenColumns(new Set(fieldsToHide));

      // Set field order based on currentView.columns
      setFieldOrder(currentView.columns);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleSelectRow = (rowId: string, selected: boolean, ctrlKey = false) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);

      if (selected) {
        if (ctrlKey) {
          // Ctrl+Click: Add to existing selection (multi-select)
          newSet.add(rowId);
        } else {
          // Regular click: Single selection
          // If clicking the only selected row, deselect it
          if (newSet.size === 1 && newSet.has(rowId)) {
            newSet.delete(rowId);
          } else {
            // Clear all and select only this row
            newSet.clear();
            newSet.add(rowId);
          }
        }
      } else {
        // Deselecting (from Ctrl+Click toggle on already selected row)
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

    // Update current view's column order if we have a current view and onUpdateView callback
    if (currentView && onUpdateView) {
      const updatedView: ViewConfig = {
        ...currentView,
        columns: newOrder,
      };

      // Update the view in local state
      setViews((prevViews) =>
        prevViews.map((v) => (v.id === updatedView.id ? updatedView : v))
      );

      // Update currentView state
      setCurrentView(updatedView);

      // Notify parent
      onUpdateView(updatedView);
    }
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

      // Update current view's visible columns if we have a current view and onUpdateView callback
      if (currentView && onUpdateView) {
        // Calculate visible columns (not in hiddenColumns) while preserving current order
        const visibleColumns = fieldOrder.filter(id => !newSet.has(id));

        const updatedView: ViewConfig = {
          ...currentView,
          columns: visibleColumns,
        };

        // Update the view in local state
        setViews((prevViews) =>
          prevViews.map((v) => (v.id === updatedView.id ? updatedView : v))
        );

        // Update currentView state
        setCurrentView(updatedView);

        // Notify parent
        onUpdateView(updatedView);
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

    // Extract auto-fill values from active filters
    const autoFillValues = extractAutoFillValues(filters, fields);

    const newRow: Row = {
      id: generateRowId(),
      values: {
        ...autoFillValues, // Apply auto-fill values from filters
        [titleField.id]: title, // Title takes precedence over auto-fill
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

  const handleRowReorder = (fromIndex: number, toIndex: number) => {
    // Create a new array with the reordered rows
    const updatedRows = [...rows];
    const [movedRow] = updatedRows.splice(fromIndex, 1);
    updatedRows.splice(toIndex, 0, movedRow);

    // Update internal state
    setRows(updatedRows);

    // Call parent onChange callback
    if (onChange) {
      onChange(updatedRows);
    }

    // Emit RowReorderEvent to parent
    if (onRowsReorder) {
      onRowsReorder({
        fromIndex,
        toIndex,
        rows: updatedRows,
        movedRow,
      });
    }
  };

  const handleTitleClick = (rowId: string) => {
    const row = rows.find((r) => r.id === rowId);
    if (row) {
      setDetailPanelRow(row);
      setDetailPanelOpen(true);
    }
  };

  const handleDetailPanelClose = () => {
    setDetailPanelOpen(false);
    // Don't clear detailPanelRow immediately to allow exit animation
    setTimeout(() => setDetailPanelRow(null), 300);
  };

  const handleContentUpdate = (rowId: string, content: RowContent) => {
    // Update the row's content in internal state
    const updatedRows = rows.map((row) => {
      if (row.id === rowId) {
        return { ...row, content };
      }
      return row;
    });

    setRows(updatedRows);

    // Update the detail panel row to reflect changes
    const updatedRow = updatedRows.find((r) => r.id === rowId);
    if (updatedRow) {
      setDetailPanelRow(updatedRow);
    }

    // Call parent onChange callback
    if (onChange) {
      onChange(updatedRows);
    }

    // Call parent onContentUpdate callback
    if (onContentUpdate) {
      onContentUpdate(rowId, content);
    }
  };

  const handleRowValueUpdate = (rowId: string, fieldId: string, value: CellValue) => {
    // Reuse the existing handleCellEdit logic
    handleCellEdit({ rowId, fieldId, value });

    // Update the detail panel row to reflect changes
    const updatedRows = rows.map((row) => {
      if (row.id === rowId) {
        return {
          ...row,
          values: {
            ...row.values,
            [fieldId]: value,
          },
        };
      }
      return row;
    });

    const updatedRow = updatedRows.find((r) => r.id === rowId);
    if (updatedRow) {
      setDetailPanelRow(updatedRow);
    }
  };

  const handleViewChange = (view: ViewConfig) => {
    // Update current view
    setCurrentView(view);

    // Apply view's filters
    setFilters(view.filters);

    // Apply view's sort configuration
    setSortConfig(view.sortBy);

    // Apply view's column visibility
    if (view.columns && view.columns.length > 0) {
      // Get all field IDs
      const allFieldIds = fields.map(f => f.id);

      // Fields not in view.columns should be hidden
      const fieldsToHide = allFieldIds.filter(fieldId => !view.columns.includes(fieldId));
      setHiddenColumns(new Set(fieldsToHide));

      // Set field order based on view.columns
      setFieldOrder(view.columns);
    }

    // Call parent callback if provided
    if (onViewChange) {
      onViewChange(view);
    }
  };

  const handleCreateView = (view: ViewConfig) => {
    // Add new view to views state
    setViews((prevViews) => [...prevViews, view]);

    // Call parent callback if provided
    if (onCreateView) {
      onCreateView(view);
    }
  };

  const handleUpdateView = (updatedView: ViewConfig) => {
    // Update view in views state
    setViews((prevViews) =>
      prevViews.map((v) => (v.id === updatedView.id ? updatedView : v))
    );

    // If updating the current view, update currentView state too
    if (currentView && currentView.id === updatedView.id) {
      setCurrentView(updatedView);
    }

    // Call parent callback if provided
    if (onUpdateView) {
      onUpdateView(updatedView);
    }
  };

  // Update views when initialViews prop changes (using memoized key)
  useEffect(() => {
    setViews(initialViews);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialViewsKey]); // Only re-run when the stringified views actually change

  // Set currentView when views array changes and currentView is null
  useEffect(() => {
    if (views.length > 0 && !currentView) {
      setCurrentView(views[0]);
    }
  }, [views, currentView]);

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
          currentFilters={filters}
          onViewChange={handleViewChange}
          onCreateView={onCreateView ? handleCreateView : undefined}
          onUpdateView={onUpdateView ? handleUpdateView : undefined}
          onDeleteView={onDeleteView}
        />
      )}
      <FilterBar
        fields={orderedFields}
        filters={filters}
        onFiltersChange={setFilters}
        onToggleVisibility={handleToggleVisibility}
      />
      <Toolbar
        selectedCount={selectedRows.size}
        onDeleteSelected={handleDeleteSelected}
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
            onRowReorder={handleRowReorder}
            onTitleClick={handleTitleClick}
            onRowNumberDoubleClick={handleTitleClick}
          />
        </table>
      </div>

      {/* Row Detail Panel */}
      {detailPanelRow && (
        <RowDetailPanel
          row={detailPanelRow}
          fields={orderedFields}
          isOpen={detailPanelOpen}
          onClose={handleDetailPanelClose}
          onContentUpdate={handleContentUpdate}
          onRowUpdate={handleRowValueUpdate}
        />
      )}
    </div>
  );
};

GitBoardTable.displayName = 'GitBoardTable';
