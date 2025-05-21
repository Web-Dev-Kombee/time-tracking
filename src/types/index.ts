import { type DefaultSession } from "next-auth";

// ========================
// Next Auth Extensions
// ========================
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

// ========================
// Enums
// ========================
export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  ACCOUNTS = "ACCOUNTS",
  SALES = "SALES",
  EMPLOYEE = "EMPLOYEE",
  USER = "USER",
}

export enum SubscriptionTier {
  FREE = "FREE",
  BASIC = "BASIC",
  PREMIUM = "PREMIUM",
}

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

export type ActivityType = "time_entry" | "client" | "project" | "invoice" | "expense";
export type NotificationType =
  | "overdue_invoice"
  | "upcoming_invoice"
  | "running_timer"
  | "payment_received";

// ========================
// Base Models
// ========================
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends BaseEntity {
  name: string | null;
  email: string;
  password: string | null;
  image: string | null;
  role: UserRole;
  subscription: SubscriptionTier;
}

export interface Client extends BaseEntity {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  createdById: string;
}

export interface Project extends BaseEntity {
  name: string;
  description: string | null;
  status: ProjectStatus;
  clientId: string;
  createdById: string;
  hourlyRate: number;
}

export interface TimeEntry extends BaseEntity {
  description: string | null;
  startTime: Date;
  endTime: Date | null;
  projectId: string;
  userId: string;
  invoiceId: string | null;
  invoiceItemId: string | null;
  billable: boolean;
}

export interface Expense extends BaseEntity {
  description: string;
  amount: number;
  date: Date;
  receipt: string | null;
  billable: boolean;
  projectId: string;
  userId: string;
  invoiceId: string | null;
  invoiceItemId: string | null;
}

export interface Invoice extends BaseEntity {
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

export interface Payment extends BaseEntity {
  invoiceId: string;
  amount: number;
  date: Date;
  method: PaymentMethod;
  reference: string | null;
  notes: string | null;
}

// ========================
// Extended Models with Relations
// ========================
export interface ProjectWithClient extends Project {
  client: Client;
  timeEntries: TimeEntry[];
}

export interface ProjectWithRelations extends Omit<Project, "updatedAt"> {
  client: Client;
  timeEntries: TimeEntry[];
  hoursTracked: string;
  updatedAt: string;
}

export interface ClientWithProjects extends Client {
  projects: Project[];
  invoices: Invoice[];
}

export interface TimeEntryWithProject extends TimeEntry {
  project: ProjectWithClient;
}

export interface TimeEntryWithDuration extends TimeEntry {
  duration: string;
  formattedDate: string;
  formattedStartTime: string;
  formattedEndTime: string;
}

export interface TimeEntryWithRelations extends TimeEntryWithDuration {
  project: {
    id: string;
    name: string;
    hourlyRate: number;
    client: {
      id: string;
      name: string;
    };
  };
}

export interface TimeEntryDetail {
  id: string;
  description: string;
  projectName: string;
  clientName: string;
  startTime: Date;
  endTime: Date | null;
  duration: number;
  billable: boolean;
}

export interface ExpenseWithProject extends Expense {
  project: ProjectWithClient;
}

export interface InvoiceWithClient extends Invoice {
  client: Client;
  items: InvoiceItem[];
}

export interface InvoiceItemWithDetails extends InvoiceItem {
  project?: Project;
  timeEntries?: TimeEntry[];
  expenses?: Expense[];
}

export interface InvoiceWithDetails extends Invoice {
  client: Client;
  items: InvoiceItemWithDetails[];
  payments: Payment[];
}

// ========================
// Activity Types
// ========================
export interface ActivityClient {
  name: string;
  email?: string;
}

export interface ActivityProject {
  name: string;
  client: ActivityClient;
}

export interface ActivityTimeEntry {
  startTime: string;
  endTime?: string;
  project: ActivityProject;
}

export interface ActivityInvoice {
  invoiceNumber: string;
  total: number;
  client: ActivityClient;
}

export interface ActivityExpense {
  description: string;
  amount: number;
  project: ActivityProject;
}

export type ActivityData =
  | ActivityTimeEntry
  | ActivityClient
  | ActivityProject
  | ActivityInvoice
  | ActivityExpense;

export interface Activity {
  id: string;
  type: ActivityType;
  data: ActivityData;
  updatedAt: string;
}

export interface ActivityItem<T> {
  type: ActivityType;
  id: string;
  data: T;
  updatedAt: Date | string;
}

export interface ActivityStats {
  activeProjects: number;
  totalClients: number;
  unpaidInvoices: number;
  hoursThisMonth: number;
}

export interface ActivityResponse {
  activities: ActivityItem<unknown>[] | Activity[];
  stats?: ActivityStats;
}

// ========================
// Notifications
// ========================
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  entityId?: string;
}

export interface NotificationCounts {
  total: number;
  overdue: number;
  upcoming: number;
  running: number;
  payments: number;
}

export interface NotificationsResponse {
  notifications: Notification[];
  counts: NotificationCounts;
}

// ========================
// Reports
// ========================
export interface ClientStats {
  id: string;
  name: string;
  billableAmount: number;
  expenses: number;
  invoicedAmount: number;
  paidAmount: number;
  outstandingAmount: number;
}

export interface RevenueReport {
  startDate: string;
  endDate: string;
  billableAmount: number;
  billableExpenses: number;
  invoicedTotal: number;
  paidTotal: number;
  outstandingTotal: number;
  clientStats: ClientStats[];
}

export interface TimeReport {
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  billablePercentage: number;
  data: ReportGroup[];
}

export interface ReportGroup {
  id: string;
  name: string;
  totalTime: number;
  billableTime: number;
  nonBillableTime: number;
  billablePercentage: number;
  items?: TimeEntryDetail[];
}

export interface RevenueTimeEntry {
  id: string;
  startTime: Date;
  endTime: Date | null;
  project: {
    hourlyRate: number;
  };
}

// ========================
// Miscellaneous
// ========================
export interface EmailConfig {
  email: string;
  subject: string;
  message: string;
}

export interface EditClientPageProps {
  params: {
    clientId: string;
  };
}

export type ClientPageProps = EditClientPageProps;

// Alias ClientWithRelations to match API usage
export type ClientWithRelations = ClientWithProjects;

// Add these interfaces to match how they're actually used in the code
export interface RevenueProject extends Project {
  timeEntries: RevenueTimeEntry[];
  expenses: RevenueExpense[];
  hourlyRate: number;
}

export interface RevenueTimeEntry {
  startTime: Date;
  endTime: Date | null;
  project: {
    hourlyRate: number;
  };
}

export interface RevenueExpense {
  amount: number;
}

export interface RevenueInvoice extends Invoice {
  payments: RevenuePayment[];
}

export interface RevenuePayment {
  amount: number;
}

export interface RevenueClientWithRelations {
  id: string;
  name: string;
  projects: RevenueProject[];
  invoices: RevenueInvoice[];
}

// Create a UI-specific type in types/index.ts
export interface ExpenseWithDetails extends Expense {
  project: {
    name: string;
    client: {
      name: string;
    };
  };
}

export interface InvoiceWithDetails extends Invoice {
  client: Client;
}
