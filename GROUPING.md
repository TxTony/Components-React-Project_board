# Grouping System Documentation

## Overview

The Grouping system in GitBoard Table allows users to organize rows into collapsible groups based on field values. This provides a GitHub Projects-like experience where data can be organized by status, assignee, priority, or any other field. Grouping is fully integrated with the Views system, allowing each view to have its own grouping configuration.

## Core Concepts

### What is Grouping?

**Grouping** organizes table rows into collapsible sections based on a selected field's values:
- Groups rows by a specific field (e.g., Status, Assignee, Priority)
- Each group displays a header with the field value and row count
- Groups can be expanded or collapsed independently
- Empty/null values are grouped as "No [FieldName]"
- Groups are sorted alphabetically with empty group appearing last
- **Grouping is saved per-view** - each view remembers its grouping configuration

### How Grouping Works with Views

When grouping is enabled:
1. User selects a field to group by from the GroupByMenu dropdown
2. The current view's `groupBy` property is updated with the field ID
3. Table rows are organized into groups based on field values
4. Each group can be collapsed/expanded independently
5. When switching views, the grouping configuration is restored from the view's `groupBy` property

**Key Behavior**: Grouping is **view-specific**:
- View A can group by "Status"
- View B can group by "Assignee"
- View C can have no grouping
- Switching between views automatically applies the correct grouping

## Data Structure

### RowGroup Interface

```typescript
interface RowGroup {
  id: string;              // Unique group identifier (e.g., "status_todo")
  label: string;           // Display label (e.g., "To Do" or "No Status")
  value: CellValue;        // Original field value (e.g., "opt_todo" or null)
  rows: Row[];             // Array of rows in this group
  count: number;           // Number of rows in group
}
```

### ViewConfig with GroupBy

```typescript
interface ViewConfig {
  id: string;                     // Unique identifier
  name: string;                   // Display name
  columns: string[];              // Visible field IDs
  sortBy: SortConfig | null;      // Sort configuration
  filters: FilterConfig[];        // Active filters
  groupBy: string | null;         // Field ID to group by (e.g., "fld_status")
}
```

### CellValue Type

```typescript
type CellValue =
  | string
  | number
  | string[]
  | null
  | undefined;
```

## Supported Field Types for Grouping

The following field types can be used for grouping:

| Field Type | Behavior | Example |
|-----------|----------|---------|
| `single-select` | Groups by option ID, displays option label | Status: "To Do", "In Progress", "Done" |
| `multi-select` | Groups by joined option labels (comma-separated) | Tags: "bug, urgent", "feature", etc. |
| `text` | Groups by exact text value | Assignee: "Alice", "Bob", etc. |
| `title` | Groups by exact title value | Category: "Frontend", "Backend", etc. |
| `assignee` | Groups by assignee option ID, displays assignee label | Assigned to: "Alice", "Bob", etc. |
| `iteration` | Groups by iteration option ID, displays iteration label | Sprint: "Sprint 1", "Sprint 2", etc. |

**Not supported**: `number`, `date` fields (these would create too many groups)

## Grouping Utilities

### groupRows Function

Located in `src/utils/grouping.ts`

```typescript
function groupRows(
  rows: Row[],
  groupByFieldId: string | null,
  fields: FieldDefinition[]
): RowGroup[]
```

**Purpose**: Organizes rows into groups based on a field's values

**Parameters**:
- `rows`: Array of table rows to group
- `groupByFieldId`: Field ID to group by (e.g., "fld_status"), or `null` for no grouping
- `fields`: Array of field definitions (needed to resolve option labels)

**Returns**: Array of `RowGroup` objects, sorted alphabetically (empty group last)

**Example Usage**:
```typescript
import { groupRows } from '@txtony/gitboard-table';

const rows = [
  { id: 'row_1', values: { fld_status: 'opt_todo', fld_title: 'Task 1' } },
  { id: 'row_2', values: { fld_status: 'opt_inprog', fld_title: 'Task 2' } },
  { id: 'row_3', values: { fld_status: 'opt_todo', fld_title: 'Task 3' } },
  { id: 'row_4', values: { fld_status: null, fld_title: 'Task 4' } },
];

const fields = [
  {
    id: 'fld_status',
    name: 'Status',
    type: 'single-select',
    options: [
      { id: 'opt_todo', label: 'To Do', color: 'gray' },
      { id: 'opt_inprog', label: 'In Progress', color: 'blue' },
    ],
  },
];

const groups = groupRows(rows, 'fld_status', fields);

// Result:
// [
//   {
//     id: 'opt_inprog',
//     label: 'In Progress',
//     value: 'opt_inprog',
//     rows: [{ id: 'row_2', ... }],
//     count: 1
//   },
//   {
//     id: 'opt_todo',
//     label: 'To Do',
//     value: 'opt_todo',
//     rows: [{ id: 'row_1', ... }, { id: 'row_3', ... }],
//     count: 2
//   },
//   {
//     id: 'empty',
//     label: 'No Status',
//     value: null,
//     rows: [{ id: 'row_4', ... }],
//     count: 1
//   }
// ]
```

