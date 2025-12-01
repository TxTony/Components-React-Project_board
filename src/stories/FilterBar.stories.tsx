import type { Meta, StoryObj } from '@storybook/react';
import { FilterBar } from '../components/Toolbar/FilterBar';
import { fields } from '../mocks/mockData';
import type { FilterConfig } from '../types';

/**
 * FilterBar Component
 *
 * Inline text-based filter input with intelligent autocomplete.
 * Syntax: `field:operator:value`
 *
 * ## Features
 * - **Autocomplete suggestions** for fields, operators, and values
 * - **Multiple filters** separated by spaces
 * - **Negative filters** using `-` prefix (e.g., `-status:equals:done`)
 * - **Comparison operators** for numbers (e.g., `points:>:3`)
 * - **Quoted values** for values with spaces (e.g., `title:contains:"login page"`)
 *
 * ## Examples
 * - `Title:contains:login` - Title contains "login"
 * - `Status:equals:done` - Status is Done
 * - `-Status:equals:todo` - Status is NOT Todo
 * - `Points:>:5` - Points greater than 5
 * - `Title:contains:"login page"` - Title contains "login page" (with quotes for spaces)
 * - Multiple: `Title:contains:login Status:equals:done Owner:equals:tony`
 */
const meta = {
  title: 'Components/FilterBar',
  component: FilterBar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Inline filter input with autocomplete for building complex filters using a GitHub-style query syntax.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    fields: {
      description: 'Array of field definitions available for filtering',
      control: { type: 'object' },
    },
    filters: {
      description: 'Array of parsed active filters (read-only, managed by component)',
      control: { type: 'object' },
    },
    onFiltersChange: {
      description: 'Callback fired when filters are parsed from input',
      action: 'onFiltersChange',
    },
  },
} satisfies Meta<typeof FilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Empty state - start typing to see autocomplete suggestions
 */
export const Empty: Story = {
  args: {
    fields,
    filters: [],
  },
};

/**
 * Interactive example - try typing these:
 * - `Ti` (shows field suggestions)
 * - `Title:` (shows operator suggestions)
 * - `Title:contains:` (type any value)
 * - `Status:equals:` (shows value suggestions)
 */
export const Interactive: Story = {
  args: {
    fields,
    filters: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Try typing filter queries. The component provides intelligent autocomplete suggestions as you type.',
      },
    },
  },
};

/**
 * Example: Simple text filter
 * Type: `Title:contains:login`
 */
export const SimpleTextFilter: Story = {
  args: {
    fields,
    filters: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Example of a simple text contains filter. Type `Title:contains:login` to filter items containing "login" in the title.',
      },
    },
  },
};

/**
 * Example: Select field filter
 * Type: `Status:equals:done` (use autocomplete for values)
 */
export const SelectFieldFilter: Story = {
  args: {
    fields,
    filters: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'For select fields, autocomplete shows available options. Type `Status:equals:` to see value suggestions.',
      },
    },
  },
};

/**
 * Example: Multiple filters
 * Type: `Title:contains:login Status:equals:done`
 */
export const MultipleFilters: Story = {
  args: {
    fields,
    filters: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Multiple filters can be added, separated by spaces. All filters use AND logic.',
      },
    },
  },
};

/**
 * Example: Negative filter
 * Type: `-Status:equals:done`
 */
export const NegativeFilter: Story = {
  args: {
    fields,
    filters: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Prefix with `-` to negate a filter. Example: `-Status:equals:done` shows all items where status is NOT done.',
      },
    },
  },
};

/**
 * Example: Comparison operators
 * Type: `Points:>:5` or `Points:>=:10` or `Points:<:3`
 */
export const ComparisonOperators: Story = {
  args: {
    fields,
    filters: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Use comparison operators for number fields: `>`, `>=`, `<`, `<=`. Example: `Points:>:5` shows items with more than 5 points.',
      },
    },
  },
};

/**
 * Example: Quoted values
 * Type: `Title:contains:"login page"`
 */
export const QuotedValues: Story = {
  args: {
    fields,
    filters: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Use quotes for values containing spaces. Example: `Title:contains:"login page"`',
      },
    },
  },
};

/**
 * Example: Complex query
 * Type: `Title:contains:auth Status:equals:done -Owner:equals:tony Points:>:3`
 */
export const ComplexQuery: Story = {
  args: {
    fields,
    filters: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Combine multiple filters with different operators: text search, select matching, negative filters, and comparisons.',
      },
    },
  },
};
