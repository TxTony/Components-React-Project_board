import type { Meta, StoryObj } from '@storybook/react';
import { GitBoardTable } from '../components/GitBoardTable';
import { fields, rows } from '../mocks/mockData';
import type { FieldDefinition, Row } from '../types';

/**
 * Showcase - Theme & Features
 *
 * Demonstrates all features and theme variations
 */
const meta = {
  title: 'Showcase/All Features',
  component: GitBoardTable,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Comprehensive showcase of all GitBoard Table features including color badges, editing, sorting, and theme support.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof GitBoardTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Color Badges Showcase - Light Theme
 */
export const ColorBadgesLight: Story = {
  args: {
    fields,
    rows,
    theme: 'light',
  },
  parameters: {
    backgrounds: { default: 'light' },
    docs: {
      description: {
        story: 'Demonstrates GitHub-style color badges with 10% opacity backgrounds and 1.5px borders for Status, Tags, Owner, and Iteration fields.',
      },
    },
  },
};

/**
 * Color Badges Showcase - Dark Theme
 */
export const ColorBadgesDark: Story = {
  args: {
    fields,
    rows,
    theme: 'dark',
  },
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'Color badges in dark mode with adapted colors for better contrast.',
      },
    },
  },
};

/**
 * All Field Types
 */
export const AllFieldTypes: Story = {
  args: {
    fields: [
      ...fields,
      // Add a custom field to showcase more options
      {
        id: 'fld_custom',
        type: 'text',
        name: 'Description',
        visible: true,
      } as FieldDefinition,
    ],
    rows: rows.map((row, index) => ({
      ...row,
      values: {
        ...row.values,
        fld_custom: `This is row ${index + 1} with a longer description to show text wrapping`,
      },
    })) as Row[],
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows all supported field types: text, number, date, single-select, multi-select, assignee, and iteration.',
      },
    },
  },
};

/**
 * Editing Experience
 */
export const EditingExperience: Story = {
  args: {
    fields,
    rows,
  },
  parameters: {
    docs: {
      description: {
        story: 'Click any cell to edit. Text/number/date fields enter edit mode on single click. Select fields show a caret - click it or double-click the cell to open the dropdown.',
      },
    },
  },
};

/**
 * Column Reordering
 */
export const ColumnReordering: Story = {
  args: {
    fields,
    rows,
    tableId: 'reorder-demo',
  },
  parameters: {
    docs: {
      description: {
        story: 'Drag column headers to reorder them. The order is saved to localStorage when tableId is provided.',
      },
    },
  },
};

/**
 * Row Management
 */
export const RowManagement: Story = {
  args: {
    fields,
    rows: rows.slice(0, 2), // Start with fewer rows
  },
  parameters: {
    docs: {
      description: {
        story: 'Add new rows using the "Add item" input at the bottom of the table. Select rows using checkboxes and delete them with the toolbar button.',
      },
    },
  },
};

/**
 * Sorting & Filtering
 */
export const SortingAndFiltering: Story = {
  args: {
    fields,
    rows,
  },
  parameters: {
    docs: {
      description: {
        story: 'Click column headers to sort (ascending/descending/none). Use the search bar to filter rows.',
      },
    },
  },
};

/**
 * Empty States
 */
export const EmptyStates: Story = {
  args: {
    fields,
    rows: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the table with no data rows. The "Add item" input is still available to add new rows.',
      },
    },
  },
};

/**
 * Responsive Behavior
 */
export const Responsive: Story = {
  args: {
    fields,
    rows,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Table scrolls horizontally on smaller screens to accommodate all columns.',
      },
    },
  },
};
