import type { Meta, StoryObj } from '@storybook/react';
import { Cell } from '../components/Table/Cell';
import { fields } from '../mocks/mockData';

/**
 * Cell Component
 *
 * Individual table cells with inline editing support for all field types:
 * - Text
 * - Number
 * - Date
 * - Single-select
 * - Multi-select
 * - Assignee
 * - Iteration
 */
const meta = {
  title: 'Components/Cell',
  component: Cell,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <table>
        <tbody>
          <tr>
            <Story />
          </tr>
        </tbody>
      </table>
    ),
  ],
  argTypes: {
    field: {
      description: 'Field definition for this cell',
      control: { type: 'object' },
    },
    value: {
      description: 'Current value of the cell',
    },
    rowId: {
      description: 'Unique row identifier',
      control: { type: 'text' },
    },
    readOnly: {
      description: 'Whether the cell is read-only',
      control: { type: 'boolean' },
    },
    onEdit: {
      description: 'Callback fired when cell value changes',
      action: 'onEdit',
    },
  },
} satisfies Meta<typeof Cell>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Text field cell
 */
export const TextField: Story = {
  args: {
    field: fields[0], // Title field
    value: 'Add login page',
    rowId: 'row_1',
  },
};

/**
 * Single-select field with color badge
 */
export const SingleSelect: Story = {
  args: {
    field: fields[1], // Status field
    value: 'opt_status_progress_29bb',
    rowId: 'row_1',
  },
};

/**
 * Assignee field
 */
export const Assignee: Story = {
  args: {
    field: fields[2], // Owner field
    value: 'usr_tony_a19f2',
    rowId: 'row_1',
  },
};

/**
 * Multi-select field with multiple color badges
 */
export const MultiSelect: Story = {
  args: {
    field: fields[3], // Tags field
    value: ['opt_6a2f_frontend', 'opt_c71d_urgent'],
    rowId: 'row_1',
  },
};

/**
 * Date field
 */
export const DateField: Story = {
  args: {
    field: fields[4], // Due Date field
    value: '2025-02-12',
    rowId: 'row_1',
  },
};

/**
 * Number field
 */
export const NumberField: Story = {
  args: {
    field: fields[5], // Points field
    value: 5,
    rowId: 'row_1',
  },
};

/**
 * Iteration field
 */
export const Iteration: Story = {
  args: {
    field: fields[6], // Iteration field
    value: 'itr_week_1_baa21',
    rowId: 'row_1',
  },
};

/**
 * Empty cell
 */
export const Empty: Story = {
  args: {
    field: fields[0],
    value: null,
    rowId: 'row_1',
  },
};

/**
 * Read-only cell
 */
export const ReadOnly: Story = {
  args: {
    field: fields[0],
    value: 'Cannot edit this',
    rowId: 'row_1',
    readOnly: true,
  },
};

/**
 * Selected cell (for select fields)
 */
export const Selected: Story = {
  args: {
    field: fields[1],
    value: 'opt_status_progress_29bb',
    rowId: 'row_1',
    isSelected: true,
  },
};
