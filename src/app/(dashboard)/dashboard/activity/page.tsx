"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  ActivityClient,
  ActivityExpense,
  ActivityInvoice,
  ActivityProject,
  ActivityResponse,
  ActivityTimeEntry,
} from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, CalendarClock, CreditCard, Receipt, User } from "lucide-react";
import { toast } from "sonner";

// Fetch activity function
async function fetchActivity(): Promise<ActivityResponse> {
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
  const formatActivity = (activity: Activity) => {
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
          return `Time tracked for ${(activityData as ActivityTimeEntry).project.name}`;
        case "client":
          return `Client: ${(activityData as ActivityClient).name}`;
        case "project":
          return `Project: ${(activityData as ActivityProject).name}`;
        case "invoice":
          return `Invoice #${(activityData as ActivityInvoice).invoiceNumber}`;
        case "expense":
          return `Expense: ${(activityData as ActivityExpense).description}`;
        default:
          return "Activity";
      }
    };

    const getDescription = () => {
      switch (type) {
        case "time_entry": {
          const timeData = activityData as ActivityTimeEntry;
          const duration = timeData.endTime
            ? Math.round(
                (new Date(timeData.endTime).getTime() - new Date(timeData.startTime).getTime()) /
                  (1000 * 60)
              )
            : 0;
          const hours = Math.floor(duration / 60);
          const minutes = duration % 60;
          return `${hours}h ${minutes}m for ${timeData.project.client.name}`;
        }
        case "client": {
          const clientData = activityData as ActivityClient;
          return clientData.email || "No email provided";
        }
        case "project": {
          const projectData = activityData as ActivityProject;
          return `Client: ${projectData.client.name}`;
        }
        case "invoice": {
          const invoiceData = activityData as ActivityInvoice;
          return `$${invoiceData.total.toFixed(2)} - ${invoiceData.client.name}`;
        }
        case "expense": {
          const expenseData = activityData as ActivityExpense;
          return `$${expenseData.amount.toFixed(2)} - ${expenseData.project.name}`;
        }
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
          {data.activities.map(activity => {
            const { icon, title, description, timestamp } = formatActivity(activity as Activity);
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
            <p>
              Start tracking time, creating projects, or invoicing clients to see activity here.
            </p>
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
