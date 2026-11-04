import { z } from 'zod';

export const loginUserSchema = z.object({
  email: z.email().trim().max(255),
  password_hash: z.string().min(6).max(100)
});

export type LoginUserZSchema = z.infer<typeof loginUserSchema>;
