import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// Define types for our data structures
interface TimeEntry {
  id: string;
  startTime: Date;
  endTime: Date | null;
  project: {
    hourlyRate: number;
  };
}

interface Expense {
  id: string;
  amount: number;
  billable: boolean;
}

interface Payment {
  id: string;
  amount: number;
}

interface Invoice {
  id: string;
  total: number;
  payments: Payment[];
}

interface Project {
  id: string;
  name: string;
  timeEntries: TimeEntry[];
  expenses: Expense[];
  hourlyRate: number;
}

interface ClientWithRelations {
  id: string;
  name: string;
  projects: Project[];
  invoices: Invoice[];
}

interface ClientStats {
  id: string;
  name: string;
  billableAmount: number;
  expenses: number;
  invoicedAmount: number;
  paidAmount: number;
  outstandingAmount: number;
}

interface RevenueReport {
  startDate: string;
  endDate: string;
  billableAmount: number;
  billableExpenses: number;
  invoicedTotal: number;
  paidTotal: number;
  outstandingTotal: number;
  clientStats: ClientStats[];
}

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
    const clientIdParam = searchParams.get("clientId");

    // Default to current month if no dates provided
    const today = new Date();
    const defaultStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const defaultEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Parse dates
    const startDate = startDateParam ? new Date(startDateParam) : defaultStartDate;
    const endDate = endDateParam ? new Date(endDateParam) : defaultEndDate;

    // Format for display
    const formattedStartDate = startDate.toISOString().split("T")[0];
    const formattedEndDate = endDate.toISOString().split("T")[0];

    // Build base query - filter by user
    const userFilter = {
      userId: session.user.id,
    };

    // Add date range filter
    const dateRangeFilter = {
      gte: startDate,
      lte: endDate,
    };

    // Query for time entries within date range
    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        ...userFilter,
        billable: true,
        startTime: dateRangeFilter,
        endTime: {
          not: null,
        },
        ...(clientIdParam && {
          project: {
            clientId: clientIdParam,
          },
        }),
      },
      include: {
        project: {
          select: {
            hourlyRate: true,
          },
        },
      },
    });

    // Calculate billable amount from time entries
    let billableAmount = 0;
    timeEntries.forEach((entry: TimeEntry) => {
      if (entry.endTime) {
        const durationMs = new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime();
        const durationHours = durationMs / (1000 * 60 * 60);
        billableAmount += durationHours * entry.project.hourlyRate;
      }
    });

    // Query for expenses within date range
    const expenses = await prisma.expense.findMany({
      where: {
        ...userFilter,
        billable: true,
        date: dateRangeFilter,
        ...(clientIdParam && {
          project: {
            clientId: clientIdParam,
          },
        }),
      },
    });

    // Calculate billable expenses
    const billableExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);

    // Query for invoices within date range
    const invoices = await prisma.invoice.findMany({
      where: {
        ...userFilter,
        issueDate: dateRangeFilter,
        ...(clientIdParam && { clientId: clientIdParam }),
      },
      include: {
        payments: true,
      },
    });

    // Calculate invoice totals
    const invoicedTotal = invoices.reduce((total, invoice) => total + invoice.total, 0);

    // Calculate paid amount
    const paidTotal = invoices.reduce(
      (total, invoice) =>
        total + invoice.payments.reduce((sum, payment) => sum + payment.amount, 0),
      0
    );

    // Calculate outstanding amount
    const outstandingTotal = invoicedTotal - paidTotal;

    // Get client statistics
    const clientData = (await prisma.client.findMany({
      where: {
        createdById: session.user.id,
        ...(clientIdParam && { id: clientIdParam }),
      },
      include: {
        projects: {
          include: {
            timeEntries: {
              where: {
                billable: true,
                startTime: dateRangeFilter,
                endTime: {
                  not: null,
                },
              },
              include: {
                project: {
                  select: {
                    hourlyRate: true,
                  },
                },
              },
            },
            expenses: {
              where: {
                billable: true,
                date: dateRangeFilter,
              },
            },
          },
        },
        invoices: {
          where: {
            issueDate: dateRangeFilter,
          },
          include: {
            payments: true,
          },
        },
      },
    })) as ClientWithRelations[];

    // Transform client data
    const clientStats: ClientStats[] = clientData.map((client: ClientWithRelations) => {
      // Calculate billable time
      const billableTime = client.projects.reduce((clientTotal: number, project: Project) => {
        return (
          clientTotal +
          project.timeEntries.reduce((projectTotal: number, entry: TimeEntry) => {
            if (!entry.endTime) return projectTotal;

            const startTime = new Date(entry.startTime);
            const endTime = new Date(entry.endTime);
            const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

            return projectTotal + durationHours * project.hourlyRate;
          }, 0)
        );
      }, 0);

      // Calculate billable expenses
      const clientExpenses = client.projects.reduce((clientTotal: number, project: Project) => {
        return (
          clientTotal +
          project.expenses.reduce((expenseTotal: number, expense: Expense) => {
            return expenseTotal + expense.amount;
          }, 0)
        );
      }, 0);

      // Calculate invoiced amount
      const invoicedAmount = client.invoices.reduce((total: number, invoice: Invoice) => {
        return total + invoice.total;
      }, 0);

      // Calculate paid amount
      const paidAmount = client.invoices.reduce((total: number, invoice: Invoice) => {
        return (
          total +
          invoice.payments.reduce((sum: number, payment: Payment) => {
            return sum + payment.amount;
          }, 0)
        );
      }, 0);

      return {
        id: client.id,
        name: client.name,
        billableAmount: billableTime,
        expenses: clientExpenses,
        invoicedAmount,
        paidAmount,
        outstandingAmount: invoicedAmount - paidAmount,
      };
    });

    // Summary data
    const summary: RevenueReport = {
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      billableAmount,
      billableExpenses,
      invoicedTotal,
      paidTotal,
      outstandingTotal,
      clientStats,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error generating revenue report:", error);
    return NextResponse.json({ error: "Failed to generate revenue report" }, { status: 500 });
  }
}
