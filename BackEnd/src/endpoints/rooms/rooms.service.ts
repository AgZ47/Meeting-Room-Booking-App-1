import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import { roomsTable } from '../../db/index.js';
import { eq } from 'drizzle-orm';

@Injectable()
export class RoomsService {
    constructor(private readonly database: DatabaseService){}

    async getAllRooms() {   
        // const roomData = await this.database.db.select().from(roomsTable)
        const roomData = await this.database.db.query.roomsTable.findMany({with: {facilities: true}})

        return { roomData, message: "Rooms retrieved successfully"};
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
