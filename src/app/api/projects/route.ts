import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

// Schema for validating project data
const ProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  clientId: z.string(),
  status: z.enum(["ACTIVE", "COMPLETED", "ARCHIVED"]).default("ACTIVE"),
  hourlyRate: z.number().min(0, "Hourly rate cannot be negative"),
  createdById: z.string(),
});

// GET all projects for the user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      where: {
        createdById: session.user.id,
      },
      include: {
        client: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

// POST to create a new project
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const validatedData = ProjectSchema.parse(json);

    // Ensure the project belongs to the authenticated user
    if (validatedData.createdById !== session.user.id) {
      return NextResponse.json(
        { error: "You can only create projects for yourself" },
        { status: 403 }
      );
    }

    // Verify the client exists and belongs to the user
    const client = await prisma.client.findUnique({
      where: {
        id: validatedData.clientId,
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const project = await prisma.project.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        status: validatedData.status,
        hourlyRate: validatedData.hourlyRate,
        client: {
          connect: {
            id: validatedData.clientId,
          },
        },
        createdBy: {
          connect: {
            id: validatedData.createdById,
          },
        },
      },
      include: {
        client: true,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid project data", details: error.format() },
        { status: 400 }
      );
    }

    console.error("Error creating project:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
