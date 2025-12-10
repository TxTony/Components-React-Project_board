# Views System Documentation

## Overview

The Views system in GitBoard Table allows users to save and switch between different table configurations. Each view represents a specific combination of filters, sorting, column visibility, and column order. This provides a GitHub Projects-like experience where users can create multiple perspectives of the same data.

## Core Concepts

### What is a View?

A **View** is a saved configuration that includes:
- **Name**: User-defined label (editable)
- **Columns**: Array of visible field IDs in a specific order
- **Filters**: Array of filter conditions to apply
- **Sort Configuration**: Optional sorting by a specific field and direction
- **Group By**: Field to group by (see [GROUPING.md](./GROUPING.md) for details)

### View Lifecycle

1. **Creation**: User clicks "+ Add view" button → new empty view is created
2. **Application**: User clicks a view tab → view's configuration is applied to the table
3. **Modification**: User changes filters, columns, or sorting → view can be updated
4. **Persistence**: Parent component receives events and can save to backend/localStorage

## Data Structure

### ViewConfig Interface

```typescript
interface ViewConfig {
  id: string;                     // Unique identifier (e.g., "view_abc123")
  name: string;                   // Display name (e.g., "In Progress Tasks")
  columns: string[];              // Visible field IDs in order (e.g., ["fld_title", "fld_status"])
  sortBy: SortConfig | null;      // Sort configuration or null
  filters: FilterConfig[];        // Array of active filters
  groupBy: string | null;         // Field ID to group by (e.g., "fld_status"), null for no grouping
}

interface SortConfig {
  field: string;                  // Field ID (e.g., "fld_title")
  direction: 'asc' | 'desc';      // Sort direction
}

interface FilterConfig {
  field: string;                  // Field ID (e.g., "fld_status")
  operator: 'contains' | 'equals' | 'not-equals' | 'is-empty' | 'is-not-empty' | 'gt' | 'gte' | 'lt' | 'lte';
  value?: any;                    // Filter value (optional for is-empty/is-not-empty)
}
```

## Mock Data Examples

### Example 1: Simple Views

```typescript
const views: ViewConfig[] = [
  {
    id: 'view_all',
    name: 'All Tasks',
    columns: ['fld_title', 'fld_status', 'fld_assignee', 'fld_priority'],
    sortBy: null,
    filters: [],
    groupBy: null,
  },
  {
    id: 'view_high_priority',
    name: 'High Priority',
    columns: ['fld_title', 'fld_status', 'fld_assignee'],
    sortBy: { field: 'fld_title', direction: 'asc' },
    filters: [
      { field: 'fld_priority', operator: 'equals', value: 'opt_high' }
    ],
    groupBy: null,
  },
  {
    id: 'view_in_progress',
    name: 'In Progress',
    columns: ['fld_title', 'fld_assignee'],
    sortBy: null,
    filters: [
      { field: 'fld_status', operator: 'equals', value: 'opt_inprog' }
    ],
    groupBy: null,
  },
];
```

### Example 2: Complex View with Multiple Filters

```typescript
const complexView: ViewConfig = {
  id: 'view_my_urgent',
  name: 'My Urgent Tasks',
  columns: ['fld_title', 'fld_due_date', 'fld_status'],
  sortBy: { field: 'fld_due_date', direction: 'asc' },
  filters: [
    { field: 'fld_assignee', operator: 'equals', value: 'user_alice' },
    { field: 'fld_priority', operator: 'equals', value: 'opt_high' },
    { field: 'fld_status', operator: 'not-equals', value: 'opt_done' },
  ],
  groupBy: null,
};
```

### Example 3: View with Custom Column Order

```typescript
const customOrderView: ViewConfig = {
  id: 'view_custom',
  name: 'Custom Layout',
  // Note: Column order matters! Columns will appear in this exact order
  columns: ['fld_status', 'fld_priority', 'fld_title', 'fld_assignee'],
  sortBy: { field: 'fld_priority', direction: 'desc' },
  filters: [],
  groupBy: null,
};
```

## Events and Callbacks

The Views system emits three main events to the parent component:

### 1. onViewChange

**When**: User clicks a view tab to switch to a different view

**Payload**: The complete `ViewConfig` object of the selected view

**Example**:
```typescript
const handleViewChange = (view: ViewConfig) => {
  console.log('User switched to view:', view.name);
  console.log('View ID:', view.id);
  console.log('Active filters:', view.filters.length);
  console.log('Visible columns:', view.columns);

  // Track analytics
  analytics.track('view_changed', {
    viewId: view.id,
    viewName: view.name,
    filterCount: view.filters.length,
    columnCount: view.columns.length,
  });
};
```

