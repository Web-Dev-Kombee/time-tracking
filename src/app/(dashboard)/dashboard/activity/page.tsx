"use client";

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarClock, User, Briefcase, Receipt, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Fetch activity function
async function fetchActivity() {
 const res = await fetch("/api/activity?limit=20");

 if (!res.ok) {
  throw new Error("Failed to fetch activity");
 }

 return res.json();
}

export default function ActivityPage() {
 // Fetch activity data
 const { data, isLoading, error } = useQuery({
  queryKey: ["activity"],
  queryFn: fetchActivity,
 });

 if (error) {
  toast.error("Failed to load activity feed");
 }

 // Function to format the activity data
 const formatActivity = (activity: any) => {
  const { type, data: activityData, updatedAt } = activity;

  const getIcon = () => {
   switch (type) {
    case "time_entry":
     return <CalendarClock className="h-8 w-8 text-blue-500" />;
    case "client":
     return <User className="h-8 w-8 text-purple-500" />;
    case "project":
     return <Briefcase className="h-8 w-8 text-green-500" />;
    case "invoice":
     return <Receipt className="h-8 w-8 text-amber-500" />;
    case "expense":
     return <CreditCard className="h-8 w-8 text-red-500" />;
    default:
     return <CalendarClock className="h-8 w-8 text-gray-500" />;
   }
  };

  const getTitle = () => {
   switch (type) {
    case "time_entry":
     return `Time tracked for ${activityData.project.name}`;
    case "client":
     return `Client: ${activityData.name}`;
    case "project":
     return `Project: ${activityData.name}`;
    case "invoice":
     return `Invoice #${activityData.invoiceNumber}`;
    case "expense":
     return `Expense: ${activityData.description}`;
    default:
     return "Activity";
   }
  };

  const getDescription = () => {
   switch (type) {
    case "time_entry": {
     const duration = activityData.endTime
      ? Math.round(
         (new Date(activityData.endTime).getTime() - new Date(activityData.startTime).getTime()) /
          (1000 * 60)
        )
      : 0;
     const hours = Math.floor(duration / 60);
     const minutes = duration % 60;
     return `${hours}h ${minutes}m for ${activityData.project.client.name}`;
    }
    case "client":
     return activityData.email || "No email provided";
    case "project":
     return `Client: ${activityData.client.name}`;
    case "invoice":
     return `$${activityData.total.toFixed(2)} - ${activityData.client.name}`;
    case "expense":
     return `$${activityData.amount.toFixed(2)} - ${activityData.project.name}`;
    default:
     return "No description";
   }
  };

  return {
   icon: getIcon(),
   title: getTitle(),
   description: getDescription(),
   timestamp: new Date(updatedAt).toLocaleString(),
  };
 };

 return (
  <div className="container mx-auto py-6">
   <div className="flex justify-between items-center mb-6">
    <h1 className="text-3xl font-bold">Activity Feed</h1>
   </div>

   {isLoading ? (
    <p>Loading activity feed...</p>
   ) : data?.activities && data.activities.length > 0 ? (
    <div className="space-y-4">
     {data.activities.map((activity: any) => {
      const { icon, title, description, timestamp } = formatActivity(activity);
      return (
       <Card key={activity.id} className="overflow-hidden">
        <div className="flex">
         <div className="flex items-center justify-center p-4 bg-muted">{icon}</div>
         <div className="flex-1 p-4">
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
          <p className="text-xs mt-1 text-muted-foreground">{timestamp}</p>
         </div>
        </div>
       </Card>
      );
     })}
    </div>
   ) : (
    <Card>
     <CardHeader>
      <CardTitle>No Activity</CardTitle>
      <CardDescription>There is no recent activity to display</CardDescription>
     </CardHeader>
     <CardContent>
      <p>Start tracking time, creating projects, or invoicing clients to see activity here.</p>
     </CardContent>
    </Card>
   )}

   {data?.stats && (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-4 mt-6">
     <Card>
      <CardHeader className="pb-2">
       <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
      </CardHeader>
      <CardContent>
       <div className="text-2xl font-bold">{data.stats.activeProjects}</div>
      </CardContent>
     </Card>
     <Card>
      <CardHeader className="pb-2">
       <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
      </CardHeader>
      <CardContent>
       <div className="text-2xl font-bold">{data.stats.totalClients}</div>
      </CardContent>
     </Card>
     <Card>
      <CardHeader className="pb-2">
       <CardTitle className="text-sm font-medium">Unpaid Invoices</CardTitle>
      </CardHeader>
      <CardContent>
       <div className="text-2xl font-bold">{data.stats.unpaidInvoices}</div>
      </CardContent>
     </Card>
     <Card>
      <CardHeader className="pb-2">
       <CardTitle className="text-sm font-medium">Hours This Month</CardTitle>
      </CardHeader>
      <CardContent>
       <div className="text-2xl font-bold">{data.stats.hoursThisMonth.toFixed(1)}</div>
      </CardContent>
     </Card>
    </div>
   )}
  </div>
 );
}
