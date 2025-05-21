import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import {
  TimeEntryWithRelations,
  Client,
  ExpenseWithProject,
  InvoiceWithClient,
  ProjectWithClient,
} from "@/types";

// Define activity-specific interfaces
interface ActivityItem<T> {
  type: string;
  id: string;
  data: T;
  updatedAt: Date;
}

interface ActivityStats {
  activeProjects: number;
  totalClients: number;
  unpaidInvoices: number;
  hoursThisMonth: number;
}

interface ActivityResponse {
  activities: ActivityItem<unknown>[];
  stats: ActivityStats;
}

// Helper function to calculate hours tracked this month
async function calculateHoursThisMonth(userId: string): Promise<number> {
  // Get the first and last day of the current month
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

  // Query the time entries for this month
  const timeEntries = await prisma.timeEntry.findMany({
    where: {
      userId: userId,
      startTime: {
        gte: firstDayOfMonth,
        lte: lastDayOfMonth,
      },
      endTime: {
        not: null,
      },
    },
  });

  // Calculate the total hours
  let totalHours = 0;
  timeEntries.forEach(entry => {
    if (entry.endTime) {
      const durationMs = entry.endTime.getTime() - entry.startTime.getTime();
      totalHours += durationMs / (1000 * 60 * 60); // Convert ms to hours
    }
  });

  return parseFloat(totalHours.toFixed(2));
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Get recent time entries
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
        updatedAt: "desc",
      },
      take: limit,
    });

    // Format entries with required additional fields
    const formattedTimeEntries: TimeEntryWithRelations[] = timeEntries.map(entry => {
      // Calculate duration values
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
      };
    });

    // Get recent expenses
    const expenses = (await prisma.expense.findMany({
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
        updatedAt: "desc",
      },
      take: limit,
    })) as ExpenseWithProject[];

    // Get recent invoices
    const invoices = (await prisma.invoice.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        client: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: limit,
    })) as InvoiceWithClient[];

    // Get recent projects
    const projects = (await prisma.project.findMany({
      where: {
        createdById: session.user.id,
      },
      include: {
        client: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: limit,
    })) as ProjectWithClient[];

    // Get recent clients
    const clients = (await prisma.client.findMany({
      where: {
        createdById: session.user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: limit,
    })) as Client[];

    // Merge and sort all activities by updated date
    const allActivities: ActivityItem<unknown>[] = [
      ...formattedTimeEntries.map(entry => ({
        type: "time_entry",
        id: entry.id,
        data: entry,
        updatedAt: entry.updatedAt,
      })),
      ...expenses.map(expense => ({
        type: "expense",
        id: expense.id,
        data: expense,
        updatedAt: expense.updatedAt,
      })),
      ...invoices.map(invoice => ({
        type: "invoice",
        id: invoice.id,
        data: invoice,
        updatedAt: invoice.updatedAt,
      })),
      ...projects.map(project => ({
        type: "project",
        id: project.id,
        data: project,
        updatedAt: project.updatedAt,
      })),
      ...clients.map(client => ({
        type: "client",
        id: client.id,
        data: client,
        updatedAt: client.updatedAt,
      })),
    ]
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, limit);

    // Calculate summary statistics
    const stats: ActivityStats = {
      activeProjects: await prisma.project.count({
        where: {
          createdById: session.user.id,
          status: "ACTIVE",
        },
      }),
      totalClients: await prisma.client.count({
        where: {
          createdById: session.user.id,
        },
      }),
      unpaidInvoices: await prisma.invoice.count({
        where: {
          userId: session.user.id,
          status: {
            in: ["SENT", "OVERDUE"],
          },
        },
      }),
      hoursThisMonth: await calculateHoursThisMonth(session.user.id),
    };

    const response: ActivityResponse = {
      activities: allActivities,
      stats,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}
