import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TimeEntryWithRelations } from "@/types";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET the currently running time entry for the authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the running time entry (one without an end time)
    const runningTimeEntry = await prisma.timeEntry.findFirst({
      where: {
        userId: session.user.id,
        endTime: null,
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

    if (!runningTimeEntry) {
      return NextResponse.json({ message: "No running time entry found" }, { status: 404 });
    }

    // Calculate elapsed time
    const startTime = new Date(runningTimeEntry.startTime);
    const now = new Date();
    const elapsedMs = now.getTime() - startTime.getTime();
    const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));
    const elapsedMinutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
    const elapsedSeconds = Math.floor((elapsedMs % (1000 * 60)) / 1000);

    // Format for response
    const formattedEntry = {
      ...runningTimeEntry,
      elapsedTime: {
        hours: elapsedHours,
        minutes: elapsedMinutes,
        seconds: elapsedSeconds,
        formatted: `${elapsedHours.toString().padStart(2, "0")}:${elapsedMinutes.toString().padStart(2, "0")}:${elapsedSeconds.toString().padStart(2, "0")}`,
      },
      formattedDate: startTime.toLocaleDateString(),
      formattedStartTime: startTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      formattedEndTime: "Running",
      duration: "",
    } as TimeEntryWithRelations;

    return NextResponse.json(formattedEntry);
  } catch (error) {
    console.error("Error fetching current time entry:", error);
    return NextResponse.json({ error: "Failed to fetch current time entry" }, { status: 500 });
  }
}
