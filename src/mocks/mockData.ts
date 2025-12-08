/**
 * Mock Data for GitBoard Table Component
 * Based on MockDatasDefinition.md
 * Used for testing and development
 */

import type {
  User,
  Iteration,
  FieldDefinition,
  Row,
  ViewConfig,
} from '@/types';

//
// USERS (for assignee fields)
//
export const users: User[] = [
  {
    id: 'usr_tony_a19f2',
    name: 'Tony Tip',
    avatar: '/avatars/tony.png',
  },
  {
    id: 'usr_alice_92bf1',
    name: 'Alice',
    avatar: '/avatars/alice.png',
  },
  {
    id: 'usr_john_11de4',
    name: 'John',
    avatar: '/avatars/john.png',
  },
];

//
// ITERATIONS
//
export const iterations: Iteration[] = [
  {
    id: 'itr_week_1_baa21',
    label: 'Week 1',
    start: '2025-02-10',
    end: '2025-02-16',
  },
  {
    id: 'itr_week_2_e991a',
    label: 'Week 2',
    start: '2025-02-17',
    end: '2025-02-23',
  },
  {
    id: 'itr_week_3_913ff',
    label: 'Week 3',
    start: '2025-02-24',
    end: '2025-03-02',
  },
];

//
// FIELDS (COLUMN DEFINITIONS)
//
export const fields: FieldDefinition[] = [
  {
    id: 'fld_title_aa12e',
    type: 'text',
    name: 'Title',
    visible: true,
    width: 240,
  },
  {
    id: 'fld_status_c81f3',
    type: 'single-select',
    name: 'Status',
    visible: true,
    options: [
      {
        id: 'opt_status_todo_118a',
        label: 'Todo',
        color: '#9e9e9e',
        description: 'Not started yet',
      },
      {
        id: 'opt_status_progress_29bb',
        label: 'In Progress',
        color: '#2196f3',
        description: 'Currently being worked on',
      },
      {
        id: 'opt_status_done_77de',
        label: 'Done',
        color: '#4caf50',
        description: 'Completed',
      },
    ],
  },
  {
    id: 'fld_owner_19ad8',
    type: 'assignee',
    name: 'Owner',
    visible: true,
    options: users.map((u) => ({ id: u.id, label: u.name })),
  },
  {
    id: 'fld_tags_92f3a',
    type: 'multi-select',
    name: 'Tags',
    visible: true,
    options: [
      {
        id: 'opt_6a2f_frontend',
        label: 'Frontend',
        color: '#4caf50',
        description: 'UI logic, components, styling',
      },
      {
        id: 'opt_8b91_backend',
        label: 'Backend',
        color: '#2196f3',
        description: 'API, services, data layer',
      },
      {
        id: 'opt_c71d_urgent',
        label: 'Urgent',
        color: '#f44336',
        description: 'Needs immediate attention',
      },
    ],
  },
  {
    id: 'fld_due_71fe3',
    type: 'date',
    name: 'Due Date',
    visible: true,
  },
  {
    id: 'fld_points_11b9e',
    type: 'number',
    name: 'Points',
    visible: true,
  },
  {
    id: 'fld_iteration_6d1a2',
    type: 'iteration',
    name: 'Iteration',
    visible: true,
    options: iterations.map((i) => ({ id: i.id, label: i.label })),
  },
];

