import { sql, defineRelations } from "drizzle-orm";
import { boolean, integer, pgTable, serial, varchar, check, primaryKey } from "drizzle-orm/pg-core";

// export const facilityEnum = pgEnum("facility", ["TV", "Projector", "Video Conferencing system", "WhiteBoard", "Smart Board", "AC", "Sound Proof", "Coffee Bar", "Accessibility+"])

export const roomsTable = pgTable("rooms", {
        id: serial().primaryKey(),
        name: varchar({length: 100}).notNull(),
        capacity: integer().notNull(),
        floor: integer().notNull(),
        is_active: boolean().notNull().default(true),
    },
    (table) => [
        check('rooms_capacity_positive', sql`${table.capacity} > 0`)
    ],  
)

export const facilitiesTable = pgTable("facilities", {
    id: serial().primaryKey(),
    name: varchar({length:100}).notNull().unique(),
})

export const roomsToFacilitiesTable = pgTable("room_to_facilities", {
    roomId: integer('room_id').notNull().references(() => roomsTable.id, {onDelete: 'cascade'}),
    facilityId: integer('facility_id').notNull().references(() => facilitiesTable.id, {onDelete: 'cascade'}),
},
    (t) => [primaryKey({columns: [t.roomId, t.facilityId]})]
)

export const roomFacilitiesRelation = defineRelations({ roomsTable, facilitiesTable, roomsToFacilitiesTable }, (r) => ({
    roomsTable: {
        facilities: r.many.facilitiesTable({
            from: r.roomsTable.id.through(r.roomsToFacilitiesTable.roomId),
            to: r.facilitiesTable.id.through(r.roomsToFacilitiesTable.facilityId)
        })
    },
    facilitiesTable: {
        rooms: r.many.roomsTable(),
    },
}))