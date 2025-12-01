import type { Meta, StoryObj } from '@storybook/react';
import { GitBoardTable } from '../components/GitBoardTable';
import { fields, rows, users, iterations } from '../mocks/mockData';

/**
 * GitBoard Table Component
 *
 * A reusable GitHub-Projects-style table component with:
 * - Editable cells with specialized editors
 * - Column reordering via drag & drop
 * - Sorting, filtering, and search
 * - Row selection
 * - localStorage persistence
 * - Light/Dark theme support
 */
const meta = {
  title: 'Components/GitBoardTable',
  component: GitBoardTable,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A feature-rich table component inspired by GitHub Projects, with inline editing, drag-and-drop column reordering, and theme support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    fields: {
      description: 'Array of field definitions that define the table columns',
      control: { type: 'object' },
    },
    rows: {
      description: 'Array of data rows to display in the table',
      control: { type: 'object' },
    },
    theme: {
      description: 'Theme for the table',
      control: { type: 'select' },
      options: ['light', 'dark'],
    },
    tableId: {
      description: 'Unique ID for localStorage persistence (optional)',
      control: { type: 'text' },
    },
    onChange: {
      description: 'Callback fired when rows data changes',
      action: 'onChange',
    },
  },
} satisfies Meta<typeof GitBoardTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default table with all field types
 */
export const Default: Story = {
  args: {
    fields,
    rows,
  },
};

/**
 * Empty table (no data rows)
 */
export const Empty: Story = {
  args: {
    fields,
    rows: [],
  },
};

/**
 * Dark theme variant
 */
export const DarkTheme: Story = {
  args: {
    fields,
    rows,
    theme: 'dark',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

/**
 * With localStorage persistence enabled
 */
export const WithPersistence: Story = {
  args: {
    fields,
    rows,
    tableId: 'storybook-demo',
  },
  parameters: {
    docs: {
      description: {
        story: 'Table state (column order, sort, filters) is saved to localStorage and restored on reload. Try reordering columns or sorting, then refresh the page.',
      },
    },
  },
};

/**
 * Large dataset (for performance testing)
 */
export const LargeDataset: Story = {
  args: {
    fields,
    rows: Array.from({ length: 100 }, (_, i) => ({
      id: `row_${i}`,
      values: {
        fld_title_aa12e: `Task ${i + 1}`,
        fld_status_c81f3: i % 3 === 0 ? 'opt_status_done_77de' : i % 2 === 0 ? 'opt_status_progress_29bb' : 'opt_status_todo_118a',
        fld_owner_19ad8: users[i % users.length].id,
        fld_tags_92f3a: i % 2 === 0 ? ['opt_6a2f_frontend'] : ['opt_8b91_backend', 'opt_c71d_urgent'],
        fld_due_71fe3: `2025-02-${String(10 + (i % 20)).padStart(2, '0')}`,
        fld_points_11b9e: (i % 5) + 1,
        fld_iteration_6d1a2: iterations[i % iterations.length].id,
      },
    })),
  },
};

/**
 * Minimal configuration (few columns)
 */
export const Minimal: Story = {
  args: {
    fields: [
      fields[0], // Title
      fields[1], // Status
      fields[2], // Owner
    ],
    rows: rows.map((row) => ({
      ...row,
      values: {
        fld_title_aa12e: row.values.fld_title_aa12e,
        fld_status_c81f3: row.values.fld_status_c81f3,
        fld_owner_19ad8: row.values.fld_owner_19ad8,
      },
    })),
  },
};

/**
 * Interactive example - all features enabled
 */
export const Interactive: Story = {
  args: {
    fields,
    rows,
    tableId: 'interactive-demo',
  },
  parameters: {
    docs: {
      description: {
        story: 'Try all features: click cells to edit, drag column headers to reorder, click to sort, select rows, add new items at the bottom.',
      },
    },
  },
};
