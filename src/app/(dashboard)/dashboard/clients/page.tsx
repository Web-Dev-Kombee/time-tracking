import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { PlusCircle, UserPlus, Building2, Mail, Phone } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ClientsPage() {
  const session = await getServerSession();

  if (!session?.user) {
    return redirect("/login");
  }

  const clients = await prisma.client.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      projects: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Link href="/dashboard/clients/new">
          <Button className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add Client
          </Button>
        </Link>
      </div>

      {clients.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No clients yet</CardTitle>
            <CardDescription>
              Add your first client to start tracking projects and time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/clients/new">
              <Button className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Add Your First Client
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Clients</CardTitle>
            <CardDescription>
              Manage your clients and view their projects.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span>{client.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {client.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span>{client.email}</span>
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {client.projects.length} projects
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/clients/${client.id}`}>
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </Link>
                        <Link href={`/dashboard/clients/${client.id}/edit`}>
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
