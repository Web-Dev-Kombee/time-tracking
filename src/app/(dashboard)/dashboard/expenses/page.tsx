"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Filter, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Define TypeScript interfaces
interface Client {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  client: Client;
}

interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  billable: boolean;
  project: Project;
}

// Fetch expenses function
async function fetchExpenses(
  projectId?: string,
  startDate?: string,
  endDate?: string,
  billable?: string
): Promise<Expense[]> {
  let url = "/api/expenses";
  const params = new URLSearchParams();

  if (projectId) params.append("projectId", projectId);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  if (billable !== undefined) params.append("billable", billable);

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fetch expenses");
  }

  return res.json();
}

export default function ExpensesPage() {
  const [filters, setFilters] = useState({
    projectId: "",
    startDate: "",
    endDate: "",
    billable: "",
  });

  // Fetch projects for the filter dropdown
  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
    // Don't refetch projects on every page refresh
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch expenses with react-query
  const {
    data: expenses,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["expenses", filters],
    queryFn: () =>
      fetchExpenses(filters.projectId, filters.startDate, filters.endDate, filters.billable),
  });

  if (error) {
    toast.error("Failed to load expenses");
  }

  // Helper function to set date range
  const setDateRange = (period: string) => {
    const today = new Date();
    let startDate = "";
    let endDate = today.toISOString().split("T")[0]; // Today

    switch (period) {
      case "thisMonth":
        // First day of current month
        startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
        break;
      case "lastMonth":
        // First day of last month
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
          .toISOString()
          .split("T")[0];
        // Last day of last month
        endDate = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split("T")[0];
        break;
      case "thisWeek":
        // First day of current week (Sunday)
        const firstDayOfWeek = new Date(today);
        firstDayOfWeek.setDate(today.getDate() - today.getDay());
        startDate = firstDayOfWeek.toISOString().split("T")[0];
        break;
      case "last30Days":
        // 30 days ago
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        startDate = thirtyDaysAgo.toISOString().split("T")[0];
        break;
      case "thisYear":
        // First day of current year
        startDate = new Date(today.getFullYear(), 0, 1).toISOString().split("T")[0];
        break;
      default:
        startDate = "";
    }

    setFilters({
      ...filters,
      startDate,
      endDate,
    });
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      projectId: "",
      startDate: "",
      endDate: "",
      billable: "",
    });
  };

  // Calculate totals
  const totalAmount =
    expenses?.reduce((sum: number, expense: Expense) => sum + expense.amount, 0) || 0;
  const billableAmount =
    expenses?.reduce(
      (sum: number, expense: Expense) => (expense.billable ? sum + expense.amount : sum),
      0
    ) || 0;
  const nonBillableAmount = totalAmount - billableAmount;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Billable Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${billableAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Non-Billable Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">${nonBillableAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setDateRange("thisMonth")}>
            <Calendar className="mr-2 h-4 w-4" />
            This Month
          </Button>

          {/* Filter Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Filter Expenses</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="startDate" className="text-right">
                    From
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={filters.startDate}
                    onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="endDate" className="text-right">
                    To
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={filters.endDate}
                    onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="project" className="text-right">
                    Project
                  </Label>
                  <Select
                    value={filters.projectId}
                    onValueChange={value => setFilters({ ...filters, projectId: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="All Projects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Projects</SelectItem>
                      {projects?.map((project: Project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="billable" className="text-right">
                    Billable
                  </Label>
                  <Select
                    value={filters.billable}
                    onValueChange={value => setFilters({ ...filters, billable: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="All Expenses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Expenses</SelectItem>
                      <SelectItem value="true">Billable Only</SelectItem>
                      <SelectItem value="false">Non-Billable Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={resetFilters}>
                  Reset
                </Button>
                <DialogClose asChild>
                  <Button type="submit">Apply Filters</Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>

          {/* Quick filter buttons */}
          <div className="hidden md:flex space-x-2">
            <Button variant="ghost" size="sm" onClick={() => setDateRange("thisWeek")}>
              This Week
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDateRange("lastMonth")}>
              Last Month
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDateRange("last30Days")}>
              Last 30 Days
            </Button>
          </div>
        </div>

        {/* Active filters indicator */}
        {(filters.startDate || filters.endDate || filters.projectId || filters.billable) && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Expenses</CardTitle>
          <CardDescription>View and manage your expense records</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading expenses...</p>
          ) : expenses && expenses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-left">Description</th>
                    <th className="py-3 px-4 text-left">Project</th>
                    <th className="py-3 px-4 text-left">Client</th>
                    <th className="py-3 px-4 text-left">Billable</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense: Expense) => (
                    <tr key={expense.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{new Date(expense.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{expense.description}</td>
                      <td className="py-3 px-4">{expense.project.name}</td>
                      <td className="py-3 px-4">{expense.project.client.name}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                            expense.billable
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {expense.billable ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">${expense.amount.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-4">No expenses found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