//
// ROWS (ITEMS)
//
export const rows: Row[] = [
  {
    id: 'row_1_d1a9f',
    values: {
      fld_title_aa12e: 'Add login page',
      fld_status_c81f3: 'opt_status_progress_29bb',
      fld_owner_19ad8: 'usr_tony_a19f2',
      fld_tags_92f3a: ['opt_6a2f_frontend'],
      fld_due_71fe3: '2025-02-12',
      fld_points_11b9e: 3,
      fld_iteration_6d1a2: 'itr_week_1_baa21',
    },
    content: {
      description: `# Login Page Implementation

## Overview
Create a secure and user-friendly login page for the application.

## Requirements
- Email/password authentication
- OAuth integration (Google, GitHub)
- Password reset functionality
- Remember me option
- Form validation with helpful error messages

## Technical Details
\`\`\`typescript
interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}
\`\`\`

## Design Notes
Follow the existing design system and ensure mobile responsiveness.`,
      mermaidDiagrams: [
        `graph TD
    A[User visits login page] --> B{Has account?}
    B -->|Yes| C[Enter credentials]
    B -->|No| D[Sign up flow]
    C --> E{Valid?}
    E -->|Yes| F[Redirect to dashboard]
    E -->|No| G[Show error message]
    G --> C`,
      ],
      links: [
        {
          id: 'link_1_auth',
          url: 'https://auth0.com/docs/quickstart',
          title: 'Auth0 Quickstart Guide',
          description: 'Documentation for OAuth integration',
        },
        {
          id: 'link_2_design',
          url: 'https://www.figma.com/design/login-page',
          title: 'Figma Design Mockups',
          description: 'Login page design specifications',
        },
      ],
      documents: [
        {
          id: 'doc_1_spec',
          filename: 'login-requirements.pdf',
          mime: 'application/pdf',
          size: 245000,
          url: '/documents/login-requirements.pdf',
          thumbnail: '/thumbnails/login-requirements.jpg',
          uploadedAt: '2025-02-08T10:30:00Z',
        },
      ],
      attachments: [],
    },
  },
  {
    id: 'row_2_e13cd',
    values: {
      fld_title_aa12e: 'Refactor API client',
      fld_status_c81f3: 'opt_status_todo_118a',
      fld_owner_19ad8: 'usr_alice_92bf1',
      fld_tags_92f3a: ['opt_8b91_backend', 'opt_c71d_urgent'],
      fld_due_71fe3: null,
      fld_points_11b9e: 5,
      fld_iteration_6d1a2: 'itr_week_2_e991a',
    },
    content: {
      description: `# API Client Refactoring

## Problem Statement
Current API client has several issues:
- No proper error handling
- Inconsistent response formats
- Missing retry logic
- No request cancellation support

## Proposed Solution
Implement a robust API client using Axios with interceptors.

### Features to Add
1. **Automatic retry** with exponential backoff
2. **Request/response interceptors** for auth tokens
3. **Unified error handling**
4. **Request cancellation** using AbortController
5. **Type-safe endpoints**

## Implementation Plan
- [ ] Create base API client class
- [ ] Add interceptors for auth
- [ ] Implement retry logic
- [ ] Add TypeScript types for all endpoints
- [ ] Write unit tests`,
      mermaidDiagrams: [
        `sequenceDiagram
    participant Client
    participant APIClient
    participant Interceptor
    participant Server
    
    Client->>APIClient: Make request
    APIClient->>Interceptor: Apply request interceptor
    Interceptor->>Server: Send request with auth token
    Server->>Interceptor: Response
    Interceptor->>APIClient: Apply response interceptor
    APIClient->>Client: Return formatted response`,
        `classDiagram
    class APIClient {
        +baseURL: string
        +timeout: number
        +get(url: string)
        +post(url: string, data: any)
        +put(url: string, data: any)
        +delete(url: string)
        -handleError(error: Error)
        -retry(request: Request)
    }
    
    class Interceptor {
        +request(config: Config)
        +response(response: Response)
        +error(error: Error)
    }
    
    APIClient --> Interceptor`,
      ],
      links: [
        {
          id: 'link_3_axios',
          url: 'https://axios-http.com/docs/interceptors',
          title: 'Axios Interceptors Documentation',
          description: 'Official guide for request/response interceptors',
        },
        {
          id: 'link_4_retry',
          url: 'https://github.com/softonic/axios-retry',
          title: 'axios-retry Library',
          description: 'Axios plugin for automatic retry',
        },
      ],
      documents: [],
      attachments: [
        {
          id: 'att_1_benchmark',
          filename: 'api-performance-benchmark.xlsx',
          mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          size: 52000,
          url: '/attachments/api-performance-benchmark.xlsx',
          uploadedAt: '2025-02-05T14:20:00Z',
        },
      ],
    },
  },
  {
    id: 'row_3_f8411',
    values: {
      fld_title_aa12e: 'Create UI kit',
      fld_status_c81f3: 'opt_status_done_77de',
      fld_owner_19ad8: 'usr_john_11de4',
      fld_tags_92f3a: [],
      fld_due_71fe3: '2025-02-20',
      fld_points_11b9e: 2,
      fld_iteration_6d1a2: 'itr_week_3_913ff',
    },
    content: {
      description: `# UI Component Library

## ✅ Completed Components

### Buttons
- Primary, Secondary, Tertiary variants
- Icon buttons
- Loading states
- Disabled states

### Forms
- Input fields
- Text areas
- Select dropdowns
- Checkboxes & Radio buttons
- Date pickers

### Feedback
- Alerts & Notifications
- Modals & Dialogs
- Tooltips
- Progress indicators

## Tech Stack
- **React 18** + TypeScript
- **TailwindCSS** for styling
- **Storybook** for documentation
- **Vitest** for testing

## Usage Example
\`\`\`tsx
import { Button, Input } from '@company/ui-kit';

function MyForm() {
  return (
    <form>
      <Input label="Email" type="email" />
      <Button variant="primary">Submit</Button>
    </form>
  );
}
\`\`\``,
      mermaidDiagrams: [
        `graph LR
    A[Design System] --> B[UI Components]
    B --> C[Button]
    B --> D[Input]
    B --> E[Select]
    B --> F[Modal]
    C --> G[Storybook]
    D --> G
    E --> G
    F --> G
    G --> H[Documentation]`,
      ],
      links: [
        {
          id: 'link_5_storybook',
          url: 'https://storybook.ui-kit.company.com',
          title: 'UI Kit Storybook',
          description: 'Live component documentation',
        },
        {
          id: 'link_6_npm',
          url: 'https://www.npmjs.com/package/@company/ui-kit',
          title: 'NPM Package',
          description: 'Published UI kit package',
        },
        {
          id: 'link_7_figma',
          url: 'https://www.figma.com/file/ui-kit-design-system',
          title: 'Design System in Figma',
          description: 'Source design files',
        },
      ],
      documents: [
        {
          id: 'doc_2_guidelines',
          filename: 'ui-kit-guidelines.pdf',
          mime: 'application/pdf',
          size: 1200000,
          url: '/documents/ui-kit-guidelines.pdf',
          thumbnail: '/thumbnails/ui-kit-guidelines.jpg',
          uploadedAt: '2025-02-18T09:00:00Z',
        },
      ],
      attachments: [
        {
          id: 'att_2_screenshots',
          filename: 'component-screenshots.zip',
          mime: 'application/zip',
          size: 3400000,
          url: '/attachments/component-screenshots.zip',
          uploadedAt: '2025-02-19T16:45:00Z',
        },
      ],
    },
  },
];

