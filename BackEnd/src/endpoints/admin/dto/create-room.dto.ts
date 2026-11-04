    import { roomsTable } from "../../../db/index.js";

    export type CreateRoomDto = typeof roomsTable.$inferInsert;

    import { z } from 'zod';

    export const createRoomSchema = z.object({
        name: z.string().trim().min(1).max(100),
        capacity: z.number().int().positive(),
        floor: z.number().int().min(0),
        facilities: z.array(z.string().trim().min(1)).default([]),
        is_active: z.boolean().default(true),
    });

    export type CreateRoomZSchema = z.output<typeof createRoomSchema>;

    export const updateRoomSchema = createRoomSchema.partial().extend({
        id: z.number().int().positive(),
    });

    export type UpdateRoomZSchema = z.infer<typeof updateRoomSchema>;
