import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import { roomsTable, bookingsTable } from '../../db/index.js';
import { eq, and, lt, notInArray, gt } from 'drizzle-orm';

@Injectable()
export class RoomsService {
    constructor(private readonly database: DatabaseService){}

    async getAllRooms() {   
        // const roomData = await this.database.db.select().from(roomsTable)
        const roomData = await this.database.db.query.roomsTable.findMany({with: {facilities: true}})

        return { roomData, message: "Rooms retrieved successfully"};
    }

    async getRoomsByAvailability(filters: {
            date: string;
            start_time: string;
            end_time: string;
        }) {
        // Validate the requested time range
        if (filters.start_time >= filters.end_time) {
            throw new BadRequestException(
                'End time must be later than start time',
            );
        }

        // Find rooms that have overlapping confirmed bookings
        const overlappingBookings = await this.database.db
            .select({
                room_id: bookingsTable.room_id,
            })
            .from(bookingsTable)
            .where(
                and(
                    eq(bookingsTable.booking_date, filters.date),
                    eq(bookingsTable.status, 'confirmed'),
                    lt(bookingsTable.start_time, filters.end_time),
                    gt(bookingsTable.end_time, filters.start_time),
                ),
            );

        const bookedRoomIds = new Set(
            overlappingBookings.map((booking) => booking.room_id)
        ) 

        const allRooms = await this.database.db.select({room_id: roomsTable.id, room_name: roomsTable.name, room_is_active: roomsTable.is_active}).from(roomsTable)

        const roomData = allRooms.map((room) => ({
            room_id: room.room_id,
            room_name: room.room_name,
            room_is_active: room.room_is_active,
            room_availability: bookedRoomIds.has(room.room_id) ? 'unavailable' : 'available',
        }))

        return {
            roomData,
            message: 'Room availability retrieved successfully',
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
