import { z } from "zod";

const baseProjectSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters long"),
  description: z.string().min(5, "Description must be at least 5 characters long"),
  status: z.enum(["idea", "active", "completed"]),
  tags: z.array(z.string()).optional(),
  ownerId: z.string().min(1, "ownerId is required"),
});

export const createProjectSchema = baseProjectSchema;

export const updateProjectSchema = baseProjectSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });
