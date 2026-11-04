import { pgEnum, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "user"]);

export const usersTable = pgTable("users", {
    id: serial().primaryKey(),
    name: varchar({length: 100}).notNull(),
    email: varchar({length: 255}).notNull().unique(),
    password_hash: varchar({length: 255}).notNull(),
    role: roleEnum().default("user").notNull(),
    created_at: timestamp({withTimezone: true}).defaultNow().notNull(),
});