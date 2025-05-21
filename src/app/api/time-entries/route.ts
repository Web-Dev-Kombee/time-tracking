import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TimeEntryWithRelations } from "@/types";
import { TimeEntrySchemaAPI } from "@/types/schemas";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

// GET all time entries for the user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const clientId = searchParams.get("clientId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const billable = searchParams.get("billable");
    const quickFilter = searchParams.get("quickFilter");

    // Build filter conditions
    const where: Prisma.TimeEntryWhereInput = {
      userId: session.user.id,
    };

    // Handle project filtering
    if (projectId) {
      where.projectId = projectId;
    }

    // Handle client filtering (requires join)
    if (clientId) {
      where.project = {
        clientId: clientId,
      };
    }

    // Handle date range filtering
    if (startDate || endDate || quickFilter) {
      where.startTime = {};

      // Handle quick filters
      if (quickFilter) {
        const now = new Date();

        switch (quickFilter) {
          case "today":
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            where.startTime.gte = today;
            break;
          case "yesterday":
            const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
            const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            where.startTime.gte = yesterday;
            where.startTime.lt = endOfYesterday;
            break;
          case "thisWeek":
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
            startOfWeek.setHours(0, 0, 0, 0);
            where.startTime.gte = startOfWeek;
            break;
          case "lastWeek":
            const startOfLastWeek = new Date(now);
            startOfLastWeek.setDate(now.getDate() - now.getDay() - 7);
            startOfLastWeek.setHours(0, 0, 0, 0);

            const endOfLastWeek = new Date(now);
            endOfLastWeek.setDate(now.getDate() - now.getDay());
            endOfLastWeek.setHours(0, 0, 0, 0);

            where.startTime.gte = startOfLastWeek;
            where.startTime.lt = endOfLastWeek;
            break;
          case "thisMonth":
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            where.startTime.gte = startOfMonth;
            break;
          case "lastMonth":
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
            where.startTime.gte = startOfLastMonth;
            where.startTime.lte = endOfLastMonth;
            break;
        }
      } else {
        // Use explicit date parameters if provided
        if (startDate) {
          where.startTime.gte = new Date(startDate);
        }

        if (endDate) {
          const endDateObj = new Date(endDate);
          endDateObj.setHours(23, 59, 59, 999); // End of day
          where.startTime.lte = endDateObj;
        }
      }
    }

    // Handle billable status filtering
    if (billable !== null && billable !== undefined) {
      where.billable = billable === "true";
    }

    // First get the raw time entries from the database
    const rawTimeEntries = await prisma.timeEntry.findMany({
      where,
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

    // Format entries with required additional fields
    const timeEntries: TimeEntryWithRelations[] = rawTimeEntries.map(entry => {
      let duration = "";
      const formattedDate = new Date(entry.startTime).toLocaleDateString();
      const formattedStartTime = new Date(entry.startTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const formattedEndTime = entry.endTime
        ? new Date(entry.endTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Running";

      // Calculate duration if entry is completed
      if (entry.endTime) {
        const durationMs = new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime();
        const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
        const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

        duration = `${durationHours}h ${durationMinutes}m`;
      }

      return {
        ...entry,
        duration,
        formattedDate,
        formattedStartTime,
        formattedEndTime,
      } as TimeEntryWithRelations;
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

    const validatedData = TimeEntrySchemaAPI.parse(json);

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
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid time entry data", details: error.format() },
        { status: 400 }
      );
    }

    console.error("Error creating time entry:", error);
    return NextResponse.json({ error: "Failed to create time entry" }, { status: 500 });
  }
}

// PUT to update an existing time entry
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing time entry ID" }, { status: 400 });
    }

    // Check if time entry exists and belongs to the user
    const existingEntry = await prisma.timeEntry.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: "Time entry not found or you don't have permission to edit it" },
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

    // Make sure userId can't be changed
    delete json.userId;

    // Validate the data
    const UpdateTimeEntrySchema = TimeEntrySchemaAPI.partial().omit({ userId: true });
    const validatedData = UpdateTimeEntrySchema.parse(json);

    // If projectId is being changed, verify the project exists and belongs to the user
    if (validatedData.projectId && validatedData.projectId !== existingEntry.projectId) {
      const project = await prisma.project.findUnique({
        where: {
          id: validatedData.projectId,
          createdById: session.user.id,
        },
      });

      if (!project) {
        return NextResponse.json({ error: "Project not found or not authorized" }, { status: 404 });
      }
    }

    const updatedTimeEntry = await prisma.timeEntry.update({
      where: {
        id,
      },
      data: {
        description: validatedData.description,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        billable: validatedData.billable,
        ...(validatedData.projectId && {
          project: {
            connect: {
              id: validatedData.projectId,
            },
          },
        }),
      },
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
    });

    // Calculate formatted fields for response
    let duration = "";
    if (updatedTimeEntry.endTime) {
      const durationMs =
        new Date(updatedTimeEntry.endTime).getTime() -
        new Date(updatedTimeEntry.startTime).getTime();
      const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
      const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      duration = `${durationHours}h ${durationMinutes}m`;
    }

    const formattedEntry = {
      ...updatedTimeEntry,
      duration,
      formattedDate: new Date(updatedTimeEntry.startTime).toLocaleDateString(),
      formattedStartTime: new Date(updatedTimeEntry.startTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      formattedEndTime: updatedTimeEntry.endTime
        ? new Date(updatedTimeEntry.endTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Running",
    };

    return NextResponse.json(formattedEntry);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid time entry data", details: error.format() },
        { status: 400 }
      );
    }

    console.error("Error updating time entry:", error);
    return NextResponse.json({ error: "Failed to update time entry" }, { status: 500 });
  }
}

// DELETE to remove a time entry
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing time entry ID" }, { status: 400 });
    }

    // Check if time entry exists and belongs to the user
    const existingEntry = await prisma.timeEntry.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: "Time entry not found or you don't have permission to delete it" },
        { status: 404 }
      );
    }

    // Check if the time entry is already associated with an invoice
    if (existingEntry.invoiceId) {
      return NextResponse.json(
        {
          error:
            "This time entry is already included in an invoice and cannot be deleted. You can remove it from the invoice first if needed.",
        },
        { status: 403 }
      );
    }

    // Delete the time entry
    await prisma.timeEntry.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ message: "Time entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting time entry:", error);
    return NextResponse.json({ error: "Failed to delete time entry" }, { status: 500 });
  }
}
