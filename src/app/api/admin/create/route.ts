import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Admin credentials
    const adminEmail = 'admin@timetrack.com';
    const adminPassword = 'Admin123!';
    const adminName = 'Admin User';

    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: {
        email: adminEmail,
      },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { message: 'Admin user already exists', userId: existingAdmin.id },
        { status: 200 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    const user = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    // Return success response (without password)
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(
      {
        message: 'Admin user created successfully',
        user: userWithoutPassword,
        credentials: {
          email: adminEmail,
          password: adminPassword, // Only included for first-time setup
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json({ error: 'Failed to create admin user' }, { status: 500 });
  }
}

// Also create a super-admin user
export async function POST() {
  try {
    // Super Admin credentials
    const adminEmail = 'superadmin@timetrack.com';
    const adminPassword = 'SuperAdmin123!';
    const adminName = 'Super Admin';

    // Check if super admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: {
        email: adminEmail,
      },
    });

    if (existingAdmin) {
      return NextResponse.json(
        {
          message: 'Super Admin user already exists',
          userId: existingAdmin.id,
        },
        { status: 200 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create super admin user
    const user = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'SUPER_ADMIN',
      },
    });

    // Return success response (without password)
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(
      {
        message: 'Super Admin user created successfully',
        user: userWithoutPassword,
        credentials: {
          email: adminEmail,
          password: adminPassword, // Only included for first-time setup
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating super admin user:', error);
    return NextResponse.json({ error: 'Failed to create super admin user' }, { status: 500 });
  }
}
