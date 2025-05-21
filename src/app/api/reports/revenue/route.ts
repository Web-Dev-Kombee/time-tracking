import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters for time range
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate') as string)
      : new Date(new Date().getFullYear(), 0, 1); // Default to start of current year

    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate') as string)
      : new Date(); // Default to today

    // Get client ID if filtering by client
    const clientId = searchParams.get('clientId');

    // Build base filters
    const baseFilter = {
      userId: session.user.id,
      ...(clientId ? { clientId } : {}),
    };

    // Get all time entries within date range
    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        userId: session.user.id,
        billable: true,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
        ...(clientId ? { project: { clientId } } : {}),
      },
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
    });

    // Calculate billable amount from time entries
    const billableAmount = timeEntries.reduce((total, entry) => {
      if (!entry.endTime) return total;

      const startTime = new Date(entry.startTime);
      const endTime = new Date(entry.endTime);
      const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

      return total + durationHours * entry.project.hourlyRate;
    }, 0);

    // Get all expenses within date range
    const expenses = await prisma.expense.findMany({
      where: {
        userId: session.user.id,
        billable: true,
        date: {
          gte: startDate,
          lte: endDate,
        },
        ...(clientId ? { project: { clientId } } : {}),
      },
    });

    // Calculate billable expenses
    const billableExpenses = expenses.reduce((total, expense) => {
      return total + expense.amount;
    }, 0);

    // Get invoices within date range
    const invoices = await prisma.invoice.findMany({
      where: {
        userId: session.user.id,
        issueDate: {
          gte: startDate,
          lte: endDate,
        },
        ...(clientId ? { clientId } : {}),
      },
      include: {
        payments: true,
      },
    });

    // Calculate invoice totals
    const invoicedTotal = invoices.reduce((total, invoice) => {
      return total + invoice.total;
    }, 0);

    // Calculate paid amounts
    const paidTotal = invoices.reduce((total, invoice) => {
      const paidAmount = invoice.payments.reduce((sum, payment) => {
        return sum + payment.amount;
      }, 0);

      return total + paidAmount;
    }, 0);

    // Calculate outstanding amount
    const outstandingTotal = invoicedTotal - paidTotal;

    // Group data by client
    const clientData = await prisma.client.findMany({
      where: {
        userId: session.user.id,
        ...(clientId ? { id: clientId } : {}),
      },
      include: {
        projects: {
          include: {
            timeEntries: {
              where: {
                billable: true,
                startTime: {
                  gte: startDate,
                  lte: endDate,
                },
              },
            },
            expenses: {
              where: {
                billable: true,
                date: {
                  gte: startDate,
                  lte: endDate,
                },
              },
            },
          },
        },
        invoices: {
          where: {
            issueDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          include: {
            payments: true,
          },
        },
      },
    });

    // Transform client data
    const clientStats = clientData.map(client => {
      // Calculate billable time
      const billableTime = client.projects.reduce((clientTotal, project) => {
        return (
          clientTotal +
          project.timeEntries.reduce((projectTotal, entry) => {
            if (!entry.endTime) return projectTotal;

            const startTime = new Date(entry.startTime);
            const endTime = new Date(entry.endTime);
            const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

            return projectTotal + durationHours * project.hourlyRate;
          }, 0)
        );
      }, 0);

      // Calculate billable expenses
      const clientExpenses = client.projects.reduce((clientTotal, project) => {
        return (
          clientTotal +
          project.expenses.reduce((expenseTotal, expense) => {
            return expenseTotal + expense.amount;
          }, 0)
        );
      }, 0);

      // Calculate invoiced amount
      const invoicedAmount = client.invoices.reduce((total, invoice) => {
        return total + invoice.total;
      }, 0);

      // Calculate paid amount
      const paidAmount = client.invoices.reduce((total, invoice) => {
        return (
          total +
          invoice.payments.reduce((sum, payment) => {
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
    const summary = {
      startDate,
      endDate,
      billableAmount,
      billableExpenses,
      invoicedTotal,
      paidTotal,
      outstandingTotal,
      clientStats,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error generating revenue report:', error);
    return NextResponse.json({ error: 'Failed to generate revenue report' }, { status: 500 });
  }
}
