import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { ProjectForm } from "@/components/forms/ProjectForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function NewProjectPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return redirect("/login");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Project</h1>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>
            Add a new project to start tracking time and managing tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm userId={session.user.id} />
        </CardContent>
      </Card>
    </div>
  );
}
