# Cell Interaction Behavior Update

## ✅ New Click Behavior Implemented

The cell interaction has been updated to work like a spreadsheet application:

### Select-Type Fields (Single-select, Multi-select, Assignee, Iteration)

**Single Click** → **Selects the cell** (shows blue ring border)
- Cell becomes selected with a blue ring outline
- Dropdown does NOT open
- User can navigate with keyboard

**Double Click** → **Opens dropdown editor**
- Dropdown appears with fixed positioning
- User can select/change value
- Click outside or Escape to close

**Click on Caret (▼)** → **Opens dropdown editor**
- Same as double-click
- Caret button has hover effect (gray background)
- Provides clear affordance for opening dropdown

### Text/Number/Date Fields (No Caret)

**Single Click** → **Enters edit mode immediately**
- Shows inline editor (text input, number input, or date picker)
- Text is selected for easy replacement
- Enter to save, Escape to cancel

**Double Click** → **Enters edit mode**
- Same behavior as single click for these field types

## Visual Indicators

### Selected Cell State
```css
/* Blue ring border when cell is selected */
.ring-2.ring-blue-500.ring-inset
```

### Caret Button
- Hover effect: Gray background
- Padding for larger click target
- Rounded corners
- Stops event propagation to prevent cell selection

## Code Changes

### src/components/Table/Cell.tsx

**Added State:**
```typescript
const [isSelected, setIsSelected] = useState(false);
```

**New Event Handlers:**
```typescript
// Single click - select cell for dropdowns, edit for text/number/date
const handleClick = () => {
  if (shouldShowCaret()) {
    setIsSelected(true);  // Just select, don't open
  } else {
    setIsEditing(true);   // Open editor immediately
  }
};

// Double click - always enters edit mode
const handleDoubleClick = () => {
  setIsEditing(true);
};

// Caret click - opens dropdown (stops propagation)
const handleCaretClick = (e: React.MouseEvent) => {
  e.stopPropagation();
  setIsEditing(true);
};
```

**Updated JSX:**
- Added `onDoubleClick` handler
- Changed caret from `<svg>` to `<button>` for better interaction
- Added hover styles to caret button
- Added blue ring to selected cells

## User Experience Flow

### Scenario 1: Editing a Status (Select Field)
1. **Click** on Status cell → Cell gets blue border (selected)
2. **Click on ▼ caret** → Dropdown opens with options
3. **Click option** → Value changes, dropdown closes
4. OR **Click outside** → Dropdown closes without change

### Scenario 2: Editing a Title (Text Field)
1. **Click** on Title cell → Text input appears immediately
2. **Type new value** → Text updates
3. **Press Enter** → Saves and exits edit mode
4. OR **Press Escape** → Cancels and exits edit mode

### Scenario 3: Quick Select Field Edit
1. **Double-click** on Status cell → Dropdown opens directly
2. **Select option** → Value changes
3. Done! (skips the "selected" state)

## Test Results
✅ **All 92 tests passing**

## Benefits

1. **Less intrusive** - Single click doesn't immediately open dropdowns
2. **Keyboard friendly** - Can navigate between cells before editing
3. **Clear affordance** - Caret button shows where to click
4. **Consistent with spreadsheets** - Familiar UX pattern
5. **Accessible** - Caret is a proper button with hover states

The interaction now matches the behavior of Google Sheets and Excel for dropdown cells!
