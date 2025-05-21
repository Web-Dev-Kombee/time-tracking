"use client";

import { TimeTrackingActions } from "@/components/forms/TimeTrackingActions";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface CurrentTimeEntryProps {
  initialEntryId?: string;
  initialStartTime?: string;
  initialDescription?: string;
  initialProjectName?: string;
  initialClientName?: string;
}

export function CurrentTimeEntry({
  initialEntryId,
  initialStartTime,
  initialDescription,
  initialProjectName,
  initialClientName,
}: CurrentTimeEntryProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [entryData, setEntryData] = useState({
    id: initialEntryId,
    startTime: initialStartTime ? new Date(initialStartTime) : null,
    description: initialDescription || "No description",
    projectName: initialProjectName || "",
    clientName: initialClientName || "",
  });
  const [hasActiveTimer, setHasActiveTimer] = useState(!!initialEntryId);

  // Fetch current time entry data on component mount if not provided
  useEffect(() => {
    if (!initialEntryId && !isLoading) {
      fetchCurrentTimeEntry();
    }
    // Poll every 60 seconds to stay in sync with server
    const interval = setInterval(() => {
      if (!isLoading) {
        fetchCurrentTimeEntry();
      }
    }, 60000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCurrentTimeEntry = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/time-entries/current");

      if (!response.ok) {
        if (response.status === 404) {
          setHasActiveTimer(false);
          setEntryData({
            id: undefined,
            startTime: null,
            description: "",
            projectName: "",
            clientName: "",
          });
          return;
        }
        throw new Error("Failed to fetch current time entry");
      }

      const data = await response.json();
      setEntryData({
        id: data.id,
        startTime: new Date(data.startTime),
        description: data.description || "No description",
        projectName: data.project.name,
        clientName: data.project.client.name,
      });
      setHasActiveTimer(true);
    } catch (error) {
      console.error("Error fetching current time entry:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasActiveTimer) {
    return null;
  }

  return (
    <Card className="bg-primary/5 border-primary/20 mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2 animate-pulse text-primary" />
            <div className="font-medium">Currently Tracking</div>
          </div>

          {entryData.id && <TimeTrackingActions entryId={entryData.id} isRunning={true} />}
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="font-medium">{entryData.description}</div>
            {entryData.startTime && (
              <div className="text-xs text-muted-foreground">
                Started at {format(entryData.startTime, "h:mm a")}
              </div>
            )}
          </div>

          <div>
            <div className="text-sm font-medium">Project</div>
            <div className="text-sm">{entryData.projectName}</div>
            <div className="text-xs text-muted-foreground">{entryData.clientName}</div>
          </div>

          <div className="flex justify-end items-center">
            <button
              onClick={() => router.push("/dashboard/time")}
              className="text-xs text-primary hover:text-primary/70 transition-colors"
            >
              View all time entries →
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
