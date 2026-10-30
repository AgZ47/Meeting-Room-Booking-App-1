import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import { roomsTable, roomFacilitiesTable, facilitiesTable } from '../../db/index.js';
import { eq } from 'drizzle-orm';

@Injectable()
export class RoomsService {
    constructor(private readonly database: DatabaseService){}

    async getAllRooms() {
        // 1. Fetch rooms with their nested facilities using the Relational API
        const rawRooms = await this.database.db.query.roomsTable.findMany({
            with: {
                facilities: true, // This leverages your defineRelations setup
            },
        });

        // 2. Format the response for your frontend
        // Relational queries return facilities as objects: [{ id: 1, name: "AC" }, ...]
        // This maps it back to a flat array of strings: ["AC", ...] to match your existing React UI
        const roomData = rawRooms.map(room => ({
            ...room,
            facilities: room.facilities.map(facility => facility.name)
        }));

        return { 
            roomData, 
            message: "Rooms retrieved successfully"
        };
    }

    async getRoomByFilter(status: string){

        if(status !== 'active' && status !== 'inactive'){
            throw new BadRequestException("Invalid status must be either 'active' or 'inactive'");
        }

        const roomData = await this.database.db.select().from(roomsTable).where(eq(roomsTable.is_active, status === 'active' ? true : false));

        if(!roomData){
            throw new NotFoundException("No rooms found for the given filter");
        }

        return {roomData: roomData, message: "Rooms retrieved successfully"};
    }
}
