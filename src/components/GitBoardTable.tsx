/**
 * GitBoardTable Component
 * Main table component with GitHub Projects-style interface
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TableHeader } from './Table/TableHeader';
import { TableBody } from './Table/TableBody';
import { GroupedTableBody } from './Table/GroupedTableBody';
import { RowContextMenu } from './Table/Menu/RowContextMenu';
import { FilterBar } from './Toolbar/FilterBar';
import { Toolbar } from './Toolbar/Toolbar';
import { ViewTabs } from './Toolbar/ViewTabs';
import { RowDetailPanel } from './ContentPanel/RowDetailPanel';
import { sortRows } from '../utils/sorting';
import { applyAllFilters, extractAutoFillValues } from '../utils/filtering';
import { groupRows } from '../utils/grouping';
import { generateRowId } from '../utils/uid';
import { saveTableState, loadTableState } from '../utils/persistence';
import type { GitBoardTableProps, CellValue, Row, SortConfig, FilterConfig, BulkUpdateEvent, ViewConfig, RowContent, RowSelectionEvent, ContextMenuClickEvent, GroupByChangeEvent } from '@/types';

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
  onRowSelect,
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
  onViewsReorder,
  hasMore,
  isLoadingMore,
  onLoadMore,
  loadingMessage,
  customActions = [],
  onContextMenuClick,
  onGroupByChange,
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
  const [groupBy, setGroupBy] = useState<string | null>(
    initialView?.groupBy || (currentView?.groupBy || null)
  );
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [lastSelectedRowId, setLastSelectedRowId] = useState<string | null>(null);
  const [lastSelectionAction, setLastSelectionAction] = useState<'select' | 'deselect' | 'range' | 'multi' | 'clear'>('select');
  const [selectedCell, setSelectedCell] = useState<{ rowId: string; fieldId: string } | null>(null);
  const [fieldOrder, setFieldOrder] = useState<string[]>(fields.map((f) => f.id));
  const [fieldWidths, setFieldWidths] = useState<Record<string, number>>({});
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  
  // Row detail panel state
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [detailPanelRow, setDetailPanelRow] = useState<Row | null>(null);

  // Context menu state
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuRow, setContextMenuRow] = useState<Row | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Ref to track previous initialRows to avoid unnecessary updates
  const prevInitialRowsRef = useRef<Row[]>();
  // Ref to track processedRows for shift-click range selection
  const processedRowsRef = useRef<Row[]>([]);

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
        if (savedState.groupBy !== undefined) {
          setGroupBy(savedState.groupBy);
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

      // Set field order: start with visible columns from view, then append hidden columns
      // This ensures all fields remain in fieldOrder even when hidden
      const visibleFields = currentView.columns.filter(id => allFieldIds.includes(id));
      const hiddenFields = fieldsToHide;
      setFieldOrder([...visibleFields, ...hiddenFields]);
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
        groupBy,
        fieldWidths,
        hiddenColumns: Array.from(hiddenColumns),
      });
    }
  }, [tableId, fieldOrder, sortConfig, filters, groupBy, fieldWidths, hiddenColumns]);

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

  const handleSelectRow = (rowId: string, selected: boolean, ctrlKey = false, shiftKey = false) => {
    let actionType: 'select' | 'deselect' | 'range' | 'multi' | 'clear' = 'select';

    setSelectedRows((prev) => {
      const newSet = new Set(prev);

      if (selected) {
        if (shiftKey && lastSelectedRowId) {
          // Shift+Click: Range selection
          actionType = 'range';
          // Find indices of last selected row and current row in processedRows
          const currentProcessedRows = processedRowsRef.current;
          const lastIndex = currentProcessedRows.findIndex(r => r.id === lastSelectedRowId);
          const currentIndex = currentProcessedRows.findIndex(r => r.id === rowId);

          if (lastIndex !== -1 && currentIndex !== -1) {
            // Select all rows between last and current (inclusive)
            const startIndex = Math.min(lastIndex, currentIndex);
            const endIndex = Math.max(lastIndex, currentIndex);

            for (let i = startIndex; i <= endIndex; i++) {
              const row = currentProcessedRows[i];
              if (row) {
                newSet.add(row.id);
              }
            }
          }
        } else if (ctrlKey) {
          // Ctrl+Click: Add to existing selection (multi-select)
          actionType = 'multi';
          newSet.add(rowId);
        } else {
          // Regular click: Single selection
          // If clicking the only selected row, deselect it
          if (newSet.size === 1 && newSet.has(rowId)) {
            actionType = 'deselect';
            newSet.delete(rowId);
          } else {
            // Clear all and select only this row
            actionType = 'select';
            newSet.clear();
            newSet.add(rowId);
          }
        }
      } else {
        // Deselecting (from Ctrl+Click toggle on already selected row)
        actionType = 'deselect';
        newSet.delete(rowId);
      }

      return newSet;
    });

    // Update last selection action
    setLastSelectionAction(actionType);

    // Update last selected row (for shift-click range selection)
    // Only update if it's not a shift-click (to maintain anchor point)
    if (!shiftKey) {
      setLastSelectedRowId(rowId);
    }
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
      // Preserve all fields (visible and hidden) in the view's columns
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
        // Calculate visible and hidden columns separately, maintaining their order
        const visibleColumns = fieldOrder.filter(id => !newSet.has(id));
        const hiddenColumns = fieldOrder.filter(id => newSet.has(id));

        // Store ALL columns (visible + hidden) in the view to preserve hidden fields
        const updatedView: ViewConfig = {
          ...currentView,
          columns: [...visibleColumns, ...hiddenColumns],
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
      setLastSelectionAction('multi');
    } else {
      setSelectedRows(new Set());
      setLastSelectionAction('clear');
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
    // Find the title field - use original fields array to avoid issues with column reordering
    const titleField = fields.find((f) => f.type === 'title') || fields.find((f) => f.type === 'text');

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

  // Context menu handlers
  const handleRowContextMenu = (row: Row, position: { x: number; y: number }) => {
    setContextMenuRow(row);
    setContextMenuPosition(position);
    setContextMenuOpen(true);
  };

  const handleCloseContextMenu = () => {
    setContextMenuOpen(false);
    setTimeout(() => {
      setContextMenuRow(null);
    }, 100);
  };

  const handleContextMenuOpen = (rowId: string) => {
    handleCloseContextMenu();
    handleTitleClick(rowId);
  };

  const handleContextMenuDelete = (rowId: string) => {
    const updatedRows = rows.filter((row) => row.id !== rowId);
    setRows(updatedRows);

    if (onChange) {
      onChange(updatedRows);
    }
  };

  const handleContextMenuDuplicate = (rowId: string) => {
    const rowToDuplicate = rows.find((row) => row.id === rowId);
    if (!rowToDuplicate) return;

    const newRow: Row = {
      ...rowToDuplicate,
      id: generateRowId(),
      content: rowToDuplicate.content ? { ...rowToDuplicate.content } : undefined,
    };

    const rowIndex = rows.findIndex((row) => row.id === rowId);
    const updatedRows = [...rows.slice(0, rowIndex + 1), newRow, ...rows.slice(rowIndex + 1)];
    setRows(updatedRows);

    if (onChange) {
      onChange(updatedRows);
    }
  };

  const handleContextMenuCustomAction = (actionName: string, row: Row) => {
    if (onContextMenuClick) {
      const event: ContextMenuClickEvent = {
        type: 'context-menu-click',
        actionName,
        row,
      };
      onContextMenuClick(event);
    }
  };

  const handleGroupByChange = (fieldId: string | null) => {
    setGroupBy(fieldId);

    // Emit the onGroupByChange event
    if (onGroupByChange) {
      const field = fieldId ? fields.find((f) => f.id === fieldId) || null : null;
      const event: GroupByChangeEvent = {
        fieldId,
        field,
      };
      onGroupByChange(event);
    }
  };

  const handleViewChange = (view: ViewConfig) => {
    // Update current view
    setCurrentView(view);

    // Apply view's filters
    setFilters(view.filters);

    // Apply view's sort configuration
    setSortConfig(view.sortBy);

    // Apply view's group by configuration
    setGroupBy(view.groupBy);

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

  const handleViewsReorder = (reorderedViews: ViewConfig[]) => {
    // Update views state with new order
    setViews(reorderedViews);

    // Save view order to localStorage if tableId is provided
    if (tableId) {
      const viewOrder = reorderedViews.map((v) => v.id);
      const currentState = loadTableState(tableId) || {};
      saveTableState(tableId, {
        ...currentState,
        viewOrder,
      });
    }

    // Call parent callback if provided
    if (onViewsReorder) {
      onViewsReorder(reorderedViews);
    }
  };

  // Update views when initialViews prop changes (using memoized key)
  useEffect(() => {
    // Restore view order from localStorage if available
    if (tableId && initialViews.length > 0) {
      const savedState = loadTableState(tableId);
      if (savedState?.viewOrder) {
        // Reorder views based on saved order
        const orderedViews = savedState.viewOrder
          .map((viewId) => initialViews.find((v) => v.id === viewId))
          .filter((v): v is ViewConfig => v !== undefined);

        // Add any new views that aren't in the saved order
        const newViews = initialViews.filter(
          (v) => !savedState.viewOrder.includes(v.id)
        );

        setViews([...orderedViews, ...newViews]);
      } else {
        setViews(initialViews);
      }
    } else {
      setViews(initialViews);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialViewsKey, tableId]); // Only re-run when the stringified views actually change

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

    // Then apply sorting (only if not grouping)
    if (!groupBy) {
      filtered = sortRows(filtered, sortConfig, orderedFields);
    }

    return filtered;
  }, [rows, filters, sortConfig, orderedFields, groupBy]);

  // Apply grouping to processed rows
  const groupedRows = useMemo(() => {
    return groupRows(processedRows, groupBy, orderedFields);
  }, [processedRows, groupBy, orderedFields]);

  // Update processedRows ref for shift-click range selection
  useEffect(() => {
    processedRowsRef.current = processedRows;
  }, [processedRows]);

  // Dispatch row selection event when selection changes
  useEffect(() => {
    if (onRowSelect) {
      const selectedRowIds = Array.from(selectedRows);
      const selectedRowObjects = rows.filter(row => selectedRows.has(row.id));

      const selectionEvent: RowSelectionEvent = {
        selectedRowIds,
        selectedRows: selectedRowObjects,
        lastAction: lastSelectionAction,
      };

      onRowSelect(selectionEvent);
    }
  }, [selectedRows, lastSelectionAction, rows, onRowSelect]);

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
          onViewsReorder={handleViewsReorder}
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
        fields={orderedFields}
        currentGroupBy={groupBy}
        onGroupByChange={handleGroupByChange}
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
            sortConfig={groupBy ? null : sortConfig}
            onSort={groupBy ? undefined : handleSort}
            onReorder={handleFieldReorder}
            onResize={handleFieldResize}
            showSelection
            allSelected={allSelected}
            onSelectAll={handleSelectAll}
          />
          {groupBy ? (
            <GroupedTableBody
              fields={orderedFields}
              groups={groupedRows}
              groupByFieldId={groupBy}
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
              onRowContextMenu={handleRowContextMenu}
              hasMore={hasMore}
              isLoadingMore={isLoadingMore}
              onLoadMore={onLoadMore}
              loadingMessage={loadingMessage}
            />
          ) : (
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
              onRowContextMenu={handleRowContextMenu}
              hasMore={hasMore}
              isLoadingMore={isLoadingMore}
              onLoadMore={onLoadMore}
              loadingMessage={loadingMessage}
            />
          )}
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
          onDelete={handleContextMenuDelete}
          onDuplicate={handleContextMenuDuplicate}
          customActions={customActions}
          onCustomAction={handleContextMenuCustomAction}
        />
      )}

      {/* Context Menu */}
      {contextMenuOpen && contextMenuRow && (
        <RowContextMenu
          row={contextMenuRow}
          position={contextMenuPosition}
          onClose={handleCloseContextMenu}
          onOpen={handleContextMenuOpen}
          onDelete={handleContextMenuDelete}
          onDuplicate={handleContextMenuDuplicate}
          customActions={customActions}
          onCustomAction={handleContextMenuCustomAction}
        />
      )}
    </div>
  );
};

GitBoardTable.displayName = 'GitBoardTable';