**Sample Payload**:
```json
{
  "id": "view_in_progress",
  "name": "In Progress",
  "columns": ["fld_title", "fld_assignee"],
  "sortBy": null,
  "filters": [
    {
      "field": "fld_status",
      "operator": "equals",
      "value": "opt_inprog"
    }
  ],
  "groupBy": null
}
```

### 2. onCreateView

**When**: User clicks the "+ Add view" button

**Payload**: A new `ViewConfig` object with default values

**Example**:
```typescript
const handleCreateView = (newView: ViewConfig) => {
  console.log('New view created:', newView.name);
  console.log('View ID:', newView.id);

  // Add to state
  setViews(prev => [...prev, newView]);

  // Optionally save to backend
  await api.views.create(newView);

  // Show success message
  toast.success(`Created view "${newView.name}"`);
};
```

**Sample Payload**:
```json
{
  "id": "view_abc123def456",
  "name": "New View",
  "columns": [],
  "sortBy": null,
  "filters": [],
  "groupBy": null
}
```

### 3. onUpdateView

**When**:
- User double-clicks a view tab and changes the name
- User modifies filters and clicks "Save"
- User reorders columns (auto-save)
- User shows/hides columns (auto-save)

**Payload**: The updated `ViewConfig` object with modified properties

**Example**:
```typescript
const handleUpdateView = (updatedView: ViewConfig) => {
  console.log('View updated:', updatedView.name);
  console.log('View ID:', updatedView.id);

  // Update in state
  setViews(prev => prev.map(v =>
    v.id === updatedView.id ? updatedView : v
  ));

  // Save to backend
  await api.views.update(updatedView.id, updatedView);

  // Show success message
  toast.success(`Saved changes to "${updatedView.name}"`);
};
```

**Sample Payloads**:

*After renaming a view:*
```json
{
  "id": "view_in_progress",
  "name": "Active Tasks",  // Changed from "In Progress"
  "columns": ["fld_title", "fld_assignee"],
  "sortBy": null,
  "filters": [
    {
      "field": "fld_status",
      "operator": "equals",
      "value": "opt_inprog"
    }
  ],
  "groupBy": null
}
```

*After saving filter changes:*
```json
{
  "id": "view_in_progress",
  "name": "In Progress",
  "columns": ["fld_title", "fld_assignee"],
  "sortBy": null,
  "filters": [
    {
      "field": "fld_status",
      "operator": "equals",
      "value": "opt_inprog"
    },
    {
      "field": "fld_assignee",
      "operator": "equals",
      "value": "user_alice"
    }
  ],
  "groupBy": null
}
```

*After reordering columns:*
```json
{
  "id": "view_in_progress",
  "name": "In Progress",
  "columns": ["fld_assignee", "fld_title"],  // Order changed
  "sortBy": null,
  "filters": [
    {
      "field": "fld_status",
      "operator": "equals",
      "value": "opt_inprog"
    }
  ],
  "groupBy": null
}
```

*After hiding a column:*
```json
{
  "id": "view_in_progress",
  "name": "In Progress",
  "columns": ["fld_title"],  // "fld_assignee" was hidden
  "sortBy": null,
  "filters": [
    {
      "field": "fld_status",
      "operator": "equals",
      "value": "opt_inprog"
    }
  ],
  "groupBy": null
}
```

## Complete Implementation Example

