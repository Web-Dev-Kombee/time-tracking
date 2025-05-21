import {
 Clock,
 Users,
 FolderKanban,
 FileSpreadsheet,
 ArrowUpRight,
 BanknoteIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DASHBOARD_STATS, RECENT_ACTIVITIES, UPCOMING_INVOICES } from "@/constants";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
 // Get the appropriate icon based on the icon name
 const getIcon = (iconName: string) => {
  switch (iconName) {
   case "Clock":
    return <Clock className="h-6 w-6 text-blue-600" />;
   case "FolderKanban":
    return <FolderKanban className="h-6 w-6 text-purple-600" />;
   case "FileSpreadsheet":
    return <FileSpreadsheet className="h-6 w-6 text-orange-600" />;
   case "Users":
    return <Users className="h-6 w-6 text-green-600" />;
   default:
    return <Clock className="h-6 w-6 text-blue-600" />;
  }
 };

 return (
  <div className="space-y-6">
   <div className="flex items-center justify-between">
    <h1 className="text-2xl font-bold">Dashboard</h1>
    <Button asChild>
     <Link href="/dashboard/time/new" className="flex items-center gap-2">
      <Clock className="h-4 w-4" />
      Track Time
     </Link>
    </Button>
   </div>

   {/* Stats Cards */}
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {DASHBOARD_STATS.map(stat => (
     <Link
      key={stat.label}
      href={stat.href}
      className="bg-background p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
     >
      <div className="flex justify-between items-start">
       <div className="bg-muted p-3 rounded-full">{getIcon(stat.iconName)}</div>
       <span
        className={cn("text-sm font-medium", stat.positive ? "text-green-600" : "text-red-600")}
       >
        {stat.change}
       </span>
      </div>
      <p className="mt-4 text-2xl font-bold">{stat.value}</p>
      <p className="text-muted-foreground text-sm">{stat.label}</p>
     </Link>
    ))}
   </div>

   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Recent Activity */}
    <div className="bg-background rounded-lg shadow-sm border">
     <div className="p-4 border-b flex justify-between items-center">
      <h2 className="font-semibold">Recent Activity</h2>
      <Link
       href="/dashboard/activity"
       className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
      >
       View all
       <ArrowUpRight className="h-3 w-3" />
      </Link>
     </div>
     <div className="divide-y">
      {RECENT_ACTIVITIES.map(activity => (
       <div key={activity.id} className="p-4 hover:bg-muted/50">
        <div className="flex justify-between">
         <p className="text-sm">
          <span className="font-medium">{activity.action}</span>{" "}
          <span className="text-primary">{activity.target}</span>
          {activity.client && <span className="text-muted-foreground"> for {activity.client}</span>}
          {activity.project && <span className="text-muted-foreground"> ({activity.project})</span>}
          {activity.amount && <span className="font-medium"> - {activity.amount}</span>}
         </p>
         <span className="text-xs text-muted-foreground">{activity.time}</span>
        </div>
       </div>
      ))}
     </div>
    </div>

    {/* Upcoming Invoices */}
    <div className="bg-background rounded-lg shadow-sm border">
     <div className="p-4 border-b flex justify-between items-center">
      <h2 className="font-semibold">Upcoming Invoices</h2>
      <Link
       href="/dashboard/invoices"
       className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
      >
       View all
       <ArrowUpRight className="h-3 w-3" />
      </Link>
     </div>
     <div className="divide-y">
      {UPCOMING_INVOICES.map(invoice => (
       <div key={invoice.id} className="p-4 hover:bg-muted/50">
        <div className="flex justify-between items-center">
         <div>
          <p className="text-sm font-medium">{invoice.client}</p>
          <div className="flex items-center gap-2 mt-1">
           <span className="text-xs">{invoice.id}</span>
           <span
            className={cn(
             "text-xs px-2 py-0.5 rounded-full",
             invoice.status === "overdue"
              ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300"
            )}
           >
            {invoice.due}
           </span>
          </div>
         </div>
         <p className="text-sm font-semibold">{invoice.amount}</p>
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
      <p className="text-sm text-gray-500">Revenue chart coming soon...</p>
     </div>
    </div>
   </div>
  </div>
 );
}
