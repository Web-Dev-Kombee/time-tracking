import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ExpenseSchema } from "@/types/schemas";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function GET(request: Request, { params }: { params: { expenseId: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const expense = await prisma.expense.findUnique({
      where: {
        id: params.expenseId,
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

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Error fetching expense:", error);
    return NextResponse.json({ error: "Failed to fetch expense" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { expenseId: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const validatedData = ExpenseSchema.parse(json);

    // Check if expense exists and belongs to user
    const existingExpense = await prisma.expense.findUnique({
      where: {
        id: params.expenseId,
        userId: session.user.id,
      },
    });

    if (!existingExpense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    // Update expense
    const updatedExpense = await prisma.expense.update({
      where: {
        id: params.expenseId,
      },
      data: {
        description: validatedData.description,
        amount: validatedData.amount,
        date: validatedData.date,
        receipt: validatedData.receipt,
        billable: validatedData.billable,
        projectId: validatedData.projectId,
      },
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
    });

    return NextResponse.json(updatedExpense);
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid expense data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating expense:", error);
    return NextResponse.json({ error: "Failed to update expense" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { expenseId: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if expense exists and belongs to user
    const existingExpense = await prisma.expense.findUnique({
      where: {
        id: params.expenseId,
        userId: session.user.id,
      },
    });

    if (!existingExpense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    // Delete expense
    await prisma.expense.delete({
      where: {
        id: params.expenseId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
  }
}
