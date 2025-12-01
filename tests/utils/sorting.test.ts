/**
 * Sorting Utility Tests
 * Tests for sorting rows by field values
 */

import { describe, it, expect } from 'vitest';
import { sortRows } from '../../src/utils/sorting';
import type { Row, FieldDefinition, SortConfig } from '../../src/types';

describe('sortRows', () => {
  const textField: FieldDefinition = {
    id: 'fld_text',
    name: 'Title',
    type: 'text',
    visible: true,
  };

  const numberField: FieldDefinition = {
    id: 'fld_number',
    name: 'Points',
    type: 'number',
    visible: true,
  };

  const dateField: FieldDefinition = {
    id: 'fld_date',
    name: 'Due Date',
    type: 'date',
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

  describe('Text sorting', () => {
    const rows: Row[] = [
      { id: 'row_1', values: { fld_text: 'Zebra' } },
      { id: 'row_2', values: { fld_text: 'Apple' } },
      { id: 'row_3', values: { fld_text: 'Mango' } },
    ];

    it('sorts text ascending', () => {
      const sortConfig: SortConfig = { field: 'fld_text', direction: 'asc' };
      const sorted = sortRows(rows, sortConfig, [textField]);

      expect(sorted[0]?.values.fld_text).toBe('Apple');
      expect(sorted[1]?.values.fld_text).toBe('Mango');
      expect(sorted[2]?.values.fld_text).toBe('Zebra');
    });

    it('sorts text descending', () => {
      const sortConfig: SortConfig = { field: 'fld_text', direction: 'desc' };
      const sorted = sortRows(rows, sortConfig, [textField]);

      expect(sorted[0]?.values.fld_text).toBe('Zebra');
      expect(sorted[1]?.values.fld_text).toBe('Mango');
      expect(sorted[2]?.values.fld_text).toBe('Apple');
    });

    it('handles case-insensitive text sorting', () => {
      const rowsWithCase: Row[] = [
        { id: 'row_1', values: { fld_text: 'zebra' } },
        { id: 'row_2', values: { fld_text: 'Apple' } },
        { id: 'row_3', values: { fld_text: 'MANGO' } },
      ];

      const sortConfig: SortConfig = { field: 'fld_text', direction: 'asc' };
      const sorted = sortRows(rowsWithCase, sortConfig, [textField]);

      expect(sorted[0]?.values.fld_text).toBe('Apple');
      expect(sorted[1]?.values.fld_text).toBe('MANGO');
      expect(sorted[2]?.values.fld_text).toBe('zebra');
    });
  });

  describe('Number sorting', () => {
    const rows: Row[] = [
      { id: 'row_1', values: { fld_number: 100 } },
      { id: 'row_2', values: { fld_number: 5 } },
      { id: 'row_3', values: { fld_number: 42 } },
    ];

    it('sorts numbers ascending', () => {
      const sortConfig: SortConfig = { field: 'fld_number', direction: 'asc' };
      const sorted = sortRows(rows, sortConfig, [numberField]);

      expect(sorted[0]?.values.fld_number).toBe(5);
      expect(sorted[1]?.values.fld_number).toBe(42);
      expect(sorted[2]?.values.fld_number).toBe(100);
    });

    it('sorts numbers descending', () => {
      const sortConfig: SortConfig = { field: 'fld_number', direction: 'desc' };
      const sorted = sortRows(rows, sortConfig, [numberField]);

      expect(sorted[0]?.values.fld_number).toBe(100);
      expect(sorted[1]?.values.fld_number).toBe(42);
      expect(sorted[2]?.values.fld_number).toBe(5);
    });
  });

  describe('Date sorting', () => {
    const rows: Row[] = [
      { id: 'row_1', values: { fld_date: '2025-03-15' } },
      { id: 'row_2', values: { fld_date: '2025-01-10' } },
      { id: 'row_3', values: { fld_date: '2025-02-20' } },
    ];

    it('sorts dates ascending', () => {
      const sortConfig: SortConfig = { field: 'fld_date', direction: 'asc' };
      const sorted = sortRows(rows, sortConfig, [dateField]);

      expect(sorted[0]?.values.fld_date).toBe('2025-01-10');
      expect(sorted[1]?.values.fld_date).toBe('2025-02-20');
      expect(sorted[2]?.values.fld_date).toBe('2025-03-15');
    });

    it('sorts dates descending', () => {
      const sortConfig: SortConfig = { field: 'fld_date', direction: 'desc' };
      const sorted = sortRows(rows, sortConfig, [dateField]);

      expect(sorted[0]?.values.fld_date).toBe('2025-03-15');
      expect(sorted[1]?.values.fld_date).toBe('2025-02-20');
      expect(sorted[2]?.values.fld_date).toBe('2025-01-10');
    });
  });

  describe('Null/undefined handling', () => {
    const rows: Row[] = [
      { id: 'row_1', values: { fld_text: 'Beta' } },
      { id: 'row_2', values: { fld_text: null } },
      { id: 'row_3', values: { fld_text: 'Alpha' } },
      { id: 'row_4', values: {} }, // undefined
    ];

    it('places null/undefined values at the end when sorting ascending', () => {
      const sortConfig: SortConfig = { field: 'fld_text', direction: 'asc' };
      const sorted = sortRows(rows, sortConfig, [textField]);

      expect(sorted[0]?.values.fld_text).toBe('Alpha');
      expect(sorted[1]?.values.fld_text).toBe('Beta');
      expect(sorted[2]?.values.fld_text).toBeNull();
      expect(sorted[3]?.values.fld_text).toBeUndefined();
    });

    it('places null/undefined values at the end when sorting descending', () => {
      const sortConfig: SortConfig = { field: 'fld_text', direction: 'desc' };
      const sorted = sortRows(rows, sortConfig, [textField]);

      expect(sorted[0]?.values.fld_text).toBe('Beta');
      expect(sorted[1]?.values.fld_text).toBe('Alpha');
      expect(sorted[2]?.values.fld_text).toBeNull();
      expect(sorted[3]?.values.fld_text).toBeUndefined();
    });
  });

  describe('Select field sorting', () => {
    const rows: Row[] = [
      { id: 'row_1', values: { fld_status: 'opt_done' } },
      { id: 'row_2', values: { fld_status: 'opt_todo' } },
      { id: 'row_3', values: { fld_status: 'opt_progress' } },
    ];

    it('sorts select fields by label', () => {
      const sortConfig: SortConfig = { field: 'fld_status', direction: 'asc' };
      const sorted = sortRows(rows, sortConfig, [selectField]);

      // Alphabetically: "Done", "In Progress", "Todo"
      expect(sorted[0]?.values.fld_status).toBe('opt_done');
      expect(sorted[1]?.values.fld_status).toBe('opt_progress');
      expect(sorted[2]?.values.fld_status).toBe('opt_todo');
    });
  });

  describe('Edge cases', () => {
    it('returns original array if no sort config', () => {
      const rows: Row[] = [
        { id: 'row_1', values: { fld_text: 'Zebra' } },
        { id: 'row_2', values: { fld_text: 'Apple' } },
      ];

      const sorted = sortRows(rows, null, [textField]);
      expect(sorted).toEqual(rows);
    });

    it('returns original array if field not found', () => {
      const rows: Row[] = [
        { id: 'row_1', values: { fld_text: 'Zebra' } },
        { id: 'row_2', values: { fld_text: 'Apple' } },
      ];

      const sortConfig: SortConfig = { field: 'nonexistent', direction: 'asc' };
      const sorted = sortRows(rows, sortConfig, [textField]);
      expect(sorted).toEqual(rows);
    });

    it('handles empty array', () => {
      const rows: Row[] = [];
      const sortConfig: SortConfig = { field: 'fld_text', direction: 'asc' };
      const sorted = sortRows(rows, sortConfig, [textField]);

      expect(sorted).toEqual([]);
    });

    it('does not mutate original array', () => {
      const rows: Row[] = [
        { id: 'row_1', values: { fld_text: 'Zebra' } },
        { id: 'row_2', values: { fld_text: 'Apple' } },
      ];

      const originalOrder = [...rows];
      const sortConfig: SortConfig = { field: 'fld_text', direction: 'asc' };
      sortRows(rows, sortConfig, [textField]);

      expect(rows).toEqual(originalOrder);
    });
  });
});
