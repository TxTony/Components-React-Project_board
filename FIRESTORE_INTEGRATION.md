# Firestore Integration Guide with Infinite Scroll

This guide shows how to integrate the GitBoard Table component with Firebase Firestore and implement infinite scroll with batched data loading.

## Basic Setup

### 1. Install Firebase

```bash
npm install firebase
```

### 2. Initialize Firebase

```typescript
// firebase.config.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  // ... other config
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

## Infinite Scroll Implementation with Firestore

### Example: Tasks Table with 200-item Batches

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { GitBoardTable } from '@txtony/gitboard-table';
import type { Row, FieldDefinition } from '@txtony/gitboard-table';
import { db } from './firebase.config';

const BATCH_SIZE = 200;

function TasksTable() {
  const [rows, setRows] = useState<Row[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Define your table fields
  const fields: FieldDefinition[] = [
    {
      id: 'title',
      name: 'Title',
      type: 'title',
      visible: true,
    },
    {
      id: 'status',
      name: 'Status',
      type: 'single-select',
      visible: true,
      options: [
        { id: 'todo', label: 'To Do', color: 'gray' },
        { id: 'in-progress', label: 'In Progress', color: 'blue' },
        { id: 'done', label: 'Done', color: 'green' },
      ],
    },
    {
      id: 'priority',
      name: 'Priority',
      type: 'single-select',
      visible: true,
      options: [
        { id: 'high', label: 'High', color: 'red' },
        { id: 'medium', label: 'Medium', color: 'yellow' },
        { id: 'low', label: 'Low', color: 'gray' },
      ],
    },
    {
      id: 'assignee',
      name: 'Assignee',
      type: 'text',
      visible: true,
    },
    {
      id: 'dueDate',
      name: 'Due Date',
      type: 'date',
      visible: true,
    },
  ];

  // Load initial batch
  useEffect(() => {
    loadInitialBatch();
  }, []);

  const loadInitialBatch = async () => {
    try {
      setIsInitialLoading(true);

      const q = query(
        collection(db, 'tasks'),
        orderBy('createdAt', 'desc'),
        limit(BATCH_SIZE)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setHasMore(false);
        setIsInitialLoading(false);
        return;
      }

      // Convert Firestore docs to table rows
      const loadedRows: Row[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        values: {
          title: doc.data().title || '',
          status: doc.data().status || 'todo',
          priority: doc.data().priority || 'medium',
          assignee: doc.data().assignee || '',
          dueDate: doc.data().dueDate || '',
        },
      }));

      setRows(loadedRows);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === BATCH_SIZE);
      setIsInitialLoading(false);
    } catch (error) {
      console.error('Error loading initial data:', error);
      setIsInitialLoading(false);
    }
  };

  // Load more data when user scrolls to bottom
  const handleLoadMore = useCallback(async () => {
    if (!lastDoc || !hasMore || isLoadingMore) return;

    try {
      setIsLoadingMore(true);

      const q = query(
        collection(db, 'tasks'),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(BATCH_SIZE)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setHasMore(false);
        setIsLoadingMore(false);
        return;
      }

      // Append new rows to existing ones
      const newRows: Row[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        values: {
          title: doc.data().title || '',
          status: doc.data().status || 'todo',
          priority: doc.data().priority || 'medium',
          assignee: doc.data().assignee || '',
          dueDate: doc.data().dueDate || '',
        },
      }));

      setRows((prev) => [...prev, ...newRows]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === BATCH_SIZE);
      setIsLoadingMore(false);
    } catch (error) {
      console.error('Error loading more data:', error);
      setIsLoadingMore(false);
    }
  }, [lastDoc, hasMore, isLoadingMore]);

  // Handle row updates
  const handleRowChange = async (updatedRows: Row[]) => {
    setRows(updatedRows);

    // Optionally sync changes back to Firestore
    // (implement your own update logic here)
  };

  if (isInitialLoading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <GitBoardTable
      fields={fields}
      rows={rows}
      onChange={handleRowChange}
      hasMore={hasMore}
      isLoadingMore={isLoadingMore}
      onLoadMore={handleLoadMore}
      loadingMessage="Loading more tasks..."
      tableId="tasks-table"
      theme="light"
    />
  );
}

export default TasksTable;
```

## Advanced: With Filtering and Search

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs
} from 'firebase/firestore';
import { GitBoardTable } from '@txtony/gitboard-table';
import type { Row, FieldDefinition, FilterConfig } from '@txtony/gitboard-table';
import { db } from './firebase.config';