**Special Handling**:
- **Empty values**: Rows with `null` or `undefined` field values are grouped as "No [FieldName]"
- **Multi-select fields**: Values are joined with ", " (e.g., ["bug", "urgent"] → "bug, urgent")
- **Option resolution**: For select fields, option IDs are resolved to their labels
- **Alphabetical sorting**: Groups are sorted by label (A-Z), with empty group last

### getUniqueFieldValues Function

Located in `src/utils/grouping.ts`

```typescript
function getUniqueFieldValues(
  rows: Row[],
  fieldId: string,
  field: FieldDefinition
): Array<{ value: CellValue; label: string; count: number }>
```

**Purpose**: Extract unique values from a field across all rows with counts

**Parameters**:
- `rows`: Array of table rows
- `fieldId`: Field ID to extract values from
- `field`: Field definition (for option label resolution)

**Returns**: Array of unique values with labels and counts

**Example Usage**:
```typescript
import { getUniqueFieldValues } from '@txtony/gitboard-table';

const rows = [
  { id: 'row_1', values: { fld_priority: 'opt_high' } },
  { id: 'row_2', values: { fld_priority: 'opt_low' } },
  { id: 'row_3', values: { fld_priority: 'opt_high' } },
  { id: 'row_4', values: { fld_priority: null } },
];

const field = {
  id: 'fld_priority',
  name: 'Priority',
  type: 'single-select',
  options: [
    { id: 'opt_high', label: 'High', color: 'red' },
    { id: 'opt_low', label: 'Low', color: 'gray' },
  ],
};

const uniqueValues = getUniqueFieldValues(rows, 'fld_priority', field);

// Result:
// [
//   { value: 'opt_high', label: 'High', count: 2 },
//   { value: 'opt_low', label: 'Low', count: 1 },
//   { value: null, label: 'No Priority', count: 1 }
// ]
```

## Components

### GroupByMenu Component

Located in `src/components/Toolbar/GroupByMenu.tsx`

**Purpose**: Dropdown menu for selecting which field to group by

**Props**:
```typescript
interface GroupByMenuProps {
  fields: FieldDefinition[];           // All field definitions
  currentGroupBy: string | null;       // Currently selected field ID
  onGroupByChange: (fieldId: string | null) => void;  // Callback when grouping changes
}
```

**Features**:
- Displays list of groupable fields (single-select, multi-select, text, title, assignee, iteration)
- Shows "No grouping" option to disable grouping
- Indicates active grouping with checkmark
- Click outside to close behavior

**Example Usage**:
```typescript
import { GroupByMenu } from '@txtony/gitboard-table';

<GroupByMenu
  fields={fields}
  currentGroupBy={groupBy}
  onGroupByChange={(fieldId) => {
    setGroupBy(fieldId);
    // Optionally update current view
    if (currentView && onUpdateView) {
      onUpdateView({ ...currentView, groupBy: fieldId });
    }
  }}
/>
```

### GroupedTableBody Component

Located in `src/components/Table/GroupedTableBody.tsx`

**Purpose**: Renders table rows organized into collapsible groups

**Props**:
```typescript
interface GroupedTableBodyProps {
  fields: FieldDefinition[];
  groups: RowGroup[];                  // Array of row groups
  onEdit?: (edit: CellEditEvent) => void;
  showSelection?: boolean;
  selectedRows?: Set<string>;
  onSelectRow?: (rowId: string, selected: boolean) => void;
  selectedCell?: { rowId: string; fieldId: string } | null;
  onSelectCell?: (rowId: string, fieldId: string) => void;
  onAddItem?: (title: string) => void;
  onBulkUpdate?: (event: BulkUpdateEvent) => void;
  onRowReorder?: (fromIndex: number, toIndex: number) => void;
  onTitleClick?: (rowId: string) => void;
  onRowNumberDoubleClick?: (rowId: string) => void;

  // Infinite scroll props
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  loadingMessage?: string;
}
```

