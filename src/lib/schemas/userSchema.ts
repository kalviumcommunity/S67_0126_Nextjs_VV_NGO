import { z } from "zod";

const baseUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["NGO", "CONTRIBUTOR"]).optional(),
  passwordHash: z.string().min(1, "Password hash is required").optional(),
});

export const createUserSchema = baseUserSchema.extend({
  role: z.enum(["NGO", "CONTRIBUTOR"]).default("CONTRIBUTOR"),
});

export const updateUserSchema = baseUserSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
