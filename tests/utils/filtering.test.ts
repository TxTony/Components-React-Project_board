/**
 * Filtering Utility Tests
 * Tests for filtering rows by search and field filters
 */

import { describe, it, expect } from 'vitest';
import { filterRows, applyGlobalSearch } from '../../src/utils/filtering';
import type { Row, FieldDefinition, FilterConfig } from '../../src/types';

describe('filterRows', () => {
  const textField: FieldDefinition = {
    id: 'fld_title',
    name: 'Title',
    type: 'text',
    visible: true,
  };

  const numberField: FieldDefinition = {
    id: 'fld_points',
    name: 'Points',
    type: 'number',
    visible: true,
  };

  const selectField: FieldDefinition = {
    id: 'fld_status',
    name: 'Status',
    type: 'single-select',
    visible: true,
    options: [
      { id: 'opt_todo', label: 'Todo' },
      { id: 'opt_progress', label: 'In Progress' },
      { id: 'opt_done', label: 'Done' },
    ],
  };

  const rows: Row[] = [
    {
      id: 'row_1',
      values: {
        fld_title: 'Add login page',
        fld_points: 3,
        fld_status: 'opt_progress',
      },
    },
    {
      id: 'row_2',
      values: {
        fld_title: 'Refactor API client',
        fld_points: 5,
        fld_status: 'opt_todo',
      },
    },
    {
      id: 'row_3',
      values: {
        fld_title: 'Create UI kit',
        fld_points: 2,
        fld_status: 'opt_done',
      },
    },
  ];

  const fields = [textField, numberField, selectField];

  describe('Contains operator', () => {
    it('filters text field with contains operator', () => {
      const filters: FilterConfig[] = [
        { field: 'fld_title', operator: 'contains', value: 'login' },
      ];

      const filtered = filterRows(rows, filters, fields);
      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.id).toBe('row_1');
    });

    it('filters case-insensitively', () => {
      const filters: FilterConfig[] = [
        { field: 'fld_title', operator: 'contains', value: 'API' },
      ];

      const filtered = filterRows(rows, filters, fields);
      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.id).toBe('row_2');
    });

    it('returns empty array when no matches', () => {
      const filters: FilterConfig[] = [
        { field: 'fld_title', operator: 'contains', value: 'nonexistent' },
      ];

      const filtered = filterRows(rows, filters, fields);
      expect(filtered).toHaveLength(0);
    });
  });

  describe('Equals operator', () => {
    it('filters with equals operator for text', () => {
      const filters: FilterConfig[] = [
        { field: 'fld_title', operator: 'equals', value: 'Add login page' },
      ];

      const filtered = filterRows(rows, filters, fields);
      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.id).toBe('row_1');
    });

    it('filters with equals operator for numbers', () => {
      const filters: FilterConfig[] = [
        { field: 'fld_points', operator: 'equals', value: 5 },
      ];

      const filtered = filterRows(rows, filters, fields);
      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.id).toBe('row_2');
    });

    it('filters select field by option ID', () => {
      const filters: FilterConfig[] = [
        { field: 'fld_status', operator: 'equals', value: 'opt_done' },
      ];

      const filtered = filterRows(rows, filters, fields);
      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.id).toBe('row_3');
    });
  });

  describe('Not-equals operator', () => {
    it('filters with not-equals operator', () => {
      const filters: FilterConfig[] = [
        { field: 'fld_status', operator: 'not-equals', value: 'opt_done' },
      ];

      const filtered = filterRows(rows, filters, fields);
      expect(filtered).toHaveLength(2);
      expect(filtered.map((r) => r.id)).toContain('row_1');
      expect(filtered.map((r) => r.id)).toContain('row_2');
    });
  });

  describe('Is-empty operator', () => {
    const rowsWithEmpty: Row[] = [
      { id: 'row_1', values: { fld_title: 'Has title', fld_points: 3 } },
      { id: 'row_2', values: { fld_title: null, fld_points: 5 } },
      { id: 'row_3', values: { fld_title: '', fld_points: 0 } },
      { id: 'row_4', values: { fld_points: 2 } }, // undefined
    ];

    it('filters empty values', () => {
      const filters: FilterConfig[] = [
        { field: 'fld_title', operator: 'is-empty' },
      ];

      const filtered = filterRows(rowsWithEmpty, filters, fields);
      expect(filtered).toHaveLength(3);
      expect(filtered.map((r) => r.id)).toContain('row_2');
      expect(filtered.map((r) => r.id)).toContain('row_3');
      expect(filtered.map((r) => r.id)).toContain('row_4');
    });
  });

  describe('Is-not-empty operator', () => {
    const rowsWithEmpty: Row[] = [
      { id: 'row_1', values: { fld_title: 'Has title' } },
      { id: 'row_2', values: { fld_title: null } },
      { id: 'row_3', values: { fld_title: '' } },
    ];

    it('filters non-empty values', () => {
      const filters: FilterConfig[] = [
        { field: 'fld_title', operator: 'is-not-empty' },
      ];

      const filtered = filterRows(rowsWithEmpty, filters, fields);
      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.id).toBe('row_1');
    });
  });

  describe('Multiple filters (AND logic)', () => {
    it('applies multiple filters with AND logic', () => {
      const filters: FilterConfig[] = [
        { field: 'fld_title', operator: 'contains', value: 'a' },
        { field: 'fld_points', operator: 'equals', value: 3 },
      ];

      const filtered = filterRows(rows, filters, fields);
      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.id).toBe('row_1');
    });

    it('returns empty array when no row matches all filters', () => {
      const filters: FilterConfig[] = [
        { field: 'fld_title', operator: 'contains', value: 'login' },
        { field: 'fld_points', operator: 'equals', value: 999 },
      ];

      const filtered = filterRows(rows, filters, fields);
      expect(filtered).toHaveLength(0);
    });
  });

  describe('Edge cases', () => {
    it('returns all rows when no filters', () => {
      const filtered = filterRows(rows, [], fields);
      expect(filtered).toHaveLength(rows.length);
      expect(filtered).toEqual(rows);
    });

    it('handles empty rows array', () => {
      const filters: FilterConfig[] = [
        { field: 'fld_title', operator: 'contains', value: 'test' },
      ];

      const filtered = filterRows([], filters, fields);
      expect(filtered).toHaveLength(0);
    });

    it('ignores filter for non-existent field', () => {
      const filters: FilterConfig[] = [
        { field: 'nonexistent', operator: 'contains', value: 'test' },
      ];

      const filtered = filterRows(rows, filters, fields);
      expect(filtered).toEqual(rows);
    });

    it('does not mutate original array', () => {
      const originalRows = [...rows];
      const filters: FilterConfig[] = [
        { field: 'fld_title', operator: 'contains', value: 'login' },
      ];

      filterRows(rows, filters, fields);
      expect(rows).toEqual(originalRows);
    });
  });
});

