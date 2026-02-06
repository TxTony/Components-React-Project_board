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
 * Check if a value is empty (null, undefined, empty string, or empty array)
 */
function isEmpty(value: CellValue): boolean {
  if (value === null || value === undefined || value === '') {
    return true;
  }
  // Check for empty arrays (e.g., multi-select fields with no selections)
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }
  return false;
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

  // For 'in' operator, check if empty values should be included
  if (filter.operator === 'in') {
    const filterValues: string[] = Array.isArray(filter.value)
      ? filter.value.map((v) => String(v).toLowerCase())
      : String(filter.value || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);

    // Check if '(empty)' is in the filter values
    const includeEmpty = filterValues.includes('(empty)') || filterValues.includes('empty');

    // If value is empty and filter includes '(empty)', match
    if (isEmpty(value) && includeEmpty) {
      return true;
    }
  }

  // For 'not-equals', empty values ARE not equal to the filter value
  if (isEmpty(value) && filter.operator === 'not-equals') {
    return true;
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

      // Filter out '(empty)' and 'empty' from comparison values
      const comparisonValues = filterValues.filter((v) => v !== '(empty)' && v !== 'empty');

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
        return comparisonValues.some((fv) => rowValuesLower.includes(fv));
      }

      // For scalar values, match if either the display value (label) or the raw stored value (ID)
      if (displayValue && comparisonValues.includes(displayValue)) {
        return true;
      }

      // Fallback: compare raw value (IDs, numbers, etc.)
      return comparisonValues.includes(String(value).toLowerCase());
    }

    case 'equals':
      // For select fields, need to handle both ID and label matching
      if (
        field.type === 'single-select' ||
        field.type === 'assignee' ||
        field.type === 'iteration'
      ) {
        // First try direct ID comparison
        if (value === filter.value) {
          return true;
        }
        // If no match, try to find option by label (case-insensitive)
        if (field.options) {
          const option = field.options.find(
            (opt) => opt.label.toLowerCase() === String(filter.value).toLowerCase()
          );
          if (option) {
            return value === option.id;
          }
        }
        return false;
      }
      // For other fields, compare display values
      return displayValue === filterValue;

    case 'not-equals':
      // For select fields, need to handle both ID and label matching
      if (
        field.type === 'single-select' ||
        field.type === 'assignee' ||
        field.type === 'iteration'
      ) {
        // First try direct ID comparison
        if (value === filter.value) {
          return false;
        }
        // If no match, try to find option by label (case-insensitive)
        if (field.options) {
          const option = field.options.find(
            (opt) => opt.label.toLowerCase() === String(filter.value).toLowerCase()
          );
          if (option) {
            return value !== option.id;
          }
        }
        // If we couldn't find the option, assume not equal
        return true;
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
 * Only processes filters with operator: 'equals'
 * If multiple filters exist for same field, uses the first one
 */
export function extractAutoFillValues(
  filters: FilterConfig[],
  fields: FieldDefinition[]
): Record<string, CellValue> {
  const autoFillValues: Record<string, CellValue> = {};
  const processedFields = new Set<string>();

  // Only 'equals' operator should trigger auto-fill
  const autoFillOperators = ['equals'];

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
        // For both 'equals' and 'contains' operators, value could be an ID or label
        if (field.options) {
          // First, check if value is already an option ID
          const optionById = field.options.find((opt) => opt.id === filter.value);
          if (optionById) {
            autoFillValues[filter.field] = filter.value;
          } else {
            // Try to find by label (case-insensitive)
            const optionByLabel = field.options.find(
              (opt) => opt.label.toLowerCase() === String(filter.value).toLowerCase()
            );
            if (optionByLabel) {
              autoFillValues[filter.field] = optionByLabel.id;
            }
          }
        }
        break;

      case 'multi-select':
        // For 'equals' operator, value might be an ID or label
        if (field.options) {
          // Check if value is already an option ID
          const optionById = field.options.find((opt) => opt.id === filter.value);
          if (optionById) {
            autoFillValues[filter.field] = [filter.value as string];
          } else {
            // Try to find by label
            const optionByLabel = field.options.find(
              (opt) => opt.label.toLowerCase() === String(filter.value).toLowerCase()
            );
            if (optionByLabel) {
              autoFillValues[filter.field] = [optionByLabel.id];
            }
          }
        }
        break;
    }
  }

  return autoFillValues;
}
