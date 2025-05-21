import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
 Clock,
 Edit,
 BarChart,
 Users,
 FileText,
 Plus,
 CalendarClock,
 DollarSign,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
 ProjectStatus,
 Project,
 TimeEntry,
 Client,
 ProjectWithClient,
 TimeEntryWithDuration,
} from "@/types";

// Helper function to get badge color based on project status
function getStatusColor(status: ProjectStatus): string {
 switch (status) {
  case ProjectStatus.ACTIVE:
   return "bg-green-100 text-green-800 hover:bg-green-100";
  case ProjectStatus.COMPLETED:
   return "bg-blue-100 text-blue-800 hover:bg-blue-100";
  case ProjectStatus.ARCHIVED:
   return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  default:
   return "bg-gray-100 text-gray-800 hover:bg-gray-100";
 }
}

interface ProjectPageProps {
 params: {
  id: string;
 };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
 const session = await getServerSession(authOptions);

 if (!session?.user) {
  return redirect("/login");
 }

 // Fetch the project with related data
 const project = await prisma.project.findUnique({
  where: {
   id: params.id,
   createdById: session.user.id,
  },
  include: {
   client: true,
   timeEntries: {
    orderBy: {
     startTime: "desc",
    },
    take: 5,
   },
  },
 });

 if (!project) {
  return notFound();
 }

 // Calculate project statistics
 const totalHours = project.timeEntries.reduce((acc: number, entry: TimeEntry) => {
  if (!entry.endTime) return acc;

  const startTime = new Date(entry.startTime);
  const endTime = new Date(entry.endTime);
  const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

  return acc + durationHours;
 }, 0);

 const totalBillableAmount = totalHours * project.hourlyRate;
 const createdDate = format(new Date(project.createdAt), "MMMM d, yyyy");
 const updatedDate = formatDistanceToNow(new Date(project.updatedAt), {
  addSuffix: true,
 });

 // Format time entries
 const timeEntriesWithDuration: TimeEntryWithDuration[] = project.timeEntries.map(
  (entry: TimeEntry) => {
   const startTime = new Date(entry.startTime);
   const endTime = entry.endTime ? new Date(entry.endTime) : new Date();
   const durationMs = endTime.getTime() - startTime.getTime();
   const hours = Math.floor(durationMs / (1000 * 60 * 60));
   const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
   const duration = `${hours}h ${minutes}m`;

   return {
    ...entry,
    duration,
    formattedDate: format(startTime, "MMM d, yyyy"),
    formattedStartTime: format(startTime, "h:mm a"),
    formattedEndTime: entry.endTime ? format(new Date(entry.endTime), "h:mm a") : "In progress",
   };
  }
 );

