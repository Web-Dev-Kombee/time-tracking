// Use the standard import for PrismaClient but mark it as 'any' to avoid TypeScript errors
// @ts-ignore
import { PrismaClient } from "@prisma/client";
import { UserRole, SubscriptionTier, ProjectStatus } from "../src/types";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting to seed the database...");

  // Clean the database first
  await prisma.payment.deleteMany({});
  await prisma.invoiceItem.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.timeEntry.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.user.deleteMany({});

  // Create admin user
  const hashedPassword = await bcrypt.hash("password123", 10);
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: UserRole.ADMIN,
      subscription: SubscriptionTier.PREMIUM,
    },
  });

  console.log(`Created admin user: ${admin.email}`);

  // Create a regular user
  const user = await prisma.user.create({
    data: {
      name: "Test User",
      email: "user@example.com",
      password: hashedPassword,
      role: UserRole.USER,
      subscription: SubscriptionTier.FREE,
    },
  });

  console.log(`Created regular user: ${user.email}`);

  // Create clients
  const client1 = await prisma.client.create({
    data: {
      name: "Acme Inc.",
      email: "contact@acme.com",
      phone: "555-1234",
      address: "123 Business St, Suite 100, New York, NY 10001",
      notes: "Major client, priority support",
      createdById: admin.id,
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: "Globex Corporation",
      email: "info@globex.com",
      phone: "555-5678",
      address: "500 Enterprise Blvd, San Francisco, CA 94107",
      createdById: admin.id,
    },
  });

  console.log(`Created ${2} clients`);

  // Create projects
  const project1 = await prisma.project.create({
    data: {
      name: "Website Redesign",
      description: "Complete overhaul of company website with new branding",
      status: ProjectStatus.ACTIVE,
      clientId: client1.id,
      createdById: admin.id,
      hourlyRate: 150,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: "Mobile App Development",
      description: "iOS and Android app for customer portal",
      status: ProjectStatus.ACTIVE,
      clientId: client1.id,
      createdById: admin.id,
      hourlyRate: 175,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: "Marketing Campaign",
      description: "Q3 digital marketing campaign",
      status: ProjectStatus.ACTIVE,
      clientId: client2.id,
      createdById: admin.id,
      hourlyRate: 125,
    },
  });

  console.log(`Created ${3} projects`);

  // Create time entries
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);

  await prisma.timeEntry.create({
    data: {
      description: "Homepage design implementation",
      startTime: new Date(yesterday.setHours(9, 0, 0)),
      endTime: new Date(yesterday.setHours(12, 30, 0)),
      projectId: project1.id,
      userId: admin.id,
    },
  });

  await prisma.timeEntry.create({
    data: {
      description: "API development",
      startTime: new Date(yesterday.setHours(13, 30, 0)),
      endTime: new Date(yesterday.setHours(17, 0, 0)),
      projectId: project2.id,
      userId: admin.id,
    },
  });

  await prisma.timeEntry.create({
    data: {
      description: "Content creation for ads",
      startTime: new Date(lastWeek.setHours(10, 0, 0)),
      endTime: new Date(lastWeek.setHours(15, 45, 0)),
      projectId: project3.id,
      userId: user.id,
    },
  });

  console.log(`Created ${3} time entries`);

  // Create expenses
  await prisma.expense.create({
    data: {
      description: "Stock photos for website",
      amount: 79.99,
      date: yesterday,
      billable: true,
      projectId: project1.id,
      userId: admin.id,
    },
  });

  await prisma.expense.create({
    data: {
      description: "Software license",
      amount: 299.0,
      date: lastWeek,
      billable: true,
      projectId: project2.id,
      userId: admin.id,
    },
  });

  console.log(`Created ${2} expenses`);

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
