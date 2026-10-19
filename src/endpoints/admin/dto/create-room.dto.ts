import { roomsTable } from "../../../db/index.js";

export type CreateRoomDto = typeof roomsTable.$inferInsert;