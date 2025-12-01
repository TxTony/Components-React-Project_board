It describes exactly what to build, how it works, the components, the data structures, the stack, the TDD expectations, and the structure of the reusable npm package.

📘 Project Architecture Document — GitBoard Table Component
Purpose

Build a reusable React + TypeScript table component that replicates GitHub Project (table view) behaviours.
This component must be theme-aware (light/dark), configurable, modular, and publishable as an npm package to be reused across multiple internal projects.

The system must include:

A table grid with editable cells

Field definitions (title, status, tags, iteration, assignee, number, date, etc.)

Sort, filter, search

Context menus

Row selection

Side-panel content viewer (markdown editor + attachments)

GitHub Project table styling inspiration

Full Test-Driven Development (unit tests + integration tests)

Type-safe data models and interfaces

Pluggable state management

1. Technology Stack
Frontend

React 18+

TypeScript

TailwindCSS

Dark/Light Themes

Inspired by GitHub Primer design tokens (optional)

Zustand or Jotai

The component must allow external state override

Tooling

Vite for development

ESLint with strict rules

Prettier for formatting

Vitest for TDD + React Testing Library

Storybook for component showcase

Packaging

Build as an npm package

Published as ESM + CJS

Expose:

Components

Hooks

Interfaces

Theme tokens

Utility functions

2. High-Level Architecture Map
gitboard-table/
│
├── src/
│   ├── index.ts
│   ├── components/
│   │   ├── Table/
│   │   │   ├── TableRoot.tsx
│   │   │   ├── TableHeader.tsx
│   │   │   ├── TableBody.tsx
│   │   │   ├── Row.tsx
│   │   │   ├── Cell.tsx
│   │   │   ├── CellEditors/
│   │   │   │   ├── TextEditor.tsx
│   │   │   │   ├── SelectEditor.tsx
│   │   │   │   ├── MultiSelectEditor.tsx
│   │   │   │   ├── DateEditor.tsx
│   │   │   │   ├── NumberEditor.tsx
│   │   │   │   └── IterationEditor.tsx
│   │   │   └── Menu/
│   │   │       ├── RowContextMenu.tsx
│   │   │       ├── ColumnMenu.tsx
│   │   │       └── FilterMenu.tsx
│   │   ├── ContentPanel/
│   │   │   ├── ContentPanelRoot.tsx
│   │   │   ├── MarkdownEditor.tsx
│   │   │   ├── AttachmentsList.tsx
│   │   │   └── AttachmentUploader.tsx
│   │   └── Shared/
│   │       ├── Badge.tsx
│   │       ├── Select.tsx
│   │       ├── ToggleThemeButton.tsx
│   │       └── Button.tsx
│   │
│   ├── hooks/
│   │   ├── useTableState.ts
│   │   ├── useTheme.ts
│   │   └── useKeyboardShortcuts.ts
│   │
│   ├── state/
│   │   ├── table.store.ts
│   │   └── content.store.ts
│   │
│   ├── themes/
│   │   ├── tokens.ts     // GitHub Primer-inspired colours
│   │   ├── light.css
│   │   └── dark.css
│   │
│   ├── utils/
│   │   ├── sorting.ts
│   │   ├── filtering.ts
│   │   ├── uid.ts
│   │   └── markdown.ts
│   │
│   ├── interfaces/
│   │   ├── fields.ts
│   │   ├── table.ts
│   │   ├── content.ts
│   │   └── attachments.ts
│   │
│   └── tests/
│       ├── table.test.tsx
│       ├── sorting.test.ts
│       ├── filtering.test.ts
│       ├── content-panel.test.tsx
│       └── keyboard.test.ts
│
├── tsconfig.json
├── eslint.config.js
├── package.json
└── README.md

3. Data Interfaces
3.1 Fields Definition
export type FieldType =
  | "title"
  | "text"
  | "number"
  | "date"
  | "single-select"
  | "multi-select"
  | "assignee"
  | "iteration";

export interface FieldOption {
  id: UID;
  label: string;
  color?: string;        // tailwind token
  description?: string;
}

export interface FieldDefinition {
  id: UID;
  name: string;
  type: FieldType;
  visible: boolean;
  options?: FieldOption[];
}

3.2 Row Definition
export interface Row {
  id: UID;
  values: Record<UID, any>; // keyed by field.id
  contentId?: UID;
}

3.3 Content Item
export interface ContentItem {
  id: UID;
  body: string; // markdown
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
  createdBy: UID;
  updatedBy: UID;
}

3.4 Attachments
export interface Attachment {
  id: UID;
  filename: string;
  mime: string;
  size: number;
  url: string;
  uploadedAt: string;
}

4. Component Responsibilities
TableRoot

receives: fields, rows, onChange, onRowOpen

handles keyboard navigation

handles column resizing

emits row updates

Cell

renders correct editor based on field type

supports inline editing

supports TDD: value → change → commit

ContentPanel

opens when clicking a row

markdown editor

attachment management

autosave behaviour

Theme

exposed as theme="light" | "dark"

support CSS variables

include GitHub-style neutral greys / subtle borders

5. State Management
Requirements

internal store (Zustand/Jotai)

optional external override

Table Store
interface TableState {
  rows: Row[];
  fields: FieldDefinition[];
  selectedRowId?: UID;
  sort: { fieldId: UID; direction: "asc" | "desc" } | null;
  filters: Record<UID, any>;
}

6. TDD Requirements
Unit Tests

Cell editor: text, number, date, select, multi-select

Sorting: default, asc, desc

Filtering: contains, equals, empty

Markdown processing

Theme switching

Integration Tests

Editing a cell updates the row

Selecting a row opens the panel

Adding an attachment updates the content

Keyboard navigation:

↑ ↓ → ←

Enter to edit

Escape to cancel

Visual Tests (Storybook)

Light theme

Dark theme

Custom fields

Large dataset (1,000 rows)

7. Packaging Structure
Exposed by the npm module:

GitBoardTable

ContentPanel

hooks: useTableState, useTheme

all interfaces

default theme tokens

Build Output:
dist/
  index.esm.js
  index.cjs.js
  styles.css

8. Deliverable Summary

The other autonomous coding AI must deliver:

Complete React component library for GitBoard-style table

Fully typed interfaces

Standalone content system

GitHub-style light/dark theme

TDD test suite

Published npm package

Storybook with interactive examples

Documentation