import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

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

    // Get recent expenses
    const expenses = await prisma.expense.findMany({
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

    // Get recent invoices
    const invoices = await prisma.invoice.findMany({
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
    });

    // Get recent projects
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
      take: limit,
    });

    // Get recent clients
    const clients = await prisma.client.findMany({
      where: {
        createdById: session.user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: limit,
    });

    // Merge and sort all activities by updated date
    const allActivities = [
      ...timeEntries.map((entry) => ({
        type: "time_entry",
        id: entry.id,
        data: entry,
        updatedAt: entry.updatedAt,
      })),
      ...expenses.map((expense) => ({
        type: "expense",
        id: expense.id,
        data: expense,
        updatedAt: expense.updatedAt,
      })),
      ...invoices.map((invoice) => ({
        type: "invoice",
        id: invoice.id,
        data: invoice,
        updatedAt: invoice.updatedAt,
      })),
      ...projects.map((project) => ({
        type: "project",
        id: project.id,
        data: project,
        updatedAt: project.updatedAt,
      })),
      ...clients.map((client) => ({
        type: "client",
        id: client.id,
        data: client,
        updatedAt: client.updatedAt,
      })),
    ]
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, limit);

    // Calculate summary statistics
    const stats = {
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

    return NextResponse.json({
      activities: allActivities,
      stats,
    });
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}

// Helper function to calculate hours tracked this month
async function calculateHoursThisMonth(userId: string) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const timeEntries = await prisma.timeEntry.findMany({
    where: {
      userId,
      startTime: {
        gte: startOfMonth,
      },
      endTime: {
        not: null,
      },
    },
  });

  const totalHours = timeEntries.reduce((total, entry) => {
    if (!entry.endTime) return total;

    const startTime = new Date(entry.startTime);
    const endTime = new Date(entry.endTime);
    const durationHours =
      (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

    return total + durationHours;
  }, 0);

  return totalHours;
}