describe('applyGlobalSearch', () => {
  const fields: FieldDefinition[] = [
    { id: 'fld_title', name: 'Title', type: 'text', visible: true },
    { id: 'fld_description', name: 'Description', type: 'text', visible: true },
    { id: 'fld_hidden', name: 'Hidden', type: 'text', visible: false },
    {
      id: 'fld_status',
      name: 'Status',
      type: 'single-select',
      visible: true,
      options: [
        { id: 'opt_todo', label: 'Todo' },
        { id: 'opt_done', label: 'Done' },
      ],
    },
  ];

  const rows: Row[] = [
    {
      id: 'row_1',
      values: {
        fld_title: 'Add login page',
        fld_description: 'Create authentication UI',
        fld_hidden: 'Should not match',
        fld_status: 'opt_todo',
      },
    },
    {
      id: 'row_2',
      values: {
        fld_title: 'Refactor API',
        fld_description: 'Improve backend code',
        fld_status: 'opt_done',
      },
    },
    {
      id: 'row_3',
      values: {
        fld_title: 'Create UI kit',
        fld_description: 'Design system components',
        fld_status: 'opt_todo',
      },
    },
  ];

  it('searches across all visible fields', () => {
    const filtered = applyGlobalSearch(rows, 'login', fields);
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe('row_1');
  });

  it('searches case-insensitively', () => {
    const filtered = applyGlobalSearch(rows, 'API', fields);
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe('row_2');
  });

  it('searches in select field labels', () => {
    const filtered = applyGlobalSearch(rows, 'Done', fields);
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe('row_2');
  });

  it('does not search hidden fields', () => {
    const filtered = applyGlobalSearch(rows, 'Should not match', fields);
    expect(filtered).toHaveLength(0);
  });

  it('returns all rows for empty search', () => {
    const filtered = applyGlobalSearch(rows, '', fields);
    expect(filtered).toEqual(rows);
  });

  it('returns all rows for whitespace-only search', () => {
    const filtered = applyGlobalSearch(rows, '   ', fields);
    expect(filtered).toEqual(rows);
  });

  it('handles partial matches', () => {
    const filtered = applyGlobalSearch(rows, 'UI', fields);
    expect(filtered).toHaveLength(2);
    expect(filtered.map((r) => r.id)).toContain('row_1');
    expect(filtered.map((r) => r.id)).toContain('row_3');
  });

  it('returns empty array when no matches', () => {
    const filtered = applyGlobalSearch(rows, 'xyz123notfound', fields);
    expect(filtered).toHaveLength(0);
  });

  it('does not mutate original array', () => {
    const originalRows = [...rows];
    applyGlobalSearch(rows, 'test', fields);
    expect(rows).toEqual(originalRows);
  });
});
