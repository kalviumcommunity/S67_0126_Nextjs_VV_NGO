import { z } from "zod";

const baseTaskSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters long"),
  description: z.string().min(5, "Description must be at least 5 characters long"),
  status: z.enum(["open", "assigned", "review", "completed"]).optional(),
  tags: z.array(z.string()).optional(),
  projectId: z.string().min(1, "projectId is required"),
  pipelineId: z.string().optional(),
  assigneeId: z.string().optional(),
});

export const createTaskSchema = baseTaskSchema;

export const updateTaskSchema = baseTaskSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });
