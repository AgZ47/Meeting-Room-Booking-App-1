import { usersTable } from "../../../db/index.js";

export type CreateUserDto = typeof usersTable.$inferInsert;