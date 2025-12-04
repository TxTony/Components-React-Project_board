# Row Reordering Documentation

This document explains how row reordering works in the GitBoard Table Component for autonomous AI agents and developers.

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Data Structures](#data-structures)
3. [Mock Data Examples](#mock-data-examples)
4. [Emitted Events](#emitted-events)
5. [Complete Implementation Example](#complete-implementation-example)
6. [Common Patterns](#common-patterns)
7. [Testing Examples](#testing-examples)
8. [Troubleshooting](#troubleshooting)
9. [AI Agent Summary](#ai-agent-summary)

---

## Core Concepts

### What is Row Reordering?

Row reordering allows users to drag and drop table rows to change their position in the table. This is a common feature in project management tools and data tables where row order matters.

### Key Features

- **Drag-and-Drop Interface**: Rows can be dragged and dropped to new positions
- **Visual Feedback**: Rows show visual states during dragging (dragging, drag-over)
- **Event Emission**: Emits `RowReorderEvent` with complete state information
- **Controlled Component**: Parent component controls the actual row order
- **Works with Filters**: Reordering works on filtered/sorted row sets

### How It Works

1. **User initiates drag**: User clicks and holds on a row, then drags it
2. **Visual feedback**: Row being dragged gets styling, target position shows feedback
3. **User drops row**: User releases mouse over target position
4. **Event emission**: Component emits `RowReorderEvent` with new order
5. **Parent updates**: Parent component receives event and updates row data
6. **Re-render**: Component re-renders with new row order

---

## Data Structures

### RowReorderEvent

The main event payload emitted when rows are reordered.

```typescript
interface RowReorderEvent {
  fromIndex: number;      // Original position of the moved row (0-based)
  toIndex: number;        // New position of the moved row (0-based)
  rows: Row[];            // Complete rows array in new order
  movedRow: Row;          // The specific row that was moved
}
```

#### Property Details

| Property | Type | Description |
|----------|------|-------------|
| `fromIndex` | `number` | Zero-based index of the row before the move |
| `toIndex` | `number` | Zero-based index of the row after the move |
| `rows` | `Row[]` | The entire rows array with rows reordered |
| `movedRow` | `Row` | The specific row object that was moved |

### Row Interface

Standard row data structure used throughout the component.

```typescript
interface Row {
  id: string;                     // Unique identifier
  values: Record<string, any>;    // Field values keyed by field ID
  contentId?: string;             // Optional content reference
}
```

---

## Mock Data Examples

### Example 1: Simple Row Reorder

**Initial State:**
```typescript
const rows = [
  { id: 'row_1', values: { title: 'Task 1', status: 'To Do' } },
  { id: 'row_2', values: { title: 'Task 2', status: 'In Progress' } },
  { id: 'row_3', values: { title: 'Task 3', status: 'Done' } },
];
```

**User Action:** Drag "Task 1" (index 0) to position 2

**Emitted Event:**
```typescript
{
  fromIndex: 0,
  toIndex: 2,
  rows: [
    { id: 'row_2', values: { title: 'Task 2', status: 'In Progress' } },
    { id: 'row_3', values: { title: 'Task 3', status: 'Done' } },
    { id: 'row_1', values: { title: 'Task 1', status: 'To Do' } },
  ],
  movedRow: { id: 'row_1', values: { title: 'Task 1', status: 'To Do' } }
}
```

### Example 2: Moving Row Upward

**Initial State:**
```typescript
const rows = [
  { id: 'row_a', values: { priority: '1', name: 'First' } },
  { id: 'row_b', values: { priority: '2', name: 'Second' } },
  { id: 'row_c', values: { priority: '3', name: 'Third' } },
];
```

**User Action:** Drag "Third" (index 2) to position 0

**Emitted Event:**
```typescript
{
  fromIndex: 2,
  toIndex: 0,
  rows: [
    { id: 'row_c', values: { priority: '3', name: 'Third' } },
    { id: 'row_a', values: { priority: '1', name: 'First' } },
    { id: 'row_b', values: { priority: '2', name: 'Second' } },
  ],
  movedRow: { id: 'row_c', values: { priority: '3', name: 'Third' } }
}
```

### Example 3: Complex Data with Multiple Fields

**Initial State:**
```typescript
const rows = [
  {
    id: 'issue_101',
    values: {
      title: 'Fix login bug',
      assignee: 'user_1',
      status: 'In Progress',
      priority: 'High',
      labels: ['bug', 'frontend']
    }
  },
  {
    id: 'issue_102',
    values: {
      title: 'Add dark mode',
      assignee: 'user_2',
      status: 'To Do',
      priority: 'Medium',
      labels: ['feature', 'ui']
    }
  },
  {
    id: 'issue_103',
    values: {
      title: 'Update docs',
      assignee: 'user_3',
      status: 'Done',
      priority: 'Low',
      labels: ['documentation']
    }
  }
];
```

**User Action:** Drag "Add dark mode" (index 1) to position 0

**Emitted Event:**
```typescript
{
  fromIndex: 1,
  toIndex: 0,
  rows: [
    {
      id: 'issue_102',
      values: {
        title: 'Add dark mode',
        assignee: 'user_2',
        status: 'To Do',
        priority: 'Medium',
        labels: ['feature', 'ui']
      }
    },
    {
      id: 'issue_101',
      values: {
        title: 'Fix login bug',
        assignee: 'user_1',
        status: 'In Progress',
        priority: 'High',
        labels: ['bug', 'frontend']
      }
    },
    {
      id: 'issue_103',
      values: {
        title: 'Update docs',
        assignee: 'user_3',
        status: 'Done',
        priority: 'Low',
        labels: ['documentation']
      }
    }
  ],
  movedRow: {
    id: 'issue_102',
    values: {
      title: 'Add dark mode',
      assignee: 'user_2',
      status: 'To Do',
      priority: 'Medium',
      labels: ['feature', 'ui']
    }
  }
}
```

---

## Emitted Events

### onRowsReorder

**When Emitted:**
- User successfully drags a row to a new position
- Drop position is different from the original position

**Not Emitted When:**
- User drops row on its original position
- User cancels drag operation (ESC key, drag outside)
- Row reordering is disabled

**Event Signature:**
```typescript
onRowsReorder?: (event: RowReorderEvent) => void;
```

**Example Handler:**
```typescript
const handleRowsReorder = (event: RowReorderEvent) => {
  console.log('Row moved from', event.fromIndex, 'to', event.toIndex);
  console.log('Moved row:', event.movedRow);
  console.log('New order:', event.rows);

  // Update backend/database
  await api.updateRowOrder({
    rowId: event.movedRow.id,
    newPosition: event.toIndex
  });

  // Update local state
  setRows(event.rows);
};
```

### onChange

The `onChange` event is also emitted whenever rows are reordered, providing the updated rows array.

**Event Signature:**
```typescript
onChange?: (rows: Row[]) => void;
```

**Example:**
```typescript
const handleChange = (rows: Row[]) => {
  console.log('Rows updated:', rows);
  // This is called for any row change including reordering
};
```

---

## Complete Implementation Example

### Full Component Setup

```typescript
import React, { useState } from 'react';
import { GitBoardTable } from '@gitboard/table';
import type { Row, FieldDefinition, RowReorderEvent } from '@gitboard/table';

const MyProjectBoard: React.FC = () => {
  // Define table fields
  const fields: FieldDefinition[] = [
    {
      id: 'fld_title',
      name: 'Title',
      type: 'text',
      visible: true
    },
    {
      id: 'fld_status',
      name: 'Status',
      type: 'single-select',
      visible: true,
      options: [
        { id: 'status_1', label: 'To Do', color: 'gray' },
        { id: 'status_2', label: 'In Progress', color: 'blue' },
        { id: 'status_3', label: 'Done', color: 'green' }
      ]
    },
    {
      id: 'fld_assignee',
      name: 'Assignee',
      type: 'assignee',
      visible: true
    }
  ];

  // Initialize row data
  const [rows, setRows] = useState<Row[]>([
    {
      id: 'row_1',
      values: {
        fld_title: 'Implement authentication',
        fld_status: 'status_2',
        fld_assignee: 'user_1'
      }
    },
    {
      id: 'row_2',
      values: {
        fld_title: 'Design landing page',
        fld_status: 'status_1',
        fld_assignee: 'user_2'
      }
    },
    {
      id: 'row_3',
      values: {
        fld_title: 'Write unit tests',
        fld_status: 'status_3',
        fld_assignee: 'user_1'
      }
    }
  ]);

  // Handle row reordering
  const handleRowsReorder = async (event: RowReorderEvent) => {
    console.log('📋 Row Reorder Event:');
    console.log('  From:', event.fromIndex);
    console.log('  To:', event.toIndex);
    console.log('  Moved Row:', event.movedRow.id);

    // Update local state immediately for responsive UI
    setRows(event.rows);

    // Persist to backend
    try {
      await fetch('/api/rows/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rowId: event.movedRow.id,
          fromIndex: event.fromIndex,
          toIndex: event.toIndex,
          newOrder: event.rows.map(r => r.id)
        })
      });

      console.log('✅ Row order saved to backend');
    } catch (error) {
      console.error('❌ Failed to save row order:', error);
      // Optionally revert the change
      // setRows(previousRows);
    }
  };

  // Handle general row changes
  const handleChange = (updatedRows: Row[]) => {
    console.log('Rows changed:', updatedRows.length);
    setRows(updatedRows);
  };

  return (
    <div className="project-board">
      <h1>My Project Board</h1>

      <GitBoardTable
        fields={fields}
        rows={rows}
        onChange={handleChange}
        onRowsReorder={handleRowsReorder}
        tableId="my-project-board"
      />

      <div className="row-count">
        Total rows: {rows.length}
      </div>
    </div>
  );
};

export default MyProjectBoard;
```

### Backend Integration Example

```typescript
// API route for persisting row order
app.post('/api/rows/reorder', async (req, res) => {
  const { rowId, fromIndex, toIndex, newOrder } = req.body;

  try {
    // Update row position in database
    await db.rows.update(rowId, {
      position: toIndex,
      updatedAt: new Date()
    });

    // Update positions for all affected rows
    await db.rows.updateMany({
      where: { id: { in: newOrder } }
    }, (row, index) => ({
      position: index,
      updatedAt: new Date()
    }));

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Common Patterns

### Pattern 1: Optimistic Updates

Update UI immediately, revert if backend fails:

```typescript
const [rows, setRows] = useState<Row[]>(initialRows);
const [previousRows, setPreviousRows] = useState<Row[]>(initialRows);

const handleRowsReorder = async (event: RowReorderEvent) => {
  // Save previous state
  setPreviousRows(rows);

  // Update immediately
  setRows(event.rows);

  try {
    await api.saveRowOrder(event);
  } catch (error) {
    // Revert on error
    setRows(previousRows);
    toast.error('Failed to reorder rows');
  }
};
```

### Pattern 2: Tracking User Actions

Log row reordering for analytics:

```typescript
const handleRowsReorder = (event: RowReorderEvent) => {
  // Update state
  setRows(event.rows);

  // Track analytics
  analytics.track('Row Reordered', {
    fromIndex: event.fromIndex,
    toIndex: event.toIndex,
    rowId: event.movedRow.id,
    direction: event.toIndex > event.fromIndex ? 'down' : 'up',
    distance: Math.abs(event.toIndex - event.fromIndex)
  });
};
```

### Pattern 3: Conditional Reordering

Only allow reordering for certain users or states:

```typescript
const handleRowsReorder = (event: RowReorderEvent) => {
  // Check permissions
  if (!currentUser.canReorderRows) {
    toast.error('You do not have permission to reorder rows');
    return;
  }

  // Check if table is locked
  if (isTableLocked) {
    toast.warning('Table is locked for editing');
    return;
  }

  // Proceed with reordering
  setRows(event.rows);
  saveToBackend(event);
};
```

### Pattern 4: Updating Related Data

Update row positions and related metadata:

```typescript
const handleRowsReorder = async (event: RowReorderEvent) => {
  // Update rows with new position metadata
  const updatedRows = event.rows.map((row, index) => ({
    ...row,
    values: {
      ...row.values,
      position: index,
      lastModified: new Date().toISOString(),
      modifiedBy: currentUser.id
    }
  }));

  setRows(updatedRows);
  await api.saveRows(updatedRows);
};
```

### Pattern 5: Undo/Redo Support

Implement undo/redo for row reordering:

```typescript
const [rows, setRows] = useState<Row[]>(initialRows);
const [history, setHistory] = useState<Row[][]>([initialRows]);
const [historyIndex, setHistoryIndex] = useState(0);

const handleRowsReorder = (event: RowReorderEvent) => {
  // Add to history
  const newHistory = history.slice(0, historyIndex + 1);
  newHistory.push(event.rows);
  setHistory(newHistory);
  setHistoryIndex(newHistory.length - 1);

  setRows(event.rows);
};

const undo = () => {
  if (historyIndex > 0) {
    setHistoryIndex(historyIndex - 1);
    setRows(history[historyIndex - 1]);
  }
};

const redo = () => {
  if (historyIndex < history.length - 1) {
    setHistoryIndex(historyIndex + 1);
    setRows(history[historyIndex + 1]);
  }
};
```

---

## Testing Examples

### Test 1: Verify Event Emission

```typescript
import { render, fireEvent, screen } from '@testing-library/react';
import { GitBoardTable } from '@gitboard/table';
import { vi } from 'vitest';

it('emits onRowsReorder with correct payload', () => {
  const onRowsReorder = vi.fn();
  const rows = [
    { id: 'row_1', values: { title: 'Task 1' } },
    { id: 'row_2', values: { title: 'Task 2' } },
    { id: 'row_3', values: { title: 'Task 3' } }
  ];

  render(
    <GitBoardTable
      fields={fields}
      rows={rows}
      onRowsReorder={onRowsReorder}
    />
  );

  // Get table rows
  const tableRows = screen.getAllByRole('row');
  const firstRow = tableRows[1]; // Skip header
  const thirdRow = tableRows[3];

  // Simulate drag and drop
  fireEvent.dragStart(firstRow);
  fireEvent.dragOver(thirdRow);
  fireEvent.drop(thirdRow);

  // Verify event was called
  expect(onRowsReorder).toHaveBeenCalledTimes(1);
  expect(onRowsReorder).toHaveBeenCalledWith({
    fromIndex: 0,
    toIndex: 2,
    rows: expect.arrayContaining([
      expect.objectContaining({ id: 'row_2' }),
      expect.objectContaining({ id: 'row_3' }),
      expect.objectContaining({ id: 'row_1' })
    ]),
    movedRow: expect.objectContaining({ id: 'row_1' })
  });
});
```

### Test 2: Verify Row Order Changes

```typescript
it('updates row order after drag and drop', async () => {
  const onRowsReorder = vi.fn();
  const { rerender } = render(
    <GitBoardTable
      fields={fields}
      rows={rows}
      onRowsReorder={onRowsReorder}
    />
  );

  // Perform drag and drop
  const tableRows = screen.getAllByRole('row');
  fireEvent.dragStart(tableRows[1]);
  fireEvent.drop(tableRows[3]);

  // Get new row order from event
  const newRows = onRowsReorder.mock.calls[0][0].rows;

  // Re-render with new rows
  rerender(
    <GitBoardTable
      fields={fields}
      rows={newRows}
      onRowsReorder={onRowsReorder}
    />
  );

  // Verify UI reflects new order
  const updatedRows = screen.getAllByRole('row');
  expect(updatedRows[1]).toHaveTextContent('Task 2');
  expect(updatedRows[2]).toHaveTextContent('Task 3');
  expect(updatedRows[3]).toHaveTextContent('Task 1');
});
```

### Test 3: Prevent Reorder on Same Position

```typescript
it('does not emit event when dropping on same position', () => {
  const onRowsReorder = vi.fn();

  render(
    <GitBoardTable
      fields={fields}
      rows={rows}
      onRowsReorder={onRowsReorder}
    />
  );

  const tableRows = screen.getAllByRole('row');
  const firstRow = tableRows[1];

  // Drag and drop on same position
  fireEvent.dragStart(firstRow);
  fireEvent.dragOver(firstRow);
  fireEvent.drop(firstRow);

  // Should not emit event
  expect(onRowsReorder).not.toHaveBeenCalled();
});
```

---

## Troubleshooting

### Issue 1: Rows Not Reordering

**Symptoms:**
- Drag and drop doesn't work
- Rows snap back to original position

**Possible Causes:**
1. Parent component not updating rows state
2. `onRowsReorder` callback missing or not implemented
3. Rows prop not updated after reorder event

**Solution:**
```typescript
// ❌ Wrong - not updating state
const handleRowsReorder = (event) => {
  console.log('Reordered!');
  // Missing: setRows(event.rows)
};

// ✅ Correct - update state
const handleRowsReorder = (event) => {
  setRows(event.rows); // Update state with new order
};
```

### Issue 2: Duplicate Event Emissions

**Symptoms:**
- `onRowsReorder` called multiple times for single drag

**Possible Causes:**
1. Multiple event listeners attached
2. Component re-rendering during drag

**Solution:**
Ensure cleanup in useEffect if adding custom listeners:
```typescript
useEffect(() => {
  const handleDrop = () => { /* ... */ };

  element.addEventListener('drop', handleDrop);

  return () => {
    element.removeEventListener('drop', handleDrop);
  };
}, []);
```

### Issue 3: Visual Feedback Not Showing

**Symptoms:**
- No visual indication during drag
- Row doesn't show "dragging" state

**Possible Causes:**
1. CSS classes not defined
2. Styles not imported

**Solution:**
Ensure component CSS is imported:
```typescript
import '@gitboard/table/styles.css';
```

Add custom drag styles if needed:
```css
.gitboard-table__row--dragging {
  opacity: 0.5;
  background: #f0f0f0;
}

.gitboard-table__row--drag-over {
  border-top: 2px solid #0969da;
}
```

### Issue 4: Reordering Breaks with Filters

**Symptoms:**
- Reordering doesn't work when filters are active
- Wrong rows get reordered

**Explanation:**
The component operates on the **displayed/filtered** rows, not the full dataset. When filters are active, `fromIndex` and `toIndex` refer to positions in the filtered view.

**Solution:**
This is expected behavior. The component correctly reorders the filtered rows. If you need to track positions in the full dataset, handle this in your backend:

```typescript
const handleRowsReorder = async (event: RowReorderEvent) => {
  // event.rows contains the reordered filtered rows
  setRows(event.rows);

  // Backend should handle mapping to full dataset
  await api.reorderRows({
    movedRowId: event.movedRow.id,
    newPosition: event.toIndex,
    filteredView: currentFilters
  });
};
```

### Issue 5: Performance Issues with Large Datasets

**Symptoms:**
- Slow drag performance with 1000+ rows
- UI freezes during drag

**Solution:**
1. Implement virtualization for large datasets
2. Debounce drag-over events
3. Use React.memo for Row components

```typescript
const MemoizedRow = React.memo(Row);

// In your render
{rows.map((row, index) => (
  <MemoizedRow key={row.id} row={row} index={index} />
))}
```

---

## AI Agent Summary

### Quick Reference for Autonomous AI Agents

**What:** Row reordering allows drag-and-drop reordering of table rows.

**When to Use:**
- User needs to manually order/prioritize items
- Order matters (task lists, rankings, sequences)
- Alternative to sort-by-column for custom ordering

**Key Implementation Steps:**

1. **Add event handler:**
   ```typescript
   const handleRowsReorder = (event: RowReorderEvent) => {
     setRows(event.rows);
   };
   ```

2. **Pass to component:**
   ```typescript
   <GitBoardTable
     onRowsReorder={handleRowsReorder}
     {...otherProps}
   />
   ```

3. **Handle the event payload:**
   - `event.fromIndex`: Original position
   - `event.toIndex`: New position
   - `event.rows`: Reordered array
   - `event.movedRow`: The moved row

**Common Mistakes:**
- ❌ Not updating parent state with `event.rows`
- ❌ Trying to reorder by row ID instead of index
- ❌ Not handling async backend updates properly

**Best Practices:**
- ✅ Update local state immediately (optimistic UI)
- ✅ Persist to backend asynchronously
- ✅ Handle errors and provide user feedback
- ✅ Track analytics for UX insights

**Testing Checklist:**
- [ ] Event emitted with correct payload
- [ ] Row order updates in UI
- [ ] No event on same-position drop
- [ ] Works with filtered rows
- [ ] Backend persistence succeeds

