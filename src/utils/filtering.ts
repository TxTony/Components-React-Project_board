/**
 * Filtering Utilities
 * Functions for filtering table rows by search and field filters
 */

import type { Row, FieldDefinition, FilterConfig, CellValue } from '@/types';

/**
 * Get the display value for a cell (resolves IDs to labels for select fields)
 */
function getDisplayValue(value: CellValue, field: FieldDefinition): string {
  if (value === null || value === undefined) {
    return '';
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

  return String(value);
}

/**
 * Check if a value is empty (null, undefined, or empty string)
 */
function isEmpty(value: CellValue): boolean {
  return value === null || value === undefined || value === '';
}

/**
 * Check if a single filter matches a row
 */
function matchesFilter(
  row: Row,
  filter: FilterConfig,
  field: FieldDefinition | undefined
): boolean {
  if (!field) {
    return true; // Ignore filter for non-existent fields
  }

  const value = row.values[filter.field];

  // Handle is-empty operator
  if (filter.operator === 'is-empty') {
    return isEmpty(value);
  }

  // Handle is-not-empty operator
  if (filter.operator === 'is-not-empty') {
    return !isEmpty(value);
  }

  // For other operators, if value is empty, no match
  if (isEmpty(value)) {
    return false;
  }

  const displayValue = getDisplayValue(value, field).toLowerCase();
  const filterValue = String(filter.value || '').toLowerCase();

  switch (filter.operator) {
    case 'contains':
      return displayValue.includes(filterValue);

    case 'equals':
      // For select fields, compare IDs directly
      if (
        field.type === 'single-select' ||
        field.type === 'assignee' ||
        field.type === 'iteration'
      ) {
        return value === filter.value;
      }
      // For other fields, compare display values
      return displayValue === filterValue;

    case 'not-equals':
      // For select fields, compare IDs directly
      if (
        field.type === 'single-select' ||
        field.type === 'assignee' ||
        field.type === 'iteration'
      ) {
        return value !== filter.value;
      }
      // For other fields, compare display values
      return displayValue !== filterValue;

    case 'gt': {
      // Greater than - for numbers and dates
      const numValue = typeof value === 'number' ? value : parseFloat(String(value));
      const numFilter = parseFloat(String(filter.value));
      if (isNaN(numValue) || isNaN(numFilter)) return false;
      return numValue > numFilter;
    }

    case 'gte': {
      // Greater than or equal - for numbers and dates
      const numValue = typeof value === 'number' ? value : parseFloat(String(value));
      const numFilter = parseFloat(String(filter.value));
      if (isNaN(numValue) || isNaN(numFilter)) return false;
      return numValue >= numFilter;
    }

    case 'lt': {
      // Less than - for numbers and dates
      const numValue = typeof value === 'number' ? value : parseFloat(String(value));
      const numFilter = parseFloat(String(filter.value));
      if (isNaN(numValue) || isNaN(numFilter)) return false;
      return numValue < numFilter;
    }

    case 'lte': {
      // Less than or equal - for numbers and dates
      const numValue = typeof value === 'number' ? value : parseFloat(String(value));
      const numFilter = parseFloat(String(filter.value));
      if (isNaN(numValue) || isNaN(numFilter)) return false;
      return numValue <= numFilter;
    }

    default:
      return true;
  }
}

/**
 * Filter rows by column-specific filters (AND logic)
 */
export function filterRows(
  rows: Row[],
  filters: FilterConfig[],
  fields: FieldDefinition[]
): Row[] {
  // No filtering if no filters
  if (filters.length === 0) {
    return rows;
  }

  // Apply all filters with AND logic
  return rows.filter((row) => {
    return filters.every((filter) => {
      const field = fields.find((f) => f.id === filter.field);
      return matchesFilter(row, filter, field);
    });
  });
}

/**
 * Apply global search across all visible fields
 */
export function applyGlobalSearch(
  rows: Row[],
  searchTerm: string,
  fields: FieldDefinition[]
): Row[] {
  // Trim and check if search is empty
  const trimmedSearch = searchTerm.trim();
  if (!trimmedSearch) {
    return rows;
  }

  const searchLower = trimmedSearch.toLowerCase();
  const visibleFields = fields.filter((f) => f.visible);

  return rows.filter((row) => {
    // Check if any visible field contains the search term
    return visibleFields.some((field) => {
      const value = row.values[field.id];
      if (isEmpty(value)) {
        return false;
      }

      const displayValue = getDisplayValue(value, field).toLowerCase();
      return displayValue.includes(searchLower);
    });
  });
}

/**
 * Apply both global search and column filters
 */
export function applyAllFilters(
  rows: Row[],
  searchTerm: string,
  filters: FilterConfig[],
  fields: FieldDefinition[]
): Row[] {
  // First apply global search
  let filtered = applyGlobalSearch(rows, searchTerm, fields);

  // Then apply column filters
  filtered = filterRows(filtered, filters, fields);

  return filtered;
}
