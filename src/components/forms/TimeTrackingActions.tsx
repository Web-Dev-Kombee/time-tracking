"use client";

import { Button } from "@/components/ui/button";
import { Play, Square } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface TimeTrackingActionsProps {
  entryId?: string;
  isRunning?: boolean;
  projectId?: string;
}

// Define error types
interface ApiError {
  error: string;
  message?: string;
}

export function TimeTrackingActions({ entryId, isRunning, projectId }: TimeTrackingActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Update elapsed time display
  const updateElapsedTime = (start: Date) => {
    const now = new Date();
    const elapsedMs = now.getTime() - start.getTime();

    const hours = Math.floor(elapsedMs / (1000 * 60 * 60));
    const minutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((elapsedMs % (1000 * 60)) / 1000);

    setElapsedTime(
      `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    );
  };

  // Fetch the currently running time entry
  const fetchCurrentTimer = useCallback(async () => {
    try {
      const response = await fetch("/api/time-entries/current");

      if (!response.ok) {
        if (response.status !== 404) {
          throw new Error("Failed to fetch current timer");
        }
        return;
      }

      const data = await response.json();
      setStartTime(new Date(data.startTime));
      updateElapsedTime(new Date(data.startTime));
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Error fetching timer information");
      } else {
        toast.error("Error fetching timer information");
      }
    }
  }, []);

  // Fetch current timer if one is running
  useEffect(() => {
    if (isRunning) {
      fetchCurrentTimer();
      // Set up interval to update timer display
      const interval = setInterval(() => {
        if (startTime) {
          updateElapsedTime(startTime);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRunning, startTime, fetchCurrentTimer]);

  // Start a new timer or resume an existing one
  const startTimer = async () => {
    setIsLoading(true);

    try {
      let response;

      if (entryId) {
        // Resume from existing entry
        response = await fetch("/api/time-entries/resume", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sourceTimeEntryId: entryId }),
        });
      } else if (projectId) {
        // Start new timer for project
        response = await fetch("/api/time-entries", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId,
            startTime: new Date(),
            userId: "current", // This will be replaced with actual user ID on server
            billable: true,
          }),
        });
      } else {
        toast.error("Missing project or time entry information");
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        const errorData = (await response.json()) as ApiError;
        throw new Error(errorData.error || "Failed to start timer");
      }

      const data = await response.json();
      setStartTime(new Date(data.startTime));
      toast.success("Timer started");

      // Refresh the page to show the running timer
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to start timer");
      } else {
        toast.error("Failed to start timer");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Stop the current timer
  const stopTimer = async () => {
    if (!entryId) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/time-entries/${entryId}/stop`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = (await response.json()) as ApiError;
        throw new Error(errorData.error || "Failed to stop timer");
      }

      toast.success("Timer stopped");
      setStartTime(null);
      setElapsedTime("00:00:00");

      // Refresh the page to update the UI
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to stop timer");
      } else {
        toast.error("Failed to stop timer");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isRunning ? (
        <div className="flex items-center gap-2">
          <div className="font-mono text-sm bg-primary/10 px-2 py-1 rounded">{elapsedTime}</div>
          <Button
            size="sm"
            variant="outline"
            onClick={stopTimer}
            disabled={isLoading}
            className="border-red-200 hover:bg-red-100"
          >
            <Square className="h-4 w-4 mr-2 text-red-500" />
            Stop
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={startTimer}
          disabled={isLoading}
          className="border-green-200 hover:bg-green-100"
        >
          <Play className="h-4 w-4 mr-2 text-green-500" />
          {entryId ? "Resume" : "Start"} Timer
        </Button>
      )}
    </div>
  );
}
