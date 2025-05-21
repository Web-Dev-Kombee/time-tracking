import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TimeEntryForm } from "@/components/forms/TimeEntryForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface EditTimeEntryPageProps {
 params: {
  id: string;
 };
}

export default async function EditTimeEntryPage({ params }: EditTimeEntryPageProps) {
 const session = await getServerSession(authOptions);

 if (!session?.user) {
  return redirect("/login");
 }

 // Fetch the time entry to edit
 const timeEntry = await prisma.timeEntry.findUnique({
  where: {
   id: params.id,
   userId: session.user.id,
  },
  include: {
   project: true,
  },
 });

 if (!timeEntry) {
  return notFound();
 }

 return (
  <div className="max-w-2xl mx-auto">
   <h1 className="text-2xl font-bold mb-6">Edit Time Entry</h1>

   <Card>
    <CardHeader>
     <CardTitle>Edit Time Entry</CardTitle>
     <CardDescription>Update details for your time entry</CardDescription>
    </CardHeader>
    <CardContent>
     <TimeEntryForm
      userId={session.user.id}
      timeEntryId={timeEntry.id}
      initialData={{
       description: timeEntry.description || "",
       projectId: timeEntry.projectId,
       date: new Date(timeEntry.startTime).toISOString().split("T")[0],
       startTime: new Date(timeEntry.startTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
       }),
       endTime: timeEntry.endTime
        ? new Date(timeEntry.endTime).toLocaleTimeString([], {
           hour: "2-digit",
           minute: "2-digit",
           hour12: false,
          })
        : "",
       billable: timeEntry.billable,
      }}
     />
    </CardContent>
   </Card>
  </div>
 );
}
