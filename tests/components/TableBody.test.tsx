/**
 * TableBody Component Tests
 * Tests for rendering rows and cells
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TableBody } from '../../src/components/Table/TableBody';
import { fields, rows } from '../../src/mocks/mockData';

describe('TableBody', () => {
  describe('Rendering', () => {
    it('renders all rows', () => {
      render(
        <table>
          <TableBody fields={fields} rows={rows} />
        </table>
      );

      // Check that all row data is rendered
      expect(screen.getByText('Add login page')).toBeInTheDocument();
      expect(screen.getByText('Refactor API client')).toBeInTheDocument();
      expect(screen.getByText('Create UI kit')).toBeInTheDocument();
    });

    it('renders correct number of rows', () => {
      const { container } = render(
        <table>
          <TableBody fields={fields} rows={rows} />
        </table>
      );

      const tbody = container.querySelector('tbody');
      const rowElements = tbody?.querySelectorAll('tr');
      expect(rowElements).toHaveLength(4); // 3 data rows + 1 add item row
    });

    it('renders cells for each visible field', () => {
      const { container } = render(
        <table>
          <TableBody fields={fields} rows={rows.slice(0, 1)} />
        </table>
      );

      const tbody = container.querySelector('tbody');
      const firstRow = tbody?.querySelector('tr');
      const cells = firstRow?.querySelectorAll('td');

      // Should have 9 cells (drag handle + row number + 7 visible fields)
      expect(cells).toHaveLength(9);
    });

    it('renders with empty rows array', () => {
      const { container } = render(
        <table>
          <TableBody fields={fields} rows={[]} />
        </table>
      );

      const tbody = container.querySelector('tbody');
      expect(tbody).toBeInTheDocument();

      const rowElements = tbody?.querySelectorAll('tr');
      expect(rowElements).toHaveLength(1); // Only add item row
    });

    it('skips hidden fields in row rendering', () => {
      const fieldsWithHidden = [
        {
          id: 'fld_visible',
          name: 'Visible',
          type: 'text' as const,
          visible: true,
        },
        {
          id: 'fld_hidden',
          name: 'Hidden',
          type: 'text' as const,
          visible: false,
        },
      ];

      const testRows = [
        {
          id: 'row_1',
          values: {
            fld_visible: 'I am visible',
            fld_hidden: 'I am hidden',
          },
        },
      ];

      const { container } = render(
        <table>
          <TableBody fields={fieldsWithHidden} rows={testRows} />
        </table>
      );

      expect(screen.getByText('I am visible')).toBeInTheDocument();
      expect(screen.queryByText('I am hidden')).not.toBeInTheDocument();

      const firstRow = container.querySelector('tr');
      const cells = firstRow?.querySelectorAll('td');
      expect(cells).toHaveLength(3); // Drag handle + row number + 1 visible field
    });
  });

  describe('Cell values', () => {
    it('renders text values correctly', () => {
      render(
        <table>
          <TableBody fields={fields} rows={rows} />
        </table>
      );

      expect(screen.getByText('Add login page')).toBeInTheDocument();
    });

    it('renders number values correctly', () => {
      render(
        <table>
          <TableBody fields={fields} rows={rows} />
        </table>
      );

      // Use getAllByText since numbers may appear in both row numbers and data
      expect(screen.getAllByText('3').length).toBeGreaterThan(0);
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getAllByText('2').length).toBeGreaterThan(0);
    });

    it('renders null values as empty', () => {
      const testRows = [
        {
          id: 'row_1',
          values: {
            fld_title_aa12e: null,
          },
        },
      ];

      const { container } = render(
        <table>
          <TableBody fields={fields} rows={testRows} />
        </table>
      );

      const firstCell = container.querySelector('td');
      expect(firstCell).toHaveTextContent('');
    });

    it('handles missing values gracefully', () => {
      const testRows = [
        {
          id: 'row_1',
          values: {}, // No values
        },
      ];

      const { container } = render(
        <table>
          <TableBody fields={fields} rows={testRows} />
        </table>
      );

      const cells = container.querySelectorAll('td');
      expect(cells.length).toBeGreaterThan(0);
    });
  });

  describe('Row structure', () => {
    it('assigns correct data-row-id attribute', () => {
      const { container } = render(
        <table>
          <TableBody fields={fields} rows={rows} />
        </table>
      );

      const firstRow = container.querySelector('tr');
      expect(firstRow).toHaveAttribute('data-row-id', 'row_1_d1a9f');
    });

    it('maintains row order', () => {
      const { container } = render(
        <table>
          <TableBody fields={fields} rows={rows} />
        </table>
      );

      const rowElements = container.querySelectorAll('tr');
      expect(rowElements[0]).toHaveAttribute('data-row-id', 'row_1_d1a9f');
      expect(rowElements[1]).toHaveAttribute('data-row-id', 'row_2_e13cd');
      expect(rowElements[2]).toHaveAttribute('data-row-id', 'row_3_f8411');
    });
  });
});
