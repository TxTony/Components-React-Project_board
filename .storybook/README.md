# GitBoard Table - Storybook Documentation

This directory contains the Storybook configuration and documentation for the GitBoard Table component library.

## Getting Started

### Running Storybook

Start the Storybook development server:

```bash
npm run storybook
```

This will start Storybook on `http://localhost:6006`

### Building Storybook

Build a static version of Storybook:

```bash
npm run build-storybook
```

The built files will be in the `storybook-static` directory.

## Stories Overview

### Components/GitBoardTable

Main table component stories showcasing:
- **Default**: Standard table with all field types
- **Empty**: Table with no data rows
- **Dark Theme**: Dark mode variant
- **With Persistence**: localStorage state persistence
- **Large Dataset**: Performance testing with 100 rows
- **Minimal**: Simplified configuration
- **Interactive**: All features enabled

### Components/Cell

Individual cell stories for all field types:
- Text Field
- Single-Select (with color badges)
- Assignee
- Multi-Select (multiple color badges)
- Date Field
- Number Field
- Iteration
- Empty cells
- Read-only cells
- Selected cells

### Components/Cell Editors

Specialized inline editor stories:
- **Text Editor**: Text and title fields
- **Number Editor**: Numeric fields
- **Date Editor**: Date fields
- **Select Editor**: Single-select dropdown
- **Multi-Select Editor**: Multi-select dropdown with checkboxes

### Showcase/All Features

Comprehensive demonstrations:
- **Color Badges Light**: GitHub-style badges in light theme
- **Color Badges Dark**: GitHub-style badges in dark theme
- **All Field Types**: Complete field type showcase
- **Editing Experience**: Cell editing interactions
- **Column Reordering**: Drag-and-drop column reordering
- **Row Management**: Adding and deleting rows
- **Sorting & Filtering**: Data manipulation features
- **Empty States**: No data scenarios
- **Responsive**: Mobile and tablet views

## Theme Switching

Use the theme toolbar in Storybook to switch between light and dark themes. The theme selector is available in the top toolbar.

## Features Demonstrated

### Color Badges
- 10% opacity background colors
- 1.5px solid borders at 100% opacity
- 6px border radius
- Full opacity text

### Editing
- Single-click for text/number/date fields
- Click caret or double-click for select fields
- Enter to save, Escape to cancel

### Column Reordering
- Drag column headers to reorder
- Visual feedback during drag
- Persisted to localStorage when tableId is provided

### Row Management
- Add new rows via the "Add item" input
- Select rows via checkboxes
- Delete selected rows via toolbar button

### Sorting
- Click column headers to sort
- Three states: ascending, descending, none
- Visual sort indicator

## Configuration Files

- **main.ts**: Storybook configuration and addons
- **preview.tsx**: Global decorators, parameters, and theme setup
- **README.md**: This file

## Customization

### Adding New Stories

Create a new `.stories.tsx` file in the `src/stories` directory:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { YourComponent } from '../components/YourComponent';

const meta = {
  title: 'Components/YourComponent',
  component: YourComponent,
  tags: ['autodocs'],
} satisfies Meta<typeof YourComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Your default props
  },
};
```

### Modifying Theme

Edit `.storybook/preview.tsx` to customize the theme decorator or add new global parameters.

## Troubleshooting

### Storybook won't start

1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules
   npm install
   ```

2. Clear Storybook cache:
   ```bash
   npm run storybook -- --no-manager-cache
   ```

### Stories not showing up

Ensure your story files match the pattern in `.storybook/main.ts`:
```typescript
stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)']
```

### Path alias not working

The `@` alias is configured in `.storybook/main.ts` via `viteFinal`. Ensure it's pointing to the correct directory.

## Resources

- [Storybook Documentation](https://storybook.js.org/docs/react/get-started/introduction)
- [Writing Stories](https://storybook.js.org/docs/react/writing-stories/introduction)
- [Args](https://storybook.js.org/docs/react/writing-stories/args)
- [Addon Catalog](https://storybook.js.org/addons)
