/**
 * Core Type Definitions for GitBoard Table Component
 * Based on GitHub Projects-style table data models
 */

/**
 * Unique identifier type for all entities
 */
export type UID = string;

/**
 * Field types supported by the table
 */
export type FieldType =
  | 'title'
  | 'text'
  | 'number'
  | 'date'
  | 'single-select'
  | 'multi-select'
  | 'assignee'
  | 'iteration';

/**
 * Option for select fields, tags, assignees, etc.
 */
export interface FieldOption {
  id: UID;
  label: string;
  color?: string;
  colour?: string; // Support both spellings
  description?: string;
}

/**
 * Field (column) definition
 */
export interface FieldDefinition {
  id: UID;
  name: string;
  type: FieldType;
  visible: boolean;
  width?: number;
  options?: FieldOption[];
}

/**
 * Link entity for row content
 */
export interface Link {
  id: UID;
  url: string;
  title: string;
  description?: string;
  favicon?: string;
}

/**
 * Document entity for row content
 */
export interface Document {
  id: UID;
  filename: string;
  mime: string;
  size: number;
  url: string;
  thumbnail?: string;
  uploadedAt: string;     // ISO timestamp
}

/**
 * Row content structure - stores rich content for detail panel
 */
export interface RowContent {
  description: string;           // Markdown text
  mermaidDiagrams?: string[];   // Array of Mermaid graph definitions
  links?: Link[];               // External links
  documents?: Document[];       // Embedded documents (PDFs, images, etc.)
  attachments?: Attachment[];   // File attachments
}

/**
 * Row data structure
 */
export interface Row {
  id: UID;
  values: Record<UID, any>;
  contentId?: UID;
  content?: RowContent;         // Rich content for detail panel
}

/**
 * User entity for assignee fields
 */
export interface User {
  id: UID;
  name: string;
  avatar?: string;
}

/**
 * Iteration (sprint/week) entity
 */
export interface Iteration {
  id: UID;
  label: string;
  start: string; // ISO date string
  end: string;   // ISO date string
}

/**
 * Content item for side panel
 */
export interface ContentItem {
  id: UID;
  body: string;           // markdown
  attachments: Attachment[];
  createdAt: string;      // ISO timestamp
  updatedAt: string;      // ISO timestamp
  createdBy: UID;
  updatedBy: UID;
}

/**
 * Attachment entity
 */
export interface Attachment {
  id: UID;
  filename: string;
  mime: string;
  size: number;
  url: string;
  uploadedAt: string;     // ISO timestamp
}

/**
 * Sort configuration
 */
export interface SortConfig {
  field: UID;
  direction: 'asc' | 'desc';
}

/**
 * Filter configuration
 */
export interface FilterConfig {
  field: UID;
  operator: 'contains' | 'equals' | 'not-equals' | 'is-empty' | 'is-not-empty' | 'gt' | 'gte' | 'lt' | 'lte' | 'in';
  value?: any;
}

/**
 * View configuration (saved state)
 */
export interface ViewConfig {
  id: UID;
  name: string;
  columns: UID[];             // Visible field IDs in order
  sortBy: SortConfig | null;
  filters: FilterConfig[];
  groupBy: UID | null;        // Field ID to group by
}

/**
 * Theme configuration
 */
export type Theme = 'light' | 'dark';

/**
 * Main component props
 */
export interface GitBoardTableProps {
  fields: FieldDefinition[];
  rows: Row[];
  theme?: Theme;
  tableId?: string; // Optional table ID for localStorage persistence
  onChange?: (rows: Row[]) => void;
  onRowOpen?: (row: Row) => void;
  onFieldChange?: (fields: FieldDefinition[]) => void;
  onBulkUpdate?: (event: BulkUpdateEvent) => void;
  onRowsReorder?: (event: RowReorderEvent) => void;  // Called when rows are reordered
  onRowSelect?: (event: RowSelectionEvent) => void;  // Called when row selection changes
  onContentUpdate?: (rowId: UID, content: RowContent) => void;  // Called when row content is updated
  contentResolver?: (id: UID) => Promise<ContentItem>;
  users?: User[];
  iterations?: Iteration[];
  initialView?: ViewConfig;
  views?: ViewConfig[];      // Array of available views
  onViewChange?: (view: ViewConfig) => void;  // Called when view changes
  onCreateView?: (view: ViewConfig) => void;  // Called when new view is created
  onUpdateView?: (view: ViewConfig) => void;  // Called when view is updated
  onDeleteView?: (viewId: string) => void;  // Called when view is deleted
  onViewsReorder?: (views: ViewConfig[]) => void;  // Called when views are reordered

  // Infinite scroll props
  hasMore?: boolean;         // Whether there are more items to load
  isLoadingMore?: boolean;   // Whether currently loading more items
  onLoadMore?: () => void;   // Called when user scrolls near bottom
  loadingMessage?: string;   // Optional custom loading message

  // Context menu props
  customActions?: CustomAction[];  // Custom actions to show in row context menu
  onContextMenuClick?: (event: ContextMenuClickEvent) => void;  // Called when custom action is clicked
}

/**
 * Cell value type union
 */
export type CellValue =
  | string
  | number
  | boolean
  | null
  | string[]
  | undefined;

/**
 * Table state interface
 */
export interface TableState {
  fields: FieldDefinition[];
  rows: Row[];
  selectedRows: Set<UID>;
  editingCell: { rowId: UID; fieldId: UID } | null;
  currentView: ViewConfig;
  theme: Theme;
}

/**
 * Cell edit event
 */
export interface CellEditEvent {
  rowId: UID;
  fieldId: UID;
  oldValue: CellValue;
  newValue: CellValue;
}

/**
 * Target cell for bulk update
 */
export interface BulkUpdateTarget {
  rowId: UID;
  fieldId: UID;
  currentValue: CellValue;
}

/**
 * Bulk update event (drag-fill)
 */
export interface BulkUpdateEvent {
  sourceCell: {
    rowId: UID;
    fieldId: UID;
    value: CellValue;
  };
  targetCells: BulkUpdateTarget[];
  field: FieldDefinition;
}

/**
 * Row reorder event (drag-and-drop row reordering)
 */
export interface RowReorderEvent {
  fromIndex: number;      // Original position of the moved row
  toIndex: number;        // New position of the moved row
  rows: Row[];            // Complete rows array in new order
  movedRow: Row;          // The row that was moved
}

/**
 * Row selection event
 */
export interface RowSelectionEvent {
  selectedRowIds: UID[];    // Array of selected row IDs
  selectedRows: Row[];      // Array of selected row objects
  lastAction: 'select' | 'deselect' | 'range' | 'multi' | 'clear';  // Type of action performed
}

/**
 * Custom action for row context menu
 */
export interface CustomAction {
  name: string;      // Unique identifier for the action
  label: string;     // Display label for the action
  icon?: string;     // Optional icon (e.g., emoji or CSS class)
}

/**
 * Context menu click event
 */
export interface ContextMenuClickEvent {
  type: 'context-menu-click';
  actionName: string;  // Name of the custom action clicked
  row: Row;            // The row that the action was performed on
}
