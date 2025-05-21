import { TimeTrackingActions } from "@/components/forms/TimeTrackingActions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TimeEntryWithRelations } from "@/types";
import { format } from "date-fns";
import { Clock, Filter, Plus, RotateCcw } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function TimeEntriesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return redirect("/login");
  }

  // Fetch time entries from the database
  const timeEntries = await prisma.timeEntry.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      project: {
        include: {
          client: true,
        },
      },
    },
    orderBy: {
      startTime: "desc",
    },
  });

  // Fetch current running time entry if any
  const runningTimeEntry = await prisma.timeEntry.findFirst({
    where: {
      userId: session.user.id,
      endTime: null,
    },
    include: {
      project: {
        include: {
          client: true,
        },
      },
    },
  });

  // Calculate the total hours for each time entry
  const timeEntriesWithDuration: TimeEntryWithRelations[] = timeEntries.map(entry => {
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
    } as TimeEntryWithRelations;
  });

  // Calculate total hours for all time entries
  const totalHoursTracked = timeEntriesWithDuration.reduce(
    (acc: number, entry: TimeEntryWithRelations) => {
      const startTime = new Date(entry.startTime);
      const endTime = entry.endTime ? new Date(entry.endTime) : new Date();
      const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      return acc + durationHours;
    },
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Time Entries</h1>
          <p className="text-muted-foreground mt-1">
            You&apos;ve tracked {totalHoursTracked.toFixed(1)} hours
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>

          <Link href="/dashboard/time/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Button>
          </Link>
        </div>
      </div>

      {runningTimeEntry && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 animate-pulse text-primary" />
              Currently Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-6 md:col-span-4">
                <div className="font-medium">
                  {runningTimeEntry.description || "No description"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Started at {format(new Date(runningTimeEntry.startTime), "h:mm a")}
                </div>
              </div>
              <div className="col-span-3 md:col-span-2">
                <div className="text-sm">{runningTimeEntry.project.name}</div>
                <div className="text-xs text-muted-foreground">
                  {runningTimeEntry.project.client.name}
                </div>
              </div>
              <div className="col-span-3 md:col-span-4 text-right">
                <TimeTrackingActions entryId={runningTimeEntry.id} isRunning={true} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Time Entries</CardTitle>
          <CardDescription>View and manage your tracked time</CardDescription>
        </CardHeader>
        <CardContent>
          {timeEntriesWithDuration.length === 0 ? (
            <div className="text-center py-6">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No time entries yet</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                Start tracking your time to see entries here
              </p>
              <Link href="/dashboard/time/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Time Entry
                </Button>
              </Link>
            </div>
          ) : (
            <div className="border rounded-md">
              <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/50 text-sm font-medium">
                <div className="col-span-5">Description</div>
                <div className="col-span-2">Project</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-1">Duration</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              <div className="divide-y">
                {timeEntriesWithDuration.map(entry => (
                  <div key={entry.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-muted/20">
                    <div className="col-span-5">
                      <div className="font-medium">{entry.description || "No description"}</div>
                      <div className="text-xs text-muted-foreground">
                        {entry.formattedStartTime} - {entry.formattedEndTime}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm">{entry.project.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {entry.project.client.name}
                      </div>
                    </div>
                    <div className="col-span-2 text-sm">{entry.formattedDate}</div>
                    <div className="col-span-1 text-sm">{entry.duration}</div>
                    <div className="col-span-2 flex justify-end gap-1">
                      {entry.endTime && !runningTimeEntry && (
                        <TimeTrackingActions entryId={entry.id} isRunning={false} />
                      )}
                      <Link href={`/dashboard/time/${entry.id}/edit`}>
                        <Button variant="ghost" size="sm" title="Edit this time entry">
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
