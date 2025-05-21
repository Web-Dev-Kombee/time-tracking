"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { Bell, X, Check, Clock, AlertTriangle, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuGroup,
 DropdownMenuItem,
 DropdownMenuLabel,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Fetch notifications function
async function fetchNotifications() {
 const res = await fetch("/api/notifications");

 if (!res.ok) {
  throw new Error("Failed to fetch notifications");
 }

 return res.json();
}

// Mark notifications as read function
async function markNotificationsAsRead(notificationIds: string[]) {
 const res = await fetch("/api/notifications", {
  method: "POST",
  headers: {
   "Content-Type": "application/json",
  },
  body: JSON.stringify({
   notificationIds,
   action: "markAsRead",
  }),
 });

 if (!res.ok) {
  throw new Error("Failed to mark notifications as read");
 }

 return res.json();
}

export function NotificationDropdown() {
 const [open, setOpen] = useState(false);

 // Fetch notifications
 const { data, isLoading, error, refetch } = useQuery({
  queryKey: ["notifications"],
  queryFn: fetchNotifications,
  refetchInterval: 60000, // Refetch every minute
 });

 // Mark as read mutation
 const markAsReadMutation = useMutation({
  mutationFn: markNotificationsAsRead,
  onSuccess: () => {
   refetch();
  },
 });

 // Handle mark all as read
 const handleMarkAllAsRead = () => {
  if (data?.notifications && data.notifications.length > 0) {
   const notificationIds = data.notifications.map((notification: any) => notification.id);
   markAsReadMutation.mutate(notificationIds);
  }
 };

 // Get notification icon based on type
 const getNotificationIcon = (type: string) => {
  switch (type) {
   case "overdue_invoice":
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
   case "upcoming_invoice":
    return <Clock className="h-4 w-4 text-amber-500" />;
   case "running_timer":
    return <Clock className="h-4 w-4 text-blue-500" />;
   case "payment_received":
    return <CreditCard className="h-4 w-4 text-green-500" />;
   default:
    return <Bell className="h-4 w-4" />;
  }
 };

 // Get notification route based on type
 const getNotificationRoute = (notification: any) => {
  switch (notification.type) {
   case "overdue_invoice":
   case "upcoming_invoice":
    return `/dashboard/invoices?id=${notification.invoiceId}`;
   case "running_timer":
    return `/dashboard/time?id=${notification.timeEntryId}`;
   case "payment_received":
    return `/dashboard/invoices?id=${notification.invoiceId}`;
   default:
    return "/dashboard";
  }
 };

 // Total notification count
 const notificationCount = data?.counts?.total || 0;

 return (
  <DropdownMenu open={open} onOpenChange={setOpen}>
   <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="sm" className="relative">
     <Bell className="h-5 w-5" />
     {notificationCount > 0 && (
      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
       {notificationCount > 9 ? "9+" : notificationCount}
      </span>
     )}
    </Button>
   </DropdownMenuTrigger>
   <DropdownMenuContent align="end" className="w-[350px]">
    <DropdownMenuLabel className="flex justify-between items-center">
     <span>Notifications</span>
     {notificationCount > 0 && (
      <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
       <Check className="h-4 w-4 mr-1" /> Mark all as read
      </Button>
     )}
    </DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuGroup className="max-h-[400px] overflow-y-auto">
     {isLoading ? (
      <div className="p-4 text-center text-sm text-muted-foreground">Loading notifications...</div>
     ) : error ? (
      <div className="p-4 text-center text-sm text-muted-foreground">
       Failed to load notifications.
      </div>
     ) : data?.notifications && data.notifications.length > 0 ? (
      data.notifications.slice(0, 10).map((notification: any) => (
       <DropdownMenuItem key={notification.id} asChild>
        <Link
         href={getNotificationRoute(notification)}
         className="cursor-pointer flex items-start py-3 px-4 hover:bg-muted"
         onClick={() => markAsReadMutation.mutate([notification.id])}
        >
         <div className="mr-3 mt-0.5">{getNotificationIcon(notification.type)}</div>
         <div className="flex-1">
          <p className="text-sm font-medium">{notification.title}</p>
          <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
          <p className="text-xs text-muted-foreground mt-1">
           {new Date(notification.createdAt).toLocaleString()}
          </p>
         </div>
        </Link>
       </DropdownMenuItem>
      ))
     ) : (
      <div className="p-4 text-center text-sm text-muted-foreground">
       No notifications to display.
      </div>
     )}
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
    <DropdownMenuItem asChild>
     <Link
      href="/dashboard/notifications"
      className="cursor-pointer flex justify-center py-2 hover:bg-muted"
     >
      View all notifications
     </Link>
    </DropdownMenuItem>
   </DropdownMenuContent>
  </DropdownMenu>
 );
}