**Features**:
- Renders group headers with toggle buttons, labels, and counts
- Each group can be collapsed/expanded independently
- Supports all table features (editing, selection, drag-fill, row reordering)
- Supports infinite scroll for loading more rows
- Maintains group collapse state independently

**Internal State**:
```typescript
const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
```

**Example Rendered Structure**:
```html
<tbody class="gitboard-table__tbody gitboard-table__tbody--grouped">
  <!-- Group 1: In Progress (2 items) -->
  <tr class="gitboard-table__group-header">
    <td colspan="5">
      <button>▼</button>
      <h3>In Progress</h3>
      <span>2</span>
    </td>
  </tr>
  <tr><!-- Row 1 --></tr>
  <tr><!-- Row 2 --></tr>

  <!-- Group 2: To Do (3 items) -->
  <tr class="gitboard-table__group-header">
    <td colspan="5">
      <button>▼</button>
      <h3>To Do</h3>
      <span>3</span>
    </td>
  </tr>
  <tr><!-- Row 3 --></tr>
  <tr><!-- Row 4 --></tr>
  <tr><!-- Row 5 --></tr>
</tbody>
```

## Integration with GitBoardTable

The main `GitBoardTable` component handles grouping automatically:

```typescript
// In GitBoardTable.tsx
const [groupBy, setGroupBy] = useState<string | null>(null);

// Group rows after filtering and (conditional) sorting
const groupedRows = useMemo(() => {
  if (!groupBy) return [];
  return groupRows(processedRows, groupBy, fields);
}, [processedRows, groupBy, fields]);

// Render appropriate table body
{groupBy ? (
  <GroupedTableBody
    groups={groupedRows}
    fields={orderedFields}
    // ... other props
  />
) : (
  <TableBody
    rows={processedRows}
    fields={orderedFields}
    // ... other props
  />
)}
```

**Important**: When grouping is active, sorting is **disabled** to prevent conflicts between group order and sort order.

## View Integration Examples

### Example 1: Views with Different Grouping

```typescript
const views: ViewConfig[] = [
  {
    id: 'view_all',
    name: 'All Tasks',
    columns: ['fld_title', 'fld_status', 'fld_assignee', 'fld_priority'],
    filters: [],
    sortBy: { field: 'fld_title', direction: 'asc' },
    groupBy: null,  // No grouping
  },
  {
    id: 'view_by_status',
    name: 'By Status',
    columns: ['fld_title', 'fld_assignee', 'fld_priority'],
    filters: [],
    sortBy: null,  // Sorting disabled when grouped
    groupBy: 'fld_status',  // Group by Status field
  },
  {
    id: 'view_by_assignee',
    name: 'By Assignee',
    columns: ['fld_title', 'fld_status', 'fld_priority'],
    filters: [],
    sortBy: null,
    groupBy: 'fld_assignee',  // Group by Assignee field
  },
  {
    id: 'view_high_priority',
    name: 'High Priority by Status',
    columns: ['fld_title', 'fld_assignee'],
    filters: [
      { field: 'fld_priority', operator: 'equals', value: 'opt_high' }
    ],
    sortBy: null,
    groupBy: 'fld_status',  // Filtered AND grouped
  },
];
```

**Behavior**:
- Switching to "All Tasks" → No grouping, rows sorted by title
- Switching to "By Status" → Rows grouped by status (To Do, In Progress, Done)
- Switching to "By Assignee" → Rows grouped by assignee (Alice, Bob, etc.)
- Switching to "High Priority by Status" → Shows only high priority rows, grouped by status

### Example 2: Updating View Grouping

```typescript
function MyApp() {
  const [views, setViews] = useState<ViewConfig[]>(initialViews);
  const [currentView, setCurrentView] = useState<ViewConfig | null>(views[0]);

  const handleGroupByChange = (fieldId: string | null) => {
    if (!currentView) return;

    // Create updated view with new groupBy
    const updatedView: ViewConfig = {
      ...currentView,
      groupBy: fieldId,
      sortBy: fieldId ? null : currentView.sortBy,  // Disable sorting when grouping
    };

    // Update views array
    setViews(prev => prev.map(v =>
      v.id === updatedView.id ? updatedView : v
    ));

    // Update current view
    setCurrentView(updatedView);

    // Optionally save to backend
    // await api.views.update(updatedView.id, updatedView);
  };

  return (
    <GitBoardTable
      fields={fields}
      rows={rows}
      views={views}
      initialView={currentView}
      onUpdateView={(updatedView) => {
        setViews(prev => prev.map(v =>
          v.id === updatedView.id ? updatedView : v
        ));
        // Save to backend
      }}
    />
  );
}
```

