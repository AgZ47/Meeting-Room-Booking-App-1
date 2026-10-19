import { bookingsTable } from "../../../db/index.js";

export type CreateBookingDto = typeof bookingsTable.$inferInsert;