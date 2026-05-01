import z from "zod";

export const LogInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(6, "Name must be at least 6 characters long")
    .max(32, "Name must be at most 32 characters long"),
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});
