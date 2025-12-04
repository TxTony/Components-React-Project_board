# GitBoard Table

A reusable GitHub-Projects-style table component, built with React + TypeScript, TailwindCSS, and theme support. Designed for internal tools, admin dashboards, project boards, and data-heavy applications.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![Tests](https://img.shields.io/badge/tests-264%20passing-success.svg)](https://vitest.dev/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 🚀 Getting Started

### Installation

```bash
npm install @txtony/gitboard-table
```

Or with yarn:

```bash
yarn add @txtony/gitboard-table
```

### Peer Dependencies

Make sure you have the required peer dependencies installed:

```bash
npm install react react-dom tailwindcss
```

### Basic Usage

```tsx
import { useState } from 'react';
import { GitBoardTable } from '@txtony/gitboard-table';
import type { FieldDefinition, Row } from '@txtony/gitboard-table';
import '@txtony/gitboard-table/styles.css';

const fields: FieldDefinition[] = [
  {
    id: 'fld_title_1',
    name: 'Title',
    type: 'title',
    visible: true,
  },
  {
    id: 'fld_status_1',
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
    id: 'fld_assignee_1',
    name: 'Assignee',
    type: 'assignee',
    visible: true,
    options: [
      { id: 'usr_1', label: 'Alice', color: '#8b5cf6' },
      { id: 'usr_2', label: 'Bob', color: '#f59e0b' },
    ],
  },
];

const initialRows: Row[] = [
  {
    id: 'row_1',
    values: {
      fld_title_1: 'Implement export system',
      fld_status_1: 'opt_inprog',
      fld_assignee_1: 'usr_1',
    },
  },
];

export function App() {
  const [rows, setRows] = useState<Row[]>(initialRows);

  return (
    <GitBoardTable
      fields={fields}
      rows={rows}
      theme="light"
      tableId="my-project-board"
      onChange={setRows}
    />
  );
}
```

### Tailwind Configuration

Add the component to your Tailwind config to enable proper styling:

```js
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/@txtony/gitboard-table/**/*.{js,jsx,ts,tsx}',
  ],
  // ... rest of your config
};
```

## ✨ Features

### 🎛 Configurable Field Types

- **Title** - Primary text field for row identification
- **Text** - General text input
- **Number** - Numeric values with validation
- **Date** - Date picker with calendar UI
- **Single-select** - Dropdown with one choice
- **Multi-select** - Dropdown with multiple choices
- **Assignee** - User assignment with colored badges
- **Iteration** - Sprint/milestone tracking

### ✍️ Inline Cell Editing

- **Double-click to edit** - Single click selects, double-click enters edit mode
- **Field-aware editors** - Specialized input for each field type
- **Keyboard shortcuts**:
  - `Enter` to commit changes
  - `Escape` to cancel
  - Arrow keys for navigation
- **Visual feedback** - Blue ring on selected cells

### 🎯 Cell Selection & Bulk Operations

- **Single-click selection** - Click any cell to select it
- **Drag-fill support** - Excel-style drag handle for bulk updates (works automatically!)
- **Visual indicators** - Selected cells show blue ring, drag targets show green highlight
- **Automatic updates** - Component handles bulk edits internally, consistent with single cell edits
- **Optional events** - `onBulkUpdate` callback provides details for analytics/logging

### 🔍 Advanced Filtering

- **Inline filter syntax** - Type filters directly: `status:equals:done title:contains:login`
- **Smart autocomplete** - Context-aware suggestions for fields, operators, and values
- **Multiple filters** - Combine multiple filters with spaces
- **Negative filters** - Use `-` prefix to exclude: `-status:equals:done`
- **Comparison operators** - For numbers: `points:>:3`, `points:<=:5`
- **Quoted values** - Support spaces: `title:"login page"`
- **Supported operators**:
  - `contains` / `is` - Contains text
  - `equals` / `=` - Exact match
  - `not-equals` / `!=` - Does not match
  - `is-empty` - Field is empty
  - `is-not-empty` - Field has value
  - `>`, `>=`, `<`, `<=` - Numeric comparisons

📖 **See [FILTER_SYSTEM.md](./FILTER_SYSTEM.md)** for complete filter documentation and Firebase/Firestore adapter instructions.

### 👁️ View Management

Save and switch between different table configurations (filters, sorting, column visibility):

- **Multiple views** - Create unlimited views with different configurations
- **Tab navigation** - Click view tabs to switch between saved views
- **Quick create** - Click "+ Add view" button to create new views instantly
- **Rename views** - Double-click any view tab to edit its name
- **Auto-apply** - Switching views automatically applies filters, sorting, and column visibility
- **Unsaved changes indicator** - "Save" button appears when filters are modified
- **Save current state** - Click "Save" to update view with current filters
- **View properties**:
  - Name (editable)
  - Filters (can be saved and restored)
  - Sort configuration
  - Column visibility and order (auto-saved on change)
  - Filter count badge
- **Auto-save features**:
  - Column reordering automatically updates the current view
  - Column visibility changes (show/hide) automatically update the current view
  - Filter changes require manual save (via "Save" button)

**Example**:
```tsx
import { useState } from 'react';
import { GitBoardTable } from '@txtony/gitboard-table';
import type { ViewConfig } from '@txtony/gitboard-table';

const initialViews: ViewConfig[] = [
  {
    id: 'view_all',
    name: 'All Tasks',
    columns: ['fld_title', 'fld_status', 'fld_assignee'],
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
];

function App() {
  const [views, setViews] = useState<ViewConfig[]>(initialViews);

  const handleCreateView = (view: ViewConfig) => {
    console.log('New view created:', view);
    setViews(prev => [...prev, view]);
  };

  const handleUpdateView = (view: ViewConfig) => {
    console.log('View updated:', view);
    setViews(prev => prev.map(v => v.id === view.id ? view : v));
  };

  const handleViewChange = (view: ViewConfig) => {
    console.log('Switched to view:', view.name);
  };

  return (
    <GitBoardTable
      fields={fields}
      rows={rows}
      views={views}
      onViewChange={handleViewChange}
      onCreateView={handleCreateView}
      onUpdateView={handleUpdateView}
    />
  );
}
```

### 📊 Sorting & Organization

- **Click to sort** - Click column headers to sort ascending/descending
- **Visual indicators** - Arrow shows current sort direction
- **Multi-type support** - Smart sorting for text, numbers, dates, and selects
- **Persistent state** - Sort preferences saved to localStorage

### 🔄 Column Management

- **Drag to reorder** - Rearrange columns by dragging headers
- **Resize columns** - Drag the right edge of any column header to resize
- **Show/Hide columns** - Toggle column visibility via eye icon menu
- **Minimum width** - Columns cannot be smaller than 80px
- **Persistent layout** - Column order, widths, and visibility saved automatically
- **Visual feedback** - Blue highlight on resize handle hover
- **Column counter** - Shows visible/total count (e.g., "3/4")

### ✅ Row Selection

- **Checkbox selection** - Select individual or all rows
- **Bulk operations** - Delete multiple rows at once
- **Visual feedback** - Selected rows highlighted
- **Toolbar actions** - Context-sensitive toolbar for selected rows

### 📝 Add Rows

- **Quick add** - Type title and press Enter to create new row
- **Empty row creation** - Add blank rows via toolbar
- **Auto-scroll** - Newly added rows scroll into view

### 🎨 Theme Support

- **Light & Dark modes** - GitHub-inspired color schemes
- **CSS variables** - Easily customizable via CSS custom properties
- **Seamless switching** - Change themes at runtime
- **System detection** - Can follow system theme preference

### 💾 Automatic Persistence

- **localStorage integration** - Table state automatically saved
- **Unique table IDs** - Multiple tables with separate states
- **Saved state includes**:
  - Column order
  - Column widths
  - Column visibility (show/hide)
  - Sort configuration
  - Active filters
- **Instant restore** - State loaded on component mount

### 🎯 Advanced Features

- **Context menus** - Right-click for row/column actions
- **Keyboard navigation** - Full keyboard accessibility
- **Loading states** - Graceful handling of async operations
- **Error boundaries** - Resilient error handling
- **Type-safe** - Complete TypeScript coverage
- **Accessible** - ARIA labels and semantic HTML

## 📋 Available NPM Commands

### Development

```bash
# Start development server with hot reload
npm run dev
```

Starts Vite dev server at `http://localhost:5173`

### Building

```bash
# Build production bundle
npm run build
```

Outputs to `dist/` directory with ESM, CJS, and type definitions

```bash
# Preview production build
npm run preview
```

### Testing

```bash
# Run tests in watch mode
npm test
```

```bash
# Run tests with UI
npm run test:ui
```

Opens Vitest UI at `http://localhost:51204`

```bash
# Generate coverage report
npm run test:coverage
```

Outputs coverage to `coverage/` directory

### Code Quality

```bash
# Run ESLint
npm run lint
```

Checks TypeScript and React code for errors and style issues

### Storybook

```bash
# Start Storybook dev server
npm run storybook
```

Opens Storybook at `http://localhost:6006` with interactive component demos

```bash
# Build static Storybook
npm run build-storybook
```

Outputs to `storybook-static/` directory

## 📚 API Reference

### GitBoardTable Props

```typescript
interface GitBoardTableProps {
  // Required
  fields: FieldDefinition[];      // Column definitions
  rows: Row[];                    // Table data

  // Optional
  theme?: 'light' | 'dark';       // Theme mode (default: 'light')
  tableId?: string;               // Unique ID for state persistence
  onChange?: (rows: Row[]) => void;           // Called when rows change
  onRowOpen?: (row: Row) => void;             // Called when row is clicked
  onFieldChange?: (fields: FieldDefinition[]) => void;  // Called when fields change
  onBulkUpdate?: (event: BulkUpdateEvent) => void;      // Called on drag-fill
  contentResolver?: (id: UID) => Promise<ContentItem>;  // Async content loader
  users?: User[];                 // Available users for assignee field
  iterations?: Iteration[];       // Available iterations
  initialView?: ViewConfig;       // Initial sorting/filtering state
  views?: ViewConfig[];           // Array of available views
  onViewChange?: (view: ViewConfig) => void;   // Called when view is switched
  onCreateView?: (view: ViewConfig) => void;   // Called when new view is created
  onUpdateView?: (view: ViewConfig) => void;   // Called when view is updated
}
```

### FieldDefinition

```typescript
interface FieldDefinition {
  id: string;                     // Unique field identifier
  name: string;                   // Display name
  type: FieldType;                // Field type (see below)
  visible: boolean;               // Show/hide in table
  width?: number;                 // Column width in pixels
  options?: FieldOption[];        // For select/assignee/iteration types
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

### Row

```typescript
interface Row {
  id: string;                     // Unique row identifier
  values: Record<string, CellValue>;  // Field values keyed by field.id
  contentId?: string;             // Optional content panel ID
}

type CellValue = string | number | boolean | null | string[] | undefined;
```

### BulkUpdateEvent

```typescript
interface BulkUpdateEvent {
  sourceCell: {
    rowId: string;
    fieldId: string;
    value: CellValue;
  };
  targetCells: BulkUpdateTarget[];
  field: FieldDefinition;
}

interface BulkUpdateTarget {
  rowId: string;
  fieldId: string;
  currentValue: CellValue;
}
```

### ViewConfig

```typescript
interface ViewConfig {
  id: string;                     // Unique view identifier
  name: string;                   // Display name (editable)
  columns: string[];              // Visible field IDs in order
  sortBy: SortConfig | null;      // Sort configuration
  filters: FilterConfig[];        // Active filters
  groupBy: string | null;         // Field ID to group by (future)
}

interface SortConfig {
  field: string;                  // Field ID to sort by
  direction: 'asc' | 'desc';      // Sort direction
}

interface FilterConfig {
  field: string;                  // Field ID to filter
  operator: 'contains' | 'equals' | 'not-equals' | 'is-empty' | 'is-not-empty' | 'gt' | 'gte' | 'lt' | 'lte';
  value?: any;                    // Filter value (optional for is-empty/is-not-empty)
}
```

## 📡 Events & Callbacks

The component emits several events for different user interactions.

📖 **See [EVENTS.md](./EVENTS.md)** for complete event documentation including all payloads and examples.

### onChange - Row Data Changes

Called whenever row data is modified (cell edits, add row, delete rows, bulk updates).

```typescript
onChange?: (rows: Row[]) => void;
```

**Example**:
```typescript
const handleChange = (updatedRows: Row[]) => {
  console.log('Rows updated:', updatedRows);
  await api.updateRows(updatedRows);  // Sync with backend
};

<GitBoardTable
  fields={fields}
  rows={rows}
  onChange={handleChange}
/>
```

### onBulkUpdate - Drag-Fill Operations

✅ **NEW**: Drag-fill works automatically! This callback is **OPTIONAL** and used for analytics/logging only.

Called when user performs Excel-style drag-fill operations.

```typescript
onBulkUpdate?: (event: BulkUpdateEvent) => void;
```

**Basic Usage** - Drag-fill works automatically with just `onChange`:
```typescript
const [rows, setRows] = useState<Row[]>(initialRows);

<GitBoardTable
  fields={fields}
  rows={rows}
  onChange={setRows}  // Drag-fill works automatically!
/>
```

**Optional: With Analytics**:
```typescript
const handleBulkUpdate = (event: BulkUpdateEvent) => {
  // Log bulk update event
  console.log('Bulk update:', event.field.name, '→', event.targetCells.length, 'cells');

  // Track analytics
  trackEvent('bulk_update', {
    field: event.field.name,
    cellCount: event.targetCells.length,
  });
};

<GitBoardTable
  fields={fields}
  rows={rows}
  onChange={setRows}
  onBulkUpdate={handleBulkUpdate}  // Optional - for analytics only
/>
```

**How It Works**:
- Component updates cells automatically (internal state management)
- `onChange` fires with updated rows (just like single cell edits)
- `onBulkUpdate` fires with event details (if provided) for analytics/logging

### onRowOpen - Row Click (Planned)

🚧 Not yet implemented. Will be called when a row is clicked to open details.

### onFieldChange - Field Config Changes (Planned)

🚧 Not yet implemented. Will be called when field definitions are modified.

### onViewChange - View Switching

Called when the user switches between different views.

```typescript
onViewChange?: (view: ViewConfig) => void;
```

**Example**:
```typescript
const handleViewChange = (view: ViewConfig) => {
  console.log('Switched to:', view.name);
  console.log('Active filters:', view.filters.length);

  // Track analytics
  trackEvent('view_changed', {
    viewName: view.name,
    filterCount: view.filters.length,
  });
};

<GitBoardTable
  fields={fields}
  rows={rows}
  views={views}
  onViewChange={handleViewChange}
/>
```

### onCreateView - New View Creation

Called when the user creates a new view by clicking the "+ Add view" button.

```typescript
onCreateView?: (view: ViewConfig) => void;
```

**Example**:
```typescript
const [views, setViews] = useState<ViewConfig[]>(initialViews);

const handleCreateView = (newView: ViewConfig) => {
  console.log('New view created:', newView.name);

  // Add to state
  setViews(prev => [...prev, newView]);

  // Optionally save to backend
  await api.saveView(newView);
};

<GitBoardTable
  fields={fields}
  rows={rows}
  views={views}
  onCreateView={handleCreateView}
/>
```

### onUpdateView - View Updates

Called when the user modifies a view (renames it or saves filter changes).

```typescript
onUpdateView?: (view: ViewConfig) => void;
```

**Example**:
```typescript
const [views, setViews] = useState<ViewConfig[]>(initialViews);

const handleUpdateView = (updatedView: ViewConfig) => {
  console.log('View updated:', updatedView.name);

  // Update in state
  setViews(prev => prev.map(v => v.id === updatedView.id ? updatedView : v));

  // Optionally save to backend
  await api.updateView(updatedView);
};

<GitBoardTable
  fields={fields}
  rows={rows}
  views={views}
  onUpdateView={handleUpdateView}
/>
```

📖 **See [EVENTS.md](./EVENTS.md) for complete event documentation including:**
- Detailed payload structures
- When each event fires
- Best practices (debouncing, optimistic updates, validation)
- TypeScript types and examples

## 🎨 Theming

### Using Built-in Themes

```tsx
<GitBoardTable theme="dark" fields={fields} rows={rows} />
```

### Custom CSS Variables

Override theme variables in your CSS:

```css
:root {
  /* Background colors */
  --gb-bg-default: #ffffff;
  --gb-bg-muted: #f6f8fa;
  --gb-bg-subtle: #f0f3f6;
  --gb-bg-inset: #eff2f5;

  /* Border colors */
  --gb-border: #d0d7de;
  --gb-border-muted: #d8dee4;

  /* Text colors */
  --gb-text-primary: #1f2328;
  --gb-text-secondary: #656d76;
  --gb-text-tertiary: #8c959f;
  --gb-text-link: #0969da;

  /* Accent colors */
  --gb-accent-emphasis: #0969da;
  --gb-accent-muted: #ddf4ff;
  --gb-accent-subtle: #b6e3ff;

  /* Spacing */
  --gb-spacing-xs: 0.25rem;
  --gb-spacing-sm: 0.5rem;
  --gb-spacing-md: 0.75rem;
  --gb-spacing-lg: 1rem;
  --gb-spacing-xl: 1.5rem;

  /* Border radius */
  --gb-radius: 0.375rem;
}
```

## 🧪 Testing

The package includes comprehensive test coverage with:

- **264 passing tests**
- Vitest + React Testing Library
- Unit tests for all components
- Integration tests for complex interactions
- Utility function tests
- **14 bulk update tests** - Verify drag-fill functionality
- **58 view tabs tests** - Verify view switching, filters, creation, editing, and saving
- **5 view management tests** - Verify column visibility and filter application from views
- **5 FilterBar external filter tests** - Verify filter display from view changes
- **39 new view management tests** - Comprehensive coverage of:
  - Add view button functionality (7 tests)
  - Double-click to edit view name (11 tests)
  - Save button for filter changes (13 tests)
  - View creation and update callbacks (8 tests)

### Example Test

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GitBoardTable } from '@txtony/gitboard-table';

test('edits a cell value', async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();

  render(<GitBoardTable fields={fields} rows={rows} onChange={onChange} />);

  // Double-click to enter edit mode
  const cell = screen.getByText('Implement export system');
  await user.dblClick(cell);

  // Type new value
  const input = screen.getByRole('textbox');
  await user.clear(input);
  await user.type(input, 'New title{Enter}');

  // Verify onChange was called
  expect(onChange).toHaveBeenCalled();
});
```

## 🛠 Development Setup

```bash
# Clone the repository
git clone https://github.com/txtony/gitboard-table.git
cd gitboard-table

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests in watch mode
npm test

# Start Storybook
npm run storybook
```

## 📦 Package Exports

The package exports both ESM and CJS formats:

```
@txtony/gitboard-table/
├── dist/
│   ├── index.esm.js      # ES Module
│   ├── index.cjs.js      # CommonJS
│   ├── types.d.ts        # TypeScript definitions
│   └── styles.css        # Component styles
```

### Import Examples

```typescript
// Component
import { GitBoardTable } from '@txtony/gitboard-table';

// Types
import type { FieldDefinition, Row, CellValue } from '@txtony/gitboard-table';

// Styles
import '@txtony/gitboard-table/styles.css';
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📄 License

MIT © [TxTony](https://github.com/TxTony)

## 🙏 Acknowledgments

- Inspired by GitHub Projects table interface
- Built with [React](https://reactjs.org/)
- Styled with [TailwindCSS](https://tailwindcss.com/)
- Tested with [Vitest](https://vitest.dev/)
- Documented with [Storybook](https://storybook.js.org/)

---

Made with ❤️ by TxTony
