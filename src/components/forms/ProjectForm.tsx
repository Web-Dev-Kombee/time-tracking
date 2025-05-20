"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { ProjectStatus } from "@/types";
import { ProjectSchema } from "@/types/schemas";
import { z } from "zod";

type ProjectFormData = z.infer<typeof ProjectSchema>;

interface ProjectFormProps {
  userId: string;
  projectId?: string;
  initialData?: ProjectFormData;
}

export function ProjectForm({
  userId,
  projectId,
  initialData,
}: ProjectFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch clients for the user
  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const response = await fetch("/api/clients");
      if (!response.ok) {
        throw new Error("Failed to fetch clients");
      }
      return response.json();
    },
  });

  // Initialize form with default values or existing project data
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(ProjectSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      clientId: "",
      status: ProjectStatus.ACTIVE,
      hourlyRate: 0,
    },
  });

  // If editing and we have a projectId but no initialData, fetch the project data
  useEffect(() => {
    const fetchProject = async () => {
      if (projectId && !initialData) {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/projects/${projectId}`);
          if (!response.ok) {
            throw new Error("Failed to fetch project");
          }

          const data = await response.json();

          // Format the data for the form
          form.reset({
            name: data.name,
            description: data.description || "",
            clientId: data.clientId,
            status: data.status,
            hourlyRate: data.hourlyRate,
          });
        } catch (error: any) {
          toast.error(error.message || "Failed to load project");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProject();
  }, [projectId, initialData, form]);

  // Handle form submission
  const onSubmit = async (data: ProjectFormData) => {
    setIsLoading(true);

    try {
      const project = {
        name: data.name,
        description: data.description,
        clientId: data.clientId,
        status: data.status,
        hourlyRate: data.hourlyRate,
        createdById: userId,
      };

      // API endpoint and method based on whether we're creating or updating
      const endpoint = projectId
        ? `/api/projects/${projectId}`
        : "/api/projects";

      const method = projectId ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(project),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save project");
      }

      toast.success(
        projectId
          ? "Project updated successfully"
          : "Project created successfully"
      );

      router.push("/dashboard/projects");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter project name"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
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
                <Textarea
                  placeholder="Project description"
                  {...field}
                  value={field.value || ""}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client</FormLabel>
                <Select
                  disabled={isLoading || isLoadingClients}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingClients ? (
                      <SelectItem value="loading" disabled>
                        Loading clients...
                      </SelectItem>
                    ) : clients && clients.length > 0 ? (
                      clients.map((client: any) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No clients found
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
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  disabled={isLoading}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(ProjectStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="hourlyRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hourly Rate ($)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {projectId ? "Update" : "Create"} Project
        </Button>
      </form>
    </Form>
  );
}
