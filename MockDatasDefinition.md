//
// USERS (for assignee fields)
//
export const users = [
  {
    id: "usr_tony_a19f2",
    name: "Tony Tip",
    avatar: "/avatars/tony.png"
  },
  {
    id: "usr_alice_92bf1",
    name: "Alice",
    avatar: "/avatars/alice.png"
  },
  {
    id: "usr_john_11de4",
    name: "John",
    avatar: "/avatars/john.png"
  }
];

//
// ITERATIONS
//
export const iterations = [
  {
    id: "itr_week_1_baa21",
    label: "Week 1",
    start: "2025-02-10",
    end: "2025-02-16"
  },
  {
    id: "itr_week_2_e991a",
    label: "Week 2",
    start: "2025-02-17",
    end: "2025-02-23"
  },
  {
    id: "itr_week_3_913ff",
    label: "Week 3",
    start: "2025-02-24",
    end: "2025-03-02"
  }
];

//
// FIELDS (COLUMN DEFINITIONS)
//
export const fields = [
  {
    id: "fld_title_aa12e",
    type: "text",
    name: "Title",
    visible: true,
    width: 240
  },
  {
    id: "fld_status_c81f3",
    type: "single-select",
    name: "Status",
    visible: true,
    options: [
      {
        id: "opt_status_todo_118a",
        label: "Todo",
        colour: "#9e9e9e",
        description: "Not started yet"
      },
      {
        id: "opt_status_progress_29bb",
        label: "In Progress",
        colour: "#2196f3",
        description: "Currently being worked on"
      },
      {
        id: "opt_status_done_77de",
        label: "Done",
        colour: "#4caf50",
        description: "Completed"
      }
    ]
  },
  {
    id: "fld_owner_19ad8",
    type: "assignee",
    name: "Owner",
    visible: true,
    options: users.map(u => ({ id: u.id, label: u.name }))
  },
  {
    id: "fld_tags_92f3a",
    type: "multi-select",
    name: "Tags",
    visible: true,
    options: [
      {
        id: "opt_6a2f_frontend",
        label: "Frontend",
        colour: "#4caf50",
        description: "UI logic, components, styling"
      },
      {
        id: "opt_8b91_backend",
        label: "Backend",
        colour: "#2196f3",
        description: "API, services, data layer"
      },
      {
        id: "opt_c71d_urgent",
        label: "Urgent",
        colour: "#f44336",
        description: "Needs immediate attention"
      }
    ]
  },
  {
    id: "fld_due_71fe3",
    type: "date",
    name: "Due Date",
    visible: true
  },
  {
    id: "fld_points_11b9e",
    type: "number",
    name: "Points",
    visible: true
  },
  {
    id: "fld_iteration_6d1a2",
    type: "iteration",
    name: "Iteration",
    visible: true,
    options: iterations.map(i => ({ id: i.id, label: i.label }))
  }
];

//
// ROWS (ITEMS)
//
export const rows = [
  {
    id: "row_1_d1a9f",
    values: {
      fld_title_aa12e: "Add login page",
      fld_status_c81f3: "opt_status_progress_29bb",
      fld_owner_19ad8: "usr_tony_a19f2",
      fld_tags_92f3a: ["opt_6a2f_frontend"],
      fld_due_71fe3: "2025-02-12",
      fld_points_11b9e: 3,
      fld_iteration_6d1a2: "itr_week_1_baa21"
    }
  },
  {
    id: "row_2_e13cd",
    values: {
      fld_title_aa12e: "Refactor API client",
      fld_status_c81f3: "opt_status_todo_118a",
      fld_owner_19ad8: "usr_alice_92bf1",
      fld_tags_92f3a: ["opt_8b91_backend", "opt_c71d_urgent"],
      fld_due_71fe3: null,
      fld_points_11b9e: 5,
      fld_iteration_6d1a2: "itr_week_2_e991a"
    }
  },
  {
    id: "row_3_f8411",
    values: {
      fld_title_aa12e: "Create UI kit",
      fld_status_c81f3: "opt_status_done_77de",
      fld_owner_19ad8: "usr_john_11de4",
      fld_tags_92f3a: [],
      fld_due_71fe3: "2025-02-20",
      fld_points_11b9e: 2,
      fld_iteration_6d1a2: "itr_week_3_913ff"
    }
  }
];

//
// SAVED VIEWS
//
export const views = [
  {
    id: "view_default_812bd",
    name: "Default",
    columns: [
      "fld_title_aa12e",
      "fld_status_c81f3",
      "fld_owner_19ad8",
      "fld_tags_92f3a",
      "fld_due_71fe3",
      "fld_points_11b9e",
      "fld_iteration_6d1a2"
    ],
    sortBy: null,
    filters: [],
    groupBy: null
  },
  {
    id: "view_by_status_992d1",
    name: "By Status",
    columns: [
      "fld_title_aa12e",
      "fld_status_c81f3",
      "fld_owner_19ad8"
    ],
    sortBy: { field: "fld_status_c81f3", direction: "asc" },
    filters: [],
    groupBy: "fld_status_c81f3"
  }
];
