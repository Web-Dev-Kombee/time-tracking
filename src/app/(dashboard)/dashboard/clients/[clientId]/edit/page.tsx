import { ClientForm } from "@/components/forms/ClientForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { EditClientPageProps } from "@/types";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

export default async function EditClientPage({ params }: EditClientPageProps) {
  const session = await getServerSession();

  if (!session?.user) {
    return redirect("/login");
  }

  const client = await prisma.client.findUnique({
    where: {
      id: params.clientId,
    },
  });

  if (!client) {
    return notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Client</h1>

      <Card>
        <CardHeader>
          <CardTitle>Edit {client.name}</CardTitle>
          <CardDescription>Update client information and contact details.</CardDescription>
        </CardHeader>
        <CardContent>
          <ClientForm client={client} />
        </CardContent>
      </Card>
    </div>
  );
}
