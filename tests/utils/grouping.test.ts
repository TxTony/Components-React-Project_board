/**
 * Tests for grouping utilities
 */

import { describe, it, expect } from 'vitest';
import { groupRows, getUniqueFieldValues } from '../../src/utils/grouping';
import type { Row, FieldDefinition } from '../../src/types';

describe('Grouping Utilities', () => {
  const mockFields: FieldDefinition[] = [
    {
      id: 'status',
      name: 'Status',
      type: 'single-select',
      visible: true,
      options: [
        { id: 'todo', label: 'To Do', color: 'gray' },
        { id: 'in-progress', label: 'In Progress', color: 'blue' },
        { id: 'done', label: 'Done', color: 'green' },
      ],
    },
    {
      id: 'priority',
      name: 'Priority',
      type: 'single-select',
      visible: true,
      options: [
        { id: 'high', label: 'High', color: 'red' },
        { id: 'medium', label: 'Medium', color: 'yellow' },
        { id: 'low', label: 'Low', color: 'gray' },
      ],
    },
    {
      id: 'title',
      name: 'Title',
      type: 'title',
      visible: true,
    },
  ];

  const mockRows: Row[] = [
    { id: 'row1', values: { status: 'todo', priority: 'high', title: 'Task 1' } },
    { id: 'row2', values: { status: 'in-progress', priority: 'medium', title: 'Task 2' } },
    { id: 'row3', values: { status: 'todo', priority: 'low', title: 'Task 3' } },
    { id: 'row4', values: { status: 'done', priority: 'high', title: 'Task 4' } },
    { id: 'row5', values: { status: 'in-progress', priority: 'medium', title: 'Task 5' } },
    { id: 'row6', values: { priority: 'low', title: 'Task 6' } }, // No status
  ];

  describe('groupRows', () => {
    it('should return all rows in a single group when groupBy is null', () => {
      const groups = groupRows(mockRows, null, mockFields);

      expect(groups).toHaveLength(1);
      expect(groups[0].id).toBe('__all__');
      expect(groups[0].label).toBe('All Items');
      expect(groups[0].rows).toHaveLength(6);
      expect(groups[0].count).toBe(6);
    });

    it('should group rows by status field', () => {
      const groups = groupRows(mockRows, 'status', mockFields);

      expect(groups).toHaveLength(4); // todo, in-progress, done, empty

      // Check "Done" group
      const doneGroup = groups.find((g) => g.id === 'done');
      expect(doneGroup).toBeDefined();
      expect(doneGroup!.label).toBe('Done');
      expect(doneGroup!.count).toBe(1);
      expect(doneGroup!.rows).toHaveLength(1);
      expect(doneGroup!.rows[0].id).toBe('row4');

      // Check "In Progress" group
      const inProgressGroup = groups.find((g) => g.id === 'in-progress');
      expect(inProgressGroup).toBeDefined();
      expect(inProgressGroup!.label).toBe('In Progress');
      expect(inProgressGroup!.count).toBe(2);
      expect(inProgressGroup!.rows).toHaveLength(2);

      // Check "To Do" group
      const todoGroup = groups.find((g) => g.id === 'todo');
      expect(todoGroup).toBeDefined();
      expect(todoGroup!.label).toBe('To Do');
      expect(todoGroup!.count).toBe(2);
      expect(todoGroup!.rows).toHaveLength(2);

      // Check empty group (rows without status)
      const emptyGroup = groups.find((g) => g.id === '__empty__');
      expect(emptyGroup).toBeDefined();
      expect(emptyGroup!.label).toBe('No Status');
      expect(emptyGroup!.count).toBe(1);
      expect(emptyGroup!.rows[0].id).toBe('row6');
    });

    it('should group rows by priority field', () => {
      const groups = groupRows(mockRows, 'priority', mockFields);

      expect(groups).toHaveLength(3); // high, medium, low

      const highGroup = groups.find((g) => g.id === 'high');
      expect(highGroup).toBeDefined();
      expect(highGroup!.label).toBe('High');
      expect(highGroup!.count).toBe(2);

      const mediumGroup = groups.find((g) => g.id === 'medium');
      expect(mediumGroup).toBeDefined();
      expect(mediumGroup!.label).toBe('Medium');
      expect(mediumGroup!.count).toBe(2);

      const lowGroup = groups.find((g) => g.id === 'low');
      expect(lowGroup).toBeDefined();
      expect(lowGroup!.label).toBe('Low');
      expect(lowGroup!.count).toBe(2);
    });

    it('should place empty group last in sort order', () => {
      const groups = groupRows(mockRows, 'status', mockFields);

      const lastGroup = groups[groups.length - 1];
      expect(lastGroup.id).toBe('__empty__');
      expect(lastGroup.label).toBe('No Status');
    });

    it('should sort groups by option order when field has options', () => {
      const groups = groupRows(mockRows, 'status', mockFields);

      // Remove empty group for checking option order
      const nonEmptyGroups = groups.filter((g) => g.id !== '__empty__');

      const labels = nonEmptyGroups.map((g) => g.label);
      // Options are defined as: To Do, In Progress, Done - so groups should follow this order
      expect(labels).toEqual(['To Do', 'In Progress', 'Done']);
    });

    it('should return single ungrouped group when field not found', () => {
      const groups = groupRows(mockRows, 'non-existent-field', mockFields);

      expect(groups).toHaveLength(1);
      expect(groups[0].id).toBe('__all__');
      expect(groups[0].label).toBe('All Items');
      expect(groups[0].rows).toHaveLength(6);
    });

    it('should show all option groups even with empty rows array', () => {
      const groups = groupRows([], 'status', mockFields);

      // Field has 3 options, so we should get 3 empty groups
      expect(groups).toHaveLength(3);
      expect(groups.every((g) => g.count === 0)).toBe(true);
      expect(groups.every((g) => g.rows.length === 0)).toBe(true);
      // Should maintain option order
      expect(groups.map((g) => g.label)).toEqual(['To Do', 'In Progress', 'Done']);
    });

    it('should group by text field', () => {
      const textField: FieldDefinition = {
        id: 'category',
        name: 'Category',
        type: 'text',
        visible: true,
      };

      const rowsWithText: Row[] = [
        { id: 'r1', values: { category: 'Frontend' } },
        { id: 'r2', values: { category: 'Backend' } },
        { id: 'r3', values: { category: 'Frontend' } },
      ];

      const groups = groupRows(rowsWithText, 'category', [textField]);

      expect(groups).toHaveLength(2);

      const frontendGroup = groups.find((g) => g.label === 'Frontend');
      expect(frontendGroup).toBeDefined();
      expect(frontendGroup!.count).toBe(2);

      const backendGroup = groups.find((g) => g.label === 'Backend');
      expect(backendGroup).toBeDefined();
      expect(backendGroup!.count).toBe(1);
    });
  });

  describe('getUniqueFieldValues', () => {
    it('should return unique values with counts for a field', () => {
      const statusField = mockFields.find((f) => f.id === 'status')!;
      const uniqueValues = getUniqueFieldValues(mockRows, 'status', statusField);

      expect(uniqueValues).toHaveLength(4); // todo, in-progress, done, empty

      const todoValue = uniqueValues.find((v) => v.value === 'todo');
      expect(todoValue).toBeDefined();
      expect(todoValue!.label).toBe('To Do');
      expect(todoValue!.count).toBe(2);

      const emptyValue = uniqueValues.find((v) => v.label === 'No Status');
      expect(emptyValue).toBeDefined();
      expect(emptyValue!.count).toBe(1);
    });

    it('should sort unique values alphabetically by label', () => {
      const statusField = mockFields.find((f) => f.id === 'status')!;
      const uniqueValues = getUniqueFieldValues(mockRows, 'status', statusField);

      const labels = uniqueValues.map((v) => v.label);
      const sortedLabels = [...labels].sort();

      expect(labels).toEqual(sortedLabels);
    });

    it('should handle empty rows array', () => {
      const statusField = mockFields.find((f) => f.id === 'status')!;
      const uniqueValues = getUniqueFieldValues([], 'status', statusField);

      expect(uniqueValues).toHaveLength(0);
    });
  });
});
