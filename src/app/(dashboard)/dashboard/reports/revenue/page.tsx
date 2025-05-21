"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClientStats, RevenueReport } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Download } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

// Fetch revenue report function
async function fetchRevenueReport(
  startDate?: string,
  endDate?: string,
  clientId?: string
): Promise<RevenueReport> {
  let url = "/api/reports/revenue";
  const params = new URLSearchParams();

  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  if (clientId) params.append("clientId", clientId);

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fetch revenue report");
  }

  return res.json();
}

export default function RevenueReportPage() {
  const [timeRange, setTimeRange] = useState("month");
  const [selectedClient, setSelectedClient] = useState("");

  // Calculate date range based on selected time range
  const getDateRange = () => {
    const now = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1); // Default to month
    }

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: now.toISOString().split("T")[0],
    };
  };

  const { startDate, endDate } = getDateRange();

  // Fetch revenue report data
  const {
    data: report,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["revenueReport", startDate, endDate, selectedClient],
    queryFn: () => fetchRevenueReport(startDate, endDate, selectedClient || undefined),
  });

  if (error) {
    toast.error("Failed to load revenue report");
  }

  // Prepare chart data for client comparison
  const clientChartData =
    report?.clientStats?.map((client: ClientStats) => ({
      name: client.name,
      billable: client.billableAmount,
      expenses: client.expenses,
      paid: client.paidAmount,
      outstanding: client.outstandingAmount,
    })) || [];

  // Prepare pie chart data for revenue breakdown
  const pieChartData = report
    ? [
        {
          name: "Billable Time",
          value: report.billableAmount,
          color: "#4f46e5",
        },
        { name: "Expenses", value: report.billableExpenses, color: "#10b981" },
        {
          name: "Outstanding",
          value: report.outstandingTotal,
          color: "#f59e0b",
        },
      ]
    : [];

  // COLORS for pie chart
  const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444"];

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Revenue Report</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Clients</SelectItem>
              {report?.clientStats?.map((client: ClientStats) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Custom Range
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p>Loading report...</p>
      ) : report ? (
        <>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Billable Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${report.billableAmount.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Billable Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${report.billableExpenses.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${report.invoicedTotal.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${report.paidTotal.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {report.outstandingTotal > 0 &&
                    `$${report.outstandingTotal.toFixed(2)} outstanding`}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue By Client</CardTitle>
                <CardDescription>Comparison of client revenue for the period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={clientChartData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={value => `$${Number(value).toFixed(2)}`} />
                      <Legend />
                      <Bar dataKey="billable" name="Billable Time" fill="#4f46e5" />
                      <Bar dataKey="expenses" name="Expenses" fill="#10b981" />
                      <Bar dataKey="outstanding" name="Outstanding" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Distribution of revenue sources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color || COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={value => `$${Number(value).toFixed(2)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Client Performance</CardTitle>
              <CardDescription>Detailed breakdown by client</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="py-3 px-4 text-left">Client</th>
                      <th className="py-3 px-4 text-right">Billable Time</th>
                      <th className="py-3 px-4 text-right">Expenses</th>
                      <th className="py-3 px-4 text-right">Invoiced</th>
                      <th className="py-3 px-4 text-right">Paid</th>
                      <th className="py-3 px-4 text-right">Outstanding</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.clientStats.map((client: ClientStats) => (
                      <tr key={client.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{client.name}</td>
                        <td className="py-3 px-4 text-right">
                          ${client.billableAmount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right">${client.expenses.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right">
                          ${client.invoicedAmount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right">${client.paidAmount.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right">
                          ${client.outstandingAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted">
                      <th className="py-3 px-4 text-left">Total</th>
                      <th className="py-3 px-4 text-right">${report.billableAmount.toFixed(2)}</th>
                      <th className="py-3 px-4 text-right">
                        ${report.billableExpenses.toFixed(2)}
                      </th>
                      <th className="py-3 px-4 text-right">${report.invoicedTotal.toFixed(2)}</th>
                      <th className="py-3 px-4 text-right">${report.paidTotal.toFixed(2)}</th>
                      <th className="py-3 px-4 text-right">
                        ${report.outstandingTotal.toFixed(2)}
                      </th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <p className="text-center py-4">No report data available</p>
      )}
    </div>
  );
}
