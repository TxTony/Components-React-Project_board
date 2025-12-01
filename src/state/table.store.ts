/**
 * Table Store
 * Zustand store for managing table state
 */

import { create } from 'zustand';
import type {
  Row,
  FieldDefinition,
  SortConfig,
  FilterConfig,
  ViewConfig,
  Theme,
  CellValue,
} from '@/types';

export interface TableState {
  // Data
  rows: Row[];
  fields: FieldDefinition[];

  // View state
  sortConfig: SortConfig | null;
  filters: FilterConfig[];
  selectedRows: Set<string>;
  currentView: ViewConfig | null;
  searchTerm: string;

  // UI state
  theme: Theme;
  editingCell: { rowId: string; fieldId: string } | null;

  // Actions - Rows
  setRows: (rows: Row[]) => void;
  addRow: (row?: Partial<Row>) => void;
  deleteRow: (rowId: string) => void;
  deleteRows: (rowIds: string[]) => void;
  duplicateRow: (rowId: string) => void;
  updateCell: (rowId: string, fieldId: string, value: CellValue) => void;

  // Actions - Fields
  setFields: (fields: FieldDefinition[]) => void;
  updateField: (fieldId: string, updates: Partial<FieldDefinition>) => void;
  hideField: (fieldId: string) => void;
  showField: (fieldId: string) => void;

  // Actions - Sorting & Filtering
  setSort: (config: SortConfig | null) => void;
  addFilter: (filter: FilterConfig) => void;
  removeFilter: (fieldId: string) => void;
  clearFilters: () => void;
  setSearchTerm: (term: string) => void;

  // Actions - Selection
  selectRow: (rowId: string, selected: boolean) => void;
  selectAllRows: (selected: boolean, visibleRowIds: string[]) => void;
  clearSelection: () => void;

  // Actions - View
  setCurrentView: (view: ViewConfig | null) => void;

  // Actions - UI
  setTheme: (theme: Theme) => void;
  setEditingCell: (cell: { rowId: string; fieldId: string } | null) => void;

  // Actions - Reset
  reset: () => void;
}

const initialState = {
  rows: [],
  fields: [],
  sortConfig: null,
  filters: [],
  selectedRows: new Set<string>(),
  currentView: null,
  searchTerm: '',
  theme: 'light' as Theme,
  editingCell: null,
};

export const useTableStore = create<TableState>((set) => ({
  ...initialState,

  // Row actions
  setRows: (rows) => set({ rows }),

  addRow: (rowData) =>
    set((state) => {
      const newRow: Row = {
        id: `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        values: {},
        ...rowData,
      };
      return { rows: [...state.rows, newRow] };
    }),

  deleteRow: (rowId) =>
    set((state) => ({
      rows: state.rows.filter((row) => row.id !== rowId),
      selectedRows: new Set([...state.selectedRows].filter((id) => id !== rowId)),
    })),

  deleteRows: (rowIds) =>
    set((state) => ({
      rows: state.rows.filter((row) => !rowIds.includes(row.id)),
      selectedRows: new Set([...state.selectedRows].filter((id) => !rowIds.includes(id))),
    })),

  duplicateRow: (rowId) =>
    set((state) => {
      const rowToDuplicate = state.rows.find((row) => row.id === rowId);
      if (!rowToDuplicate) return state;

      const newRow: Row = {
        ...rowToDuplicate,
        id: `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        values: { ...rowToDuplicate.values },
      };

      return { rows: [...state.rows, newRow] };
    }),

  updateCell: (rowId, fieldId, value) =>
    set((state) => ({
      rows: state.rows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              values: {
                ...row.values,
                [fieldId]: value,
              },
            }
          : row
      ),
    })),

  // Field actions
  setFields: (fields) => set({ fields }),

  updateField: (fieldId, updates) =>
    set((state) => ({
      fields: state.fields.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      ),
    })),

  hideField: (fieldId) =>
    set((state) => ({
      fields: state.fields.map((field) =>
        field.id === fieldId ? { ...field, visible: false } : field
      ),
    })),

  showField: (fieldId) =>
    set((state) => ({
      fields: state.fields.map((field) =>
        field.id === fieldId ? { ...field, visible: true } : field
      ),
    })),

  // Sorting & Filtering actions
  setSort: (config) => set({ sortConfig: config }),

  addFilter: (filter) =>
    set((state) => ({
      filters: [...state.filters.filter((f) => f.field !== filter.field), filter],
    })),

  removeFilter: (fieldId) =>
    set((state) => ({
      filters: state.filters.filter((f) => f.field !== fieldId),
    })),

  clearFilters: () => set({ filters: [] }),

  setSearchTerm: (term) => set({ searchTerm: term }),

  // Selection actions
  selectRow: (rowId, selected) =>
    set((state) => {
      const newSet = new Set(state.selectedRows);
      if (selected) {
        newSet.add(rowId);
      } else {
        newSet.delete(rowId);
      }
      return { selectedRows: newSet };
    }),

  selectAllRows: (selected, visibleRowIds) =>
    set({
      selectedRows: selected ? new Set(visibleRowIds) : new Set(),
    }),

  clearSelection: () => set({ selectedRows: new Set() }),

  // View actions
  setCurrentView: (view) => set({ currentView: view }),

  // UI actions
  setTheme: (theme) => set({ theme }),

  setEditingCell: (cell) => set({ editingCell: cell }),

  // Reset
  reset: () => set(initialState),
}));
