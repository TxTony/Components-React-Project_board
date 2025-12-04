# Filters System Documentation

## Overview

The Filters system in GitBoard Table provides a powerful way to filter table data using an intuitive inline syntax similar to search engines. Users can combine multiple filters with various operators to narrow down the displayed rows. The system supports both manual filter input and programmatic filter application through views.

## Core Concepts

### What is a Filter?

A **Filter** is a condition that determines which rows are visible in the table. Each filter consists of:
- **Field**: The column to filter on
- **Operator**: How to compare the value (equals, contains, greater than, etc.)
- **Value**: The value to compare against (optional for some operators)

### Filter Application

Filters are applied in the following order:
1. **Search Query**: Global text search (if provided)
2. **Filter Array**: All filters in the `filters` array are applied with AND logic
3. **Row Processing**: Only rows matching ALL filters are displayed

## Data Structure

### FilterConfig Interface

```typescript
interface FilterConfig {
  field: string;                  // Field ID (e.g., "fld_status")
  operator: FilterOperator;       // Comparison operator
  value?: any;                    // Filter value (optional for is-empty/is-not-empty)
}

type FilterOperator =
  | 'contains'      // Text contains value (case-insensitive)
  | 'equals'        // Exact match
  | 'not-equals'    // Does not equal
  | 'is-empty'      // Field has no value
  | 'is-not-empty'  // Field has a value
  | 'gt'            // Greater than (numbers/dates)
  | 'gte'           // Greater than or equal
  | 'lt'            // Less than
  | 'lte';          // Less than or equal
```

## Filter Syntax

### Inline Filter Format

The FilterBar accepts an inline filter syntax in the format:

```
field:operator:value
```

**Examples:**
```
status:equals:done
title:contains:login
points:>:5
assignee:is-not-empty
```

### Operator Aliases

The system supports multiple aliases for operators to improve user experience:

| Operator | Aliases | Example |
|----------|---------|---------|
| `contains` | `is` | `title:contains:login` or `title:is:login` |
| `equals` | `=` | `status:equals:done` or `status:=:done` |
| `not-equals` | `!=` | `status:not-equals:done` or `status:!=:done` |
| `gt` | `>` | `points:>:5` |
| `gte` | `>=` | `points:>=:5` |
| `lt` | `<` | `points:<:10` |
| `lte` | `<=` | `points:<=:10` |

### Multiple Filters

Combine multiple filters by separating them with spaces:

```
status:equals:done title:contains:login
```

This applies filters with AND logic (all conditions must match).

### Negative Filters

Use `-` prefix to exclude rows:

```
-status:equals:done
```

This shows all rows EXCEPT those with status "done".

### Quoted Values

Use quotes for values containing spaces:

```
title:"login page"
assignee:"John Smith"
```

## Mock Data Examples

### Example 1: Basic Filters

```typescript
const filters: FilterConfig[] = [
  {
    field: 'fld_status',
    operator: 'equals',
    value: 'opt_inprog',
  },
];

// Shows only rows where status equals "In Progress"
```

### Example 2: Multiple Filter Conditions

```typescript
const filters: FilterConfig[] = [
  {
    field: 'fld_status',
    operator: 'not-equals',
    value: 'opt_done',
  },
  {
    field: 'fld_assignee',
    operator: 'equals',
    value: 'user_alice',
  },
  {
    field: 'fld_priority',
    operator: 'equals',
    value: 'opt_high',
  },
];

// Shows Alice's high-priority tasks that are not done
```

### Example 3: Numeric Filters

```typescript
const filters: FilterConfig[] = [
  {
    field: 'fld_points',
    operator: 'gte',
    value: 5,
  },
  {
    field: 'fld_points',
    operator: 'lte',
    value: 10,
  },
];

// Shows rows where points are between 5 and 10 (inclusive)
```

### Example 4: Empty/Non-Empty Filters

```typescript
const filters: FilterConfig[] = [
  {
    field: 'fld_assignee',
    operator: 'is-empty',
    // No value needed for is-empty
  },
];

// Shows unassigned tasks
```

```typescript
const filters: FilterConfig[] = [
  {
    field: 'fld_due_date',
    operator: 'is-not-empty',
    // No value needed for is-not-empty
  },
];

// Shows tasks with a due date set
```

### Example 5: Text Search Filters

```typescript
const filters: FilterConfig[] = [
  {
    field: 'fld_title',
    operator: 'contains',
    value: 'login',
  },
];

// Shows rows where title contains "login" (case-insensitive)
```

### Example 6: Date Range Filters

```typescript
const filters: FilterConfig[] = [
  {
    field: 'fld_created_at',
    operator: 'gte',
    value: '2024-01-01',
  },
  {
    field: 'fld_created_at',
    operator: 'lt',
    value: '2024-02-01',
  },
];

// Shows rows created in January 2024
```

### Example 7: Multi-Select Filters

```typescript
const filters: FilterConfig[] = [
  {
    field: 'fld_tags',
    operator: 'contains',
    value: 'urgent',
  },
];

// For multi-select fields, shows rows where the array includes "urgent"
```

## Filter Processing Flow

### How Filters Are Applied

```
User types in FilterBar: "status:equals:done title:contains:login"
  ↓
FilterBar parses input and creates FilterConfig objects
  ↓
FilterBar emits onFiltersChange([
  { field: 'fld_status', operator: 'equals', value: 'done' },
  { field: 'fld_title', operator: 'contains', value: 'login' }
])
  ↓
GitBoardTable receives filters and sets internal state
  ↓
applyAllFilters() utility function processes each row:
  - Check if row matches filter 1 (status equals done)
  - Check if row matches filter 2 (title contains login)
  - Only include row if ALL filters match
  ↓
Filtered rows are rendered in table
  ↓
Stats shown: "Showing X of Y rows"
```

### Filter Matching Logic

For each row, the system:

1. **Retrieves field value** from `row.values[filter.field]`
2. **Applies operator logic**:
   - `equals`: Exact string match (case-insensitive for text)
   - `not-equals`: Not equal
   - `contains`: String includes substring (case-insensitive)
   - `is-empty`: Value is null, undefined, empty string, or empty array
   - `is-not-empty`: Value exists and is not empty
   - `gt/gte/lt/lte`: Numeric/date comparison
3. **Combines results**: Row must match ALL filters (AND logic)

## Events and Callbacks

The Filters system doesn't emit its own events directly, but works through the Views system and component state.

### Filter Changes via Views

When filters change and user clicks "Save":

```typescript
const handleUpdateView = (updatedView: ViewConfig) => {
  console.log('View updated with new filters:', updatedView.filters);

  // Example payload:
  // {
  //   id: 'view_in_progress',
  //   name: 'In Progress',
  //   columns: ['fld_title', 'fld_status'],
  //   filters: [
  //     { field: 'fld_status', operator: 'equals', value: 'opt_inprog' },
  //     { field: 'fld_assignee', operator: 'equals', value: 'user_alice' }
  //   ],
  //   sortBy: null,
  //   groupBy: null
  // }
};
```

### Programmatic Filter Application

Set filters directly via view's `filters` array:

```typescript
const myView: ViewConfig = {
  id: 'view_custom',
  name: 'Custom View',
  columns: ['fld_title', 'fld_status'],
  filters: [
    { field: 'fld_priority', operator: 'equals', value: 'opt_high' },
  ],
  sortBy: null,
  groupBy: null,
};

// When this view is applied, filters are automatically activated
```

## Complete Implementation Example

