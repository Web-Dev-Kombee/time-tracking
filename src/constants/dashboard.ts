// Dashboard page statistics
export const DASHBOARD_STATS = [
  {
    label: "Hours tracked this month",
    value: "87.5",
    change: "+12.5%",
    positive: true,
    iconName: "Clock",
    href: "/dashboard/time",
  },
  {
    label: "Active projects",
    value: "8",
    change: "+2",
    positive: true,
    iconName: "FolderKanban",
    href: "/dashboard/projects",
  },
  {
    label: "Invoices due",
    value: "$4,250",
    change: "$1,250",
    positive: false,
    iconName: "FileSpreadsheet",
    href: "/dashboard/invoices",
  },
  {
    label: "Clients",
    value: "12",
    change: "+3",
    positive: true,
    iconName: "Users",
    href: "/dashboard/clients",
  },
];

// Recent activities for dashboard
export const RECENT_ACTIVITIES = [
  {
    id: 1,
    type: "time-entry",
    action: "Tracked 2.5 hours on",
    target: "Website Redesign",
    client: "Acme Inc.",
    time: "2 hours ago",
  },
  {
    id: 2,
    type: "invoice",
    action: "Sent invoice #1052 to",
    target: "Globex Corporation",
    amount: "$1,850.00",
    time: "Yesterday",
  },
  {
    id: 3,
    type: "expense",
    action: "Added expense for",
    target: "Client meeting",
    amount: "$45.00",
    project: "Marketing Campaign",
    time: "Yesterday",
  },
];

// Upcoming invoices for dashboard
export const UPCOMING_INVOICES = [
  {
    id: "INV-1052",
    client: "Globex Corporation",
    amount: "$1,850.00",
    due: "Due in 5 days",
    status: "pending",
  },
  {
    id: "INV-1048",
    client: "Acme Inc.",
    amount: "$3,200.00",
    due: "Due in 2 days",
    status: "pending",
  },
  {
    id: "INV-1045",
    client: "Stark Industries",
    amount: "$7,500.00",
    due: "Overdue by 3 days",
    status: "overdue",
  },
];
