import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReportGroup, TimeReport } from "@/types";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// Define report item details type

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const groupBy = searchParams.get("groupBy") || "project"; // Default to project
    const includeDetails = searchParams.get("includeDetails") === "true";
    const projectId = searchParams.get("projectId");
    const clientId = searchParams.get("clientId");

    // Default to current month if no dates provided
    const today = new Date();
    const defaultStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const defaultEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    // Parse dates
    const startDate = startDateParam ? new Date(startDateParam) : defaultStartDate;
    const endDate = endDateParam ? new Date(endDateParam) : defaultEndDate;

    // Base query filters
    const whereClause: Prisma.TimeEntryWhereInput = {
      userId: session.user.id,
      startTime: {
        gte: startDate,
        lte: endDate,
      },
      endTime: {
        not: null, // Only count completed time entries
      },
    };

    // Add project filter if specified
    if (projectId) {
      whereClause.projectId = projectId;
    }

    // Add client filter if specified
    if (clientId) {
      whereClause.project = {
        clientId: clientId,
      };
    }

    // Fetch all time entries matching the criteria
    const timeEntries = await prisma.timeEntry.findMany({
      where: whereClause,
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

    // Calculate totals
    let totalHours = 0;
    let billableHours = 0;
    let nonBillableHours = 0;

    // Process entries to calculate durations
    const processedEntries = timeEntries.map(entry => {
      const startTime = new Date(entry.startTime);
      const endTime = new Date(entry.endTime!);
      const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

      totalHours += durationHours;
      if (entry.billable) {
        billableHours += durationHours;
      } else {
        nonBillableHours += durationHours;
      }

      return {
        ...entry,
        durationHours,
      };
    });

    // Group entries based on the groupBy parameter
    const groupedData: Record<string, ReportGroup> = {};

    processedEntries.forEach(entry => {
      let groupId: string;
      let groupName: string;

      switch (groupBy) {
        case "client":
          groupId = entry.project.client.id;
          groupName = entry.project.client.name;
          break;
        case "project":
          groupId = entry.project.id;
          groupName = entry.project.name;
          break;
        case "date":
          const dateString = new Date(entry.startTime).toISOString().split("T")[0];
          groupId = dateString;
          groupName = new Date(dateString).toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          break;
        case "month":
          const date = new Date(entry.startTime);
          groupId = `${date.getFullYear()}-${date.getMonth() + 1}`;
          groupName = date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
          });
          break;
        default:
          groupId = entry.project.id;
          groupName = entry.project.name;
      }

      if (!groupedData[groupId]) {
        groupedData[groupId] = {
          id: groupId,
          name: groupName,
          totalTime: 0,
          billableTime: 0,
          nonBillableTime: 0,
          billablePercentage: 0,
          items: includeDetails ? [] : undefined,
        };
      }

      groupedData[groupId].totalTime += entry.durationHours;

      if (entry.billable) {
        groupedData[groupId].billableTime += entry.durationHours;
      } else {
        groupedData[groupId].nonBillableTime += entry.durationHours;
      }

      // Add the entry to items if details are requested
      if (includeDetails && groupedData[groupId].items) {
        groupedData[groupId].items?.push({
          id: entry.id,
          description: entry.description || "No description",
          projectName: entry.project.name,
          clientName: entry.project.client.name,
          startTime: entry.startTime,
          endTime: entry.endTime,
          duration: entry.durationHours,
          billable: entry.billable,
        });
      }
    });

    // Calculate percentages and format hours
    Object.values(groupedData).forEach(group => {
      group.billablePercentage =
        group.totalTime > 0 ? Math.round((group.billableTime / group.totalTime) * 100) : 0;

      // Round hours to 2 decimal places
      group.totalTime = parseFloat(group.totalTime.toFixed(2));
      group.billableTime = parseFloat(group.billableTime.toFixed(2));
      group.nonBillableTime = parseFloat(group.nonBillableTime.toFixed(2));
    });

    // Convert to array and sort by total time (descending)
    const groupedArray = Object.values(groupedData).sort((a, b) => b.totalTime - a.totalTime);

    // Prepare the final report
    const billablePercentage = totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0;

    const report: TimeReport = {
      totalHours: parseFloat(totalHours.toFixed(2)),
      billableHours: parseFloat(billableHours.toFixed(2)),
      nonBillableHours: parseFloat(nonBillableHours.toFixed(2)),
      billablePercentage,
      data: groupedArray,
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error generating time report:", error);
    return NextResponse.json({ error: "Failed to generate time report" }, { status: 500 });
  }
}
