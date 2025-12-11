/**
 * localStorage Persistence Utility
 * Handles saving and loading table state to/from localStorage
 */

import type { SortConfig, FilterConfig } from '@/types';

export interface TableState {
  fieldOrder?: string[];
  sortConfig?: SortConfig | null;
  filters?: FilterConfig[];
  groupBy?: string | null;
  columnWidths?: Record<string, number>;
  fieldWidths?: Record<string, number>;
  hiddenColumns?: string[];
  viewOrder?: string[];  // Ordered list of view IDs
}

const STORAGE_KEY_PREFIX = 'gitboard-table-';

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Save table state to localStorage
 */
export function saveTableState(tableId: string, state: TableState): boolean {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage is not available');
    return false;
  }

  try {
    const key = `${STORAGE_KEY_PREFIX}${tableId}`;
    const serialized = JSON.stringify(state);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error('Failed to save table state:', error);
    return false;
  }
}

/**
 * Load table state from localStorage
 */
export function loadTableState(tableId: string): TableState | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  try {
    const key = `${STORAGE_KEY_PREFIX}${tableId}`;
    const serialized = localStorage.getItem(key);

    if (!serialized) {
      return null;
    }

    return JSON.parse(serialized) as TableState;
  } catch (error) {
    console.error('Failed to load table state:', error);
    return null;
  }
}

/**
 * Clear table state from localStorage
 */
export function clearTableState(tableId: string): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    const key = `${STORAGE_KEY_PREFIX}${tableId}`;
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Failed to clear table state:', error);
    return false;
  }
}

/**
 * Get all saved table IDs
 */
export function getSavedTableIds(): string[] {
  if (!isLocalStorageAvailable()) {
    return [];
  }

  try {
    const keys = Object.keys(localStorage);
    return keys
      .filter((key) => key.startsWith(STORAGE_KEY_PREFIX))
      .map((key) => key.replace(STORAGE_KEY_PREFIX, ''));
  } catch (error) {
    console.error('Failed to get saved table IDs:', error);
    return [];
  }
}
