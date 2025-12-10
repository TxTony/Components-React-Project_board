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

    case 'in': {
      // filter.value expected to be an array or comma-separated list
      const filterValues: string[] = Array.isArray(filter.value)
        ? filter.value.map((v) => String(v).toLowerCase())
        : String(filter.value || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);

      // Multi-select stored as array of IDs
      if (field.type === 'multi-select' && Array.isArray(value)) {
        // Map stored ids to labels if options exist, otherwise use ids
        const rowValuesLower: string[] = Array.isArray(value)
          ? value.map((id) => {
              if (field.options) {
                const opt = field.options.find((o) => o.id === id);
                return (opt?.label || String(id)).toLowerCase();
              }
              return String(id).toLowerCase();
            })
          : [];

        // Match if any filter value matches any item in the row array
        return filterValues.some((fv) => rowValuesLower.includes(fv));
      }

      // For scalar values, match if either the display value (label) or the raw stored value (ID)
      if (displayValue && filterValues.includes(displayValue)) {
        return true;
      }

      // Fallback: compare raw value (IDs, numbers, etc.)
      return filterValues.includes(String(value).toLowerCase());
    }

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

/**
 * Extract auto-fill values from active filters for new row creation
 * Only processes filters with operators: 'equals', 'contains'
 * If multiple filters exist for same field, uses the first one
 */
export function extractAutoFillValues(
  filters: FilterConfig[],
  fields: FieldDefinition[]
): Record<string, CellValue> {
  const autoFillValues: Record<string, CellValue> = {};
  const processedFields = new Set<string>();

  // Operators that should trigger auto-fill
  const autoFillOperators = ['equals', 'contains'];

  for (const filter of filters) {
    // Skip if field already processed (use first filter only)
    if (processedFields.has(filter.field)) {
      continue;
    }

    // Skip if operator not in auto-fill list
    if (!autoFillOperators.includes(filter.operator)) {
      continue;
    }

    // Skip if no value
    if (filter.value === undefined || filter.value === null || filter.value === '') {
      continue;
    }

    // Find the field definition
    const field = fields.find((f) => f.id === filter.field);
    if (!field) {
      continue;
    }

    // Mark field as processed
    processedFields.add(filter.field);

    // Extract value based on field type
    switch (field.type) {
      case 'text':
      case 'title':
        autoFillValues[filter.field] = String(filter.value);
        break;

      case 'number':
        // Try to parse as number
        const numValue = parseFloat(String(filter.value));
        if (!isNaN(numValue)) {
          autoFillValues[filter.field] = numValue;
        }
        break;

      case 'date':
        // Use date string directly
        autoFillValues[filter.field] = String(filter.value);
        break;

      case 'single-select':
      case 'assignee':
      case 'iteration':
        // Filter value is a label string, need to find the option ID
        if (field.options) {
          const option = field.options.find(
            (opt) => opt.label.toLowerCase() === String(filter.value).toLowerCase()
          );
          if (option) {
            autoFillValues[filter.field] = option.id;
          }
        }
        break;

      case 'multi-select':
        // For 'contains' operator, the value is a label string
        // For multi-select, we add it to an array
        if (field.options) {
          const option = field.options.find(
            (opt) => opt.label.toLowerCase() === String(filter.value).toLowerCase()
          );
          if (option) {
            // For multi-select, value should be an array of IDs
            autoFillValues[filter.field] = [option.id];
          }
        }
        break;
    }
  }

  return autoFillValues;
}
