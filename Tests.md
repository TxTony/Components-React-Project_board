✅ TDD Expectations / Test Specifications

Below is the behaviour list you test one-by-one, written as expectations.

1. Columns
Create

When a new column is added, it appears at the end of the table with a default width.

Newly created column is editable (name and type).

Rename

Renaming a column updates the header immediately.

Reorder

Dragging a column left or right updates the order in the DOM and internal state.

Resize

Dragging a column edge adjusts its width.

Width is persisted in the view state.

Visibility

Hiding a column removes it from the table view.

Showing a column restores its previous width and position.

2. Rows & Items
Add row

Clicking “Add row” inserts a new row with empty default values.

Inline edit

Clicking a cell enters edit mode appropriate to its type.

Editing commits after blur or Enter.

Escape cancels changes.

Reorder rows

Drag-and-drop moves the row and updates its index in the internal state.

3. Field Types
Text

User can input any string.

Number

Only numeric input allowed.

Empty value allowed.

Date

Opens a date picker.

Clears value when user removes it.

Single-select

Dropdown appears with available options.

Selecting option closes dropdown and commits value.

Multi-select

Dropdown allows toggling multiple tags.

Selecting/deselecting updates the cell value immediately.

Assignee

Dropdown lists all available users.

Selecting commits the value.

Iteration

Dropdown lists iterations.

Selecting commits the value.

4. Filtering

Applying a filter hides rows not matching.

Multiple filters combine with AND logic.

Clearing filters restores all rows.

5. Sorting

Clicking a header sorts by that field in ascending order.

Clicking again toggles descending.

Sorting preserves filtered rows.

6. Grouping

Grouping by a field creates collapsed/expanded sections.

Each section displays its own row count.

Dragging between groups updates the grouped field.

7. Bulk Selection

Clicking checkbox selects a row.

Shift-click selects a range.

Bulk actions apply to all selected rows.

8. Views
Saving

Saving a view stores:

column order

column visibility

filters

sorting

grouping

Switching

Switching view loads all saved configurations immediately.

9. Side Panel (optional)

Clicking a row opens a side panel.

Panel shows all field values and description section.

Editing in the panel synchronises with table values.

10. Performance
Virtualisation

Only visible rows render.

Scrolling loads new rows without lag.

Editing debounce

Edits update global state only after a short debounce.

---

## Test Infrastructure

### Test Framework
- **Vitest**: Fast unit test runner with native ESM support
- **React Testing Library**: Component testing focused on user behavior
- **@testing-library/jest-dom**: Custom matchers for DOM assertions
- **@testing-library/user-event**: Realistic user interaction simulation

### Running Tests

```bash
# Run all tests (watch mode)
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Test Organization

```
tests/
├── setup.ts              # Global test configuration
├── GitBoardTable.test.tsx # Main component tests
├── components/           # Individual component tests
├── hooks/               # Custom hooks tests
└── utils/               # Utility function tests
```

### Coverage Requirements

All code must maintain minimum coverage:
- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 80%
- **Statements**: 80%

### Test-Driven Development (TDD) Workflow

1. **Red**: Write a failing test for new feature
2. **Green**: Write minimal code to pass the test
3. **Refactor**: Improve code while keeping tests green

### Mock Data

All tests use standardized mock data from `src/mocks/mockData.ts`:
- 3 users (Tony, Alice, John)
- 3 iterations (Week 1, 2, 3)
- 7 field definitions (text, status, owner, tags, date, points, iteration)
- 3 sample rows with complete data

### Testing Best Practices

1. **Test user behavior, not implementation**
   - Use `getByRole`, `getByLabelText` instead of `getByTestId` when possible
   - Simulate real user interactions

2. **Keep tests isolated**
   - Each test should be independent
   - Use cleanup after each test (automatic)

3. **Use descriptive test names**
   - Format: `it('does X when Y happens')`
   - Clear expectations in test descriptions

4. **Avoid testing library internals**
   - Focus on public API and user-facing behavior
   - Don't test React/library implementation details

5. **Mock external dependencies**
   - Use MSW for API mocking
   - Mock browser APIs (IntersectionObserver, matchMedia)

### Current Test Status

✅ **Green Light** - All tests passing

Initial test suite includes:
- Component rendering tests
- Theme switching tests
- Props validation tests
- ARIA accessibility tests

### Next Test Priorities

Following the TDD expectations above, implement tests in this order:

1. **Column Management** (Create, Rename, Reorder, Resize, Visibility)
2. **Row Operations** (Add, Edit, Reorder)
3. **Field Types** (Text, Number, Date, Select variants)
4. **Table Features** (Filtering, Sorting, Grouping)
5. **Views** (Save, Switch, Restore)
6. **Performance** (Virtualization, Debouncing)

Each feature requires:
- Unit tests for logic
- Integration tests for user flows
- Edge case handling
- Accessibility verification