import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ClientForm } from "@/components/forms/ClientForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function NewClientPage() {
  const session = await getServerSession();

  if (!session?.user) {
    return redirect("/login");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add New Client</h1>

      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
          <CardDescription>
            Add a new client to start tracking projects and time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientForm />
        </CardContent>
      </Card>
    </div>
  );
}
