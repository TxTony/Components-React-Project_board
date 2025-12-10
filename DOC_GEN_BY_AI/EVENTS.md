# GitBoardTable - Events & Payloads Documentation

This document describes all events emitted by the GitBoardTable component and their payload structures.

## Table of Contents

1. [onChange - Row Data Changes](#onchange---row-data-changes)
2. [onBulkUpdate - Drag-Fill Operations](#onbulkupdate---drag-fill-operations)
3. [onRowOpen - Row Click/Open](#onrowopen---row-clickopen)
4. [onFieldChange - Field Definition Changes](#onfieldchange---field-definition-changes)
5. [onContentUpdate - Row Content Changes](#oncontentupdaterow-content-changes)
6. [onRowsReorder - Row Reordering](#onrowsreorder---row-reordering)
7. [View Events](#view-events)
   - [onViewChange - View Switching](#onviewchange---view-switching)
   - [onCreateView - View Creation](#oncreateview---view-creation)
   - [onUpdateView - View Updates](#onupdateview---view-updates)
   - [onDeleteView - View Deletion](#ondeleteview---view-deletion)
8. [Column Values Events (Detail Panel)](#column-values-events-detail-panel)

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
  
  // View Management
  views?: ViewConfig[];
  initialView?: ViewConfig;

  // Event Handlers - Data Changes
  onChange?: (rows: Row[]) => void;                           // ✅ Implemented
  onBulkUpdate?: (event: BulkUpdateEvent) => void;           // ✅ Implemented
  onRowsReorder?: (event: RowReorderEvent) => void;          // ✅ Implemented
  onContentUpdate?: (rowId: UID, content: RowContent) => void; // ✅ Implemented
  
  // Event Handlers - UI Actions
  onRowOpen?: (row: Row) => void;                            // ✅ Implemented
  onFieldChange?: (fields: FieldDefinition[]) => void;       // 🚧 Planned
  
  // Event Handlers - View Management
  onViewChange?: (view: ViewConfig) => void;                 // ✅ Implemented
  onCreateView?: (view: ViewConfig) => void;                 // ✅ Implemented
  onUpdateView?: (view: ViewConfig) => void;                 // ✅ Implemented
  onDeleteView?: (viewId: string) => void;                   // ✅ Implemented

  // Advanced Props
  contentResolver?: (id: UID) => Promise<ContentItem>;
}
```

---

## Event Firing Frequency

**High Frequency Events**:
- `onChange`: Fires on every data modification (could be multiple times per second during rapid editing)
- `onContentUpdate`: Fires as user types in description editor (debounce recommended)

**Medium Frequency Events**:
- `onBulkUpdate`: Fires once per drag-fill operation
- `onRowsReorder`: Fires once per row drag-and-drop
- `onViewChange`: Fires when user switches between views

**Low Frequency Events**:
- `onCreateView`: Fires when user creates a new view
- `onUpdateView`: Fires when user saves view changes
- `onDeleteView`: Fires when user deletes a view
- `onFieldChange`: Would fire when user changes table configuration
- `onRowOpen`: Fires when user clicks a row to open detail panel

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

## onContentUpdate - Row Content Changes

**Trigger**: Emitted when row content (description, links, documents, diagrams) is updated in the detail panel.

**Signature**:
```typescript
onContentUpdate?: (rowId: UID, content: RowContent) => void;
```

**Payload Parameters**:
- `rowId`: The unique identifier of the row being updated
- `content`: The complete updated content object

**Payload Type**:
```typescript
interface RowContent {
  description: string;           // Markdown text
  mermaidDiagrams?: string[];   // Array of Mermaid graph definitions
  links?: Link[];               // External links
  documents?: Document[];       // Embedded documents (PDFs, images, etc.)
  attachments?: Attachment[];   // File attachments
}

interface Link {
  id: UID;
  url: string;
  title: string;
  description?: string;
  favicon?: string;
}

interface Document {
  id: UID;
  filename: string;
  mime: string;
  size: number;
  url: string;
  thumbnail?: string;
  uploadedAt: string;     // ISO timestamp
}
```

**Example Payload**:
```javascript
// rowId
"row_test_42"

// content
{
  description: "# Task Overview\n\nThis task involves...\n\n[Documentation](https://example.com)",
  mermaidDiagrams: [
    "graph TD\n  A[Start] --> B[End]"
  ],
  links: [
    {
      id: "link_1",
      url: "https://example.com",
      title: "Documentation"
    }
  ],
  documents: [],
  attachments: []
}
```

**Usage Example**:
```typescript
const handleContentUpdate = async (rowId: string, content: RowContent) => {
  console.log(`Content updated for row ${rowId}`);
  
  // Save to backend
  await api.updateRowContent(rowId, content);
  
  // Update analytics
  trackEvent('row_content_updated', {
    rowId,
    hasDescription: !!content.description,
    linkCount: content.links?.length || 0,
    diagramCount: content.mermaidDiagrams?.length || 0,
  });
};

<GitBoardTable
  fields={fields}
  rows={rows}
  onContentUpdate={handleContentUpdate}
/>
```

**When It Fires**:

1. **Description Edit**: User modifies markdown content in the UnifiedDescriptionEditor
2. **Link Addition**: User pastes a URL into the description
3. **Mermaid Diagram**: User adds or modifies a ```mermaid code block
4. **Document Upload**: User uploads a file attachment

---

## onRowsReorder - Row Reordering

**Trigger**: Emitted when rows are reordered via drag-and-drop.

**Signature**:
```typescript
onRowsReorder?: (event: RowReorderEvent) => void;
```

**Payload Type**:
```typescript
interface RowReorderEvent {
  fromIndex: number;  // Original position
  toIndex: number;    // New position
  rowId: UID;         // ID of the row being moved
}

type UID = string;
```

**Example Payload**:
```javascript
{
  fromIndex: 2,
  toIndex: 5,
  rowId: "row_test_42"
}
// Row at position 2 moved to position 5
```

**Usage Example**:
```typescript
const handleRowsReorder = (event: RowReorderEvent) => {
  console.log(`Row ${event.rowId} moved from position ${event.fromIndex} to ${event.toIndex}`);
  
  // Track analytics
  trackEvent('row_reordered', {
    rowId: event.rowId,
    distance: Math.abs(event.toIndex - event.fromIndex),
  });
  
  // Optional: Save new order to backend
  await api.updateRowOrder(event);
};

<GitBoardTable
  fields={fields}
  rows={rows}
  onChange={handleRowChange}
  onRowsReorder={handleRowsReorder}
/>
```

**When It Fires**:

1. User clicks and drags a row number
2. User drops the row at a new position
3. The table updates automatically
4. Both `onChange` (with reordered rows) and `onRowsReorder` fire

**Important Notes**:

- The component automatically reorders rows internally
- `onChange` will also fire with the reordered rows array
- `onRowsReorder` provides the specific indices for tracking/logging
- Row order is based on the current filtered/sorted view

---

## View Events

The GitBoardTable supports a complete view management system similar to GitHub Projects. Views allow users to save different combinations of filters, sorting, and column visibility.

### onViewChange - View Switching

**Trigger**: Emitted when user switches between different saved views.

**Signature**:
```typescript
onViewChange?: (view: ViewConfig) => void;
```

**Payload Type**:
```typescript
interface ViewConfig {
  id: UID;
  name: string;
  filters: FilterConfig[];
  sortBy: SortConfig | null;
  columns: UID[];  // Ordered list of visible field IDs
}

interface FilterConfig {
  id: UID;
  field: UID;
  operator: FilterOperator;
  value: any;
}

interface SortConfig {
  field: UID;
  direction: 'asc' | 'desc';
}

type FilterOperator = 
  | 'equals' 
  | 'not-equals' 
  | 'contains' 
  | 'not-contains' 
  | 'is-empty' 
  | 'is-not-empty'
  | 'greater-than'
  | 'less-than';
```

**Example Payload**:
```javascript
{
  id: "view_my_tasks",
  name: "My Tasks",
  filters: [
    {
      id: "filter_1",
      field: "fld_assignee",
      operator: "equals",
      value: "usr_tony_a19f2"
    },
    {
      id: "filter_2",
      field: "fld_status",
      operator: "not-equals",
      value: "opt_status_done"
    }
  ],
  sortBy: {
    field: "fld_due_date",
    direction: "asc"
  },
  columns: ["fld_title", "fld_status", "fld_due_date", "fld_assignee"]
}
```

**Usage Example**:
```typescript
const handleViewChange = (view: ViewConfig) => {
  console.log('🔍 View changed:', view.name);
  
  // Track analytics
  trackEvent('view_switched', {
    viewId: view.id,
    viewName: view.name,
    filterCount: view.filters.length,
  });
  
  // Optional: Save last viewed to localStorage
  localStorage.setItem('lastViewId', view.id);
};

<GitBoardTable
  fields={fields}
  rows={rows}
  views={views}
  onViewChange={handleViewChange}
/>
```

### onCreateView - View Creation

**Trigger**: Emitted when user creates a new view via the "+ Add view" button.

**Signature**:
```typescript
onCreateView?: (view: ViewConfig) => void;
```

**Payload Type**: Same as `ViewConfig` above

**Example Payload**:
```javascript
{
  id: "view_generated_id_123",
  name: "New View",
  filters: [],
  sortBy: null,
  columns: ["fld_title", "fld_status", "fld_assignee"]
}
```

**Usage Example**:
```typescript
const handleCreateView = (view: ViewConfig) => {
  console.log('✨ View created:', view.name);
  
  // Add to state
  setViews(prev => [...prev, view]);
  
  // Save to backend
  await api.createView(view);
  
  // Track analytics
  trackEvent('view_created', {
    viewId: view.id,
    viewName: view.name,
  });
};

<GitBoardTable
  fields={fields}
  rows={rows}
  views={views}
  onCreateView={handleCreateView}
/>
```

### onUpdateView - View Updates

**Trigger**: Emitted when user modifies an existing view (renames, saves filter changes, etc.).

**Signature**:
```typescript
onUpdateView?: (view: ViewConfig) => void;
```

**Payload Type**: Same as `ViewConfig` above

**Example Payload**:
```javascript
{
  id: "view_my_tasks",
  name: "My Tasks (Updated)", // Name changed
  filters: [
    {
      id: "filter_1",
      field: "fld_assignee",
      operator: "equals",
      value: "usr_tony_a19f2"
    }
  ],
  sortBy: {
    field: "fld_priority",
    direction: "desc"
  },
  columns: ["fld_title", "fld_status", "fld_priority"]
}
```

**Usage Example**:
```typescript
const handleUpdateView = (view: ViewConfig) => {
  console.log('💾 View updated:', view.name);
  
  // Update in state
  setViews(prev => prev.map(v => v.id === view.id ? view : v));
  
  // Save to backend
  await api.updateView(view);
  
  // Track analytics
  trackEvent('view_updated', {
    viewId: view.id,
    changes: detectChanges(oldView, view),
  });
};

<GitBoardTable
  fields={fields}
  rows={rows}
  views={views}
  onUpdateView={handleUpdateView}
/>
```

### onDeleteView - View Deletion

**Trigger**: Emitted when user deletes a view via the dropdown menu.

**Signature**:
```typescript
onDeleteView?: (viewId: string) => void;
```

**Payload**: String - the unique identifier of the deleted view

**Example Payload**:
```javascript
"view_my_tasks"
```

**Usage Example**:
```typescript
const handleDeleteView = async (viewId: string) => {
  console.log('🗑️ View deleted:', viewId);
  
  // Confirm deletion
  const confirmed = await confirm('Delete this view?');
  if (!confirmed) return;
  
  // Remove from state
  setViews(prev => prev.filter(v => v.id !== viewId));
  
  // Delete from backend
  await api.deleteView(viewId);
  
  // Track analytics
  trackEvent('view_deleted', { viewId });
};

<GitBoardTable
  fields={fields}
  rows={rows}
  views={views}
  onDeleteView={handleDeleteView}
/>
```

**Complete View Management Example**:

```typescript
const MyComponent = () => {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [views, setViews] = useState<ViewConfig[]>(initialViews);
  const [currentView, setCurrentView] = useState<ViewConfig | null>(views[0] || null);

  const handleViewChange = (view: ViewConfig) => {
    console.log('Switching to view:', view.name);
    setCurrentView(view);
    trackEvent('view_switched', { viewName: view.name });
  };

  const handleCreateView = async (view: ViewConfig) => {
    // Add to local state
    setViews(prev => [...prev, view]);
    
    // Persist to backend
    await api.createView(view);
    
    toast.success(`View "${view.name}" created`);
  };

  const handleUpdateView = async (view: ViewConfig) => {
    // Update local state
    setViews(prev => prev.map(v => v.id === view.id ? view : v));
    
    // Persist to backend
    await api.updateView(view);
    
    toast.success(`View "${view.name}" updated`);
  };

  const handleDeleteView = async (viewId: string) => {
    const view = views.find(v => v.id === viewId);
    
    // Remove from state
    setViews(prev => prev.filter(v => v.id !== viewId));
    
    // If current view was deleted, switch to first available
    if (currentView?.id === viewId) {
      setCurrentView(views[0] || null);
    }
    
    // Persist to backend
    await api.deleteView(viewId);
    
    toast.success(`View "${view?.name}" deleted`);
  };

  return (
    <GitBoardTable
      fields={fields}
      rows={rows}
      views={views}
      initialView={currentView}
      onChange={setRows}
      onViewChange={handleViewChange}
      onCreateView={handleCreateView}
      onUpdateView={handleUpdateView}
      onDeleteView={handleDeleteView}
    />
  );
};
```

---

## Column Values Events (Detail Panel)

The detail panel includes a **ColumnValuesList** component that allows editing row values directly from the side panel. These events are handled internally by the GitBoardTable but trigger the same `onChange` callback.

### Internal Event: onRowUpdate

**Trigger**: Emitted when a column value is edited in the detail panel's column values list.

**Internal Signature** (RowDetailPanel):
```typescript
onRowUpdate?: (rowId: string, fieldId: string, value: CellValue) => void;
```

**Payload Parameters**:
- `rowId`: The unique identifier of the row being updated
- `fieldId`: The unique identifier of the field (column) being updated
- `value`: The new value for the cell

**Payload Types**:
```typescript
type CellValue =
  | string           // Text, title, single-select option ID
  | number           // Numeric fields
  | string[]         // Multi-select option IDs
  | null             // Empty/cleared value
  | undefined;       // Unset value

type UID = string;
```

**Example Payloads**:

```javascript
// Text field update
onRowUpdate("row_42", "fld_title_aa12e", "Updated Task Title")

// Status (single-select) update
onRowUpdate("row_42", "fld_status_c81f3", "opt_status_progress_29bb")

// Number field update
onRowUpdate("row_42", "fld_estimate_88a2", 8)

// Date field update
onRowUpdate("row_42", "fld_due_date_77c1", "2025-12-31")

// Clearing a value
onRowUpdate("row_42", "fld_owner_19ad8", null)
```

**How It Works**:

When a user edits a value in the ColumnValuesList component:

1. **User Action**: Clicks on a field value in the detail panel
2. **Edit Mode**: Field becomes editable (input, select, date picker, etc.)
3. **Value Change**: User modifies the value
4. **onRowUpdate Fires**: `RowDetailPanel` calls `onRowUpdate(rowId, fieldId, newValue)`
5. **GitBoardTable Handler**: `handleRowValueUpdate` processes the update
6. **Cell Edit Reuse**: Calls `handleCellEdit` to update the row data
7. **onChange Fires**: Parent receives updated rows via `onChange` callback
8. **Panel Refresh**: Detail panel updates to show the new value

**Internal Handler (GitBoardTable)**:
```typescript
const handleRowValueUpdate = (rowId: string, fieldId: string, value: CellValue) => {
  // Reuse the existing handleCellEdit logic
  handleCellEdit({ rowId, fieldId, value });

  // Update the detail panel row to reflect changes
  const updatedRows = rows.map((row) => {
    if (row.id === rowId) {
      return {
        ...row,
        values: {
          ...row.values,
          [fieldId]: value,
        },
      };
    }
    return row;
  });

  const updatedRow = updatedRows.find((r) => r.id === rowId);
  if (updatedRow) {
    setDetailPanelRow(updatedRow);
  }
};
```

**Parent Component Perspective**:

From the parent component's perspective, column value edits in the detail panel are **indistinguishable from table cell edits**. Both trigger the same `onChange` event:

```typescript
const MyComponent = () => {
  const [rows, setRows] = useState<Row[]>(initialRows);

  const handleChange = (updatedRows: Row[]) => {
    console.log('Rows updated - could be from table OR detail panel');
    setRows(updatedRows);
    
    // Save to backend
    api.saveRows(updatedRows);
  };

  return (
    <GitBoardTable
      fields={fields}
      rows={rows}
      onChange={handleChange}  // ← Receives updates from BOTH sources
    />
  );
};
```

**Field Type Behaviors in ColumnValuesList**:

| Field Type | Edit Behavior | Value Type | Example |
|------------|---------------|------------|---------|
| **text** | Click to edit with text input | `string` | `"Task Title"` |
| **title** | Click to edit with text input | `string` | `"Main Task"` |
| **number** | Click to edit with number input | `number` | `42` |
| **date** | Click to edit with date picker | `string` (ISO date) | `"2025-12-31"` |
| **single-select** | Dropdown menu (instant update) | `string` (option ID) | `"opt_status_done_77de"` |
| **multi-select** | Display only (not editable yet) | `string[]` | `["opt_1", "opt_2"]` |
| **assignee** | Display only (not editable yet) | `string` (user ID) | `"usr_tony_a19f2"` |
| **iteration** | Display only (not editable yet) | `string` (iteration ID) | `"itr_week_1_baa21"` |

**Keyboard Shortcuts**:

- **Enter**: Save the current edit
- **Escape**: Cancel the current edit and revert to original value
- **Tab**: Save and move to next field (planned)

**Visual States**:

- **Default**: Value displayed with hover effect
- **Editing**: Input field with blue border and focus ring
- **Empty**: Displays placeholder text in gray italic
- **Select Fields**: Always show dropdown (no edit mode)

**Usage Example - Monitoring Column Changes**:

```typescript
const MyComponent = () => {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [lastEdit, setLastEdit] = useState<{field: string, value: any} | null>(null);

  const handleChange = (updatedRows: Row[]) => {
    // Find what changed
    const changedRow = updatedRows.find((r, i) => 
      JSON.stringify(r) !== JSON.stringify(rows[i])
    );
    
    if (changedRow) {
      // Detect which field changed
      const oldRow = rows.find(r => r.id === changedRow.id);
      if (oldRow) {
        const changedFieldId = Object.keys(changedRow.values).find(
          fieldId => changedRow.values[fieldId] !== oldRow.values[fieldId]
        );
        
        if (changedFieldId) {
          setLastEdit({
            field: changedFieldId,
            value: changedRow.values[changedFieldId]
          });
        }
      }
    }
    
    setRows(updatedRows);
  };

  return (
    <>
      {lastEdit && (
        <div>Last edit: {lastEdit.field} = {lastEdit.value}</div>
      )}
      <GitBoardTable
        fields={fields}
        rows={rows}
        onChange={handleChange}
      />
    </>
  );
};
```

**Component Architecture**:

```
GitBoardTable
  └── RowDetailPanel
        ├── UnifiedDescriptionEditor
        │     └── onChange(description, metadata)
        │           └── triggers onContentUpdate
        │
        └── ColumnValuesList
              ├── Text/Number/Date fields: inline editing
              ├── Single-select: dropdown selection
              └── onValueChange(fieldId, value)
                    └── triggers onRowUpdate
                          └── triggers handleCellEdit
                                └── triggers onChange
```

**Best Practices**:

1. **Always handle `onChange`**: Column value edits flow through the same `onChange` callback as table edits
2. **Keep state synchronized**: Use React state and pass it to both `rows` prop and `onChange` handler
3. **Validate on change**: Add validation logic in your `onChange` handler if needed
4. **Debounce saves**: Consider debouncing backend saves for text field edits
5. **Handle errors gracefully**: Show user feedback if a save fails

**Future Enhancements**:

- Editable multi-select fields with checkbox dropdown
- Editable assignee fields with user picker
- Editable iteration fields with iteration selector
- Inline validation feedback
- Undo/redo support for detail panel edits
- Optimistic updates with rollback on error

---

## TypeScript Import

All types are exported from the package:

```typescript
import type {
  // Core Types
  Row,
  RowContent,
  FieldDefinition,
  FieldOption,
  CellValue,
  UID,
  
  // Content Types
  Link,
  Document,
  Attachment,
  
  // Event Types
  BulkUpdateEvent,
  BulkUpdateTarget,
  RowReorderEvent,
  
  // View Types
  ViewConfig,
  FilterConfig,
  SortConfig,
  FilterOperator,
  
  // Component Props
  GitBoardTableProps,
  
  // User & Iteration Types
  User,
  Iteration,
} from '@txtony/gitboard-table';
```
