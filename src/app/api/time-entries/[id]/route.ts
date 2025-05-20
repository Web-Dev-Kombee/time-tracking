import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { authOptions } from "@/lib/auth";

// Schema for validating time entry update data
const TimeEntryUpdateSchema = z.object({
  description: z.string().optional(),
  projectId: z.string(),
  startTime: z.date(),
  endTime: z.date().optional().nullable(),
  billable: z.boolean().default(true),
  userId: z.string(),
});

// GET a specific time entry
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const timeEntry = await prisma.timeEntry.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
    });

    if (!timeEntry) {
      return NextResponse.json(
        { error: "Time entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(timeEntry);
  } catch (error) {
    console.error("Error fetching time entry:", error);
    return NextResponse.json(
      { error: "Failed to fetch time entry" },
      { status: 500 }
    );
  }
}

// PUT to update a time entry
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the time entry exists and belongs to the user
    const existingTimeEntry = await prisma.timeEntry.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingTimeEntry) {
      return NextResponse.json(
        { error: "Time entry not found or not authorized" },
        { status: 404 }
      );
    }

    const json = await request.json();

    // Convert string dates to Date objects if they're not already
    if (typeof json.startTime === "string") {
      json.startTime = new Date(json.startTime);
    }

    if (json.endTime && typeof json.endTime === "string") {
      json.endTime = new Date(json.endTime);
    }

    const validatedData = TimeEntryUpdateSchema.parse(json);

    // Ensure the time entry belongs to the authenticated user
    if (validatedData.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only update your own time entries" },
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
      return NextResponse.json(
        { error: "Project not found or not authorized" },
        { status: 404 }
      );
    }

    const updatedTimeEntry = await prisma.timeEntry.update({
      where: {
        id: params.id,
      },
      data: {
        description: validatedData.description,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        billable: validatedData.billable,
        projectId: validatedData.projectId,
      },
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
    });

    return NextResponse.json(updatedTimeEntry);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid time entry data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating time entry:", error);
    return NextResponse.json(
      { error: "Failed to update time entry" },
      { status: 500 }
    );
  }
}

// DELETE a time entry
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the time entry exists and belongs to the user
    const timeEntry = await prisma.timeEntry.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!timeEntry) {
      return NextResponse.json(
        { error: "Time entry not found or not authorized" },
        { status: 404 }
      );
    }

    // Delete the time entry
    await prisma.timeEntry.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: "Time entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting time entry:", error);
    return NextResponse.json(
      { error: "Failed to delete time entry" },
      { status: 500 }
    );
  }
}