function TasksTableWithFilters() {
  const [rows, setRows] = useState<Row[]>([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const BATCH_SIZE = 200;

  // Build Firestore query based on filters
  const buildQuery = useCallback((afterDoc = null) => {
    let q = query(collection(db, 'tasks'));

    // Apply status filter if set
    if (statusFilter) {
      q = query(q, where('status', '==', statusFilter));
    }

    // Order and pagination
    q = query(q, orderBy('createdAt', 'desc'));

    if (afterDoc) {
      q = query(q, startAfter(afterDoc));
    }

    q = query(q, limit(BATCH_SIZE));

    return q;
  }, [statusFilter]);

  // Load data
  const loadData = useCallback(async (isLoadingMore = false) => {
    try {
      if (isLoadingMore) {
        setIsLoadingMore(true);
      }

      const q = buildQuery(isLoadingMore ? lastDoc : null);
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setHasMore(false);
        setIsLoadingMore(false);
        return;
      }

      const newRows: Row[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        values: {
          title: doc.data().title || '',
          status: doc.data().status || 'todo',
          priority: doc.data().priority || 'medium',
          assignee: doc.data().assignee || '',
          dueDate: doc.data().dueDate || '',
        },
      }));

      if (isLoadingMore) {
        setRows((prev) => [...prev, ...newRows]);
      } else {
        setRows(newRows);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === BATCH_SIZE);
      setIsLoadingMore(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setIsLoadingMore(false);
    }
  }, [buildQuery, lastDoc]);

  // Load initial data
  useEffect(() => {
    setRows([]);
    setLastDoc(null);
    setHasMore(true);
    loadData(false);
  }, [statusFilter]); // Reload when filter changes

  const handleLoadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    loadData(true);
  }, [hasMore, isLoadingMore, loadData]);

  const fields: FieldDefinition[] = [
    // ... your fields
  ];

  return (
    <div>
      {/* Optional: External filter UI */}
      <div style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>
        <label>
          Filter by status:
          <select
            value={statusFilter || ''}
            onChange={(e) => setStatusFilter(e.target.value || null)}
          >
            <option value="">All</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </label>
      </div>

      <GitBoardTable
        fields={fields}
        rows={rows}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={handleLoadMore}
        tableId="tasks-table-filtered"
      />
    </div>
  );
}

export default TasksTableWithFilters;
```

## Performance Tips

### 1. Use Firestore Indexes
Create indexes for fields you query/filter on:

```typescript
// In Firebase Console, create composite index for:
// Collection: tasks
// Fields: status (Ascending), createdAt (Descending)
```

### 2. Optimize Batch Size
- **200 items**: Good balance for most use cases
- **Adjust based on**:
  - Document size (larger docs = smaller batches)
  - Network speed
  - User scroll speed

### 3. Debounce Scroll Events
Already handled by `useInfiniteScroll` hook with `threshold` parameter.

### 4. Handle Real-time Updates (Optional)

```typescript
import { onSnapshot } from 'firebase/firestore';

useEffect(() => {
  const q = query(
    collection(db, 'tasks'),
    orderBy('createdAt', 'desc'),
    limit(BATCH_SIZE)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const updatedRows: Row[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      values: { /* map your data */ },
    }));

    setRows((prev) => {
      // Merge updates with existing data beyond first batch
      const existingBeyondFirst = prev.slice(BATCH_SIZE);
      return [...updatedRows, ...existingBeyondFirst];
    });
  });

  return () => unsubscribe();
}, []);
```

## Firestore Data Structure Example

```typescript
// Firestore Collection: tasks
{
  "title": "Implement authentication",
  "status": "in-progress",
  "priority": "high",
  "assignee": "john@example.com",
  "dueDate": "2025-12-15",
  "description": "Add OAuth and JWT authentication",
  "createdAt": Timestamp,
  "updatedAt": Timestamp
}
```

## Saving Updates Back to Firestore

```typescript
import { doc, updateDoc } from 'firebase/firestore';

const handleRowChange = async (updatedRows: Row[]) => {
  setRows(updatedRows);

  // Find the changed row (you'll need to track this)
  const changedRow = updatedRows.find(/* your logic */);

  if (changedRow) {
    try {
      await updateDoc(doc(db, 'tasks', changedRow.id), {
        ...changedRow.values,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating document:', error);
    }
  }
};
```

## Complete Working Example

See the `examples/firestore-integration` folder in the repository for a complete working example with:
- Full CRUD operations
- Real-time updates
- Error handling
- Loading states
- Offline support

## Troubleshooting

### Issue: "Missing or insufficient permissions"
**Solution**: Update Firestore security rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Issue: Infinite scroll triggers too early
**Solution**: Adjust threshold in component:
```typescript
// In useInfiniteScroll hook (internal)
threshold: 400  // Trigger 400px before bottom (default: 200)
```

### Issue: Duplicate items after loading more
**Solution**: Ensure unique row IDs from Firestore doc IDs:
```typescript
const newRows = snapshot.docs.map((doc) => ({
  id: doc.id,  // Use Firestore doc ID, not generated ID
  values: { /* ... */ },
}));
```
