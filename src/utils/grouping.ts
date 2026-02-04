/**
 * Grouping Utilities
 * Functions for grouping table rows by field values
 */

import type { Row, FieldDefinition, CellValue } from '@/types';

/**
 * Represents a group of rows
 */
export interface RowGroup {
  id: string;              // Unique group ID (based on value)
  label: string;           // Display label for the group
  value: CellValue;        // The actual value that defines this group
  rows: Row[];             // Rows in this group
  count: number;           // Number of rows in group
  collapsed?: boolean;     // Whether the group is collapsed
}

/**
 * Get the display label for a cell value
 */
function getGroupLabel(value: CellValue, field: FieldDefinition): string {
  if (value === null || value === undefined || value === '') {
    return 'No ' + field.name;
  }

  // For select fields, get the label from options
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
    return labels.join(', ') || 'No ' + field.name;
  }

  // For dates, format nicely
  if (field.type === 'date' && value) {
    try {
      const date = new Date(String(value));
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString();
      }
    } catch {
      // Fall through to string conversion
    }
  }

  return String(value);
}

/**
 * Generate a unique group ID from a value
 */
function getGroupId(value: CellValue): string {
  if (value === null || value === undefined || value === '') {
    return '__empty__';
  }

  if (Array.isArray(value)) {
    return value.join('__');
  }

  return String(value);
}

/**
 * Group rows by a field value
 */
export function groupRows(
  rows: Row[],
  groupByFieldId: string | null,
  fields: FieldDefinition[]
): RowGroup[] {
  // If no grouping, return all rows in a single default group
  if (!groupByFieldId) {
    return [
      {
        id: '__all__',
        label: 'All Items',
        value: null,
        rows,
        count: rows.length,
        collapsed: false,
      },
    ];
  }

  // Find the field to group by
  const field = fields.find((f) => f.id === groupByFieldId);
  if (!field) {
    // Field not found, return all rows ungrouped
    return [
      {
        id: '__all__',
        label: 'All Items',
        value: null,
        rows,
        count: rows.length,
        collapsed: false,
      },
    ];
  }

  // Create groups map
  const groupsMap = new Map<string, RowGroup>();

  // Pre-populate groups from field options to show all groups even if empty
  if (field.options && field.options.length > 0) {
    for (const option of field.options) {
      groupsMap.set(option.id, {
        id: option.id,
        label: option.label,
        value: option.id,
        rows: [],
        count: 0,
        collapsed: false,
      });
    }
  }

  // Group rows
  for (const row of rows) {
    const value = row.values[groupByFieldId];
    const groupId = getGroupId(value);
    const groupLabel = getGroupLabel(value, field);

    if (!groupsMap.has(groupId)) {
      groupsMap.set(groupId, {
        id: groupId,
        label: groupLabel,
        value,
        rows: [],
        count: 0,
        collapsed: false,
      });
    }

    const group = groupsMap.get(groupId)!;
    group.rows.push(row);
    group.count++;
  }

  // Convert to array and sort
  const groups = Array.from(groupsMap.values());

  // Sort groups:
  // - If field has options, preserve option order
  // - Empty group always last
  // - Others alphabetically by label
  if (field.options && field.options.length > 0) {
    const optionOrder = new Map(field.options.map((opt, idx) => [opt.id, idx]));
    groups.sort((a, b) => {
      if (a.id === '__empty__') return 1;
      if (b.id === '__empty__') return -1;
      const orderA = optionOrder.get(a.id);
      const orderB = optionOrder.get(b.id);
      if (orderA !== undefined && orderB !== undefined) return orderA - orderB;
      if (orderA !== undefined) return -1;
      if (orderB !== undefined) return 1;
      return a.label.localeCompare(b.label);
    });
  } else {
    groups.sort((a, b) => {
      if (a.id === '__empty__') return 1;
      if (b.id === '__empty__') return -1;
      return a.label.localeCompare(b.label);
    });
  }

  return groups;
}

/**
 * Get unique values for a field (useful for group by options)
 */
export function getUniqueFieldValues(
  rows: Row[],
  fieldId: string,
  field: FieldDefinition
): Array<{ value: CellValue; label: string; count: number }> {
  const valuesMap = new Map<string, { value: CellValue; label: string; count: number }>();

  for (const row of rows) {
    const value = row.values[fieldId];
    const id = getGroupId(value);
    const label = getGroupLabel(value, field);

    if (!valuesMap.has(id)) {
      valuesMap.set(id, { value, label, count: 0 });
    }

    const entry = valuesMap.get(id)!;
    entry.count++;
  }

  return Array.from(valuesMap.values()).sort((a, b) => a.label.localeCompare(b.label));
}