```typescript
import { useState, useEffect } from 'react';
import { GitBoardTable } from '@txtony/gitboard-table';
import type { ViewConfig, FieldDefinition, Row, FilterConfig } from '@txtony/gitboard-table';

function TaskBoard() {
  // Field definitions
  const fields: FieldDefinition[] = [
    {
      id: 'fld_title',
      name: 'Title',
      type: 'title',
      visible: true,
    },
    {
      id: 'fld_status',
      name: 'Status',
      type: 'single-select',
      visible: true,
      options: [
        { id: 'opt_todo', label: 'To Do', color: '#6b7280' },
        { id: 'opt_inprog', label: 'In Progress', color: '#3b82f6' },
        { id: 'opt_review', label: 'In Review', color: '#f59e0b' },
        { id: 'opt_done', label: 'Done', color: '#10b981' },
      ],
    },
    {
      id: 'fld_assignee',
      name: 'Assignee',
      type: 'assignee',
      visible: true,
      options: [
        { id: 'user_alice', label: 'Alice', color: '#8b5cf6' },
        { id: 'user_bob', label: 'Bob', color: '#f59e0b' },
        { id: 'user_charlie', label: 'Charlie', color: '#ef4444' },
      ],
    },
    {
      id: 'fld_priority',
      name: 'Priority',
      type: 'single-select',
      visible: true,
      options: [
        { id: 'opt_low', label: 'Low', color: '#6b7280' },
        { id: 'opt_medium', label: 'Medium', color: '#f59e0b' },
        { id: 'opt_high', label: 'High', color: '#ef4444' },
      ],
    },
    {
      id: 'fld_points',
      name: 'Story Points',
      type: 'number',
      visible: true,
    },
  ];

  // Sample data
  const initialRows: Row[] = [
    {
      id: 'row_1',
      values: {
        fld_title: 'Implement user authentication',
        fld_status: 'opt_inprog',
        fld_assignee: 'user_alice',
        fld_priority: 'opt_high',
        fld_points: 8,
      },
    },
    {
      id: 'row_2',
      values: {
        fld_title: 'Fix login page bug',
        fld_status: 'opt_todo',
        fld_assignee: 'user_bob',
        fld_priority: 'opt_high',
        fld_points: 3,
      },
    },
    {
      id: 'row_3',
      values: {
        fld_title: 'Update documentation',
        fld_status: 'opt_done',
        fld_assignee: 'user_alice',
        fld_priority: 'opt_low',
        fld_points: 2,
      },
    },
    {
      id: 'row_4',
      values: {
        fld_title: 'Review pull requests',
        fld_status: 'opt_review',
        fld_assignee: 'user_charlie',
        fld_priority: 'opt_medium',
        fld_points: 5,
      },
    },
    {
      id: 'row_5',
      values: {
        fld_title: 'Design new landing page',
        fld_status: 'opt_todo',
        // No assignee
        fld_priority: 'opt_medium',
        fld_points: 13,
      },
    },
  ];

  // Pre-defined views with filters
  const initialViews: ViewConfig[] = [
    {
      id: 'view_all',
      name: 'All Tasks',
      columns: ['fld_title', 'fld_status', 'fld_assignee', 'fld_priority', 'fld_points'],
      filters: [],
      sortBy: null,
      groupBy: null,
    },
    {
      id: 'view_in_progress',
      name: 'In Progress',
      columns: ['fld_title', 'fld_assignee', 'fld_points'],
      filters: [
        { field: 'fld_status', operator: 'equals', value: 'opt_inprog' },
      ],
      sortBy: null,
      groupBy: null,
    },
    {
      id: 'view_high_priority',
      name: 'High Priority',
      columns: ['fld_title', 'fld_status', 'fld_assignee'],
      filters: [
        { field: 'fld_priority', operator: 'equals', value: 'opt_high' },
        { field: 'fld_status', operator: 'not-equals', value: 'opt_done' },
      ],
      sortBy: { field: 'fld_points', direction: 'desc' },
      groupBy: null,
    },
    {
      id: 'view_unassigned',
      name: 'Unassigned',
      columns: ['fld_title', 'fld_priority', 'fld_points'],
      filters: [
        { field: 'fld_assignee', operator: 'is-empty' },
      ],
      sortBy: { field: 'fld_priority', direction: 'desc' },
      groupBy: null,
    },
    {
      id: 'view_alice_tasks',
      name: 'Alice\'s Tasks',
      columns: ['fld_title', 'fld_status', 'fld_points'],
      filters: [
        { field: 'fld_assignee', operator: 'equals', value: 'user_alice' },
        { field: 'fld_status', operator: 'not-equals', value: 'opt_done' },
      ],
      sortBy: { field: 'fld_priority', direction: 'desc' },
      groupBy: null,
    },
    {
      id: 'view_large_tasks',
      name: 'Large Tasks (8+ points)',
      columns: ['fld_title', 'fld_assignee', 'fld_points'],
      filters: [
        { field: 'fld_points', operator: 'gte', value: 8 },
      ],
      sortBy: { field: 'fld_points', direction: 'desc' },
      groupBy: null,
    },
  ];

  const [rows, setRows] = useState<Row[]>(initialRows);
  const [views, setViews] = useState<ViewConfig[]>(initialViews);

  const handleUpdateView = (updatedView: ViewConfig) => {
    console.log('📊 View filters updated:', {
      viewName: updatedView.name,
      filterCount: updatedView.filters.length,
      filters: updatedView.filters.map(f => ({
        field: fields.find(field => field.id === f.field)?.name,
        operator: f.operator,
        value: f.value,
      })),
    });

    // Update view in state
    setViews(prev => prev.map(v =>
      v.id === updatedView.id ? updatedView : v
    ));

    // Save to backend
    saveViewToBackend(updatedView);
  };

  const handleViewChange = (view: ViewConfig) => {
    console.log('🔍 View changed:', {
      name: view.name,
      activeFilters: view.filters.length,
    });

    if (view.filters.length > 0) {
      console.log('Active filters:');
      view.filters.forEach(filter => {
        const field = fields.find(f => f.id === filter.field);
        console.log(`  - ${field?.name} ${filter.operator} ${filter.value || '(empty)'}`);
      });
    }
  };

  const saveViewToBackend = async (view: ViewConfig) => {
    try {
      await fetch(`/api/views/${view.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(view),
      });
      console.log('✅ View saved to backend');
    } catch (error) {
      console.error('❌ Failed to save view:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Task Board with Filters</h1>

      <GitBoardTable
        fields={fields}
        rows={rows}
        views={views}
        onChange={setRows}
        onViewChange={handleViewChange}
        onUpdateView={handleUpdateView}
        theme="light"
      />
    </div>
  );
}

