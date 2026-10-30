import { sql, defineRelations } from "drizzle-orm";
import { boolean, integer, pgTable, serial, varchar, check, primaryKey } from "drizzle-orm/pg-core";

// 1. The original Rooms table (minus the facilities array)
export const roomsTable = pgTable("rooms", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    capacity: integer("capacity").notNull(),
    floor: integer("floor").notNull(),
    is_active: boolean("is_active").notNull().default(true),
}, (table) => [
    check('rooms_capacity_positive', sql`${table.capacity} > 0`)
]);

// 2. The new standalone Facilities table
export const facilitiesTable = pgTable("facilities", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull().unique(), // Unique ensures no duplicate facility names
});

// 3. The Many-to-Many Join Table
export const roomFacilitiesTable = pgTable("room_facilities", {
    room_id: integer("room_id")
        .notNull()
        .references(() => roomsTable.id, { onDelete: "cascade" }), // Cascade deletes the link if the room is deleted
    facility_id: integer("facility_id")
        .notNull()
        .references(() => facilitiesTable.id, { onDelete: "cascade" }), // Cascade deletes the link if the facility is deleted
}, (table) => [
    // Composite primary key prevents assigning the same facility to the same room twice
    primaryKey({ columns: [table.room_id, table.facility_id] })
]);

export const schemaRelations = defineRelations(
  { roomsTable, facilitiesTable, roomFacilitiesTable }, 
  (r) => ({
    
    // 1. Explicit mappings for the join table
    roomFacilitiesTable: {
      room: r.one.roomsTable({
        from: r.roomFacilitiesTable.room_id,
        to: r.roomsTable.id,
      }),
      facility: r.one.facilitiesTable({
        from: r.roomFacilitiesTable.facility_id,
        to: r.facilitiesTable.id,
      }),
    },

    // 2. Direct Many-to-Many for Rooms (bypassing junction in queries)
    roomsTable: {
      facilities: r.many.facilitiesTable({
        // Primary key -> through junction Room FK
        from: r.roomsTable.id.through(r.roomFacilitiesTable.room_id),
        // Target Primary key -> through junction Facility FK
        to: r.facilitiesTable.id.through(r.roomFacilitiesTable.facility_id)
      })
    },

    // 3. Direct Many-to-Many for Facilities (bypassing junction in queries)
    facilitiesTable: {
      rooms: r.many.roomsTable({
        // Primary key -> through junction Facility FK
        from: r.facilitiesTable.id.through(r.roomFacilitiesTable.facility_id),
        // Target Primary key -> through junction Room FK
        to: r.roomsTable.id.through(r.roomFacilitiesTable.room_id)
      })
    }
  })
);