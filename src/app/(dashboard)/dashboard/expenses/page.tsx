'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Fetch expenses function
async function fetchExpenses(
  projectId?: string,
  startDate?: string,
  endDate?: string,
  billable?: string
) {
  let url = '/api/expenses';
  const params = new URLSearchParams();

  if (projectId) params.append('projectId', projectId);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (billable !== undefined) params.append('billable', billable);

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error('Failed to fetch expenses');
  }

  return res.json();
}

export default function ExpensesPage() {
  const [filters, setFilters] = useState({
    projectId: '',
    startDate: '',
    endDate: '',
    billable: '',
  });

  // Fetch expenses with react-query
  const {
    data: expenses,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['expenses', filters],
    queryFn: () =>
      fetchExpenses(filters.projectId, filters.startDate, filters.endDate, filters.billable),
  });

  if (error) {
    toast.error('Failed to load expenses');
  }

  // Calculate totals
  const totalAmount = expenses?.reduce((sum: number, expense: any) => sum + expense.amount, 0) || 0;
  const billableAmount =
    expenses?.reduce(
      (sum: number, expense: any) => (expense.billable ? sum + expense.amount : sum),
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
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            This Month
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
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
                  {expenses.map((expense: any) => (
                    <tr key={expense.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{new Date(expense.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{expense.description}</td>
                      <td className="py-3 px-4">{expense.project.name}</td>
                      <td className="py-3 px-4">{expense.project.client.name}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                            expense.billable
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {expense.billable ? 'Yes' : 'No'}
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
