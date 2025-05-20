import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { ClientSchema } from "@/types/schemas";
import { z } from "zod";

// GET a specific client
export async function GET(
  request: Request,
  { params }: { params: { clientId: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await prisma.client.findUnique({
      where: {
        id: params.clientId,
      },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("[CLIENT_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT to update a client
export async function PUT(
  request: Request,
  { params }: { params: { clientId: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = ClientSchema.parse(body);

    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: {
        id: params.clientId,
      },
    });

    if (!existingClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const updatedClient = await prisma.client.update({
      where: {
        id: params.clientId,
      },
      data: validatedData,
    });

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error("[CLIENT_PUT]", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid client data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE a client
export async function DELETE(
  request: Request,
  { params }: { params: { clientId: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: {
        id: params.clientId,
      },
    });

    if (!existingClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Delete client
    await prisma.client.delete({
      where: {
        id: params.clientId,
      },
    });

    return NextResponse.json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error("[CLIENT_DELETE]", error);

    if (
      error instanceof Error &&
      error.message.includes("foreign key constraint")
    ) {
      return NextResponse.json(
        { error: "Cannot delete client with associated projects or invoices" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
