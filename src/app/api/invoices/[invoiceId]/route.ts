import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { InvoiceSchema } from "@/types/schemas";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: { invoiceId: string } }) {
 try {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invoice = await prisma.invoice.findUnique({
   where: {
    id: params.invoiceId,
    userId: session.user.id,
   },
   include: {
    client: true,
    items: {
     include: {
      project: true,
      timeEntries: true,
      expenses: true,
     },
    },
    payments: true,
   },
  });

  if (!invoice) {
   return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  return NextResponse.json(invoice);
 } catch (error) {
  console.error("Error fetching invoice:", error);
  return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 });
 }
}

export async function PUT(request: Request, { params }: { params: { invoiceId: string } }) {
 try {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const validatedData = InvoiceSchema.parse(json);

  // Check if invoice exists and belongs to user
  const existingInvoice = await prisma.invoice.findUnique({
   where: {
    id: params.invoiceId,
    userId: session.user.id,
   },
  });

  if (!existingInvoice) {
   return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  // Calculate invoice totals
  const subtotal = validatedData.items.reduce(
   (sum, item) => sum + item.quantity * item.unitPrice,
   0
  );

  const tax = subtotal * (validatedData.tax / 100);
  const total = subtotal + tax;

  // Update invoice and items in a transaction
  const updatedInvoice = await prisma.$transaction(async tx => {
   // Delete existing items
   await tx.invoiceItem.deleteMany({
    where: {
     invoiceId: params.invoiceId,
    },
   });

   // Update invoice and create new items
   return tx.invoice.update({
    where: {
     id: params.invoiceId,
    },
    data: {
     clientId: validatedData.clientId,
     issueDate: validatedData.issueDate,
     dueDate: validatedData.dueDate,
     status: validatedData.status,
     notes: validatedData.notes,
     subtotal,
     tax,
     total,
     items: {
      create: validatedData.items.map(item => ({
       description: item.description,
       quantity: item.quantity,
       unitPrice: item.unitPrice,
       amount: item.quantity * item.unitPrice,
       projectId: item.projectId || null,
       type: item.type,
      })),
     },
    },
    include: {
     client: true,
     items: true,
    },
   });
  });

  return NextResponse.json(updatedInvoice);
 } catch (error: any) {
  if (error.name === "ZodError") {
   return NextResponse.json(
    { error: "Invalid invoice data", details: error.errors },
    { status: 400 }
   );
  }

  console.error("Error updating invoice:", error);
  return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
 }
}

export async function DELETE(request: Request, { params }: { params: { invoiceId: string } }) {
 try {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if invoice exists and belongs to user
  const existingInvoice = await prisma.invoice.findUnique({
   where: {
    id: params.invoiceId,
    userId: session.user.id,
   },
  });

  if (!existingInvoice) {
   return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  // Delete invoice (this will cascade delete items due to the relation)
  await prisma.invoice.delete({
   where: {
    id: params.invoiceId,
   },
  });

  return NextResponse.json({ success: true });
 } catch (error) {
  console.error("Error deleting invoice:", error);
  return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 });
 }
}
