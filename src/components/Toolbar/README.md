# ViewTabs Component

A tab-based navigation component for managing and switching between different views in the GitBoard table.

## Features

- **View Switching**: Click tabs to switch between saved views
- **Inline Editing**: Double-click a tab to rename the view
- **Add New Views**: Create new views with the "+ Add view" button
- **Delete Views**: Click the dropdown caret (▼) on a tab to open a menu with delete option (red)
- **Save Changes**: Save button appears when current view has unsaved filter changes
- **Smart Deletion**: Automatically switches to another view when deleting the active view

## Usage

```tsx
import { ViewTabs } from '@/components/Toolbar/ViewTabs';
import type { ViewConfig, FilterConfig } from '@/types';

function MyComponent() {
  const [views, setViews] = useState<ViewConfig[]>([
    {
      id: 'view_all',
      name: 'All Tasks',
      columns: ['fld_1', 'fld_2'],
      sortBy: null,
      filters: [],
      groupBy: null,
    },
    {
      id: 'view_my_tasks',
      name: 'My Tasks',
      columns: ['fld_1', 'fld_2'],
      sortBy: { field: 'fld_1', direction: 'asc' },
      filters: [
        { field: 'fld_owner', operator: 'equals', value: 'user_1' }
      ],
      groupBy: null,
    },
  ]);
  
  const [currentViewId, setCurrentViewId] = useState('view_all');
  const [currentFilters, setCurrentFilters] = useState<FilterConfig[]>([]);

  const handleViewChange = (view: ViewConfig) => {
    setCurrentViewId(view.id);
    setCurrentFilters(view.filters);
  };

  const handleCreateView = (view: ViewConfig) => {
    setViews([...views, view]);
  };

  const handleUpdateView = (updatedView: ViewConfig) => {
    setViews(views.map(v => v.id === updatedView.id ? updatedView : v));
  };

  const handleDeleteView = (viewId: string) => {
    setViews(views.filter(v => v.id !== viewId));
  };

  return (
    <ViewTabs
      views={views}
      currentViewId={currentViewId}
      currentFilters={currentFilters}
      onViewChange={handleViewChange}
      onCreateView={handleCreateView}
      onUpdateView={handleUpdateView}
      onDeleteView={handleDeleteView}
    />
  );
}
```

## Props

### ViewTabsProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `views` | `ViewConfig[]` | ✓ | Array of view configurations |
| `currentViewId` | `string` | ✓ | ID of the currently active view |
| `currentFilters` | `FilterConfig[]` | ✓ | Current filter state (for detecting unsaved changes) |
| `onViewChange` | `(view: ViewConfig) => void` | ✓ | Callback when a view tab is clicked |
| `onCreateView` | `(view: ViewConfig) => void` | - | Callback when a new view is created |
| `onUpdateView` | `(view: ViewConfig) => void` | - | Callback when a view is updated (rename or save) |
| `onDeleteView` | `(viewId: string) => void` | - | Callback when a view is deleted |

## Types

### ViewConfig

```typescript
interface ViewConfig {
  id: string;
  name: string;
  columns: string[];
  sortBy: { field: string; direction: 'asc' | 'desc' } | null;
  filters: FilterConfig[];
  groupBy: string | null;
}
```

### FilterConfig

```typescript
interface FilterConfig {
  field: string;
  operator: 'equals' | 'not-equals' | 'contains' | 'not-contains' | 'greater-than' | 'less-than' | 'is-empty' | 'is-not-empty';
  value: string | number | boolean;
}
```

## Events

### onViewChange

Fired when a user clicks on a view tab to switch views.

**Payload**: `ViewConfig` - The view that was selected

**Example**:
```typescript
const handleViewChange = (view: ViewConfig) => {
  console.log('Switched to view:', view.name);
  setCurrentViewId(view.id);
  setCurrentFilters(view.filters);
};
```

### onCreateView

Fired when a user clicks the "+ Add view" button. You should add the new view to your state and optionally switch to it.

**Payload**: `ViewConfig` - A new view object with a unique ID and default values