//
// SAVED VIEWS
//
export const views: ViewConfig[] = [
  {
    id: 'view_all_tasks',
    name: 'All Tasks',
    columns: [
      'fld_title_aa12e',
      'fld_status_c81f3',
      'fld_owner_19ad8',
      'fld_tags_92f3a',
      'fld_due_71fe3',
      'fld_points_11b9e',
      'fld_iteration_6d1a2',
    ],
    sortBy: null,
    filters: [],
    groupBy: null,
  },
  {
    id: 'view_in_progress',
    name: 'In Progress',
    columns: [
      'fld_title_aa12e',
      'fld_status_c81f3',
      'fld_owner_19ad8',
      'fld_due_71fe3',
      'fld_points_11b9e',
    ],
    sortBy: { field: 'fld_due_71fe3', direction: 'asc' },
    filters: [
      { field: 'fld_status_c81f3', operator: 'equals', value: 'opt_status_progress_29bb' },
    ],
    groupBy: null,
  },
  {
    id: 'view_my_tasks',
    name: 'My Tasks',
    columns: [
      'fld_title_aa12e',
      'fld_status_c81f3',
      'fld_due_71fe3',
      'fld_points_11b9e',
    ],
    sortBy: { field: 'fld_due_71fe3', direction: 'asc' },
    filters: [
      { field: 'fld_owner_19ad8', operator: 'equals', value: 'usr_tony_a19f2' },
      { field: 'fld_status_c81f3', operator: 'not-equals', value: 'opt_status_done_77de' },
    ],
    groupBy: null,
  },
  {
    id: 'view_urgent',
    name: 'Urgent',
    columns: [
      'fld_title_aa12e',
      'fld_owner_19ad8',
      'fld_tags_92f3a',
      'fld_due_71fe3',
    ],
    sortBy: { field: 'fld_due_71fe3', direction: 'asc' },
    filters: [
      { field: 'fld_tags_92f3a', operator: 'contains', value: 'opt_c71d_urgent' },
    ],
    groupBy: null,
  },
  {
    id: 'view_high_value',
    name: 'High Value',
    columns: [
      'fld_title_aa12e',
      'fld_points_11b9e',
      'fld_status_c81f3',
      'fld_owner_19ad8',
    ],
    sortBy: { field: 'fld_points_11b9e', direction: 'desc' },
    filters: [
      { field: 'fld_points_11b9e', operator: 'gte', value: 3 },
    ],
    groupBy: null,
  },
];

//
// Default export for convenience
//
export default {
  users,
  iterations,
  fields,
  rows,
  views,
};
