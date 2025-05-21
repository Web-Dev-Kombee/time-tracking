'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { Bell, Clock, AlertTriangle, CreditCard, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Fetch notifications function
async function fetchNotifications() {
  const res = await fetch('/api/notifications');

  if (!res.ok) {
    throw new Error('Failed to fetch notifications');
  }

  return res.json();
}

// Mark notifications as read function
async function markNotificationsAsRead(notificationIds: string[]) {
  const res = await fetch('/api/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      notificationIds,
      action: 'markAsRead',
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to mark notifications as read');
  }

  return res.json();
}

export default function NotificationsPage() {
  const [selectedTab, setSelectedTab] = useState('all');

  // Fetch notifications
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationsAsRead,
    onSuccess: () => {
      toast.success('Notifications marked as read');
      refetch();
    },
    onError: () => {
      toast.error('Failed to mark notifications as read');
    },
  });

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    if (data?.notifications && data.notifications.length > 0) {
      const notificationIds = data.notifications.map((notification: any) => notification.id);
      markAsReadMutation.mutate(notificationIds);
    }
  };

  // Filter notifications based on selected tab
  const getFilteredNotifications = () => {
    if (!data?.notifications) return [];

    switch (selectedTab) {
      case 'invoice':
        return data.notifications.filter(
          (notification: any) =>
            notification.type === 'overdue_invoice' || notification.type === 'upcoming_invoice'
        );
      case 'timer':
        return data.notifications.filter(
          (notification: any) => notification.type === 'running_timer'
        );
      case 'payment':
        return data.notifications.filter(
          (notification: any) => notification.type === 'payment_received'
        );
      default:
        return data.notifications;
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'overdue_invoice':
        return <AlertTriangle className="h-6 w-6 text-red-500" />;
      case 'upcoming_invoice':
        return <Clock className="h-6 w-6 text-amber-500" />;
      case 'running_timer':
        return <Clock className="h-6 w-6 text-blue-500" />;
      case 'payment_received':
        return <CreditCard className="h-6 w-6 text-green-500" />;
      default:
        return <Bell className="h-6 w-6" />;
    }
  };

  if (error) {
    toast.error('Failed to load notifications');
  }

  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        {data?.notifications && data.notifications.length > 0 && (
          <Button onClick={handleMarkAllAsRead} disabled={markAsReadMutation.isPending}>
            <Check className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">
              All
              {data?.counts?.total > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs rounded-full px-2 py-0.5">
                  {data.counts.total}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="invoice">
              Invoices
              {data?.counts?.overdue + data?.counts?.upcoming > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs rounded-full px-2 py-0.5">
                  {data.counts.overdue + data.counts.upcoming}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="timer">
              Timers
              {data?.counts?.running > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs rounded-full px-2 py-0.5">
                  {data.counts.running}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="payment">
              Payments
              {data?.counts?.payments > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs rounded-full px-2 py-0.5">
                  {data.counts.payments}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>All Notifications</CardTitle>
              <CardDescription>View all your recent notifications</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center py-4">Loading notifications...</p>
              ) : filteredNotifications.length > 0 ? (
                <div className="space-y-4">
                  {filteredNotifications.map((notification: any) => (
                    <div
                      key={notification.id}
                      className="flex items-start p-4 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="mr-4">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1">
                        <h3 className="font-medium">{notification.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsReadMutation.mutate([notification.id])}
                      >
                        <Check className="h-4 w-4" />
                        Mark as read
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4">No notifications to display</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {['invoice', 'timer', 'payment'].map(tab => (
          <TabsContent key={tab} value={tab} className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>
                  {tab === 'invoice'
                    ? 'Invoice Notifications'
                    : tab === 'timer'
                      ? 'Timer Notifications'
                      : 'Payment Notifications'}
                </CardTitle>
                <CardDescription>
                  {tab === 'invoice'
                    ? 'View notifications related to your invoices'
                    : tab === 'timer'
                      ? 'View notifications about running timers'
                      : 'View notifications about recent payments'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-center py-4">Loading notifications...</p>
                ) : filteredNotifications.length > 0 ? (
                  <div className="space-y-4">
                    {filteredNotifications.map((notification: any) => (
                      <div
                        key={notification.id}
                        className="flex items-start p-4 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="mr-4">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1">
                          <h3 className="font-medium">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsReadMutation.mutate([notification.id])}
                        >
                          <Check className="h-4 w-4" />
                          Mark as read
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4">No {tab} notifications to display</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
