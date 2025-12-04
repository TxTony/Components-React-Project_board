# GitBoard Table - Filter System Documentation

This document explains how the GitBoard Table filter system works and provides instructions for creating database adapters (e.g., Firebase Firestore) to translate client-side filters to server-side queries.

## Table of Contents

1. [Overview](#overview)
2. [Filter Data Structure](#filter-data-structure)
3. [Supported Operators](#supported-operators)
4. [Filter Logic](#filter-logic)
5. [Field Type Handling](#field-type-handling)
6. [Global Search](#global-search)
7. [Firebase Firestore Adapter Instructions](#firebase-firestore-adapter-instructions)
8. [Example Firestore Queries](#example-firestore-queries)

---

## Overview

The GitBoard Table component uses a flexible filter system that supports:

- **Column-specific filters** with various operators
- **Global search** across all visible fields
- **AND logic** for combining multiple filters
- **Type-aware comparisons** (text, number, select fields, dates)
- **Empty/null value checks**

Filters are applied **client-side** by default, but can be translated to database queries for server-side filtering on large datasets.

---

## Filter Data Structure

### FilterConfig Interface

```typescript
interface FilterConfig {
  field: string;      // Field ID (e.g., "fld_status_123")
  operator: FilterOperator;
  value?: any;        // Optional - not needed for is-empty/is-not-empty
}

type FilterOperator =
  | 'contains'        // Text contains substring
  | 'equals'          // Exact match
  | 'not-equals'      // Not equal to
  | 'is-empty'        // Field is null/undefined/empty string
  | 'is-not-empty'    // Field has a value
  | 'gt'              // Greater than (numbers/dates)
  | 'gte'             // Greater than or equal
  | 'lt'              // Less than
  | 'lte'             // Less than or equal
```

### Example Filter Configurations

```typescript
// Text filter: Title contains "login"
{
  field: "fld_title_123",
  operator: "contains",
  value: "login"
}

// Select filter: Status equals "In Progress"
{
  field: "fld_status_456",
  operator: "equals",
  value: "opt_inprogress_789"  // Option ID, not label!
}

// Number filter: Points greater than 5
{
  field: "fld_points_101",
  operator: "gt",
  value: 5
}

// Empty check: Assignee is empty
{
  field: "fld_assignee_202",
  operator: "is-empty"
  // No value needed
}

// Multiple filters (AND logic)
[
  { field: "fld_status_456", operator: "equals", value: "opt_todo_999" },
  { field: "fld_points_101", operator: "gte", value: 3 }
]
// Result: Rows where status = "To Do" AND points >= 3
```

---

## Supported Operators

### Text Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `contains` | Value contains substring (case-insensitive) | `title:contains:login` |
| `equals` | Exact match (case-insensitive) | `title:equals:"Login Page"` |
| `not-equals` | Does not match | `title:not-equals:archived` |

### Comparison Operators (Numbers/Dates)

| Operator | Description | Example |
|----------|-------------|---------|
| `gt` | Greater than | `points:>:5` |
| `gte` | Greater than or equal | `points:>=:3` |
| `lt` | Less than | `points:<:10` |
| `lte` | Less than or equal | `points:<=:8` |

### Special Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `is-empty` | Field is null, undefined, or empty string | `assignee:is-empty` |
| `is-not-empty` | Field has a value | `assignee:is-not-empty` |

---

## Filter Logic

### Multiple Filters - AND Logic

When multiple filters are applied, they use **AND** logic:

```typescript
const filters: FilterConfig[] = [
  { field: "fld_status", operator: "equals", value: "opt_inprog" },
  { field: "fld_priority", operator: "equals", value: "opt_high" },
  { field: "fld_points", operator: "gte", value: 5 }
];

// Result: Rows where (status = "In Progress")
//                AND (priority = "High")
//                AND (points >= 5)
```

### Filter Application Order

1. **Global Search** applied first (if present)
2. **Column Filters** applied second (all with AND logic)

```typescript
// Example: Search for "login" AND status = "Done"
searchTerm: "login"
filters: [{ field: "fld_status", operator: "equals", value: "opt_done" }]

// Result: Rows that contain "login" in ANY field
//         AND have status = "Done"
```

---

## Field Type Handling

Different field types require special handling:

### Single-Select / Assignee / Iteration Fields

**Important:** For select-type fields, filters use **option IDs**, not display labels!

```typescript
// Field definition
{
  id: "fld_status",
  type: "single-select",
  options: [
    { id: "opt_todo", label: "To Do" },
    { id: "opt_inprog", label: "In Progress" },
    { id: "opt_done", label: "Done" }
  ]
}

// ✅ CORRECT: Use option ID
{
  field: "fld_status",
  operator: "equals",
  value: "opt_inprog"  // ID, not "In Progress"
}

// ❌ WRONG: Don't use label
{
  field: "fld_status",
  operator: "equals",
  value: "In Progress"  // This won't work
}
```

**Reason:** Row data stores option IDs, not labels:

```typescript
// Row data structure
{
  id: "row_1",
  values: {
    fld_status: "opt_inprog"  // Stores ID
  }
}
```

### Multi-Select Fields

Multi-select fields store arrays of option IDs:

```typescript
// Row data
{
  id: "row_1",
  values: {
    fld_tags: ["tag_1", "tag_2", "tag_3"]  // Array of IDs
  }
}

// Filter: Tags contains "bug"
{
  field: "fld_tags",
  operator: "contains",
  value: "bug"  // Searches in joined labels
}
```

### Number Fields

Numbers are compared numerically:

```typescript
// Row data
{
  id: "row_1",
  values: {
    fld_points: 5  // Number type
  }
}

// Filter: Points >= 3
{
  field: "fld_points",
  operator: "gte",
  value: 3
}
```

### Date Fields

Dates are stored as ISO strings and compared as numbers:

```typescript
// Row data
{
  id: "row_1",
  values: {
    fld_due_date: "2025-12-15"  // ISO date string
  }
}

// Filter: Due date after 2025-12-01
{
  field: "fld_due_date",
  operator: "gt",
  value: "2025-12-01"
}
```

### Text Fields (Title, Text)

Text comparisons are case-insensitive:

```typescript
// Row data
{
  id: "row_1",
  values: {
    fld_title: "Add Login Page"
  }
}

// Filter: Title contains "login" (case-insensitive)
{
  field: "fld_title",
  operator: "contains",
  value: "login"  // Matches "Login" in the title
}
```

---

## Global Search

Global search searches across **all visible fields** (OR logic):

```typescript
// Search term: "john"
searchTerm: "john"

// Searches in all visible fields:
// - Title: "Assign to John"  ✅ Match
// - Status: "In Progress"    ❌ No match
// - Assignee: "John Doe"     ✅ Match
// - Description: "Contact john@example.com" ✅ Match

// Returns rows where ANY field contains "john"
```

**Note:** Global search is case-insensitive and searches display values (labels), not IDs.

---

## Firebase Firestore Adapter Instructions

### Task for Autonomous AI Agent

**Goal:** Create a Firebase Firestore adapter that translates `FilterConfig[]` to Firestore queries.

**Package to Create:** `@txtony/gitboard-firestore-adapter`

### Requirements

1. **Input:** Array of `FilterConfig` objects
2. **Output:** Firestore query object
3. **Support all operators** listed above
4. **Handle field types** correctly
5. **Implement AND logic** for multiple filters
6. **Support global search** (optional - may require full-text search setup)

### Interface to Implement

```typescript
import { Query, CollectionReference } from 'firebase/firestore';
import type { FilterConfig, FieldDefinition } from '@txtony/gitboard-table';

export interface FirestoreAdapterOptions {
  collection: CollectionReference;
  filters: FilterConfig[];
  fields: FieldDefinition[];
  searchTerm?: string;
}

export interface FirestoreAdapter {
  /**
   * Convert FilterConfig[] to Firestore query
   * @returns Firestore Query object
   */
  buildQuery(options: FirestoreAdapterOptions): Query;

  /**
   * Convert single filter to Firestore where clause
   */
  buildWhereClause(
    filter: FilterConfig,
    field: FieldDefinition
  ): [string, any, any]; // [fieldPath, operator, value]
}
```

### Operator Mapping

Map GitBoard operators to Firestore operators:

```typescript
const OPERATOR_MAP: Record<string, string> = {
  'equals': '==',
  'not-equals': '!=',
  'gt': '>',
  'gte': '>=',
  'lt': '<',
  'lte': '<=',
  'is-empty': '==',      // Compare to null
  'is-not-empty': '!=',  // Compare to null
  'contains': 'array-contains', // For arrays, or use full-text search
};
```

### Implementation Guidelines

#### 1. Basic Structure

```typescript
import { query, where, Query, CollectionReference } from 'firebase/firestore';

export class GitBoardFirestoreAdapter {
  buildQuery(options: FirestoreAdapterOptions): Query {
    const { collection, filters, fields } = options;

    let q: Query = collection;

    // Apply each filter as a where clause
    for (const filter of filters) {
      const field = fields.find(f => f.id === filter.field);
      if (!field) continue;

      const [fieldPath, operator, value] = this.buildWhereClause(filter, field);
      q = query(q, where(fieldPath, operator, value));
    }

    return q;
  }

  buildWhereClause(
    filter: FilterConfig,
    field: FieldDefinition
  ): [string, any, any] {
    // Implementation details below
  }
}
```

#### 2. Handle Each Operator

```typescript
buildWhereClause(filter: FilterConfig, field: FieldDefinition): [string, any, any] {
  const fieldPath = `values.${filter.field}`;

  switch (filter.operator) {
    case 'equals':
      return [fieldPath, '==', filter.value];

    case 'not-equals':
      return [fieldPath, '!=', filter.value];

    case 'gt':
      return [fieldPath, '>', filter.value];

    case 'gte':
      return [fieldPath, '>=', filter.value];

    case 'lt':
      return [fieldPath, '<', filter.value];

    case 'lte':
      return [fieldPath, '<=', filter.value];

    case 'is-empty':
      return [fieldPath, '==', null];

    case 'is-not-empty':
      return [fieldPath, '!=', null];

    case 'contains':
      // Special handling needed - see below
      throw new Error('contains operator requires special setup');

    default:
      throw new Error(`Unsupported operator: ${filter.operator}`);
  }
}
```

#### 3. Handle "contains" Operator

Firestore doesn't have native "contains" for strings. Options:

**Option A: Use array-contains for multi-select fields**

```typescript
case 'contains':
  if (field.type === 'multi-select') {
    return [fieldPath, 'array-contains', filter.value];
  }
  throw new Error('contains only supported for multi-select fields');
```

**Option B: Use full-text search (Algolia, Typesense, or Firestore extensions)**

```typescript
// Requires external search service
case 'contains':
  // Delegate to Algolia/Typesense
  // This query won't work in pure Firestore
```

**Option C: Use >= and <= for text prefix search**

```typescript
case 'contains':
  // Only works for PREFIX matching, not substring
  const prefix = filter.value;
  const end = prefix + '\uf8ff';
  return [fieldPath, '>=', prefix]; // Need to add second where for <=
```

#### 4. Handle Multiple Filters (AND Logic)

Firestore applies multiple `where()` clauses with AND logic automatically:

```typescript
// GitBoard filters
[
  { field: "fld_status", operator: "equals", value: "opt_todo" },
  { field: "fld_points", operator: "gte", value: 3 }
]

// Firestore query (automatic AND)
query(
  collection,
  where('values.fld_status', '==', 'opt_todo'),
  where('values.fld_points', '>=', 3)
)
```

#### 5. Data Structure in Firestore

Store rows with this structure:

```typescript
// Firestore document structure
{
  id: "row_1",
  values: {
    fld_title: "Add login page",
    fld_status: "opt_inprog",
    fld_points: 5,
    fld_assignee: "user_123",
    fld_tags: ["tag_1", "tag_2"]  // Array for multi-select
  },
  contentId: "content_1",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Important:** All cell values are stored in the `values` object, so Firestore queries must use `values.{fieldId}` paths.

#### 6. Handle Edge Cases

```typescript
buildWhereClause(filter: FilterConfig, field: FieldDefinition): [string, any, any] {
  const fieldPath = `values.${filter.field}`;

  // Edge case 1: Null/undefined values
  if (filter.operator === 'is-empty') {
    return [fieldPath, 'in', [null, undefined, '']];
  }

  // Edge case 2: Select fields - compare IDs not labels
  if (filter.operator === 'equals' &&
      (field.type === 'single-select' ||
       field.type === 'assignee' ||
       field.type === 'iteration')) {
    // filter.value is already an option ID
    return [fieldPath, '==', filter.value];
  }

  // Edge case 3: Date comparisons
  if (field.type === 'date') {
    // Convert ISO string to Firestore Timestamp
    const timestamp = Timestamp.fromDate(new Date(filter.value));
    return [fieldPath, mapOperator(filter.operator), timestamp];
  }

  // ... rest of implementation
}
```

---

## Example Firestore Queries

### Example 1: Simple Equality Filter

**GitBoard Filter:**
```typescript
{
  field: "fld_status",
  operator: "equals",
  value: "opt_inprog"
}
```

**Firestore Query:**
```typescript
import { collection, query, where } from 'firebase/firestore';

const q = query(
  collection(db, 'rows'),
  where('values.fld_status', '==', 'opt_inprog')
);
```

### Example 2: Multiple Filters (AND)

**GitBoard Filters:**
```typescript
[
  { field: "fld_status", operator: "equals", value: "opt_todo" },
  { field: "fld_priority", operator: "equals", value: "opt_high" },
  { field: "fld_points", operator: "gte", value: 5 }
]
```

**Firestore Query:**
```typescript
const q = query(
  collection(db, 'rows'),
  where('values.fld_status', '==', 'opt_todo'),
  where('values.fld_priority', '==', 'opt_high'),
  where('values.fld_points', '>=', 5)
);
```

### Example 3: Empty Check

**GitBoard Filter:**
```typescript
{
  field: "fld_assignee",
  operator: "is-empty"
}
```

**Firestore Query:**
```typescript
const q = query(
  collection(db, 'rows'),
  where('values.fld_assignee', '==', null)
);
```

### Example 4: Number Comparison

**GitBoard Filter:**
```typescript
{
  field: "fld_points",
  operator: "gt",
  value: 3
}
```

**Firestore Query:**
```typescript
const q = query(
  collection(db, 'rows'),
  where('values.fld_points', '>', 3)
);
```

### Example 5: Multi-Select Array Contains

**GitBoard Filter:**
```typescript
{
  field: "fld_tags",
  operator: "contains",
  value: "tag_bug"  // Tag option ID
}
```

**Firestore Query:**
```typescript
const q = query(
  collection(db, 'rows'),
  where('values.fld_tags', 'array-contains', 'tag_bug')
);
```

---

## Limitations and Considerations

### Firestore Query Limitations

1. **No native substring search**
   - Firestore doesn't support SQL `LIKE` or regex
   - Use external search service (Algolia, Typesense) for full-text search
   - Or implement prefix matching with `>=` and `<=`

2. **Inequality operators on different fields**
   - Firestore limits inequality operators (`>`, `<`, `!=`) to one field per query
   - Example: Can't query `points > 3 AND priority != "low"` in single query
   - Workaround: Filter client-side or restructure data

3. **OR logic**
   - Firestore supports OR with `in` operator (up to 10 values)
   - For complex OR conditions, use `or()` query (Firebase SDK v9+)
   - GitBoard filters use AND logic, so this is not an issue

4. **Array contains**
   - `array-contains` only checks if array contains a specific value
   - Can't check if array contains multiple values (use `array-contains-any`)

### Performance Considerations

1. **Create indexes** for filtered fields
   ```typescript
   // Firestore automatic indexes usually sufficient
   // For complex queries, create composite indexes
   ```

2. **Limit results** to prevent large data transfers
   ```typescript
   const q = query(
     collection(db, 'rows'),
     where('values.fld_status', '==', 'opt_todo'),
     limit(100)  // Limit results
   );
   ```

3. **Use cursors** for pagination
   ```typescript
   const q = query(
     collection(db, 'rows'),
     where('values.fld_status', '==', 'opt_todo'),
     startAfter(lastDoc),  // Cursor pagination
     limit(50)
   );
   ```

---

## Testing the Adapter

### Test Cases to Implement

```typescript
describe('GitBoardFirestoreAdapter', () => {
  it('converts equals operator', () => {
    const filter = {
      field: 'fld_status',
      operator: 'equals',
      value: 'opt_todo'
    };
    const [path, op, val] = adapter.buildWhereClause(filter, statusField);
    expect(path).toBe('values.fld_status');
    expect(op).toBe('==');
    expect(val).toBe('opt_todo');
  });

  it('converts gt operator', () => {
    const filter = {
      field: 'fld_points',
      operator: 'gt',
      value: 5
    };
    const [path, op, val] = adapter.buildWhereClause(filter, pointsField);
    expect(path).toBe('values.fld_points');
    expect(op).toBe('>');
    expect(val).toBe(5);
  });

  it('handles is-empty operator', () => {
    const filter = {
      field: 'fld_assignee',
      operator: 'is-empty'
    };
    const [path, op, val] = adapter.buildWhereClause(filter, assigneeField);
    expect(path).toBe('values.fld_assignee');
    expect(op).toBe('==');
    expect(val).toBe(null);
  });

  it('builds query with multiple filters', () => {
    const filters = [
      { field: 'fld_status', operator: 'equals', value: 'opt_todo' },
      { field: 'fld_points', operator: 'gte', value: 3 }
    ];
    const q = adapter.buildQuery({ collection, filters, fields });
    // Verify query structure
  });
});
```

---

## Summary for AI Agent

**Task:** Create a Firestore adapter package that:

1. ✅ Takes `FilterConfig[]` as input
2. ✅ Returns Firestore `Query` object
3. ✅ Maps GitBoard operators to Firestore operators
4. ✅ Handles all field types correctly
5. ✅ Uses `values.{fieldId}` path for all queries
6. ✅ Implements AND logic for multiple filters
7. ✅ Handles edge cases (null values, select field IDs, dates)
8. ⚠️ Documents limitations (substring search, inequality constraints)
9. ✅ Includes comprehensive tests
10. ✅ Exports TypeScript types

**Package Structure:**
```
@txtony/gitboard-firestore-adapter/
├── src/
│   ├── index.ts              # Main adapter class
│   ├── types.ts              # TypeScript interfaces
│   ├── operators.ts          # Operator mapping
│   └── utils.ts              # Helper functions
├── tests/
│   ├── adapter.test.ts       # Unit tests
│   └── integration.test.ts   # Firestore emulator tests
├── README.md                 # Usage documentation
└── package.json
```

**Dependencies:**
- `firebase` or `@firebase/firestore`
- `@txtony/gitboard-table` (peer dependency for types)

**Result:** Developers can filter large datasets server-side by passing filters to Firestore, reducing client-side data transfer and improving performance.
