/**
 * Sorting Utilities
 * Functions for sorting table rows by field values
 */

import type { Row, FieldDefinition, SortConfig, CellValue } from '@/types';

/**
 * Get the display value for a cell (resolves IDs to labels for select fields)
 */
function getDisplayValue(
  value: CellValue,
  field: FieldDefinition
): string | number | null {
  if (value === null || value === undefined) {
    return null;
  }

  // For select fields, get the label
  if (
    (field.type === 'single-select' ||
      field.type === 'assignee' ||
      field.type === 'iteration') &&
    field.options
  ) {
    const option = field.options.find((opt) => opt.id === value);
    return option?.label || String(value);
  }

  // For multi-select, join labels
  if (field.type === 'multi-select' && Array.isArray(value) && field.options) {
    const labels = value
      .map((id) => {
        const option = field.options?.find((opt) => opt.id === id);
        return option?.label || String(id);
      })
      .filter(Boolean);
    return labels.join(', ');
  }

  return value as string | number;
}

/**
 * Compare two values for sorting
 */
function compareValues(
  a: CellValue,
  b: CellValue,
  field: FieldDefinition,
  direction: 'asc' | 'desc'
): number {
  const aVal = getDisplayValue(a, field);
  const bVal = getDisplayValue(b, field);

  // Handle null/undefined - always put at the end
  if (aVal === null || aVal === undefined) {
    return 1;
  }
  if (bVal === null || bVal === undefined) {
    return -1;
  }

  // Number comparison
  if (field.type === 'number') {
    const aNum = typeof aVal === 'number' ? aVal : parseFloat(String(aVal));
    const bNum = typeof bVal === 'number' ? bVal : parseFloat(String(bVal));

    if (isNaN(aNum)) return 1;
    if (isNaN(bNum)) return -1;

    const result = aNum - bNum;
    return direction === 'asc' ? result : -result;
  }

  // Date comparison
  if (field.type === 'date') {
    const aDate = new Date(String(aVal)).getTime();
    const bDate = new Date(String(bVal)).getTime();

    if (isNaN(aDate)) return 1;
    if (isNaN(bDate)) return -1;

    const result = aDate - bDate;
    return direction === 'asc' ? result : -result;
  }

  // String comparison (case-insensitive)
  const aStr = String(aVal).toLowerCase();
  const bStr = String(bVal).toLowerCase();

  if (aStr < bStr) {
    return direction === 'asc' ? -1 : 1;
  }
  if (aStr > bStr) {
    return direction === 'asc' ? 1 : -1;
  }
  return 0;
}

/**
 * Sort rows by a field
 */
export function sortRows(
  rows: Row[],
  sortConfig: SortConfig | null,
  fields: FieldDefinition[]
): Row[] {
  // No sorting if no config
  if (!sortConfig) {
    return rows;
  }

  // Find the field definition
  const field = fields.find((f) => f.id === sortConfig.field);
  if (!field) {
    return rows;
  }

  // Create a copy to avoid mutation
  const sortedRows = [...rows];

  // Sort the rows
  sortedRows.sort((a, b) => {
    const aValue = a.values[sortConfig.field];
    const bValue = b.values[sortConfig.field];

    return compareValues(aValue, bValue, field, sortConfig.direction);
  });

  return sortedRows;
}

/**
 * Toggle sort direction for a field
 */
export function toggleSortDirection(
  currentSort: SortConfig | null,
  fieldId: string
): SortConfig {
  // If not currently sorting by this field, start with ascending
  if (!currentSort || currentSort.field !== fieldId) {
    return { field: fieldId, direction: 'asc' };
  }

  // If currently ascending, switch to descending
  if (currentSort.direction === 'asc') {
    return { field: fieldId, direction: 'desc' };
  }

  // If currently descending, remove sort (will be handled by caller)
  return { field: fieldId, direction: 'asc' };
}