```typescript
import { useState } from 'react';
import { GitBoardTable } from '@txtony/gitboard-table';
import type { ViewConfig, FieldDefinition, Row } from '@txtony/gitboard-table';

function MyApp() {
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
  ];

  // Initial data
  const initialRows: Row[] = [
    {
      id: 'row_1',
      values: {
        fld_title: 'Implement user authentication',
        fld_status: 'opt_inprog',
        fld_assignee: 'user_alice',
        fld_priority: 'opt_high',
      },
    },
    {
      id: 'row_2',
      values: {
        fld_title: 'Fix navigation bug',
        fld_status: 'opt_todo',
        fld_assignee: 'user_bob',
        fld_priority: 'opt_medium',
      },
    },
    {
      id: 'row_3',
      values: {
        fld_title: 'Update documentation',
        fld_status: 'opt_done',
        fld_assignee: 'user_alice',
        fld_priority: 'opt_low',
      },
    },
  ];

  // Initial views
  const initialViews: ViewConfig[] = [
    {
      id: 'view_all',
      name: 'All Tasks',
      columns: ['fld_title', 'fld_status', 'fld_assignee', 'fld_priority'],
      sortBy: null,
      filters: [],
      groupBy: null,
    },
    {
      id: 'view_in_progress',
      name: 'In Progress',
      columns: ['fld_title', 'fld_assignee'],
      sortBy: { field: 'fld_title', direction: 'asc' },
      filters: [
        { field: 'fld_status', operator: 'equals', value: 'opt_inprog' }
      ],
      groupBy: null,
    },
    {
      id: 'view_high_priority',
      name: 'High Priority',
      columns: ['fld_title', 'fld_status', 'fld_assignee'],
      sortBy: { field: 'fld_priority', direction: 'desc' },
      filters: [
        { field: 'fld_priority', operator: 'equals', value: 'opt_high' }
      ],
      groupBy: null,
    },
  ];

  // State
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [views, setViews] = useState<ViewConfig[]>(initialViews);

  // Event handlers
  const handleViewChange = (view: ViewConfig) => {
    console.log('🔍 View changed:', {
      name: view.name,
      filterCount: view.filters.length,
      columnCount: view.columns.length,
      hasSorting: view.sortBy !== null,
    });

    // Optional: Track analytics
    // analytics.track('view_changed', { viewId: view.id });
  };

  const handleCreateView = (newView: ViewConfig) => {
    console.log('✨ View created:', newView);

    // Update local state
    setViews(prev => [...prev, newView]);

    // Optional: Save to backend
    // await api.views.create(newView);
  };

  const handleUpdateView = (updatedView: ViewConfig) => {
    console.log('💾 View updated:', updatedView);

    // Update local state
    setViews(prev => prev.map(v =>
      v.id === updatedView.id ? updatedView : v
    ));

    // Optional: Save to backend
    // await api.views.update(updatedView.id, updatedView);
  };

  const handleRowChange = (updatedRows: Row[]) => {
    console.log('📊 Rows changed:', updatedRows.length);
    setRows(updatedRows);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Task Board</h1>

      <GitBoardTable
        fields={fields}
        rows={rows}
        views={views}
        onChange={handleRowChange}
        onViewChange={handleViewChange}
        onCreateView={handleCreateView}
        onUpdateView={handleUpdateView}
        theme="light"
      />
    </div>
  );
}

export default MyApp;
```

## How Views Work Internally

### 1. View Application Flow

When a user clicks on a view tab:

```
User clicks view tab
  ↓
ViewTabs emits onViewChange(view)
  ↓
GitBoardTable receives view
  ↓
GitBoardTable applies:
  - Filters: setFilters(view.filters)
  - Sort: setSortConfig(view.sortBy)
  - Columns: setFieldOrder(view.columns)
  - Hidden columns: Calculate and setHiddenColumns()
  ↓
Table re-renders with new configuration
  ↓
Parent component receives onViewChange callback
```

### 2. View Creation Flow

When a user clicks "+ Add view":

```
User clicks "+ Add view"
  ↓
ViewTabs creates new ViewConfig with:
  - Unique ID (generated via generateRowId())
  - Default name: "New View"
  - Empty columns: []
  - No filters: []
  - No sorting: null
  ↓
ViewTabs emits onCreateView(newView)
  ↓
ViewTabs also emits onViewChange(newView) to switch to it
  ↓
GitBoardTable adds view to internal state
  ↓
GitBoardTable emits onCreateView to parent
  ↓
Parent component updates its state
```

### 3. View Update Flow (Manual Save)

When a user modifies filters and clicks "Save":

```
User modifies filters in FilterBar
  ↓
User clicks "Save" button in ViewTabs
  ↓
ViewTabs detects currentFilters !== view.filters
  ↓
ViewTabs creates updated view:
  updatedView = { ...currentView, filters: currentFilters }
  ↓
ViewTabs emits onUpdateView(updatedView)
  ↓
GitBoardTable updates internal views state
  ↓
GitBoardTable emits onUpdateView to parent
  ↓
Parent component updates its state
```

### 4. View Update Flow (Auto-save for Columns)

When a user reorders or hides/shows columns:

```
User drags column header (or toggles visibility)
  ↓
TableHeader emits handleFieldReorder() (or handleToggleVisibility())
  ↓
GitBoardTable detects current view exists and onUpdateView callback exists
  ↓
GitBoardTable creates updated view:
  updatedView = { ...currentView, columns: newColumnOrder }
  ↓
GitBoardTable updates internal views state
  ↓
GitBoardTable emits onUpdateView to parent
  ↓
Parent component updates its state
```

## Auto-save vs Manual Save

The Views system has two different save behaviors:

### Auto-save (Immediate)
- **Column reordering**: Drag column header → immediate save
- **Column visibility**: Show/hide column → immediate save
- **View name editing**: Double-click tab, edit name, press Enter → immediate save

