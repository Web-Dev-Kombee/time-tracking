import { NextResponse } from 'next/server';
import { validateUserRole } from '@/lib/api-auth';
import { UserRole } from '@/types';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const UserUpdateSchema = z.object({
  role: z.nativeEnum(UserRole),
});

// GET - Get a specific user details
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { session, response } = await validateUserRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]);
  if (!session) return response;

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
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
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PATCH - Update a user's role
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  // Only SUPER_ADMIN and ADMIN can update roles
  const { session, response } = await validateUserRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]);
  if (!session) return response;

  try {
    const data = await request.json();
    const { role } = UserUpdateSchema.parse(data);

    // Get current user role
    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: { role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Additional validation rules:
    // 1. Only SUPER_ADMIN can modify another SUPER_ADMIN
    // 2. ADMIN cannot promote users to SUPER_ADMIN
    const currentUserRole = session.user.role as UserRole;

    if (targetUser.role === UserRole.SUPER_ADMIN && currentUserRole !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { error: 'Only super-admins can modify super-admin accounts' },
        { status: 403 }
      );
    }

    if (role === UserRole.SUPER_ADMIN && currentUserRole !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { error: 'Only super-admins can create super-admin accounts' },
        { status: 403 }
      );
    }

    // Update the user role
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user role:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid role value', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
  }
}

// DELETE - Delete a user
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  // Only SUPER_ADMIN can delete users
  const { session, response } = await validateUserRole([UserRole.SUPER_ADMIN]);
  if (!session) return response;

  try {
    // Prevent self-deletion
    if (params.id === session.user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete the user
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
