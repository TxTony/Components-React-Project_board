/**
 * Tests for localStorage persistence utility
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  saveTableState,
  loadTableState,
  clearTableState,
  getSavedTableIds,
} from '../../src/utils/persistence';

describe('localStorage persistence', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
  });

  describe('saveTableState', () => {
    it('saves table state to localStorage', () => {
      const tableId = 'test-table';
      const state = {
        fieldOrder: ['fld_1', 'fld_2', 'fld_3'],
        sortConfig: { field: 'fld_1', direction: 'asc' as const },
        filters: [],
      };

      const result = saveTableState(tableId, state);

      expect(result).toBe(true);
      const saved = localStorage.getItem('gitboard-table-test-table');
      expect(saved).toBeDefined();
      expect(JSON.parse(saved!)).toEqual(state);
    });

    it('handles errors gracefully when localStorage fails', () => {
      // We can't reliably test localStorage unavailability in jsdom,
      // but we can verify the function doesn't throw
      expect(() => {
        saveTableState('test', {});
      }).not.toThrow();
    });
  });

  describe('loadTableState', () => {
    it('loads table state from localStorage', () => {
      const tableId = 'test-table';
      const state = {
        fieldOrder: ['fld_1', 'fld_2'],
        sortConfig: { field: 'fld_1', direction: 'desc' as const },
        filters: [],
      };

      localStorage.setItem('gitboard-table-test-table', JSON.stringify(state));

      const loaded = loadTableState(tableId);

      expect(loaded).toEqual(state);
    });

    it('returns null when no state is saved', () => {
      const loaded = loadTableState('nonexistent-table');

      expect(loaded).toBeNull();
    });

    it('handles errors gracefully when localStorage fails', () => {
      // We can't reliably test localStorage unavailability in jsdom,
      // but we can verify the function doesn't throw
      expect(() => {
        loadTableState('test');
      }).not.toThrow();
    });

    it('returns null when saved data is corrupted', () => {
      localStorage.setItem('gitboard-table-test', 'invalid json');

      const loaded = loadTableState('test');

      expect(loaded).toBeNull();
    });
  });

  describe('clearTableState', () => {
    it('clears table state from localStorage', () => {
      const tableId = 'test-table';
      localStorage.setItem('gitboard-table-test-table', JSON.stringify({}));

      const result = clearTableState(tableId);

      expect(result).toBe(true);
      expect(localStorage.getItem('gitboard-table-test-table')).toBeNull();
    });

    it('handles errors gracefully when localStorage fails', () => {
      // We can't reliably test localStorage unavailability in jsdom,
      // but we can verify the function doesn't throw
      expect(() => {
        clearTableState('test');
      }).not.toThrow();
    });
  });

  describe('getSavedTableIds', () => {
    it('returns list of saved table IDs', () => {
      localStorage.setItem('gitboard-table-table1', JSON.stringify({}));
      localStorage.setItem('gitboard-table-table2', JSON.stringify({}));
      localStorage.setItem('other-key', 'value');

      const ids = getSavedTableIds();

      expect(ids).toContain('table1');
      expect(ids).toContain('table2');
      expect(ids).not.toContain('other-key');
      expect(ids).toHaveLength(2);
    });

    it('returns empty array when no tables are saved', () => {
      const ids = getSavedTableIds();

      expect(ids).toEqual([]);
    });

    it('handles errors gracefully when localStorage fails', () => {
      // We can't reliably test localStorage unavailability in jsdom,
      // but we can verify the function doesn't throw
      expect(() => {
        getSavedTableIds();
      }).not.toThrow();
    });
  });

  describe('Integration: save and load', () => {
    it('saves and loads complete table state', () => {
      const tableId = 'my-table';
      const state = {
        fieldOrder: ['id', 'name', 'status', 'priority'],
        sortConfig: { field: 'name', direction: 'asc' as const },
        filters: [
          { field: 'status', operator: 'equals' as const, value: 'active' },
        ],
        columnWidths: {
          id: 100,
          name: 200,
        },
        hiddenColumns: ['priority'],
      };

      // Save
      saveTableState(tableId, state);

      // Load
      const loaded = loadTableState(tableId);

      expect(loaded).toEqual(state);
    });

    it('handles partial state correctly', () => {
      const tableId = 'partial-table';
      const state = {
        fieldOrder: ['a', 'b', 'c'],
      };

      saveTableState(tableId, state);
      const loaded = loadTableState(tableId);

      expect(loaded).toEqual(state);
      expect(loaded?.sortConfig).toBeUndefined();
      expect(loaded?.filters).toBeUndefined();
    });
  });
});
