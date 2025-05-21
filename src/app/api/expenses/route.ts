import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ExpenseSchema } from "@/types/schemas";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

// GET all expenses
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const billable = searchParams.get("billable");

    // Build filter conditions
    const where: Prisma.ExpenseWhereInput = {
      userId: session.user.id,
    };

    if (projectId) {
      where.projectId = projectId;
    }

    if (startDate || endDate) {
      where.date = {};

      if (startDate) {
        where.date.gte = new Date(startDate);
      }

      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    if (billable !== null) {
      where.billable = billable === "true";
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

// POST to create a new expense
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const validatedData = ExpenseSchema.parse(json);

    const expense = await prisma.expense.create({
      data: {
        description: validatedData.description,
        amount: validatedData.amount,
        date: validatedData.date,
        receipt: validatedData.receipt,
        billable: validatedData.billable,
        projectId: validatedData.projectId,
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

    return NextResponse.json(expense, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid expense data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating expense:", error);
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}