export default TaskBoard;
```

## Filter Operators Deep Dive

### Text Operators

#### contains (alias: is)

**Use Case**: Find rows where text field includes a substring

**Example**:
```typescript
{ field: 'fld_title', operator: 'contains', value: 'login' }
```

**Matches**:
- "User login page"
- "Fix login bug"
- "Login authentication"

**Does Not Match**:
- "User authentication"
- "Sign in page"

**Notes**: Case-insensitive, works on text fields

---

#### equals (alias: =)

**Use Case**: Exact match for select fields or text

**Example**:
```typescript
{ field: 'fld_status', operator: 'equals', value: 'opt_done' }
```

**Matches**:
- Status is exactly "Done" (opt_done)

**Does Not Match**:
- Any other status value

**Notes**: For select fields, compare option IDs. For text, case-insensitive exact match.

---

#### not-equals (alias: !=)

**Use Case**: Exclude specific values

**Example**:
```typescript
{ field: 'fld_status', operator: 'not-equals', value: 'opt_done' }
```

**Matches**:
- Status is "To Do", "In Progress", or any value except "Done"

**Does Not Match**:
- Status is "Done"

---

### Empty/Existence Operators

#### is-empty

**Use Case**: Find rows with no value in a field

**Example**:
```typescript
{ field: 'fld_assignee', operator: 'is-empty' }
// No value property needed
```

**Matches**:
- Assignee is null
- Assignee is undefined
- Assignee is empty string ""
- Assignee is empty array []

**Does Not Match**:
- Assignee has any value

---

#### is-not-empty

**Use Case**: Find rows with a value in a field

**Example**:
```typescript
{ field: 'fld_due_date', operator: 'is-not-empty' }
// No value property needed
```

**Matches**:
- Due date has any value

**Does Not Match**:
- Due date is null, undefined, "", or []

---

### Numeric/Date Comparison Operators

#### gt (alias: >)

**Use Case**: Greater than comparison

**Example**:
```typescript
{ field: 'fld_points', operator: 'gt', value: 5 }
```

**Matches**: Points > 5 (6, 7, 8, ...)

**Does Not Match**: Points ≤ 5 (5, 4, 3, ...)

---

#### gte (alias: >=)

**Use Case**: Greater than or equal

**Example**:
```typescript
{ field: 'fld_points', operator: 'gte', value: 5 }
```

**Matches**: Points ≥ 5 (5, 6, 7, ...)

**Does Not Match**: Points < 5 (4, 3, 2, ...)

---

#### lt (alias: <)

**Use Case**: Less than comparison

**Example**:
```typescript
{ field: 'fld_points', operator: 'lt', value: 10 }
```

**Matches**: Points < 10 (9, 8, 7, ...)

**Does Not Match**: Points ≥ 10 (10, 11, 12, ...)

---

#### lte (alias: <=)

**Use Case**: Less than or equal

**Example**:
```typescript
{ field: 'fld_points', operator: 'lte', value: 10 }
```

**Matches**: Points ≤ 10 (10, 9, 8, ...)

**Does Not Match**: Points > 10 (11, 12, 13, ...)

---

### Date Filtering Examples

```typescript
// Tasks created this year
const filters: FilterConfig[] = [
  { field: 'fld_created_at', operator: 'gte', value: '2024-01-01' },
];

