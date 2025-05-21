import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// GET notifications for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get upcoming due invoices (due within 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const today = new Date();

    const upcomingInvoices = await prisma.invoice.findMany({
      where: {
        userId: session.user.id,
        status: {
          in: ["SENT"],
        },
        dueDate: {
          gte: today,
          lte: sevenDaysFromNow,
        },
      },
      include: {
        client: true,
      },
      orderBy: {
        dueDate: "asc",
      },
    });

    // Get overdue invoices
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        userId: session.user.id,
        status: {
          in: ["SENT", "OVERDUE"],
        },
        dueDate: {
          lt: today,
        },
      },
      include: {
        client: true,
      },
      orderBy: {
        dueDate: "asc",
      },
    });

    // Get currently running time entries (those without end time)
    const runningTimeEntries = await prisma.timeEntry.findMany({
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
    });

    // Get recent payments (last 48 hours)
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const recentPayments = await prisma.payment.findMany({
      where: {
        invoice: {
          userId: session.user.id,
        },
        createdAt: {
          gte: twoDaysAgo,
        },
      },
      include: {
        invoice: {
          include: {
            client: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Build notifications array
    const notifications = [
      // Overdue invoices notifications
      ...overdueInvoices.map(invoice => ({
        id: `overdue-${invoice.id}`,
        type: "overdue_invoice",
        title: "Overdue Invoice",
        message: `Invoice ${invoice.invoiceNumber} for ${invoice.client.name} is overdue by ${Math.ceil(
          (today.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
        )} days.`,
        invoiceId: invoice.id,
        clientId: invoice.clientId,
        amount: invoice.total,
        createdAt: invoice.dueDate,
        read: false,
      })),

      // Upcoming due invoices notifications
      ...upcomingInvoices.map(invoice => ({
        id: `upcoming-${invoice.id}`,
        type: "upcoming_invoice",
        title: "Upcoming Invoice Due",
        message: `Invoice ${invoice.invoiceNumber} for ${invoice.client.name} is due in ${Math.ceil(
          (new Date(invoice.dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        )} days.`,
        invoiceId: invoice.id,
        clientId: invoice.clientId,
        amount: invoice.total,
        createdAt: new Date(),
        read: false,
      })),

      // Running time entries notifications
      ...runningTimeEntries.map(entry => ({
        id: `running-${entry.id}`,
        type: "running_timer",
        title: "Timer Running",
        message: `You have a timer running for ${entry.project.name} (${
          entry.project.client.name
        }) for ${Math.floor(
          (today.getTime() - new Date(entry.startTime).getTime()) / (1000 * 60 * 60)
        )} hours.`,
        timeEntryId: entry.id,
        projectId: entry.projectId,
        clientId: entry.project.clientId,
        createdAt: entry.startTime,
        read: false,
      })),

      // Recent payments notifications
      ...recentPayments.map(payment => ({
        id: `payment-${payment.id}`,
        type: "payment_received",
        title: "Payment Received",
        message: `Payment of $${payment.amount.toFixed(
          2
        )} received for invoice ${payment.invoice.invoiceNumber} from ${payment.invoice.client.name}.`,
        paymentId: payment.id,
        invoiceId: payment.invoiceId,
        clientId: payment.invoice.clientId,
        amount: payment.amount,
        createdAt: payment.createdAt,
        read: false,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      notifications,
      counts: {
        total: notifications.length,
        overdue: overdueInvoices.length,
        upcoming: upcomingInvoices.length,
        running: runningTimeEntries.length,
        payments: recentPayments.length,
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

// No actual persistence for notifications yet, but this endpoint is for
// demonstration purposes to show how it could be implemented in the future
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const { notificationIds, action } = json;

    if (!notificationIds || !Array.isArray(notificationIds) || !action) {
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
    }

    // If we were storing notifications in the database, we would mark them as read here
    // For now, just return success
    if (action === "markAsRead") {
      return NextResponse.json({
        success: true,
        message: `${notificationIds.length} notifications marked as read`,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}
