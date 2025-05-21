"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
 Form,
 FormControl,
 FormField,
 FormItem,
 FormLabel,
 FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

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

export function TimeEntryForm({ userId, timeEntryId, initialData }: TimeEntryFormProps) {
 const router = useRouter();
 const [isLoading, setIsLoading] = useState(false);
 const [isTracking, setIsTracking] = useState(false);

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
    } catch (error: any) {
     toast.error(error.message || "Failed to load time entry");
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
    const error = await response.json();
    throw new Error(error.error || "Failed to save time entry");
   }

   toast.success(
    timeEntryId ? "Time entry updated successfully" : "Time entry created successfully"
   );

   router.push("/dashboard/time");
   router.refresh();
  } catch (error: any) {
   toast.error(error.message || "Something went wrong");
  } finally {
   setIsLoading(false);
  }
 };

 // Start tracking time (sets start time to now and enables tracking mode)
 const startTracking = () => {
  form.setValue("startTime", format(new Date(), "HH:mm"));
  form.setValue("endTime", "");
  setIsTracking(true);
  toast.info("Time tracking started");
 };

 // Stop tracking time (sets end time to now)
 const stopTracking = () => {
  form.setValue("endTime", format(new Date(), "HH:mm"));
  setIsTracking(false);
  toast.info("Time tracking stopped");
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
        onValueChange={field.onChange}
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

     <div className="flex gap-4">
      <FormField
       control={form.control}
       name="startTime"
       render={({ field }) => (
        <FormItem className="flex-1">
         <FormLabel>Start Time</FormLabel>
         <FormControl>
          <Input type="time" {...field} disabled={isLoading || isTracking} />
         </FormControl>
         <FormMessage />
        </FormItem>
       )}
      />

      <FormField
       control={form.control}
       name="endTime"
       render={({ field }) => (
        <FormItem className="flex-1">
         <FormLabel>End Time</FormLabel>
         <FormControl>
          <Input
           type="time"
           {...field}
           value={field.value || ""}
           disabled={isLoading || isTracking}
          />
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
        <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
       </FormControl>
       <div className="space-y-1 leading-none">
        <FormLabel>Billable</FormLabel>
        <p className="text-sm text-muted-foreground">
         This time entry will be included in invoices
        </p>
       </div>
      </FormItem>
     )}
    />

    <div className="flex flex-col sm:flex-row gap-3">
     {!timeEntryId &&
      (isTracking ? (
       <Button type="button" variant="destructive" onClick={stopTracking} className="gap-2">
        <Clock className="h-4 w-4" />
        Stop Tracking
       </Button>
      ) : (
       <Button type="button" variant="outline" onClick={startTracking} className="gap-2">
        <Clock className="h-4 w-4" />
        Start Tracking
       </Button>
      ))}

     <Button type="submit" disabled={isLoading} className="gap-2">
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {timeEntryId ? "Update" : "Save"} Time Entry
     </Button>
    </div>
   </form>
  </Form>
 );
}
