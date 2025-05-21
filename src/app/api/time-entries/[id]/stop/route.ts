import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { TimeEntryWithRelations } from "@/types";

// POST to stop a running time entry
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the time entry exists, belongs to user, and is running (no end time)
    const timeEntry = await prisma.timeEntry.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
        endTime: null, // Only running time entries can be stopped
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
        {
          error:
            "Time entry not found, already completed, or you don't have permission to modify it",
        },
        { status: 404 }
      );
    }

    // Set the end time to now
    const updatedTimeEntry = await prisma.timeEntry.update({
      where: {
        id: params.id,
      },
      data: {
        endTime: new Date(),
      },
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
    });

    // Calculate duration and format fields for response
    const startTime = new Date(updatedTimeEntry.startTime);
    const endTime = new Date(updatedTimeEntry.endTime!);
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
    const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const duration = `${durationHours}h ${durationMinutes}m`;

    const formattedEntry = {
      ...updatedTimeEntry,
      duration,
      formattedDate: startTime.toLocaleDateString(),
      formattedStartTime: startTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      formattedEndTime: endTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    } as TimeEntryWithRelations;

    return NextResponse.json(formattedEntry);
  } catch (error) {
    console.error("Error stopping time entry:", error);
    return NextResponse.json({ error: "Failed to stop time entry" }, { status: 500 });
  }
}
