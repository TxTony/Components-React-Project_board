# Sentry‑Style Query Filter System for GitBoard

This document explains the filtering system used in GitBoard, inspired by Sentry’s search query syntax. It includes design goals, syntax rules, data structures, and an implementation plan with TDD, as well as how to integrate the system into the Vue/React component.

---

## 1. Overview

The GitBoard filter system allows users to type a structured query string to filter board rows. The goal is to provide a powerful and expressive search syntax similar to Sentry:

```
assigned:tony status:progress -status:done tags:frontend points:>3 title:"login page"
```

The filter string is parsed into a structured set of filter objects and stored inside `views.filters`.

---

## 2. Syntax Rules

### **2.1 Operators**

* `=` equals
* `!=` not equals
* `>` greater than (number/date)
* `<` less than
* `>=` greater or equal
* `<=` less or equal
* `~` contains (string search)
* `!~` not contains

### **2.2 Negation**

Prefix `-` negates the filter.

```
-status:done
-tag:urgent
```

### **2.3 Field matching**

```
field:operator?value
```

Examples:

```
status:todo
points:>3
owner:alice
title~:"login"
```

### **2.4 Quoted values**

Values containing spaces or special characters must be wrapped:

```
title:"Add login page"
```

### **2.5 Supported fields**

| Field keyword                   | Maps to field       | Type          |
| ------------------------------- | ------------------- | ------------- |
| `title`                         | fld_title_aa12e     | string        |
| `status`                        | fld_status_c81f3    | single-select |
| `owner`, `assigned`, `assignee` | fld_owner_19ad8     | assignee      |
| `tag`, `tags`                   | fld_tags_92f3a      | multi-select  |
| `due`, `dueDate`                | fld_due_71fe3       | date          |
| `points`, `pts`                 | fld_points_11b9e    | number        |
| `iteration`, `sprint`           | fld_iteration_6d1a2 | single-select |

---

## 3. Filter Object Format (Stored in `views.filters`)

Each filter becomes a structured object.

### **3.1 Format**

```
{
  field: "fld_status_c81f3",
  operator: "=",   // '=', '!=', '>', '<', '>=', '<=', '~', '!~'
  value: "opt_status_todo_118a",
  negated: false
}
```

### **3.2 Example Parsed Filter Set**

Input string:

```
assigned:tony -status:done points:>3 title~:"login page"
```

Output:

```
[
  {
    field: "fld_owner_19ad8",
    operator: "=",
    value: "usr_tony_a19f2",
    negated: false
  },
  {
    field: "fld_status_c81f3",
    operator: "=",
    value: "opt_status_done_77de",
    negated: true
  },
  {
    field: "fld_points_11b9e",
    operator: ">",
    value: 3,
    negated: false
  },
  {
    field: "fld_title_aa12e",
    operator: "~",
    value: "login page",
    negated: false
  }
]
```

---

## 4. Firestore Query Mapping

do not implement firestore query mapping its outside our scope

## 5. Component Responsibilities

A dedicated `FilterBar` component:

### **Features**

* Input field for typing Sentry‑style query
* Autocomplete for fields
* Autocomplete for known values (status, tags, owners)
* Chips display for active filters
* Emits `onFiltersChange(parsedFilters)`

### **Props**

* `value: string` (initial query)
* `fields: FieldDefinition[]`

### **Events**

* `update:value` (for v-model)
* `filters-changed` (parsed filter array)

---

## 6. Implementation Plan (TDD)

### **6.1 Test Phases**

#### **Phase 1 — Query Parsing**

Tests:

* Parse single filter
* Parse multiple filters
* Support all operators
* Negation
* Quoted values
* Field aliases
* Error handling (invalid syntax)

#### **Phase 2 — Validation Layer**

Tests:

* Field must exist
* Value must map to allowed options (
* Auto-mapping (e.g., "tony" → usr_tony…)

#### **Phase 3 — Field Mapping Layer**

This phase no longer deals with Firestore. Instead, its responsibility is:

* Map parsed filter tokens to **GitBoard field definitions** (title, owner, and any custom field defined in `fields[]`).
* Convert field aliases (e.g., `assigned`, `assignee`, `owner` → `fld_owner_19ad8`).
* Handle type inference (string, number, date, select, multi-select).
* Validate value type compatibility.

Tests:

* Title field mapping
* Owner field mapping
* Mapping all custom fields dynamically
* Detect invalid fields
* Detect incompatible operators

#### **Phase 4 — Component** — Component**

Tests:

* Renders input
* Displays chips
* Emits updates
* Sync with v-model

---



## 8. Next Step

Once validated, integrate the FilterBar into the board header and store parsed filters inside the `views.filters` array.
