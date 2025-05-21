import { NextResponse } from "next/server";
import { validateUserRole } from "@/lib/api-auth";
import { UserRole } from "@/types";
import { prisma } from "@/lib/prisma";

/**
 * GET - Get all users (admin only)
 */
export async function GET(request: Request) {
 // Validate that the request is coming from an admin user
 const { session, response } = await validateUserRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]);
 if (!session) return response;

 try {
  // Only super-admin and admin can list all users
  const users = await prisma.user.findMany({
   select: {
    id: true,
    name: true,
    email: true,
    role: true,
    subscription: true,
    createdAt: true,
    updatedAt: true,
    image: true,
   },
   orderBy: {
    name: "asc",
   },
  });

  return NextResponse.json(users);
 } catch (error) {
  console.error("Error fetching users:", error);
  return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
 }
}

/**
 * POST - Create a new user (admin only)
 */
export async function POST(request: Request) {
 // Only SUPER_ADMIN can create new admin users
 const { session, response } = await validateUserRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]);
 if (!session) return response;

 try {
  const data = await request.json();

  // Additional validation for ADMIN users - they can't create SUPER_ADMIN users
  if (session.user.role === UserRole.ADMIN && data.role === UserRole.SUPER_ADMIN) {
   return NextResponse.json(
    { error: "Admin users cannot create super-admin accounts" },
    { status: 403 }
   );
  }

  // Create the new user
  const user = await prisma.user.create({
   data: {
    name: data.name,
    email: data.email,
    role: data.role,
    // Additional user data...
   },
   select: {
    id: true,
    name: true,
    email: true,
    role: true,
    subscription: true,
    image: true,
   },
  });

  return NextResponse.json(user, { status: 201 });
 } catch (error) {
  console.error("Error creating user:", error);
  return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
 }
}
