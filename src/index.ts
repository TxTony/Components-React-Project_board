/**
 * GitBoard Table Component Library
 * Main entry point
 */

// Export main component
export { GitBoardTable } from './components/GitBoardTable';

// Export table components
export { TableHeader } from './components/Table/TableHeader';
export { TableBody } from './components/Table/TableBody';
export { Row as RowComponent } from './components/Table/Row';
export { Cell } from './components/Table/Cell';

// Export cell editors
export {
  TextEditor,
  NumberEditor,
  DateEditor,
  SelectEditor,
  MultiSelectEditor,
  IterationEditor,
} from './components/Table/CellEditors';

// Export menus
export {
  RowContextMenu,
  ColumnMenu,
  FilterMenu,
} from './components/Table/Menu';

// Export shared components
export {
  Badge,
  Button,
  Select,
  ToggleThemeButton,
} from './components/Shared';

// Export content panel components
export {
  ContentPanelRoot,
  MarkdownEditor,
  AttachmentsList,
  AttachmentUploader,
} from './components/ContentPanel';

// Export toolbar components
export { FilterBar } from './components/Toolbar/FilterBar';
export { Toolbar } from './components/Toolbar/Toolbar';
export { ColumnVisibilityMenu } from './components/Toolbar/ColumnVisibilityMenu';

// Export hooks
export {
  useTableState,
  useTheme,
  useKeyboardShortcuts,
  createTableShortcuts,
} from './hooks';

// Export state stores
export {
  useTableStore,
  useContentStore,
} from './state';

// Export utilities
export { sortRows } from './utils/sorting';
export { applyAllFilters } from './utils/filtering';
export { generateRowId, generateFieldId } from './utils/uid';
export {
  parseMarkdown,
  sanitizeHTML,
  markdownToHTML,
  markdownToPlainText,
  countWords,
  truncateMarkdown,
  generatePreview,
} from './utils/markdown';

// Export theme tokens
export {
  lightTheme,
  darkTheme,
  generateCSSVariables,
} from './themes/tokens';

// Export types
export type {
  UID,
  FieldType,
  FieldOption,
  FieldDefinition,
  Row,
  User,
  Iteration,
  ContentItem,
  Attachment,
  SortConfig,
  FilterConfig,
  ViewConfig,
  Theme,
  GitBoardTableProps,
  CellValue,
  TableState,
  CellEditEvent,
  BulkUpdateEvent,
  BulkUpdateTarget,
} from './types';

// Export mock data for testing/development
export { users, iterations, fields, rows, views } from './mocks/mockData';
