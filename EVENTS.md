# GitBoardTable - Events & Payloads Documentation

This document describes all events emitted by the GitBoardTable component and their payload structures.

## Table of Contents

1. [onChange - Row Data Changes](#onchange---row-data-changes)
2. [onBulkUpdate - Drag-Fill Operations](#onbulkupdate---drag-fill-operations)
3. [onRowOpen - Row Click/Open](#onrowopen---row-clickopen)
4. [onFieldChange - Field Definition Changes](#onfieldchange---field-definition-changes)

---

## onChange - Row Data Changes

**Trigger**: Emitted whenever row data is modified through:
- Cell editing (any field type)
- Adding new rows
- Deleting rows
- Bulk updates

**Signature**:
```typescript
onChange?: (rows: Row[]) => void;
```

**Payload**: Complete array of all rows with updated data

**Payload Type**:
```typescript
interface Row {
  id: UID;              // Unique row identifier
  values: Record<UID, any>;  // Key-value map of field values
  contentId?: UID;      // Optional content panel ID
}

type UID = string;
```

**Example Payload**:
```javascript
[
  {
    id: "row-1",
    values: {
      "field-1": "Updated task title",
      "field-2": "opt-2",      // Status: In Progress
      "field-3": "user-1",     // Assignee
      "field-4": "2025-12-15", // Due date
      "field-5": 8,            // Estimate (number)
      "field-6": ["tag-1", "tag-2"], // Tags (multi-select)
    },
    contentId: "content-1"
  },
  {
    id: "row-2",
    values: {
      "field-1": "Another task",
      "field-2": "opt-1",      // Status: Todo
      "field-3": "user-2",
      "field-4": "2025-12-20",
    }
  }
]
```

**Usage Example**:
```typescript
const handleChange = (updatedRows: Row[]) => {
  console.log('Rows updated:', updatedRows);

  // Sync with backend
  await api.updateRows(updatedRows);

  // Update local state
  setRows(updatedRows);

  // Trigger analytics
  trackEvent('table_data_changed', {
    rowCount: updatedRows.length,
  });
};

<GitBoardTable
  fields={fields}
  rows={rows}
  onChange={handleChange}
/>
```

**When It Fires**:

1. **Cell Edit**: User double-clicks a cell and changes its value
   ```javascript
   // User changes "Task A" to "Task B"
   // onChange fires with all rows, row-1 updated
   ```

2. **Add Row**: User clicks "+" button or adds item via AddItemRow
   ```javascript
   // New row with generated ID is appended
   // onChange fires with [...existingRows, newRow]
   ```

3. **Delete Rows**: User selects rows and clicks delete
   ```javascript
   // Selected rows are removed
   // onChange fires with filtered rows array
   ```

4. **Bulk Update**: After drag-fill operation completes
   ```javascript
   // Multiple cells updated at once
   // onChange fires with all updated rows
   ```

---

## onBulkUpdate - Drag-Fill Operations

✅ **NEW**: Drag-fill now works automatically! This callback is **OPTIONAL** and is used for analytics or custom logic only.

**Trigger**: Emitted when user performs a drag-fill operation (Excel-style)
- User single-clicks a cell to select it
- User drags the fill handle (bottom-right corner) down the column
- Releases mouse to apply the value to all target cells

**Automatic Behavior**:
- The component automatically updates the cells when drag-fill is performed
- `onChange` is called with the updated rows (consistent with cell edits)
- `onBulkUpdate` provides additional event details for analytics/logging

**Signature**:
```typescript
onBulkUpdate?: (event: BulkUpdateEvent) => void;
```

**Payload Type**:
```typescript
interface BulkUpdateEvent {
  sourceCell: {
    rowId: UID;       // Source row ID
    fieldId: UID;     // Source field/column ID
    value: CellValue; // Value being copied
  };
  targetCells: BulkUpdateTarget[];  // All cells to be updated
  field: FieldDefinition;           // Field definition for the column
}

interface BulkUpdateTarget {
  rowId: UID;           // Target row ID
  fieldId: UID;         // Target field ID (same as source)
  currentValue: CellValue;  // Current value before update
}

type CellValue = string | number | boolean | null | string[] | undefined;

interface FieldDefinition {
  id: UID;
  name: string;
  type: FieldType;
  visible: boolean;
  width?: number;
  options?: FieldOption[];
}
```

**Example Payload**:
```javascript
{
  sourceCell: {
    rowId: "row-1",
    fieldId: "field-2",  // Status field
    value: "opt-2"       // "In Progress" option
  },
  targetCells: [
    {
      rowId: "row-2",
      fieldId: "field-2",
      currentValue: "opt-1"  // Was "Todo"
    },
    {
      rowId: "row-3",
      fieldId: "field-2",
      currentValue: null     // Was empty
    },
    {
      rowId: "row-4",
      fieldId: "field-2",
      currentValue: "opt-3"  // Was "Done"
    }
  ],
  field: {
    id: "field-2",
    name: "Status",
    type: "single-select",
    visible: true,
    options: [
      { id: "opt-1", label: "Todo", color: "gray" },
      { id: "opt-2", label: "In Progress", color: "yellow" },
      { id: "opt-3", label: "Done", color: "green" }
    ]
  }
}
```

**Basic Usage - Drag-Fill Works Automatically**:

```typescript
const [rows, setRows] = useState<Row[]>(initialRows);

// Drag-fill works out of the box with just onChange!
<GitBoardTable
  fields={fields}
  rows={rows}
  onChange={setRows}  // Called for all changes, including bulk updates
/>
```

That's it! The component automatically handles bulk updates internally.

**Optional: Analytics/Logging Example**:

If you want to track or log bulk update events:

```typescript
const handleChange = (updatedRows: Row[]) => {
  setRows(updatedRows);
  // Sync with backend
  await api.updateRows(updatedRows);
};

const handleBulkUpdate = (event: BulkUpdateEvent) => {
  // This is called IN ADDITION to onChange
  console.log('📊 Bulk update analytics:', {
    field: event.field.name,
    sourceValue: event.sourceCell.value,
    cellCount: event.targetCells.length,
  });

  // Track in analytics platform
  trackEvent('bulk_update', {
    field: event.field.name,
    cellCount: event.targetCells.length,
  });
};

<GitBoardTable
  fields={fields}
  rows={rows}
  onChange={handleChange}
  onBulkUpdate={handleBulkUpdate}  // Optional - for analytics only
/>
```

**Optional: Custom Validation Example**:

If you want to validate or prevent bulk updates:

```typescript
const handleBulkUpdate = async (event: BulkUpdateEvent) => {
  // Validate before allowing the change
  if (event.targetCells.length > 100) {
    const confirmed = await confirm(
      `This will update ${event.targetCells.length} cells. Continue?`
    );

    if (!confirmed) {
      // Revert the change by setting rows back to previous state
      setRows(previousRows);
      return;
    }
  }

  // Log the successful bulk update
  console.log('Bulk update applied:', event);
};

<GitBoardTable
  fields={fields}
  rows={rows}
  onChange={setRows}
  onBulkUpdate={handleBulkUpdate}  // Optional - for validation
/>
```

**Note**: The component updates cells automatically. Both `onChange` and `onBulkUpdate` (if provided) fire during bulk operations.

**Important Notes**:

1. ✅ **Automatic Updates**: Drag-fill works out of the box. No callback required!

2. **Direction**: Drag-fill only works **downwards** in the same column

3. **Selection Required**: User must single-click to select cell before dragging

4. **Visual Feedback**: Cells turn blue when dragging over them

5. **Both Events Fire**: When bulk update occurs:
   - Component updates internal state automatically
   - `onChange` fires with updated rows (just like cell edits)
   - `onBulkUpdate` fires with event details (if provided)

6. **Source Excluded**: `targetCells` array excludes the source cell

**Sequence of Events**:
```
1. User single-clicks cell (row-1, field-2)
   → Cell selected, no event fired

2. User mouse-downs on fill handle (small square at bottom-right of cell)
   → Drag-fill mode activated

3. User drags down over row-2, row-3, row-4
   → Visual feedback shows blue highlight on target cells

4. User releases mouse
   → Component automatically updates internal state
   → onChange fires with updated rows array
   → onBulkUpdate fires with event details (if callback provided)
```

**Why Is It Automatic Now?**

The component handles bulk updates internally for consistency:
- Single cell edits: Component updates → `onChange` fires
- Bulk updates: Component updates → `onChange` fires + `onBulkUpdate` fires
- Same behavior, consistent API
- `onBulkUpdate` is optional and provides extra context for analytics

---

## onRowOpen - Row Click/Open

**Status**: 🚧 **Planned** - Not currently implemented in the component

**Intended Purpose**: To notify parent component when a row is clicked/opened for viewing details

**Signature**:
```typescript
onRowOpen?: (row: Row) => void;
```

**Payload Type**:
```typescript
interface Row {
  id: UID;
  values: Record<UID, any>;
  contentId?: UID;
}
```

**Planned Example Payload**:
```javascript
{
  id: "row-1",
  values: {
    "field-1": "Task title",
    "field-2": "opt-2",
    "field-3": "user-1",
  },
  contentId: "content-1"  // Can be used to load content panel
}
```

**Planned Usage**:
```typescript
const handleRowOpen = (row: Row) => {
  console.log('Row opened:', row);

  // Open modal/panel
  setSelectedRow(row);
  setIsPanelOpen(true);

  // Load content if contentId exists
  if (row.contentId) {
    loadContent(row.contentId);
  }

  // Track analytics
  trackEvent('row_opened', { rowId: row.id });
};

<GitBoardTable
  fields={fields}
  rows={rows}
  onRowOpen={handleRowOpen}  // Not yet functional
/>
```

---

## onFieldChange - Field Definition Changes

**Status**: 🚧 **Planned** - Not currently implemented in the component

**Intended Purpose**: To notify parent component when field definitions are modified (column reorder, resize, visibility, etc.)

**Signature**:
```typescript
onFieldChange?: (fields: FieldDefinition[]) => void;
```

**Payload Type**:
```typescript
interface FieldDefinition {
  id: UID;
  name: string;
  type: FieldType;
  visible: boolean;
  width?: number;
  options?: FieldOption[];
}

type FieldType =
  | 'title'
  | 'text'
  | 'number'
  | 'date'
  | 'single-select'
  | 'multi-select'
  | 'assignee'
  | 'iteration';
```

**Planned Example Payload**:
```javascript
[
  {
    id: "field-1",
    name: "Title",
    type: "title",
    visible: true,
    width: 250  // User resized from default 150
  },
  {
    id: "field-3",
    name: "Priority",
    type: "single-select",
    visible: true,
    width: 120,
    options: [...]
  },
  {
    id: "field-2",
    name: "Status",
    type: "single-select",
    visible: false,  // User hid this column
    width: 150,
    options: [...]
  }
]
```

**Planned Usage**:
```typescript
const handleFieldChange = (updatedFields: FieldDefinition[]) => {
  console.log('Fields updated:', updatedFields);

  // Sync field configuration with backend
  await api.updateTableConfig({
    fields: updatedFields
  });

  // Update local state
  setFields(updatedFields);

  // Track analytics
  trackEvent('field_config_changed', {
    hiddenCount: updatedFields.filter(f => !f.visible).length,
  });
};

<GitBoardTable
  fields={fields}
  rows={rows}
  onFieldChange={handleFieldChange}  // Not yet functional
/>
```

**Would Fire On**:
- Column reordering (drag & drop)
- Column resizing
- Column visibility toggling
- Field renaming
- Field type changes
- Field options modification

---

## Complete Props Interface

For reference, here's the complete props interface with all events:

```typescript
interface GitBoardTableProps {
  // Required Props
  fields: FieldDefinition[];
  rows: Row[];

  // Optional Configuration
  theme?: 'light' | 'dark';
  tableId?: string;  // For localStorage persistence
  users?: User[];
  iterations?: Iteration[];
  initialView?: ViewConfig;

  // Event Handlers
  onChange?: (rows: Row[]) => void;              // ✅ Implemented
  onBulkUpdate?: (event: BulkUpdateEvent) => void;  // ✅ Implemented
  onRowOpen?: (row: Row) => void;                // 🚧 Planned
  onFieldChange?: (fields: FieldDefinition[]) => void;  // 🚧 Planned

  // Advanced Props
  contentResolver?: (id: UID) => Promise<ContentItem>;
}
```

---

## Event Firing Frequency

**High Frequency Events**:
- `onChange`: Fires on every data modification (could be multiple times per second during rapid editing)

**Medium Frequency Events**:
- `onBulkUpdate`: Fires once per drag-fill operation

**Low Frequency Events**:
- `onFieldChange`: Would fire when user changes table configuration
- `onRowOpen`: Would fire when user clicks a row

---

## Best Practices

### 1. Debounce High-Frequency Events

```typescript
import { debounce } from 'lodash';

const debouncedSave = debounce(async (rows: Row[]) => {
  await api.updateRows(rows);
}, 500);

const handleChange = (rows: Row[]) => {
  setRows(rows);           // Update immediately
  debouncedSave(rows);     // Save with delay
};
```

### 2. Optimistic Updates

```typescript
const handleChange = async (rows: Row[]) => {
  // Update UI immediately
  setRows(rows);

  try {
    // Sync with backend
    await api.updateRows(rows);
  } catch (error) {
    // Revert on error
    setRows(previousRows);
    showError('Failed to save changes');
  }
};
```

### 3. Batch Analytics

```typescript
let pendingChanges = 0;

const handleChange = (rows: Row[]) => {
  pendingChanges++;
  setRows(rows);

  // Track batch every 10 changes
  if (pendingChanges >= 10) {
    trackEvent('bulk_changes', { count: pendingChanges });
    pendingChanges = 0;
  }
};
```

### 4. Validate Bulk Updates

```typescript
const handleBulkUpdate = async (event: BulkUpdateEvent) => {
  // Validate business rules
  if (event.field.type === 'assignee') {
    const hasCapacity = await checkUserCapacity(
      event.sourceCell.value,
      event.targetCells.length
    );

    if (!hasCapacity) {
      showWarning('User is over capacity');
      return; // Prevent update
    }
  }

  // Allow onChange to handle the actual update
  console.log('Bulk update validated:', event);
};
```

---

## Troubleshooting

### "Drag-fill doesn't work" / "Cells don't update"

**Symptoms**:
- You can see the fill handle (small square at bottom-right of selected cell)
- You can click and drag it down
- Cells highlight blue while dragging
- But when you release, cells don't show the new value

**Likely Causes**:

1. **Not using `onChange` properly**:
   ```typescript
   // ❌ Wrong - not updating state
   <GitBoardTable
     fields={fields}
     rows={rows}
     onChange={(updatedRows) => console.log(updatedRows)}
   />

   // ✅ Correct - update state
   <GitBoardTable
     fields={fields}
     rows={rows}
     onChange={setRows}  // Updates state with new rows
   />
   ```

2. **Rows prop not reactive**:
   ```typescript
   // ❌ Wrong - using static array
   const rows = [...]; // Doesn't re-render on change

   // ✅ Correct - using state
   const [rows, setRows] = useState([...]); // Reactive
   ```

### "onChange fires but cells still don't update"

**Cause**: Your state isn't connected to the component properly.

**Solution**: Make sure you're using React state and passing it correctly:

```typescript
const [rows, setRows] = useState<Row[]>(initialRows);

<GitBoardTable
  fields={fields}
  rows={rows}           // ← Pass state variable
  onChange={setRows}    // ← Update state on change
/>
```

### "How do I validate bulk updates before applying?"

Use async validation in your `onBulkUpdate` handler:

```typescript
const handleBulkUpdate = async (event: BulkUpdateEvent) => {
  // Validate
  if (event.targetCells.length > 100) {
    const confirmed = await confirm('Update 100+ cells?');
    if (!confirmed) return;
  }

  // Apply
  setRows(prev => prev.map(row => {
    const target = event.targetCells.find(t => t.rowId === row.id);
    return target ? {
      ...row,
      values: { ...row.values, [event.sourceCell.fieldId]: event.sourceCell.value }
    } : row;
  }));
};
```

---

## TypeScript Import

All types are exported from the package:

```typescript
import type {
  Row,
  FieldDefinition,
  BulkUpdateEvent,
  BulkUpdateTarget,
  CellValue,
  UID,
  GitBoardTableProps,
} from '@txtony/gitboard-table';
```