 return (
  <div className="space-y-6">
   <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
     <div className="flex items-center gap-2">
      <h1 className="text-2xl font-bold">{project.name}</h1>
      <Badge className={getStatusColor(project.status)}>
       {project.status.charAt(0) + project.status.slice(1).toLowerCase()}
      </Badge>
     </div>
     <p className="text-muted-foreground mt-1">Client: {project.client.name}</p>
    </div>

    <div className="flex items-center gap-2">
     <Link href={`/dashboard/time/new?projectId=${project.id}`}>
      <Button variant="outline" size="sm">
       <Clock className="h-4 w-4 mr-2" />
       Track Time
      </Button>
     </Link>

     <Link href={`/dashboard/projects/${project.id}/edit`}>
      <Button size="sm">
       <Edit className="h-4 w-4 mr-2" />
       Edit Project
      </Button>
     </Link>
    </div>
   </div>

   {/* Project Overview */}
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <Card>
     <CardContent className="pt-6">
      <div className="flex flex-col items-center text-center space-y-2">
       <Clock className="h-8 w-8 text-blue-600" />
       <CardTitle className="text-2xl">{totalHours.toFixed(1)}</CardTitle>
       <CardDescription>Total Hours</CardDescription>
      </div>
     </CardContent>
    </Card>

    <Card>
     <CardContent className="pt-6">
      <div className="flex flex-col items-center text-center space-y-2">
       <DollarSign className="h-8 w-8 text-green-600" />
       <CardTitle className="text-2xl">${totalBillableAmount.toFixed(2)}</CardTitle>
       <CardDescription>Billable Amount</CardDescription>
      </div>
     </CardContent>
    </Card>

    <Card>
     <CardContent className="pt-6">
      <div className="flex flex-col items-center text-center space-y-2">
       <CalendarClock className="h-8 w-8 text-purple-600" />
       <CardTitle className="text-2xl">{createdDate}</CardTitle>
       <CardDescription>Project Started</CardDescription>
      </div>
     </CardContent>
    </Card>

    <Card>
     <CardContent className="pt-6">
      <div className="flex flex-col items-center text-center space-y-2">
       <Users className="h-8 w-8 text-orange-600" />
       <CardTitle className="text-2xl">${project.hourlyRate}</CardTitle>
       <CardDescription>Hourly Rate</CardDescription>
      </div>
     </CardContent>
    </Card>
   </div>

   {/* Project Details Tabs */}
   <Tabs defaultValue="overview" className="w-full">
    <TabsList className="grid w-full grid-cols-4">
     <TabsTrigger value="overview">Overview</TabsTrigger>
     <TabsTrigger value="time">Time Entries</TabsTrigger>
     <TabsTrigger value="tasks">Tasks</TabsTrigger>
     <TabsTrigger value="invoices">Invoices</TabsTrigger>
    </TabsList>

    <TabsContent value="overview" className="mt-6 space-y-6">
     <Card>
      <CardHeader>
       <CardTitle>Project Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
       {project.description && (
        <div>
         <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
         <p>{project.description}</p>
        </div>
       )}

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <div>
         <h3 className="text-sm font-medium text-muted-foreground mb-1">Client</h3>
         <Link
          href={`/dashboard/clients/${project.client.id}`}
          className="text-blue-600 hover:underline"
         >
          {project.client.name}
         </Link>
        </div>

        <div>
         <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
         <Badge className={getStatusColor(project.status)}>
          {project.status.charAt(0) + project.status.slice(1).toLowerCase()}
         </Badge>
        </div>

        <div>
         <h3 className="text-sm font-medium text-muted-foreground mb-1">Hourly Rate</h3>
         <p>${project.hourlyRate.toFixed(2)}</p>
        </div>

        <div>
         <h3 className="text-sm font-medium text-muted-foreground mb-1">Last Updated</h3>
         <p>{updatedDate}</p>
        </div>
       </div>
      </CardContent>
     </Card>

     <Card>
      <CardHeader className="flex flex-row items-center justify-between">
       <div>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Recent time entries for this project</CardDescription>
       </div>
       <Link href="/dashboard/time/new">
        <Button variant="outline" size="sm">
         <Plus className="h-4 w-4 mr-2" />
         Add Time
        </Button>
       </Link>
      </CardHeader>
      <CardContent>
       {timeEntriesWithDuration.length === 0 ? (
        <div className="text-center py-6">
         <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
         <h3 className="text-lg font-medium">No time entries yet</h3>
         <p className="text-muted-foreground mt-1 mb-4">Start tracking time for this project</p>
         <Link href={`/dashboard/time/new?projectId=${project.id}`}>
          <Button>
           <Plus className="h-4 w-4 mr-2" />
           Add Time Entry
          </Button>
         </Link>
        </div>
       ) : (
        <div className="space-y-4">
         {timeEntriesWithDuration.map(entry => (
          <div key={entry.id} className="flex justify-between border-b pb-4">
           <div>
            <p className="font-medium">{entry.description || "No description"}</p>
            <div className="text-sm text-muted-foreground">
             {entry.formattedDate}: {entry.formattedStartTime} - {entry.formattedEndTime}
            </div>
           </div>
           <div className="text-right">
            <p className="font-medium">{entry.duration}</p>
            <Link
             href={`/dashboard/time/${entry.id}/edit`}
             className="text-xs text-blue-600 hover:underline"
            >
             Edit
            </Link>
           </div>
          </div>
         ))}
        </div>
       )}

       {timeEntriesWithDuration.length > 0 && (
        <div className="mt-4">
         <Link
          href={`/dashboard/time?projectId=${project.id}`}
          className="text-sm text-blue-600 hover:underline flex items-center justify-center"
         >
          View all time entries
         </Link>
        </div>
       )}
      </CardContent>
     </Card>
    </TabsContent>

    <TabsContent value="time" className="mt-6">
     <Card>
      <CardHeader className="flex flex-row items-center justify-between">
       <div>
        <CardTitle>Time Entries</CardTitle>
        <CardDescription>All time entries for this project</CardDescription>
       </div>
       <Link href={`/dashboard/time/new?projectId=${project.id}`}>
        <Button size="sm">
         <Plus className="h-4 w-4 mr-2" />
         Add Time
        </Button>
       </Link>
      </CardHeader>
      <CardContent>
       <div className="text-center py-6">
        <Link href={`/dashboard/time?projectId=${project.id}`}>
         <Button>View All Time Entries</Button>
        </Link>
       </div>
      </CardContent>
     </Card>
    </TabsContent>

    <TabsContent value="tasks" className="mt-6">
     <Card>
      <CardHeader>
       <CardTitle>Tasks</CardTitle>
       <CardDescription>Manage tasks for this project</CardDescription>
      </CardHeader>
      <CardContent className="text-center py-6">
       <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
       <h3 className="text-lg font-medium">Task Management Coming Soon</h3>
       <p className="text-muted-foreground mt-1 mb-4">
        This feature is currently under development
       </p>
      </CardContent>
     </Card>
    </TabsContent>

    <TabsContent value="invoices" className="mt-6">
     <Card>
      <CardHeader>
       <CardTitle>Invoices</CardTitle>
       <CardDescription>Manage invoices for this project</CardDescription>
      </CardHeader>
      <CardContent className="text-center py-6">
       <BarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
       <h3 className="text-lg font-medium">Invoicing Coming Soon</h3>
       <p className="text-muted-foreground mt-1 mb-4">
        This feature is currently under development
       </p>
      </CardContent>
     </Card>
    </TabsContent>
   </Tabs>
  </div>
 );
}
