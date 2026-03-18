# GitBoard Custom Content Slot - Changelog

## Version 0.1.32

### New Feature: Custom Content Slot in Row Detail Panel

Added a new `renderRowDetailContent` prop to `GitBoardTable` that allows rendering custom content in the row detail panel.

#### Changes Made

**1. Type Definitions (`src/types/index.ts`)**
- Added `renderRowDetailContent?: (row: Row) => React.ReactNode` to `GitBoardTableProps`
- Exported additional types:
  - `RowContent`
  - `Link`
  - `Document`
  - `CustomAction`
  - `ContextMenuClickEvent`

**2. Row Detail Panel (`src/components/ContentPanel/RowDetailPanel.tsx`)**
- Added `renderCustomContent` prop to `RowDetailPanelProps`
- Modified layout to display custom content in a full-width section below the description editor and column values
- Custom content is rendered with a top border separator when provided

**3. Main Table Component (`src/components/GitBoardTable.tsx`)**
- Added `renderRowDetailContent` to destructured props
- Passed `renderRowDetailContent` to `RowDetailPanel` as `renderCustomContent`

**4. Package Exports (`src/index.ts`)**
- Exported missing types that are commonly used in custom content implementations

#### Usage Example

```tsx
import { GitBoardTable } from '@txtony/gitboard-table';
import type { Row } from '@txtony/gitboard-table';

<GitBoardTable
  fields={fields}
  rows={rows}
  // ... other props
  renderRowDetailContent={(row: Row) => (
    <div className="my-custom-content">
      <h3>Custom Section for {row.id}</h3>
      {/* Render any custom UI here - attachments, comments, etc. */}
    </div>
  )}
/>
```

#### Layout Structure

When custom content is rendered:

```
┌─────────────────────────────────────────────┐
│ Row Detail Panel Header                     │
├────────────────┬────────────────────────────┤
│ Description    │ Column Values              │
│ Editor         │                            │
│                │                            │
├────────────────┴────────────────────────────┤
│ ─────────────────────────────────────────── │ ← Separator
│ Custom Content Section                      │
│ (renderRowDetailContent output)             │
│                                             │
└─────────────────────────────────────────────┘
```

#### CSS Classes

The custom content section has the following class for styling:

```css
.gitboard-row-detail-panel__custom-content
```

You can target this class for custom styling if needed.

#### Benefits

- **Extensible**: Add any custom functionality to row detail panels without modifying GitBoard
- **Flexible**: Render attachments, comments, activity logs, or any custom UI
- **Type-Safe**: Full TypeScript support with proper row typing
- **Isolated**: Custom content doesn't interfere with existing panel functionality

#### Breaking Changes

None. This is a backward-compatible addition. Existing implementations will continue to work unchanged.

#### Migration from Dialog-Based Approach

If you previously used a separate dialog for custom content (like attachments), you can now integrate it directly:

**Before:**
```tsx
// Separate dialog opened from context menu
const [showAttachmentsDialog, setShowAttachmentsDialog] = useState(false);
const customActions = [
  { name: 'attachments', label: 'Attachments', icon: '📎' }
];

<AttachmentsDialog
  isOpen={showAttachmentsDialog}
  onClose={() => setShowAttachmentsDialog(false)}
  row={selectedRow}
/>
```

**After:**
```tsx
// Integrated into detail panel
<GitBoardTable
  renderRowDetailContent={(row) => (
    <AttachmentSection rowId={row.id} />
  )}
/>
```

#### Next Steps

To use this feature in your project:

1. Update `@txtony/gitboard-table` to version `0.1.32` or higher
2. Add the `renderRowDetailContent` prop to your `GitBoardTable` component
3. Implement your custom content renderer function
4. Remove any dialog-based workarounds if applicable

---

**Version:** 0.1.32
**Date:** 2024-02-12
**Author:** TxTony
