import { bookingsTable } from "../../../db/index.js";

export type CreateBookingDto = typeof bookingsTable.$inferInsert;

import { z } from 'zod';

export const roomBookingsSchema = z.object({
    room_id: z.number().int().positive(),
    user_id: z.number().int().positive(),
    booking_date: z.date().optional(),
    start_time: z.iso.time({precision: 0}),
    end_time: z.iso.time({precision: 0}),
    purpose: z.string().trim().min(1).max(255),
    status: z.enum(['confirmed', 'cancelled', 'completed']).default('completed'),
});

export type RoomBookingsZSchema = z.infer<typeof roomBookingsSchema>;