// Tasks due before today
const filters: FilterConfig[] = [
  { field: 'fld_due_date', operator: 'lt', value: new Date().toISOString() },
];

// Tasks due in the next 7 days
const filters: FilterConfig[] = [
  { field: 'fld_due_date', operator: 'gte', value: new Date().toISOString() },
  { field: 'fld_due_date', operator: 'lte', value: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
];
```

## Common Filter Patterns

### Pattern 1: Active Tasks Only

```typescript
const activeTasksFilters: FilterConfig[] = [
  { field: 'fld_status', operator: 'not-equals', value: 'opt_done' },
  { field: 'fld_status', operator: 'not-equals', value: 'opt_archived' },
];
```

### Pattern 2: My Overdue High-Priority Tasks

```typescript
const myOverdueHighPriorityFilters: FilterConfig[] = [
  { field: 'fld_assignee', operator: 'equals', value: currentUserId },
  { field: 'fld_priority', operator: 'equals', value: 'opt_high' },
  { field: 'fld_due_date', operator: 'lt', value: new Date().toISOString() },
  { field: 'fld_status', operator: 'not-equals', value: 'opt_done' },
];
```

### Pattern 3: Unassigned Tasks by Priority

```typescript
const unassignedByPriorityFilters: FilterConfig[] = [
  { field: 'fld_assignee', operator: 'is-empty' },
];

// View configuration with sorting
const unassignedView: ViewConfig = {
  id: 'view_unassigned',
  name: 'Unassigned',
  columns: ['fld_title', 'fld_priority', 'fld_points'],
  filters: unassignedByPriorityFilters,
  sortBy: { field: 'fld_priority', direction: 'desc' },
  groupBy: null,
};
```

### Pattern 4: Story Points Range

```typescript
const mediumSizedTasksFilters: FilterConfig[] = [
  { field: 'fld_points', operator: 'gte', value: 3 },
  { field: 'fld_points', operator: 'lte', value: 8 },
];
```

### Pattern 5: Multiple Assignees (OR Logic)

Note: The current system uses AND logic. For OR logic, create separate views:

```typescript
// View 1: Alice's tasks
const aliceView: ViewConfig = {
  id: 'view_alice',
  name: 'Alice\'s Tasks',
  columns: ['fld_title', 'fld_status'],
  filters: [
    { field: 'fld_assignee', operator: 'equals', value: 'user_alice' },
  ],
  sortBy: null,
  groupBy: null,
};

// View 2: Bob's tasks
const bobView: ViewConfig = {
  id: 'view_bob',
  name: 'Bob\'s Tasks',
  columns: ['fld_title', 'fld_status'],
  filters: [
    { field: 'fld_assignee', operator: 'equals', value: 'user_bob' },
  ],
  sortBy: null,
  groupBy: null,
};
```

### Pattern 6: Search + Filter Combination

Users can combine inline search with filters:

```
title:contains:login status:equals:done
```

This creates:
```typescript
const filters: FilterConfig[] = [
  { field: 'fld_title', operator: 'contains', value: 'login' },
  { field: 'fld_status', operator: 'equals', value: 'done' },
];
```

## Filter Statistics

The component automatically shows filter statistics:

```typescript
// When filters are active
"Showing 5 of 20 rows"

// When no filters are active
// Stats are hidden
```

This helps users understand how many rows match their filter criteria.

## Programmatic Filter Manipulation

### Dynamic Filter Creation

```typescript
// Create filters based on user role
const createFiltersForUser = (userId: string, role: string): FilterConfig[] => {
  const filters: FilterConfig[] = [];

  if (role === 'viewer') {
    // Viewers only see completed tasks
    filters.push({
      field: 'fld_status',
      operator: 'equals',
      value: 'opt_done',
    });
  }

  if (role === 'contributor') {
    // Contributors see their assigned tasks
    filters.push({
      field: 'fld_assignee',
      operator: 'equals',
      value: userId,
    });
    filters.push({
      field: 'fld_status',
      operator: 'not-equals',
      value: 'opt_done',
    });
  }

  // Admins get no filters (see everything)

  return filters;
};

// Usage
const userFilters = createFiltersForUser('user_123', 'contributor');
const userView: ViewConfig = {
  id: 'view_user',
  name: 'My Tasks',
  columns: ['fld_title', 'fld_status', 'fld_priority'],
  filters: userFilters,
  sortBy: null,
  groupBy: null,
};
```

### Filter Validation

```typescript
const validateFilter = (filter: FilterConfig, fields: FieldDefinition[]): boolean => {
  // Check if field exists
  const field = fields.find(f => f.id === filter.field);
  if (!field) {
    console.error(`Field ${filter.field} not found`);
    return false;
  }

  // Check if operator is valid for field type
  const numericOperators = ['gt', 'gte', 'lt', 'lte'];
  if (numericOperators.includes(filter.operator)) {
    if (field.type !== 'number' && field.type !== 'date') {
      console.error(`Operator ${filter.operator} not valid for field type ${field.type}`);
      return false;
    }
  }

  // Check if value is provided for operators that need it
  const operatorsNeedingValue = ['contains', 'equals', 'not-equals', 'gt', 'gte', 'lt', 'lte'];
  if (operatorsNeedingValue.includes(filter.operator)) {
    if (filter.value === undefined || filter.value === null) {
      console.error(`Operator ${filter.operator} requires a value`);
      return false;
    }
  }

  return true;
};
```

## Testing Filters

### Unit Test Example

```typescript
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GitBoardTable } from '@txtony/gitboard-table';

