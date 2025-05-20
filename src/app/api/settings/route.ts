import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import bcrypt from "bcrypt";

// Schema for profile update
const ProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

// Schema for password update
const PasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// GET user settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        subscription: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch user settings" },
      { status: 500 }
    );
  }
}

// PATCH update user settings
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const { action } = json;

    if (action === "updateProfile") {
      const validatedData = ProfileSchema.parse(json.data);

      // Check if email is being changed and if it's already in use
      if (validatedData.email !== session.user.email) {
        const existingUser = await prisma.user.findUnique({
          where: {
            email: validatedData.email,
          },
        });

        if (existingUser) {
          return NextResponse.json(
            { error: "Email already in use" },
            { status: 400 }
          );
        }
      }

      const updatedUser = await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          name: validatedData.name,
          email: validatedData.email,
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          subscription: true,
        },
      });

      return NextResponse.json(updatedUser);
    }

    if (action === "updatePassword") {
      const validatedData = PasswordSchema.parse(json.data);

      // Get user with password
      const user = await prisma.user.findUnique({
        where: {
          id: session.user.id,
        },
        select: {
          id: true,
          password: true,
        },
      });

      if (!user || !user.password) {
        return NextResponse.json(
          { error: "User not found or no password set" },
          { status: 400 }
        );
      }

      // Verify current password
      const passwordValid = await bcrypt.compare(
        validatedData.currentPassword,
        user.password
      );

      if (!passwordValid) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);

      // Update password
      await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          password: hashedPassword,
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating user settings:", error);
    return NextResponse.json(
      { error: "Failed to update user settings" },
      { status: 500 }
    );
  }
}
