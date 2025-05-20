import ClientDeleteButton from "@/components/clients/ClientDeleteButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  Building2,
  ClipboardList,
  FolderKanban,
  Mail,
  MapPin,
  Pencil,
  Phone,
  PlusCircle,
} from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface ClientPageProps {
  params: {
    clientId: string;
  };
}

export default async function ClientPage({ params }: ClientPageProps) {
  const session = await getServerSession();

  if (!session?.user) {
    return redirect("/login");
  }

  const client = await prisma.client.findUnique({
    where: {
      id: params.clientId,
    },
    include: {
      projects: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!client) {
    return notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/clients">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{client.name}</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/clients/${client.id}/edit`}>
            <Button variant="outline" className="flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <ClientDeleteButton clientId={client.id} clientName={client.name} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Client details card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Client Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {client.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-gray-500">{client.email}</p>
                </div>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-gray-500">{client.phone}</p>
                </div>
              </div>
            )}
            {client.address && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-gray-500">{client.address}</p>
                </div>
              </div>
            )}
            {client.notes && (
              <div className="flex items-start gap-3">
                <ClipboardList className="h-4 w-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium">Notes</p>
                  <p className="text-sm text-gray-500 whitespace-pre-line">
                    {client.notes}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Projects card */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5" />
                Projects
              </CardTitle>
              <CardDescription>
                Projects for {client.name} ({client.projects.length})
              </CardDescription>
            </div>
            <Link href={`/dashboard/projects/new?clientId=${client.id}`}>
              <Button size="sm" className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Add Project
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {client.projects.length === 0 ? (
              <div className="text-center py-6">
                <FolderKanban className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium">No projects yet</h3>
                <p className="text-sm text-gray-500 mt-1 mb-4">
                  Create a project to start tracking time for this client.
                </p>
                <Link href={`/dashboard/projects/new?clientId=${client.id}`}>
                  <Button>Add First Project</Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Hourly Rate</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {client.projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">
                        {project.name}
                      </TableCell>
                      <TableCell>
                        <div
                          className={`text-xs px-2 py-1 rounded-full inline-flex items-center font-medium ${getStatusClasses(
                            project.status
                          )}`}
                        >
                          {project.status}
                        </div>
                      </TableCell>
                      <TableCell>${project.hourlyRate}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/projects/${project.id}`}>
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getStatusClasses(status: string): string {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-700";
    case "COMPLETED":
      return "bg-blue-100 text-blue-700";
    case "ARCHIVED":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}