test('applies filter and shows filtered rows', async () => {
  const user = userEvent.setup();

  const fields = [
    { id: 'fld_title', name: 'Title', type: 'text', visible: true },
    {
      id: 'fld_status',
      name: 'Status',
      type: 'single-select',
      visible: true,
      options: [
        { id: 'opt_todo', label: 'To Do' },
        { id: 'opt_done', label: 'Done' },
      ],
    },
  ];

  const rows = [
    { id: 'row_1', values: { fld_title: 'Task 1', fld_status: 'opt_todo' } },
    { id: 'row_2', values: { fld_title: 'Task 2', fld_status: 'opt_done' } },
    { id: 'row_3', values: { fld_title: 'Task 3', fld_status: 'opt_todo' } },
  ];

  const views = [
    {
      id: 'view_all',
      name: 'All',
      columns: ['fld_title', 'fld_status'],
      filters: [],
      sortBy: null,
      groupBy: null,
    },
    {
      id: 'view_done',
      name: 'Done',
      columns: ['fld_title', 'fld_status'],
      filters: [{ field: 'fld_status', operator: 'equals', value: 'opt_done' }],
      sortBy: null,
      groupBy: null,
    },
  ];

  render(
    <GitBoardTable
      fields={fields}
      rows={rows}
      views={views}
    />
  );

  // Initially all rows visible
  expect(screen.getByText('Task 1')).toBeInTheDocument();
  expect(screen.getByText('Task 2')).toBeInTheDocument();
  expect(screen.getByText('Task 3')).toBeInTheDocument();

  // Switch to "Done" view
  const doneTab = screen.getByRole('tab', { name: /Done/i });
  await user.click(doneTab);

  // Only Task 2 should be visible
  expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
  expect(screen.getByText('Task 2')).toBeInTheDocument();
  expect(screen.queryByText('Task 3')).not.toBeInTheDocument();

  // Filter stats should show "Showing 1 of 3 rows"
  expect(screen.getByText(/Showing 1 of 3 rows/i)).toBeInTheDocument();
});
```

### Integration Test with FilterBar

```typescript
test('user can type filter in FilterBar', async () => {
  const user = userEvent.setup();

  render(
    <GitBoardTable
      fields={fields}
      rows={rows}
      views={views}
    />
  );

  // Find the filter input
  const filterInput = screen.getByLabelText(/filter input/i);

  // Type a filter
  await user.type(filterInput, 'status:equals:done');
  await user.keyboard('{Enter}');

  // Rows should be filtered
  expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
  expect(screen.getByText('Task 2')).toBeInTheDocument();
});
```

## Troubleshooting

### Issue: Filters not being applied

**Symptoms**: All rows still visible despite filter being set

**Solution**: Ensure field IDs match exactly:

```typescript
// ❌ Wrong - mismatched field ID
const filters: FilterConfig[] = [
  { field: 'status', operator: 'equals', value: 'done' },
  // Field ID is 'fld_status', not 'status'
];

