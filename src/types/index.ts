import { type DefaultSession } from "next-auth";

// Extend Next Auth session types
declare module "next-auth" {
 interface Session {
  user: {
   id: string;
   name: string;
   email: string;
   image?: string;
   role: UserRole;
   subscription: SubscriptionTier;
  } & DefaultSession["user"];
 }

 interface User {
  role: UserRole;
  subscription: SubscriptionTier;
 }
}

declare module "next-auth/jwt" {
 interface JWT {
  id: string;
  role: UserRole;
  subscription: SubscriptionTier;
 }
}

// User related types
export enum UserRole {
 SUPER_ADMIN = "SUPER_ADMIN",
 ADMIN = "ADMIN",
 ACCOUNTS = "ACCOUNTS",
 SALES = "SALES",
 EMPLOYEE = "EMPLOYEE",
}

export enum SubscriptionTier {
 FREE = "FREE",
 BASIC = "BASIC",
 PREMIUM = "PREMIUM",
}

// Enums
export enum ProjectStatus {
 ACTIVE = "ACTIVE",
 COMPLETED = "COMPLETED",
 ARCHIVED = "ARCHIVED",
}

export enum InvoiceStatus {
 DRAFT = "DRAFT",
 SENT = "SENT",
 PAID = "PAID",
 OVERDUE = "OVERDUE",
 CANCELLED = "CANCELLED",
}

export enum ItemType {
 SERVICE = "SERVICE",
 EXPENSE = "EXPENSE",
 PRODUCT = "PRODUCT",
}

export enum PaymentMethod {
 BANK_TRANSFER = "BANK_TRANSFER",
 CREDIT_CARD = "CREDIT_CARD",
 STRIPE = "STRIPE",
 PAYPAL = "PAYPAL",
 CASH = "CASH",
 OTHER = "OTHER",
}

// Base interfaces based on Prisma schema
export interface User {
 id: string;
 name: string | null;
 email: string;
 password: string | null;
 image: string | null;
 role: UserRole;
 subscription: SubscriptionTier;
 createdAt: Date;
 updatedAt: Date;
}

export interface Project {
 id: string;
 name: string;
 description: string | null;
 status: ProjectStatus;
 clientId: string;
 createdById: string;
 createdAt: Date;
 updatedAt: Date;
 hourlyRate: number;
}

export interface TimeEntry {
 id: string;
 description: string | null;
 startTime: Date;
 endTime: Date | null;
 projectId: string;
 userId: string;
 createdAt: Date;
 updatedAt: Date;
 invoiceId: string | null;
 invoiceItemId: string | null;
 billable: boolean;
}

export interface Client {
 id: string;
 name: string;
 email: string | null;
 phone: string | null;
 address: string | null;
 notes: string | null;
 createdById: string;
 createdAt: Date;
 updatedAt: Date;
}

export interface Invoice {
 id: string;
 invoiceNumber: string;
 clientId: string;
 userId: string;
 issueDate: Date;
 dueDate: Date;
 status: InvoiceStatus;
 notes: string | null;
 subtotal: number;
 tax: number;
 total: number;
 createdAt: Date;
 updatedAt: Date;
}

export interface InvoiceItem {
 id: string;
 invoiceId: string;
 description: string;
 quantity: number;
 unitPrice: number;
 amount: number;
 projectId: string | null;
 type: ItemType;
}

export interface Expense {
 id: string;
 description: string;
 amount: number;
 date: Date;
 receipt: string | null;
 billable: boolean;
 projectId: string;
 userId: string;
 createdAt: Date;
 updatedAt: Date;
 invoiceId: string | null;
 invoiceItemId: string | null;
}

export interface Payment {
 id: string;
 invoiceId: string;
 amount: number;
 date: Date;
 method: PaymentMethod;
 reference: string | null;
 notes: string | null;
 createdAt: Date;
 updatedAt: Date;
}

// Extended interfaces with additional fields
export interface ProjectWithRelations extends Omit<Project, "updatedAt"> {
 client: {
  id: string;
  name: string;
 };
 timeEntries: TimeEntry[];
 hoursTracked: string;
 updatedAt: string;
}

export interface ProjectWithClient extends Project {
 client: Client;
 timeEntries: TimeEntry[];
}

export interface TimeEntryWithDuration extends TimeEntry {
 duration: string;
 formattedDate: string;
 formattedStartTime: string;
 formattedEndTime: string;
}

export interface TimeEntryWithRelations extends TimeEntry {
 project: {
  id: string;
  name: string;
  client: {
   id: string;
   name: string;
  };
 };
 duration: string;
 formattedDate: string;
 formattedStartTime: string;
 formattedEndTime: string;
}

export type TimeEntryWithProject = TimeEntry & {
 project: ProjectWithClient;
};

export type ExpenseWithProject = Expense & {
 project: ProjectWithClient;
};

export type InvoiceWithClient = Invoice & {
 client: Client;
 items: InvoiceItem[];
};

export type InvoiceItemWithDetails = InvoiceItem & {
 project?: Project;
 timeEntries?: TimeEntry[];
 expenses?: Expense[];
};

export type InvoiceWithDetails = Invoice & {
 client: Client;
 items: InvoiceItemWithDetails[];
 payments: Payment[];
};