## State Persistence

Grouping state is persisted in two ways:

### 1. View-Level Persistence

The `groupBy` field is part of the `ViewConfig` object, so it's automatically persisted with views:

```typescript
// In src/utils/persistence.ts
export interface TableState {
  fieldOrder?: string[];
  sortConfig?: SortConfig | null;
  filters?: FilterConfig[];
  groupBy?: string | null;  // Persisted with view
  columnWidths?: Record<string, number>;
  fieldWidths?: Record<string, number>;
  hiddenColumns?: string[];
}

// Save to localStorage
export function saveTableState(tableId: string, state: TableState): void {
  const key = `gitboard-table-${tableId}`;
  localStorage.setItem(key, JSON.stringify(state));
}

// Load from localStorage
export function loadTableState(tableId: string): TableState | null {
  const key = `gitboard-table-${tableId}`;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : null;
}
```

### 2. Group Collapse State (Component-Level)

Each group's collapsed/expanded state is maintained in component state (not persisted):

```typescript
// In GroupedTableBody.tsx
const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

const toggleGroupCollapse = (groupId: string) => {
  setCollapsedGroups((prev) => {
    const newSet = new Set(prev);
    if (newSet.has(groupId)) {
      newSet.delete(groupId);  // Expand
    } else {
      newSet.add(groupId);     // Collapse
    }
    return newSet;
  });
};
```

**Design Decision**: Group collapse state is **not persisted** because:
- It's a temporary UI state for quick exploration
- Different users may want different collapse states
- Avoids complexity of tracking collapse state per view per user

## Interaction with Other Features

### Grouping + Filtering

Filtering is applied **before** grouping:

```typescript
// Processing order in GitBoardTable
const filteredRows = applyAllFilters(rows, filters, fields);
const sortedRows = groupBy ? filteredRows : sortRows(filteredRows, sortConfig);
const groupedRows = groupBy ? groupRows(sortedRows, groupBy, fields) : [];
```

**Example**:
```typescript
// View: "High Priority by Status"
filters: [{ field: 'fld_priority', operator: 'equals', value: 'opt_high' }]
groupBy: 'fld_status'

// Result:
// 1. Filter to only high priority rows (10 rows → 3 rows)
// 2. Group the 3 filtered rows by status
//    - To Do (1 row)
//    - In Progress (2 rows)
```

### Grouping + Sorting

When grouping is active, **sorting is disabled**:

```typescript
// In GitBoardTable
<TableHeader
  fields={orderedFields}
  sortConfig={groupBy ? null : sortConfig}  // Pass null when grouped
  onSort={groupBy ? undefined : handleSort}  // Disable sort handler when grouped
/>
```

**Why?** Sorting and grouping have conflicting goals:
- Grouping organizes by field values (alphabetically)
- Sorting organizes by different criteria
- Allowing both would be confusing

**Best Practice**: Use filtering instead of sorting when grouping is active.

### Grouping + Infinite Scroll

Grouping works seamlessly with infinite scroll:

```typescript
<GroupedTableBody
  groups={groupedRows}
  hasMore={hasMore}
  isLoadingMore={isLoadingMore}
  onLoadMore={handleLoadMore}
  loadingMessage="Loading more tasks..."
/>
```

**Behavior**:
1. Initial batch of rows (e.g., 200) is loaded and grouped
2. User scrolls to bottom of last group
3. `onLoadMore` callback fires
4. New rows are appended to `rows` array
5. Groups are recalculated with new rows
6. New rows appear in their respective groups

**Example Flow**:
```
Initial load: 200 rows
  - Group "To Do": 80 rows
  - Group "In Progress": 70 rows
  - Group "Done": 50 rows

User scrolls to bottom → Load more

After loading 200 more rows: 400 total rows
  - Group "To Do": 150 rows (+70)
  - Group "In Progress": 140 rows (+70)
  - Group "Done": 110 rows (+60)
```

## CSS Styling

### Group Header Styles

Located in `src/styles/styles.css`:

