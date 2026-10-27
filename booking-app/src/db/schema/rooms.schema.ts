import { sql } from "drizzle-orm";
import { boolean, integer, pgTable, serial, varchar, check, pgEnum } from "drizzle-orm/pg-core";

export const facilityEnum = pgEnum("facility", ["TV", "Projector", "Video Conferencing system", "WhiteBoard", "Smart Board", "AC", "Sound Proof", "Coffee Bar", "Accessibility+"])

export const roomsTable = pgTable("rooms", {
        id: serial().primaryKey(),
        name: varchar({length: 100}).notNull(),
        capacity: integer().notNull(),
        floor: integer().notNull(),
        facilities: facilityEnum().array().notNull().default(["AC"]), 
        is_active: boolean().notNull().default(true),
    },
    (table) => [
        check('rooms_capacity_positive', sql`${table.capacity} > 0`)
    ],  
)