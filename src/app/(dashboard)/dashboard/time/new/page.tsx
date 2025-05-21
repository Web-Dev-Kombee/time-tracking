import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { TimeEntryForm } from "@/components/forms/TimeEntryForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewTimeEntryPage() {
 const session = await getServerSession(authOptions);

 if (!session?.user) {
  return redirect("/login");
 }

 return (
  <div className="max-w-2xl mx-auto">
   <h1 className="text-2xl font-bold mb-6">Add Time Entry</h1>

   <Card>
    <CardHeader>
     <CardTitle>Track Your Time</CardTitle>
     <CardDescription>Create a new time entry for work completed on a project</CardDescription>
    </CardHeader>
    <CardContent>
     <TimeEntryForm userId={session.user.id} />
    </CardContent>
   </Card>
  </div>
 );
}
