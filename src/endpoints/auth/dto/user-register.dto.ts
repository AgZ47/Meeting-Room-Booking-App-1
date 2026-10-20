import { z } from 'zod';

export const registerUserSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().trim().max(255),
  password: z.string().min(6).max(100),
  role: z.enum(['user', 'admin']).default('user'),
});

export type RegisterUserZSchema = z.infer<typeof registerUserSchema>;