### Manual Save (Requires User Action)
- **Filter changes**: Modify filters → "Save" button appears → user clicks "Save"

**Why this distinction?**
- Structural changes (columns) are less likely to be exploratory → auto-save provides convenience
- Filter changes are often exploratory → manual save prevents accidental overwrites

## Common Patterns

### Pattern 1: Persist Views to Backend

```typescript
const handleUpdateView = async (updatedView: ViewConfig) => {
  // Optimistic update
  setViews(prev => prev.map(v =>
    v.id === updatedView.id ? updatedView : v
  ));

  try {
    // Save to backend
    await fetch(`/api/views/${updatedView.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedView),
    });
  } catch (error) {
    console.error('Failed to save view:', error);
    // Revert optimistic update on error
    setViews(prev => /* restore previous state */);
  }
};
```

### Pattern 2: Load Views from Backend on Mount

```typescript
useEffect(() => {
  async function loadViews() {
    try {
      const response = await fetch('/api/views');
      const data = await response.json();
      setViews(data.views);
    } catch (error) {
      console.error('Failed to load views:', error);
      // Fallback to default views
      setViews(defaultViews);
    }
  }

  loadViews();
}, []);
```

### Pattern 3: Delete View

```typescript
const handleDeleteView = async (viewId: string) => {
  // Remove from state
  setViews(prev => prev.filter(v => v.id !== viewId));

  // Delete from backend
  await fetch(`/api/views/${viewId}`, { method: 'DELETE' });

  // If deleted view was active, switch to first view
  if (currentView?.id === viewId && views.length > 1) {
    handleViewChange(views[0]);
  }
};
```

## Testing Views

### Unit Test Example

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GitBoardTable } from '@txtony/gitboard-table';

test('switches view and applies filters', async () => {
  const user = userEvent.setup();
  const onViewChange = vi.fn();

  const views = [
    {
      id: 'view_all',
      name: 'All Tasks',
      columns: ['fld_title', 'fld_status'],
      filters: [],
      sortBy: null,
      groupBy: null,
    },
    {
      id: 'view_done',
      name: 'Done',
      columns: ['fld_title'],
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
      onViewChange={onViewChange}
    />
  );

  // Switch to "Done" view
  const doneTab = screen.getByRole('tab', { name: /Done/i });
  await user.click(doneTab);

  // Verify callback was called
  expect(onViewChange).toHaveBeenCalledWith(views[1]);

  // Verify filters are applied (rows are filtered)
  expect(screen.getByText(/Showing \d+ of \d+ rows/i)).toBeInTheDocument();
});
```

## Troubleshooting

### Issue: Views not updating when parent state changes

**Solution**: Ensure `views` prop is updated in parent component when callbacks are triggered:

```typescript
// ❌ Wrong - not updating state
const handleUpdateView = (view: ViewConfig) => {
  api.saveView(view); // Only saves to backend
};

// ✅ Correct - updating state
const handleUpdateView = (view: ViewConfig) => {
  setViews(prev => prev.map(v => v.id === view.id ? view : v));
  api.saveView(view);
};
```

### Issue: Column order not persisting

**Solution**: Make sure `onUpdateView` callback is provided:

```typescript
// ❌ Wrong - no callback
<GitBoardTable fields={fields} rows={rows} views={views} />

// ✅ Correct - with callback
<GitBoardTable
  fields={fields}
  rows={rows}
  views={views}
  onUpdateView={handleUpdateView}
/>
```

### Issue: Filter changes not showing "Save" button

**Solution**: Ensure `currentFilters` prop is passed to ViewTabs and `onUpdateView` is provided. This is handled automatically by GitBoardTable.

## Summary for AI Agents

When implementing views:

1. **Data Structure**: Each view is a `ViewConfig` object with id, name, columns, filters, sortBy, groupBy
2. **Three Events**: `onViewChange` (switch), `onCreateView` (new), `onUpdateView` (modify)
3. **Auto-save**: Column order and visibility changes auto-save to current view
4. **Manual Save**: Filter changes require explicit save via "Save" button
5. **State Management**: Parent component should maintain views array and update it when callbacks fire
6. **View Application**: Switching views applies filters, sorting, column configuration, and grouping
7. **Unique IDs**: Use `generateRowId()` or similar for generating unique view IDs
8. **Persistence**: Parent component is responsible for persisting views (localStorage, backend, etc.)
9. **Grouping**: Each view can have its own `groupBy` configuration - see [GROUPING.md](./GROUPING.md) for complete grouping documentation
10. **Sorting vs Grouping**: When `groupBy` is set, `sortBy` is automatically disabled to prevent conflicts

The Views system provides a complete solution for managing multiple table configurations with minimal effort from the parent component.
