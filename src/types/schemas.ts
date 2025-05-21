import { z } from "zod";
import { ProjectStatus, InvoiceStatus, ItemType, PaymentMethod } from "./index";

// User related schemas
export const UserSchema = z.object({
 name: z.string().min(2, "Name must be at least 2 characters"),
 email: z.string().email("Invalid email address"),
 password: z.string().min(8, "Password must be at least 8 characters").optional(),
});

export const LoginSchema = z.object({
 email: z.string().email("Invalid email address"),
 password: z.string().min(1, "Password is required"),
});

// Client schemas
export const ClientSchema = z.object({
 name: z.string().min(2, "Client name must be at least 2 characters"),
 email: z.string().email("Invalid email address").optional().or(z.literal("")),
 phone: z.string().optional().or(z.literal("")),
 address: z.string().optional().or(z.literal("")),
 notes: z.string().optional().or(z.literal("")),
});

// Project schemas
export const ProjectSchema = z.object({
 name: z.string().min(2, "Project name must be at least 2 characters"),
 description: z.string().optional().or(z.literal("")),
 status: z.nativeEnum(ProjectStatus),
 clientId: z.string().min(1, "Client is required"),
 hourlyRate: z.coerce.number().min(0, "Rate must be a positive number"),
});

// Time entry schemas
export const TimeEntrySchema = z.object({
 description: z.string().optional().or(z.literal("")),
 startTime: z.coerce.date(),
 endTime: z.coerce.date().optional().nullable(),
 projectId: z.string().min(1, "Project is required"),
 billable: z.boolean().default(true),
});

// Expense schemas
export const ExpenseSchema = z.object({
 description: z.string().min(2, "Description is required"),
 amount: z.coerce.number().positive("Amount must be positive"),
 date: z.coerce.date(),
 receipt: z.string().optional().or(z.literal("")),
 billable: z.boolean().default(true),
 projectId: z.string().min(1, "Project is required"),
});

// Invoice schemas
export const InvoiceItemSchema = z.object({
 description: z.string().min(2, "Description is required"),
 quantity: z.coerce.number().positive("Quantity must be positive"),
 unitPrice: z.coerce.number().nonnegative("Price must be non-negative"),
 projectId: z.string().optional().or(z.literal("")),
 type: z.nativeEnum(ItemType),
});

export const InvoiceSchema = z.object({
 clientId: z.string().min(1, "Client is required"),
 issueDate: z.coerce.date(),
 dueDate: z.coerce.date(),
 notes: z.string().optional().or(z.literal("")),
 status: z.nativeEnum(InvoiceStatus),
 items: z.array(InvoiceItemSchema).min(1, "At least one item is required"),
 tax: z.coerce.number().nonnegative("Tax must be non-negative"),
});

// Payment schemas
export const PaymentSchema = z.object({
 invoiceId: z.string().min(1, "Invoice is required"),
 amount: z.coerce.number().positive("Amount must be positive"),
 date: z.coerce.date(),
 method: z.nativeEnum(PaymentMethod),
 reference: z.string().optional().or(z.literal("")),
 notes: z.string().optional().or(z.literal("")),
});
