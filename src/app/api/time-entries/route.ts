import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { authOptions } from "@/lib/auth";

// Schema for validating time entry data
const TimeEntrySchema = z.object({
 description: z.string().optional(),
 projectId: z.string(),
 startTime: z.date(),
 endTime: z.date().optional().nullable(),
 billable: z.boolean().default(true),
 userId: z.string(),
});

// GET all time entries for the user
export async function GET() {
 try {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  return NextResponse.json(timeEntries);
 } catch (error) {
  console.error("Error fetching time entries:", error);
  return NextResponse.json({ error: "Failed to fetch time entries" }, { status: 500 });
 }
}

// POST to create a new time entry
export async function POST(request: Request) {
 try {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();

  // Convert string dates to Date objects if they're not already
  if (typeof json.startTime === "string") {
   json.startTime = new Date(json.startTime);
  }

  if (json.endTime && typeof json.endTime === "string") {
   json.endTime = new Date(json.endTime);
  }

  const validatedData = TimeEntrySchema.parse(json);

  // Ensure the time entry belongs to the authenticated user
  if (validatedData.userId !== session.user.id) {
   return NextResponse.json(
    { error: "You can only create time entries for yourself" },
    { status: 403 }
   );
  }

  // Verify the project exists and belongs to the user
  const project = await prisma.project.findUnique({
   where: {
    id: validatedData.projectId,
    createdById: session.user.id,
   },
  });

  if (!project) {
   return NextResponse.json({ error: "Project not found or not authorized" }, { status: 404 });
  }

  const timeEntry = await prisma.timeEntry.create({
   data: {
    description: validatedData.description,
    startTime: validatedData.startTime,
    endTime: validatedData.endTime,
    billable: validatedData.billable,
    project: {
     connect: {
      id: validatedData.projectId,
     },
    },
    user: {
     connect: {
      id: validatedData.userId,
     },
    },
   },
   include: {
    project: {
     include: {
      client: true,
     },
    },
   },
  });

  return NextResponse.json(timeEntry, { status: 201 });
 } catch (error: any) {
  if (error.name === "ZodError") {
   return NextResponse.json(
    { error: "Invalid time entry data", details: error.errors },
    { status: 400 }
   );
  }

  console.error("Error creating time entry:", error);
  return NextResponse.json({ error: "Failed to create time entry" }, { status: 500 });
 }
}
