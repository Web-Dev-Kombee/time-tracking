import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const json = await request.json();
    const { sourceTimeEntryId } = json;

    if (!sourceTimeEntryId) {
      return NextResponse.json({ error: "Source time entry ID is required" }, { status: 400 });
    }

    // Check if the source time entry exists and belongs to the user
    const sourceTimeEntry = await prisma.timeEntry.findUnique({
      where: {
        id: sourceTimeEntryId,
        userId: session.user.id,
      },
      include: {
        project: true,
      },
    });

    if (!sourceTimeEntry) {
      return NextResponse.json(
        { error: "Source time entry not found or you don't have permission to access it" },
        { status: 404 }
      );
    }

    // Check if user already has a running time entry
    const runningTimeEntry = await prisma.timeEntry.findFirst({
      where: {
        userId: session.user.id,
        endTime: null,
      },
    });

    if (runningTimeEntry) {
      return NextResponse.json(
        {
          error: "You already have a running time entry. Please stop it before starting a new one.",
          runningTimeEntryId: runningTimeEntry.id,
        },
        { status: 409 }
      );
    }

    // Create a new time entry using the source entry's details
    const newTimeEntry = await prisma.timeEntry.create({
      data: {
        description: sourceTimeEntry.description,
        startTime: new Date(), // Start now
        endTime: null, // Running entry
        billable: sourceTimeEntry.billable,
        projectId: sourceTimeEntry.projectId,
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

    // Format for response
    const formattedStartTime = new Date(newTimeEntry.startTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const response = {
      ...newTimeEntry,
      duration: "",
      formattedDate: new Date(newTimeEntry.startTime).toLocaleDateString(),
      formattedStartTime,
      formattedEndTime: "Running",
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error resuming time entry:", error);
    return NextResponse.json({ error: "Failed to resume time entry" }, { status: 500 });
  }
}
