import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { InvoiceSchema } from '@/types/schemas';
import { authOptions } from '@/lib/auth';

// GET all invoices
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');

    // Build filter conditions
    const where: any = {
      userId: session.user.id,
    };

    if (clientId) {
      where.clientId = clientId;
    }

    if (status) {
      where.status = status;
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        client: true,
        items: true,
        payments: true,
      },
      orderBy: {
        issueDate: 'desc',
      },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

// POST to create a new invoice
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    const validatedData = InvoiceSchema.parse(json);

    // Generate invoice number (format: INV-YYYYMMDD-XXX)
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');

    // Count today's invoices to generate sequential number
    const todayInvoicesCount = await prisma.invoice.count({
      where: {
        invoiceNumber: {
          startsWith: `INV-${dateStr}`,
        },
      },
    });

    const invoiceNumber = `INV-${dateStr}-${(todayInvoicesCount + 1).toString().padStart(3, '0')}`;

    // Calculate total
    const subtotal = validatedData.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    const tax = subtotal * (validatedData.tax / 100);
    const total = subtotal + tax;

    // Create invoice with items in a transaction
    const invoice = await prisma.$transaction(async tx => {
      // Create the invoice
      const newInvoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          clientId: validatedData.clientId,
          userId: session.user.id,
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

      return newInvoice;
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid invoice data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}