**Example**:
```typescript
const handleCreateView = (view: ViewConfig) => {
  console.log('Creating new view:', view.name);
  setViews([...views, view]);
  setCurrentViewId(view.id);
};
```

### onUpdateView

Fired when a view is updated (renamed via double-click edit, or saved with modified filters).

**Payload**: `ViewConfig` - The updated view object

**Example**:
```typescript
const handleUpdateView = (updatedView: ViewConfig) => {
  console.log('Updating view:', updatedView.name);
  setViews(views.map(v => v.id === updatedView.id ? updatedView : v));
};
```

### onDeleteView

Fired when a user clicks the delete button (X) on a view tab.

**Payload**: `string` - The ID of the view to be deleted

**Behavior**:
- Delete button only appears when `onDeleteView` is provided
- Delete button is hidden when only 1 view exists (cannot delete the last view)
- If deleting the active view, the component automatically calls `onViewChange` with another view before calling `onDeleteView`

**Example**:
```typescript
const handleDeleteView = (viewId: string) => {
  console.log('Deleting view:', viewId);
  
  // Remove the view from state
  setViews(views.filter(v => v.id !== viewId));
  
  // Note: If this was the active view, onViewChange was already called
  // by ViewTabs component to switch to another view first
};
```

## User Interactions

### Switching Views

1. Click on any tab to activate that view
2. The tab becomes highlighted and shows an active state
3. `onViewChange` is called with the selected view

### Renaming Views

1. Double-click on a tab to enter edit mode
2. The tab becomes an input field with the current name selected
3. Type the new name
4. Press Enter to save or Escape to cancel
5. Click outside to save
6. `onUpdateView` is called with the renamed view

### Creating Views

1. Click the "+ Add view" button
2. A new view is created with default values
3. The new view enters edit mode immediately for naming
4. `onCreateView` is called with the new view
5. `onViewChange` is called to switch to the new view

### Deleting Views

1. Click the caret icon (▼) on the right side of any tab
2. A dropdown menu appears with available options
3. Click the "Delete" option (displayed in red with a trash icon)
4. The dropdown closes and the view is deleted
5. If deleting the active view:
   - `onViewChange` is called first with another view (typically the first remaining view)
   - Then `onDeleteView` is called with the deleted view's ID
6. If deleting a non-active view:
   - Only `onDeleteView` is called
7. Caret icon is hidden when only 1 view remains
8. Clicking outside the dropdown closes it without taking action

### Saving Changes

1. Modify filters in the current view
2. A "Save" button appears (only if `onUpdateView` is provided)
3. Click "Save" to persist the filter changes
4. `onUpdateView` is called with the updated view

## Styling

The component uses CSS custom properties for theming and supports both light and dark modes:

```css
.gitboard-view-tabs - Main container
.gitboard-view-tabs__tab - Individual tab button
.gitboard-view-tabs__tab--active - Active tab state
.gitboard-view-tabs__badge - Filter count badge
.gitboard-view-tabs__caret - Dropdown caret icon
.gitboard-view-tabs__dropdown - Dropdown menu container
.gitboard-view-tabs__dropdown-item - Menu item
.gitboard-view-tabs__dropdown-item--danger - Delete menu item (red)
.gitboard-view-tabs__add-button - Add view button
.gitboard-view-tabs__save-button - Save changes button
.gitboard-view-tabs__input - Inline edit input
```

### Dropdown Menu Styling

The dropdown menu:
- Opens below the tab with shadow and border
- Contains menu items with hover effects
- Delete option styled in red (#dc2626)
- Includes trash icon
- Positioned absolutely with z-index: 1000
- Auto-closes when clicking outside

## Accessibility

- Uses ARIA role="tablist" for the container
- Each tab has role="tab" with aria-selected attribute
- Delete buttons have descriptive aria-label including view name
- Supports keyboard navigation (Enter/Escape for editing)
- Proper focus management when editing

## Notes

- View IDs should be unique
- At least one view should always exist (delete button hidden for single view)
- The component handles automatic view switching when deleting the active view
- Filter comparison is done via JSON.stringify() for detecting unsaved changes
- New views are created with a generated unique ID using `generateRowId()`