```css
/* Group Header */
.gitboard-table__group-header {
  background-color: var(--gb-bg-default);
}

.gitboard-table__group-header:hover .gitboard-table__group-header-cell {
  background-color: var(--gb-bg-muted);
}

.gitboard-table__group-header-cell {
  padding: 0.75rem 1rem;
  background-color: var(--gb-bg-default);
  border: none;
  border-left: 1px solid var(--gb-border);
  border-right: 1px solid var(--gb-border);
  cursor: pointer;
}

/* Group Header Content */
.gitboard-table__group-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.gitboard-table__group-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Group Toggle Button */
.gitboard-table__group-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  background-color: transparent;
  border: none;
  border-radius: 4px;
  color: var(--gb-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.gitboard-table__group-toggle:hover {
  background-color: var(--gb-bg-subtle);
  color: var(--gb-text-primary);
}

.gitboard-table__group-toggle-icon {
  transition: transform 0.2s ease;
}

/* Rotates when collapsed */
/* Applied inline: transform: rotate(-90deg) when collapsed */

/* Group Label */
.gitboard-table__group-label {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--gb-text-primary);
}

/* Group Count Badge */
.gitboard-table__group-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 20px;
  padding: 0 6px;
  background-color: var(--gb-bg-muted);
  border-radius: 10px;
  color: var(--gb-text-secondary);
  font-size: 12px;
  font-weight: 500;
}
```

### Customizing Group Styles

To customize group appearance, override the CSS variables or classes:

```css
/* Custom group header background */
.gitboard-table__group-header {
  background-color: #f0f4f8;
}

/* Custom toggle button color */
.gitboard-table__group-toggle {
  color: #3b82f6;
}

/* Custom count badge */
.gitboard-table__group-count {
  background-color: #3b82f6;
  color: white;
}
```

## Testing Grouping

### Unit Test Example

Located in `tests/utils/grouping.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { groupRows, getUniqueFieldValues } from '../src/utils/grouping';

describe('groupRows', () => {
  it('groups rows by single-select field', () => {
    const rows = [
      { id: 'row_1', values: { fld_status: 'opt_todo' } },
      { id: 'row_2', values: { fld_status: 'opt_inprog' } },
      { id: 'row_3', values: { fld_status: 'opt_todo' } },
    ];

    const fields = [
      {
        id: 'fld_status',
        name: 'Status',
        type: 'single-select',
        options: [
          { id: 'opt_todo', label: 'To Do', color: 'gray' },
          { id: 'opt_inprog', label: 'In Progress', color: 'blue' },
        ],
      },
    ];

    const groups = groupRows(rows, 'fld_status', fields);

    expect(groups).toHaveLength(2);
    expect(groups[0].label).toBe('In Progress');
    expect(groups[0].rows).toHaveLength(1);
    expect(groups[1].label).toBe('To Do');
    expect(groups[1].rows).toHaveLength(2);
  });

  it('handles empty values as "No [FieldName]"', () => {
    const rows = [
      { id: 'row_1', values: { fld_status: 'opt_todo' } },
      { id: 'row_2', values: { fld_status: null } },
    ];

    const fields = [
      {
        id: 'fld_status',
        name: 'Status',
        type: 'single-select',
        options: [{ id: 'opt_todo', label: 'To Do', color: 'gray' }],
      },
    ];

    const groups = groupRows(rows, 'fld_status', fields);

    expect(groups).toHaveLength(2);
    expect(groups[0].label).toBe('To Do');
    expect(groups[1].label).toBe('No Status');
    expect(groups[1].value).toBeNull();
  });
});
```

## Common Patterns

### Pattern 1: Enable Grouping Programmatically

```typescript
// Enable grouping by status field
const enableStatusGrouping = () => {
  if (!currentView) return;

  const updatedView: ViewConfig = {
    ...currentView,
    groupBy: 'fld_status',
    sortBy: null,  // Disable sorting
  };

  setCurrentView(updatedView);
  onUpdateView?.(updatedView);
};
```

### Pattern 2: Toggle Grouping On/Off

```typescript
const toggleGrouping = (fieldId: string) => {
  if (!currentView) return;

  const newGroupBy = currentView.groupBy === fieldId ? null : fieldId;

  const updatedView: ViewConfig = {
    ...currentView,
    groupBy: newGroupBy,
    sortBy: newGroupBy ? null : currentView.sortBy,
  };

  setCurrentView(updatedView);
  onUpdateView?.(updatedView);
};
```

### Pattern 3: Create View with Grouping

```typescript
const createGroupedView = () => {
  const newView: ViewConfig = {
    id: generateRowId(),
    name: 'Tasks by Status',
    columns: visibleFieldIds,
    filters: [],
    sortBy: null,
    groupBy: 'fld_status',  // Pre-configured grouping
  };

  onCreateView?.(newView);
};
```

