"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoiceStatus } from "@/types";

// Fetch invoices function
async function fetchInvoices(status?: string) {
 const url = status ? `/api/invoices?status=${status}` : "/api/invoices";
 const res = await fetch(url);

 if (!res.ok) {
  throw new Error("Failed to fetch invoices");
 }

 return res.json();
}

export default function InvoicesPage() {
 const [selectedStatus, setSelectedStatus] = useState<string>("all");

 // Fetch invoices with react-query
 const {
  data: invoices,
  isLoading,
  error,
 } = useQuery({
  queryKey: ["invoices", selectedStatus],
  queryFn: () => fetchInvoices(selectedStatus !== "all" ? selectedStatus : undefined),
 });

 if (error) {
  toast.error("Failed to load invoices");
 }

 const getStatusColor = (status: InvoiceStatus) => {
  switch (status) {
   case InvoiceStatus.PAID:
    return "bg-green-100 text-green-800";
   case InvoiceStatus.OVERDUE:
    return "bg-red-100 text-red-800";
   case InvoiceStatus.SENT:
    return "bg-blue-100 text-blue-800";
   case InvoiceStatus.DRAFT:
    return "bg-gray-100 text-gray-800";
   case InvoiceStatus.CANCELLED:
    return "bg-yellow-100 text-yellow-800";
   default:
    return "bg-gray-100 text-gray-800";
  }
 };

 return (
  <div className="container mx-auto py-6">
   <div className="flex justify-between items-center mb-6">
    <h1 className="text-3xl font-bold">Invoices</h1>
    <Button>
     <Plus className="mr-2 h-4 w-4" />
     New Invoice
    </Button>
   </div>

   <Tabs defaultValue="all" onValueChange={setSelectedStatus}>
    <div className="flex justify-between items-center mb-4">
     <TabsList>
      <TabsTrigger value="all">All</TabsTrigger>
      <TabsTrigger value="DRAFT">Draft</TabsTrigger>
      <TabsTrigger value="SENT">Sent</TabsTrigger>
      <TabsTrigger value="PAID">Paid</TabsTrigger>
      <TabsTrigger value="OVERDUE">Overdue</TabsTrigger>
     </TabsList>

     <Button variant="outline" size="sm">
      <Filter className="mr-2 h-4 w-4" />
      Filter
     </Button>
    </div>

    <TabsContent value="all" className="mt-0">
     <Card>
      <CardHeader>
       <CardTitle>All Invoices</CardTitle>
       <CardDescription>View and manage all your invoices</CardDescription>
      </CardHeader>
      <CardContent>
       {isLoading ? (
        <p>Loading invoices...</p>
       ) : invoices && invoices.length > 0 ? (
        <div className="overflow-x-auto">
         <table className="w-full border-collapse">
          <thead>
           <tr className="bg-muted">
            <th className="py-3 px-4 text-left">Invoice #</th>
            <th className="py-3 px-4 text-left">Client</th>
            <th className="py-3 px-4 text-left">Issue Date</th>
            <th className="py-3 px-4 text-left">Due Date</th>
            <th className="py-3 px-4 text-left">Status</th>
            <th className="py-3 px-4 text-right">Amount</th>
            <th className="py-3 px-4 text-right">Actions</th>
           </tr>
          </thead>
          <tbody>
           {invoices.map((invoice: any) => (
            <tr key={invoice.id} className="border-b hover:bg-muted/50">
             <td className="py-3 px-4">{invoice.invoiceNumber}</td>
             <td className="py-3 px-4">{invoice.client.name}</td>
             <td className="py-3 px-4">{new Date(invoice.issueDate).toLocaleDateString()}</td>
             <td className="py-3 px-4">{new Date(invoice.dueDate).toLocaleDateString()}</td>
             <td className="py-3 px-4">
              <span
               className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(
                invoice.status
               )}`}
              >
               {invoice.status}
              </span>
             </td>
             <td className="py-3 px-4 text-right">${invoice.total.toFixed(2)}</td>
             <td className="py-3 px-4 text-right">
              <Button variant="ghost" size="sm">
               View
              </Button>
             </td>
            </tr>
           ))}
          </tbody>
         </table>
        </div>
       ) : (
        <p className="text-center py-4">No invoices found</p>
       )}
      </CardContent>
     </Card>
    </TabsContent>

    {["DRAFT", "SENT", "PAID", "OVERDUE"].map(status => (
     <TabsContent key={status} value={status} className="mt-0">
      <Card>
       <CardHeader>
        <CardTitle>{status.charAt(0) + status.slice(1).toLowerCase()} Invoices</CardTitle>
        <CardDescription>View and manage your {status.toLowerCase()} invoices</CardDescription>
       </CardHeader>
       <CardContent>
        {isLoading ? (
         <p>Loading invoices...</p>
        ) : invoices && invoices.length > 0 ? (
         <div className="overflow-x-auto">
          <table className="w-full border-collapse">
           <thead>
            <tr className="bg-muted">
             <th className="py-3 px-4 text-left">Invoice #</th>
             <th className="py-3 px-4 text-left">Client</th>
             <th className="py-3 px-4 text-left">Issue Date</th>
             <th className="py-3 px-4 text-left">Due Date</th>
             <th className="py-3 px-4 text-right">Amount</th>
             <th className="py-3 px-4 text-right">Actions</th>
            </tr>
           </thead>
           <tbody>
            {invoices.map((invoice: any) => (
             <tr key={invoice.id} className="border-b hover:bg-muted/50">
              <td className="py-3 px-4">{invoice.invoiceNumber}</td>
              <td className="py-3 px-4">{invoice.client.name}</td>
              <td className="py-3 px-4">{new Date(invoice.issueDate).toLocaleDateString()}</td>
              <td className="py-3 px-4">{new Date(invoice.dueDate).toLocaleDateString()}</td>
              <td className="py-3 px-4 text-right">${invoice.total.toFixed(2)}</td>
              <td className="py-3 px-4 text-right">
               <Button variant="ghost" size="sm">
                View
               </Button>
              </td>
             </tr>
            ))}
           </tbody>
          </table>
         </div>
        ) : (
         <p className="text-center py-4">No {status.toLowerCase()} invoices found</p>
        )}
       </CardContent>
      </Card>
     </TabsContent>
    ))}
   </Tabs>
  </div>
 );
}
