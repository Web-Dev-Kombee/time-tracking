import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FolderKanban, Plus, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectStatus, Project, TimeEntry, ProjectWithRelations } from "@/types";

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

export default async function ProjectsPage() {
 const session = await getServerSession(authOptions);

 if (!session?.user) {
  return redirect("/login");
 }

 // Fetch projects from the database
 const projects = await prisma.project.findMany({
  where: {
   createdById: session.user.id,
  },
  include: {
   client: true,
   timeEntries: true,
  },
  orderBy: {
   updatedAt: "desc",
  },
 });

 // Calculate total hours for each project
 const projectsWithStats: ProjectWithRelations[] = projects.map(
  (
   project: Project & {
    client: { id: string; name: string };
    timeEntries: TimeEntry[];
   }
  ) => {
   const totalHours = project.timeEntries.reduce((acc: number, entry: TimeEntry) => {
    if (!entry.endTime) return acc;

    const startTime = new Date(entry.startTime);
    const endTime = new Date(entry.endTime);
    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

    return acc + durationHours;
   }, 0);

   const hoursTracked = totalHours.toFixed(1);
   const formattedUpdatedAt = formatDistanceToNow(new Date(project.updatedAt), {
    addSuffix: true,
   });

   return {
    ...project,
    hoursTracked,
    updatedAt: formattedUpdatedAt,
   };
  }
 );

 return (
  <div className="space-y-6">
   <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
     <h1 className="text-2xl font-bold">Projects</h1>
     <p className="text-muted-foreground mt-1">Manage your projects and track time</p>
    </div>

    <Link href="/dashboard/projects/new">
     <Button size="sm">
      <Plus className="h-4 w-4 mr-2" />
      New Project
     </Button>
    </Link>
   </div>

   {projectsWithStats.length === 0 ? (
    <Card>
     <CardContent className="text-center py-10">
      <FolderKanban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium">No projects yet</h3>
      <p className="text-muted-foreground mt-1 mb-4">
       Create your first project to start tracking time
      </p>
      <Link href="/dashboard/projects/new">
       <Button>
        <Plus className="h-4 w-4 mr-2" />
        Add Project
       </Button>
      </Link>
     </CardContent>
    </Card>
   ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
     {projectsWithStats.map(project => (
      <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
       <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
         <div className="flex justify-between items-start">
          <Badge className={getStatusColor(project.status)}>
           {project.status.charAt(0) + project.status.slice(1).toLowerCase()}
          </Badge>
          <div className="text-sm text-muted-foreground">${project.hourlyRate}/hr</div>
         </div>
         <CardTitle className="text-xl mt-2">{project.name}</CardTitle>
         <CardDescription>{project.client.name}</CardDescription>
        </CardHeader>
        <CardContent>
         <div className="flex justify-between items-center mt-2">
          <div className="flex items-center">
           <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
           <span className="text-sm">{project.hoursTracked} hours tracked</span>
          </div>
          <div className="text-xs text-muted-foreground">Updated {project.updatedAt}</div>
         </div>
         {project.description && (
          <p className="text-sm text-muted-foreground mt-4 line-clamp-2">{project.description}</p>
         )}
        </CardContent>
       </Card>
      </Link>
     ))}
    </div>
   )}
  </div>
 );
}