## Performance Considerations

### Grouping Performance

The `groupRows` function has **O(n)** time complexity:
- Single pass through all rows
- Hash map for O(1) group lookup
- Efficient for large datasets (tested with 10,000+ rows)

```typescript
// Simplified implementation
function groupRows(rows, groupByFieldId, fields) {
  const groupsMap = new Map();

  // O(n) - single pass
  for (const row of rows) {
    const value = row.values[groupByFieldId];
    const key = value ?? 'empty';

    if (!groupsMap.has(key)) {
      groupsMap.set(key, []);
    }
    groupsMap.get(key).push(row);
  }

  // O(g log g) where g = number of groups (typically small)
  return Array.from(groupsMap.entries())
    .map(([key, rows]) => ({ /* ... */ }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
```

### Optimization Tips

1. **Memoization**: `groupRows` is memoized in `GitBoardTable`:
```typescript
const groupedRows = useMemo(
  () => groupRows(processedRows, groupBy, fields),
  [processedRows, groupBy, fields]
);
```

2. **Avoid unnecessary re-grouping**: Only re-group when:
   - `groupBy` field changes
   - Filtered rows change
   - Field definitions change (option labels)

3. **Lazy rendering**: Use virtual scrolling for groups with many rows

## Troubleshooting

### Issue: Groups not appearing

**Solution**: Ensure field type is supported for grouping:
```typescript
// ✅ Supported
'single-select', 'multi-select', 'text', 'title', 'assignee', 'iteration'

// ❌ Not supported
'number', 'date'
```

### Issue: Group labels showing IDs instead of names

**Solution**: Ensure field has `options` array with labels:
```typescript
// ❌ Missing options
{
  id: 'fld_status',
  name: 'Status',
  type: 'single-select',
  options: [],  // Empty!
}

// ✅ With options
{
  id: 'fld_status',
  name: 'Status',
  type: 'single-select',
  options: [
    { id: 'opt_todo', label: 'To Do', color: 'gray' },
    { id: 'opt_done', label: 'Done', color: 'green' },
  ],
}
```

### Issue: Sorting still enabled when grouping

**Solution**: Ensure sorting is disabled in TableHeader:
```typescript
<TableHeader
  sortConfig={groupBy ? null : sortConfig}  // Pass null when grouped
  onSort={groupBy ? undefined : handleSort}  // Disable handler
/>
```

### Issue: Groups not persisting between view switches

**Solution**: Ensure `groupBy` is part of view state and `onUpdateView` is called:
```typescript
const handleGroupByChange = (fieldId: string | null) => {
  if (currentView && onUpdateView) {
    onUpdateView({ ...currentView, groupBy: fieldId });
  }
};
```

## Summary for AI Agents

**Key Implementation Points**:

1. **Grouping is view-specific**: Each view has its own `groupBy` configuration
2. **Grouping logic**: Use `groupRows(rows, groupByFieldId, fields)` from `src/utils/grouping.ts`
3. **Supported fields**: single-select, multi-select, text, title, assignee, iteration
4. **Empty values**: Handled as "No [FieldName]" group, always appears last
5. **Sorting**: Automatically disabled when grouping is active
6. **Component**: Use `GroupedTableBody` to render grouped rows
7. **UI Control**: Use `GroupByMenu` dropdown in toolbar
8. **State management**: `groupBy` is part of `ViewConfig` and persisted with views
9. **Processing order**: Filter → (Sort if not grouped) → Group
10. **Collapse state**: Maintained in component state, not persisted
11. **Integration**: Works with infinite scroll, filtering, row selection, editing
12. **Performance**: O(n) grouping algorithm, memoized in component

**Quick Start**:
```typescript
import { groupRows, GroupByMenu, GroupedTableBody } from '@txtony/gitboard-table';

// 1. Add groupBy to view
const view = {
  id: 'view_1',
  name: 'By Status',
  groupBy: 'fld_status',
  // ... other config
};

// 2. Add GroupByMenu to toolbar
<GroupByMenu
  fields={fields}
  currentGroupBy={view.groupBy}
  onGroupByChange={handleGroupByChange}
/>

// 3. Group rows and render
const groups = groupRows(filteredRows, view.groupBy, fields);
<GroupedTableBody groups={groups} fields={fields} />
```

This implementation provides a complete, GitHub Projects-like grouping experience with full view integration and persistence.
