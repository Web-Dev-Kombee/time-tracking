import {
  Clock,
  Users,
  FolderKanban,
  FileSpreadsheet,
  ArrowUpRight,
  BanknoteIcon,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  // This would normally come from a database query
  const stats = [
    {
      label: "Hours tracked this month",
      value: "87.5",
      change: "+12.5%",
      positive: true,
      icon: <Clock className="h-6 w-6 text-blue-600" />,
      href: "/dashboard/time",
    },
    {
      label: "Active projects",
      value: "8",
      change: "+2",
      positive: true,
      icon: <FolderKanban className="h-6 w-6 text-purple-600" />,
      href: "/dashboard/projects",
    },
    {
      label: "Invoices due",
      value: "$4,250",
      change: "$1,250",
      positive: false,
      icon: <FileSpreadsheet className="h-6 w-6 text-orange-600" />,
      href: "/dashboard/invoices",
    },
    {
      label: "Clients",
      value: "12",
      change: "+3",
      positive: true,
      icon: <Users className="h-6 w-6 text-green-600" />,
      href: "/dashboard/clients",
    },
  ];

  const recentActivities = [
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

  const upcomingInvoices = [
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link
          href="/dashboard/time/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
        >
          <Clock className="h-4 w-4" />
          Track Time
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="bg-gray-50 p-3 rounded-full">{stat.icon}</div>
              <span
                className={`text-sm font-medium ${
                  stat.positive ? "text-green-600" : "text-red-600"
                }`}
              >
                {stat.change}
              </span>
            </div>
            <p className="mt-4 text-2xl font-bold">{stat.value}</p>
            <p className="text-gray-500 text-sm">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold">Recent Activity</h2>
            <Link
              href="/dashboard/activity"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View all
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between">
                  <p className="text-sm">
                    <span className="font-medium">{activity.action}</span>{" "}
                    <span className="text-blue-600">{activity.target}</span>
                    {activity.client && (
                      <span className="text-gray-600">
                        {" "}
                        for {activity.client}
                      </span>
                    )}
                    {activity.project && (
                      <span className="text-gray-600">
                        {" "}
                        ({activity.project})
                      </span>
                    )}
                    {activity.amount && (
                      <span className="font-medium"> - {activity.amount}</span>
                    )}
                  </p>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Invoices */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold">Upcoming Invoices</h2>
            <Link
              href="/dashboard/invoices"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View all
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y">
            {upcomingInvoices.map((invoice) => (
              <div key={invoice.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{invoice.client}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs">{invoice.id}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          invoice.status === "overdue"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {invoice.due}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{invoice.amount}</p>
                    <Link
                      href={`/dashboard/invoices/${invoice.id}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Chart Preview */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-semibold">Revenue Overview</h2>
          <div className="flex gap-2">
            <select className="text-sm border rounded-md px-2 py-1">
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>This year</option>
            </select>
            <Link
              href="/dashboard/reports/revenue"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Detailed Report
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md border">
          <div className="text-center">
            <BanknoteIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              Revenue chart coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
