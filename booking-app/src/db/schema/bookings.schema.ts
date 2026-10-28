import { date, index, integer, pgEnum, pgTable, serial, time, timestamp, varchar } from "drizzle-orm/pg-core";
import { roomsTable } from "./rooms.schema.js";
import { usersTable } from "./users.schema.js";

export const statusEnum = pgEnum("status", ["confirmed", "cancelled", "completed"])

export const bookingsTable = pgTable("bookings", {
    id: serial().primaryKey().notNull(),
    room_id: integer().notNull().references(() => roomsTable.id, {onDelete: 'cascade'}),
    user_id: integer().notNull().references(() => usersTable.id, {onDelete: 'cascade'}),
    booking_date: date().notNull().defaultNow(),
    start_time: time().notNull(),
    end_time: time().notNull(),
    purpose: varchar({length: 255}).notNull(),
    status: statusEnum().default("confirmed").notNull(),
    created_at: timestamp({withTimezone: true}).defaultNow().notNull(),
},(table) => [
    index("booking_user_id_idx").on(table.user_id),
    
    index("booking_room_id_idx").on(table.room_id),
    
    index("booking_room_date_idx").on(table.room_id, table.booking_date),
])