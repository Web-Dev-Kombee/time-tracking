"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Clock, Loader2, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Define the schema for the form
const TimeEntrySchema = z.object({
  description: z.string().optional(),
  projectId: z.string({
    required_error: "Please select a project",
  }),
  date: z.string({
    required_error: "Please select a date",
  }),
  startTime: z.string({
    required_error: "Please enter a start time",
  }),
  endTime: z.string().optional(),
  billable: z.boolean(),
});

type TimeEntryFormData = z.infer<typeof TimeEntrySchema>;

interface TimeEntryFormProps {
  userId: string;
  timeEntryId?: string;
  initialData?: TimeEntryFormData;
}

interface Project {
  id: string;
  name: string;
  client: {
    name: string;
  };
}

interface ApiError {
  error: string;
  details?: Record<string, unknown>;
}

export function TimeEntryForm({ userId, timeEntryId, initialData }: TimeEntryFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Fetch projects for the user
  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await fetch("/api/projects");
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      return response.json();
    },
  });

  // Initialize form with default values or existing time entry data
  const form = useForm<TimeEntryFormData>({
    resolver: zodResolver(TimeEntrySchema),
    defaultValues: initialData || {
      description: "",
      projectId: "",
      date: format(new Date(), "yyyy-MM-dd"),
      startTime: format(new Date(), "HH:mm"),
      endTime: "",
      billable: true,
    },
  });

  // If editing and we have a timeEntryId but no initialData, fetch the time entry data
  useEffect(() => {
    const fetchTimeEntry = async () => {
      if (timeEntryId && !initialData) {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/time-entries/${timeEntryId}`);
          if (!response.ok) {
            throw new Error("Failed to fetch time entry");
          }

          const data = await response.json();

          // Format the data for the form
          form.reset({
            description: data.description || "",
            projectId: data.projectId,
            date: format(new Date(data.startTime), "yyyy-MM-dd"),
            startTime: format(new Date(data.startTime), "HH:mm"),
            endTime: data.endTime ? format(new Date(data.endTime), "HH:mm") : "",
            billable: data.billable,
          });
        } catch (error) {
          if (error instanceof Error) {
            toast.error(error.message || "Failed to load time entry");
          } else {
            toast.error("Failed to load time entry");
          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchTimeEntry();
  }, [timeEntryId, initialData, form]);

  // Handle form submission
  const onSubmit = async (data: TimeEntryFormData) => {
    setIsLoading(true);

    try {
      // Combine date and times into proper DateTime format
      const [year, month, day] = data.date.split("-").map(Number);
      const [startHour, startMinute] = data.startTime.split(":").map(Number);

      const startTime = new Date(year, month - 1, day, startHour, startMinute);

      let endTime = null;
      if (data.endTime) {
        const [endHour, endMinute] = data.endTime.split(":").map(Number);
        endTime = new Date(year, month - 1, day, endHour, endMinute);
      }

      const timeEntry = {
        description: data.description,
        projectId: data.projectId,
        startTime,
        endTime,
        billable: data.billable,
        userId,
      };

      // API endpoint and method based on whether we're creating or updating
      const endpoint = timeEntryId ? `/api/time-entries/${timeEntryId}` : "/api/time-entries";

      const method = timeEntryId ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(timeEntry),
      });

      if (!response.ok) {
        const error = (await response.json()) as ApiError;
        throw new Error(error.error || "Failed to save time entry");
      }

      toast.success(
        timeEntryId ? "Time entry updated successfully" : "Time entry created successfully"
      );

      router.push("/dashboard/time");
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || "Something went wrong");
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Start timer immediately for the selected project
  const startProjectTimer = async () => {
    if (!selectedProjectId) {
      toast.error("Please select a project first");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/time-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: selectedProjectId,
          description: form.getValues("description") || "",
          startTime: new Date(),
          billable: form.getValues("billable") ?? true,
          userId,
        }),
      });

      if (!response.ok) {
        const error = (await response.json()) as ApiError;
        throw new Error(error.error || "Failed to start timer");
      }

      toast.success("Timer started successfully");
      router.push("/dashboard/time");
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || "Something went wrong");
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="projectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project</FormLabel>
              <Select
                disabled={isLoading}
                onValueChange={value => {
                  field.onChange(value);
                  setSelectedProjectId(value);
                }}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingProjects ? (
                    <SelectItem value="loading" disabled>
                      Loading projects...
                    </SelectItem>
                  ) : projects && projects.length > 0 ? (
                    projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name} ({project.client.name})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No projects found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="What did you work on?" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} value={field.value || ""} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="billable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Billable</FormLabel>
                <p className="text-sm text-muted-foreground">
                  This time entry will be billed to the client
                </p>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-between items-center pt-2">
          <div>
            {selectedProjectId && !timeEntryId && (
              <Button
                type="button"
                variant="outline"
                onClick={startProjectTimer}
                disabled={isLoading}
                className="mr-2 border-green-200 hover:bg-green-100"
              >
                <Play className="h-4 w-4 mr-2 text-green-500" />
                Start Timer Now
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/time")}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  {timeEntryId ? "Update" : "Save"} Time Entry
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