// ✅ Correct - matching field ID
const filters: FilterConfig[] = [
  { field: 'fld_status', operator: 'equals', value: 'opt_done' },
];
```

### Issue: Option values not matching

**Symptoms**: Filter doesn't match any rows

**Solution**: Use option IDs, not labels:

```typescript
// ❌ Wrong - using label
{ field: 'fld_status', operator: 'equals', value: 'Done' }

// ✅ Correct - using option ID
{ field: 'fld_status', operator: 'equals', value: 'opt_done' }
```

### Issue: Numeric comparison not working

**Symptoms**: Numeric filter returns unexpected results

**Solution**: Ensure value is a number, not a string:

```typescript
// ❌ Wrong - string value
{ field: 'fld_points', operator: 'gt', value: '5' }

// ✅ Correct - numeric value
{ field: 'fld_points', operator: 'gt', value: 5 }
```

### Issue: Multi-select filter not working

**Symptoms**: Filter on multi-select field doesn't match

**Solution**: Use 'contains' operator for arrays:

```typescript
// ❌ Wrong - equals won't work for arrays
{ field: 'fld_tags', operator: 'equals', value: 'urgent' }

// ✅ Correct - contains checks if array includes value
{ field: 'fld_tags', operator: 'contains', value: 'urgent' }
```

### Issue: Date comparison not working

**Symptoms**: Date filter doesn't match expected rows

**Solution**: Use ISO date strings:

```typescript
// ❌ Wrong - invalid date format
{ field: 'fld_due_date', operator: 'gt', value: '01/15/2024' }

// ✅ Correct - ISO format
{ field: 'fld_due_date', operator: 'gt', value: '2024-01-15' }
```

## Filter Limitations

### Current Limitations

1. **AND Logic Only**: All filters use AND logic. No OR logic between filters.
   - Workaround: Create separate views for different OR conditions

2. **No Nested Conditions**: Cannot create complex conditions like `(A AND B) OR (C AND D)`
   - Workaround: Create multiple views

3. **No Regex Support**: The 'contains' operator is simple substring match
   - Workaround: Use multiple filters or pre-process data

4. **No Cross-Field Filters**: Cannot filter where `field_a > field_b`
   - Workaround: Pre-compute comparison in data

## Summary for AI Agents

When implementing filters:

1. **Data Structure**: FilterConfig has `field` (ID), `operator`, and optional `value`
2. **Operators**: 9 operators covering text, numeric, date, and empty checks
3. **Inline Syntax**: `field:operator:value` format in FilterBar
4. **AND Logic**: All filters must match (no OR support currently)
5. **Field IDs**: Always use field IDs, never field names
6. **Option IDs**: For select fields, use option IDs, not labels
7. **Type Safety**: Numeric operators need numeric values, not strings
8. **Auto-Stats**: Component shows "Showing X of Y rows" automatically
9. **View Integration**: Filters are part of ViewConfig for persistence
10. **Testing**: Test filter application, stats display, and edge cases

The Filters system provides comprehensive filtering capabilities with an intuitive inline syntax and programmatic control through views.
