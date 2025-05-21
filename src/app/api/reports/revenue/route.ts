import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ClientStats,
  RevenueClientWithRelations as ClientWithRelations,
  RevenueExpense as Expense,
  RevenueInvoice as Invoice,
  RevenuePayment as Payment,
  RevenueProject as Project,
  RevenueReport,
  RevenueTimeEntry as TimeEntry,
} from "@/types";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

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
    })) as unknown as ClientWithRelations[];

    // Transform client data
    const clientStats: ClientStats[] = clientData.map((client: ClientWithRelations) => {
      // Calculate billable time
      const billableTime = client.projects.reduce((clientTotal: number, project: Project) => {
        const projectTotal = project.timeEntries.reduce((total: number, entry) => {
          if (!entry.endTime) return total;

          const startTime = new Date(entry.startTime);
          const endTime = new Date(entry.endTime);
          const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

          return total + durationHours * entry.project.hourlyRate;
        }, 0);

        return clientTotal + Number(projectTotal);
      }, 0);

      // Calculate billable expenses
      const clientExpenses = client.projects.reduce((clientTotal: number, project: Project) => {
        const expenseTotal = project.expenses.reduce((total: number, expense: Expense) => {
          return total + expense.amount;
        }, 0);

        return clientTotal + Number(expenseTotal);
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
