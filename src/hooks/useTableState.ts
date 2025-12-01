/**
 * useTableState Hook
 * Custom hook for managing table state (rows, fields, filters, sorting)
 */

import { useState, useCallback } from 'react';
import type {
  Row,
  FieldDefinition,
  SortConfig,
  FilterConfig,
  CellValue,
} from '@/types';

export interface UseTableStateOptions {
  initialRows: Row[];
  initialFields: FieldDefinition[];
  initialSort?: SortConfig | null;
  initialFilters?: FilterConfig[];
  onChange?: (rows: Row[]) => void;
  onFieldChange?: (fields: FieldDefinition[]) => void;
}

export interface UseTableStateReturn {
  rows: Row[];
  fields: FieldDefinition[];
  sortConfig: SortConfig | null;
  filters: FilterConfig[];
  selectedRows: Set<string>;
  updateCell: (rowId: string, fieldId: string, value: CellValue) => void;
  addRow: (row?: Partial<Row>) => void;
  deleteRow: (rowId: string) => void;
  deleteRows: (rowIds: string[]) => void;
  duplicateRow: (rowId: string) => void;
  setSort: (config: SortConfig | null) => void;
  addFilter: (filter: FilterConfig) => void;
  removeFilter: (fieldId: string) => void;
  clearFilters: () => void;
  selectRow: (rowId: string, selected: boolean) => void;
  selectAllRows: (selected: boolean, visibleRowIds: string[]) => void;
  clearSelection: () => void;
  updateField: (fieldId: string, updates: Partial<FieldDefinition>) => void;
}

export const useTableState = ({
  initialRows,
  initialFields,
  initialSort = null,
  initialFilters = [],
  onChange,
  onFieldChange,
}: UseTableStateOptions): UseTableStateReturn => {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [fields, setFields] = useState<FieldDefinition[]>(initialFields);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(initialSort);
  const [filters, setFilters] = useState<FilterConfig[]>(initialFilters);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const updateCell = useCallback(
    (rowId: string, fieldId: string, value: CellValue) => {
      setRows((prevRows) => {
        const newRows = prevRows.map((row) => {
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

        if (onChange) {
          onChange(newRows);
        }

        return newRows;
      });
    },
    [onChange]
  );

  const addRow = useCallback(
    (rowData?: Partial<Row>) => {
      const newRow: Row = {
        id: `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        values: {},
        ...rowData,
      };

      setRows((prevRows) => {
        const newRows = [...prevRows, newRow];
        if (onChange) {
          onChange(newRows);
        }
        return newRows;
      });
    },
    [onChange]
  );

  const deleteRow = useCallback(
    (rowId: string) => {
      setRows((prevRows) => {
        const newRows = prevRows.filter((row) => row.id !== rowId);
        if (onChange) {
          onChange(newRows);
        }
        return newRows;
      });

      setSelectedRows((prev) => {
        const newSet = new Set(prev);
        newSet.delete(rowId);
        return newSet;
      });
    },
    [onChange]
  );

  const deleteRows = useCallback(
    (rowIds: string[]) => {
      setRows((prevRows) => {
        const newRows = prevRows.filter((row) => !rowIds.includes(row.id));
        if (onChange) {
          onChange(newRows);
        }
        return newRows;
      });

      setSelectedRows((prev) => {
        const newSet = new Set(prev);
        rowIds.forEach((id) => newSet.delete(id));
        return newSet;
      });
    },
    [onChange]
  );

  const duplicateRow = useCallback(
    (rowId: string) => {
      setRows((prevRows) => {
        const rowToDuplicate = prevRows.find((row) => row.id === rowId);
        if (!rowToDuplicate) return prevRows;

        const newRow: Row = {
          ...rowToDuplicate,
          id: `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          values: { ...rowToDuplicate.values },
        };

        const newRows = [...prevRows, newRow];
        if (onChange) {
          onChange(newRows);
        }
        return newRows;
      });
    },
    [onChange]
  );

  const setSort = useCallback((config: SortConfig | null) => {
    setSortConfig(config);
  }, []);

  const addFilter = useCallback((filter: FilterConfig) => {
    setFilters((prev) => {
      // Remove existing filter for this field
      const filtered = prev.filter((f) => f.field !== filter.field);
      return [...filtered, filter];
    });
  }, []);

  const removeFilter = useCallback((fieldId: string) => {
    setFilters((prev) => prev.filter((f) => f.field !== fieldId));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
  }, []);

  const selectRow = useCallback((rowId: string, selected: boolean) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(rowId);
      } else {
        newSet.delete(rowId);
      }
      return newSet;
    });
  }, []);

  const selectAllRows = useCallback((selected: boolean, visibleRowIds: string[]) => {
    if (selected) {
      setSelectedRows(new Set(visibleRowIds));
    } else {
      setSelectedRows(new Set());
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedRows(new Set());
  }, []);

  const updateField = useCallback(
    (fieldId: string, updates: Partial<FieldDefinition>) => {
      setFields((prevFields) => {
        const newFields = prevFields.map((field) => {
          if (field.id === fieldId) {
            return { ...field, ...updates };
          }
          return field;
        });

        if (onFieldChange) {
          onFieldChange(newFields);
        }

        return newFields;
      });
    },
    [onFieldChange]
  );

  return {
    rows,
    fields,
    sortConfig,
    filters,
    selectedRows,
    updateCell,
    addRow,
    deleteRow,
    deleteRows,
    duplicateRow,
    setSort,
    addFilter,
    removeFilter,
    clearFilters,
    selectRow,
    selectAllRows,
    clearSelection,
    updateField,
  };
};
