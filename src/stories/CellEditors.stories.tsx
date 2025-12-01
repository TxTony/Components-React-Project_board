import type { Meta, StoryObj } from '@storybook/react';
import { TextEditor } from '../components/Table/CellEditors/TextEditor';
import { NumberEditor } from '../components/Table/CellEditors/NumberEditor';
import { DateEditor } from '../components/Table/CellEditors/DateEditor';
import { SelectEditor } from '../components/Table/CellEditors/SelectEditor';
import { MultiSelectEditor } from '../components/Table/CellEditors/MultiSelectEditor';
import { fields } from '../mocks/mockData';

/**
 * Cell Editors
 *
 * Specialized inline editors for different field types
 */
const meta = {
  title: 'Components/Cell Editors',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

/**
 * Text Editor - for text and title fields
 */
export const Text: StoryObj<typeof TextEditor> = {
  render: (args) => (
    <div style={{ width: '300px', padding: '20px', border: '1px solid #ccc' }}>
      <TextEditor {...args} />
    </div>
  ),
  args: {
    value: 'Edit this text',
    onCommit: (value) => console.log('Committed:', value),
    onCancel: () => console.log('Cancelled'),
  },
};

/**
 * Number Editor - for numeric fields
 */
export const Number: StoryObj<typeof NumberEditor> = {
  render: (args) => (
    <div style={{ width: '300px', padding: '20px', border: '1px solid #ccc' }}>
      <NumberEditor {...args} />
    </div>
  ),
  args: {
    value: 5,
    onCommit: (value) => console.log('Committed:', value),
    onCancel: () => console.log('Cancelled'),
  },
};

/**
 * Date Editor - for date fields
 */
export const Date: StoryObj<typeof DateEditor> = {
  render: (args) => (
    <div style={{ width: '300px', padding: '20px', border: '1px solid #ccc' }}>
      <DateEditor {...args} />
    </div>
  ),
  args: {
    value: '2025-02-12',
    onCommit: (value) => console.log('Committed:', value),
    onCancel: () => console.log('Cancelled'),
  },
};

/**
 * Select Editor - dropdown for single-select fields
 */
export const Select: StoryObj<typeof SelectEditor> = {
  render: (args) => (
    <div style={{ width: '400px', padding: '20px', position: 'relative' }}>
      <table>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #ccc', padding: '8px', position: 'relative' }}>
              <SelectEditor {...args} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  ),
  args: {
    value: 'opt_status_progress_29bb',
    options: fields[1].options || [],
    onCommit: (value) => console.log('Committed:', value),
    onCancel: () => console.log('Cancelled'),
  },
};

/**
 * Multi-Select Editor - dropdown for multi-select fields
 */
export const MultiSelect: StoryObj<typeof MultiSelectEditor> = {
  render: (args) => (
    <div style={{ width: '400px', padding: '20px', position: 'relative' }}>
      <table>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #ccc', padding: '8px', position: 'relative' }}>
              <MultiSelectEditor {...args} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  ),
  args: {
    value: ['opt_6a2f_frontend', 'opt_c71d_urgent'],
    options: fields[3].options || [],
    onCommit: (value) => console.log('Committed:', value),
    onCancel: () => console.log('Cancelled'),
  },
};
