import { describe, it, expect } from 'vitest';
import { filterRows } from '../filtering';

// Minimal FieldDefinition shape for tests
const statusField = {
  id: 'fld_status',
  name: 'Status',
  type: 'single-select',
  visible: true,
  options: [
    { id: 'opt_prod', label: 'Prod' },
    { id: 'opt_snapshot', label: 'Snapshot' },
    { id: 'opt_other', label: 'Other' },
  ],
};

const tagsField = {
  id: 'fld_tags',
  name: 'Tags',
  type: 'multi-select',
  visible: true,
  options: [
    { id: 'tag_bug', label: 'Bug' },
    { id: 'tag_snapshot', label: 'Snapshot' },
    { id: 'tag_prod', label: 'Prod' },
  ],
};

describe('filterRows - in operator', () => {
  it('matches scalar field when stored ID is in the list', () => {
    const rows = [
      { id: 'r1', values: { fld_status: 'opt_prod' } },
      { id: 'r2', values: { fld_status: 'opt_other' } },
    ];

    const filters = [
      { field: 'fld_status', operator: 'in', value: ['opt_prod', 'opt_snapshot'] },
    ];

    const out = filterRows(rows as any, filters as any, [statusField as any]);
    expect(out.map((r) => r.id)).toEqual(['r1']);
  });

  it('matches scalar field when label is used in the list', () => {
    const rows = [
      { id: 'r1', values: { fld_status: 'opt_snapshot' } },
      { id: 'r2', values: { fld_status: 'opt_other' } },
    ];

    const filters = [
      { field: 'fld_status', operator: 'in', value: ['Snapshot', 'Prod'] },
    ];

    const out = filterRows(rows as any, filters as any, [statusField as any]);
    expect(out.map((r) => r.id)).toEqual(['r1']);
  });

  it('matches multi-select when any provided value appears in the array (by label)', () => {
    const rows = [
      { id: 'r1', values: { fld_tags: ['tag_snapshot', 'tag_bug'] } },
      { id: 'r2', values: { fld_tags: ['tag_prod'] } },
      { id: 'r3', values: { fld_tags: [] } },
    ];

    const filters = [
      { field: 'fld_tags', operator: 'in', value: ['Snapshot', 'Other'] },
    ];

    const out = filterRows(rows as any, filters as any, [tagsField as any]);
    expect(out.map((r) => r.id)).toEqual(['r1']);
  });

  it('does not match when none of the values appear', () => {
    const rows = [
      { id: 'r1', values: { fld_status: 'opt_other' } },
    ];

    const filters = [
      { field: 'fld_status', operator: 'in', value: ['opt_prod', 'opt_snapshot'] },
    ];

    const out = filterRows(rows as any, filters as any, [statusField as any]);
    expect(out).toHaveLength(0);
  });
});
