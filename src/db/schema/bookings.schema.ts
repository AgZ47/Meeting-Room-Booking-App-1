import { date, integer, pgEnum, pgTable, serial, time, timestamp, varchar } from "drizzle-orm/pg-core";
import { roomsTable } from "./rooms.schema.js";
import { usersTable } from "./users.schema.js";

export const statusEnum = pgEnum("status", ["confirmed", "cancelled", "completed"])

export const bookingsTable = pgTable("bookings", {
    id: serial().primaryKey(),
    room_id: integer().notNull().references(() => roomsTable.id),
    user_id: integer().notNull().references(() => usersTable.id),
    booking_date: date().notNull(),
    start_time: time().notNull(),
    end_time: time().notNull(),
    purpose: varchar({length: 255}).notNull(),
    status: statusEnum().default("confirmed").notNull(),
    created_at: timestamp({withTimezone: true}).defaultNow().notNull(),
})