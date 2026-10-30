import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import type { CreateRoomZSchema, CreateRoomDto } from './dto/create-room.dto.js';
import { roomsTable, bookingsTable, usersTable, facilitiesTable, roomFacilitiesTable } from '../../db/index.js';
import { eq, sql, inArray } from 'drizzle-orm';

@Injectable()
export class AdminService {
    constructor(private readonly database: DatabaseService){}

    
    async addRoom(createRoomDto: CreateRoomZSchema) {
        const { facilities, ...roomDetails } = createRoomDto;

        const roomData = await this.database.db.transaction(async (tx) => {

            // Insert room
            const [newRoom] = await tx
                .insert(roomsTable)
                .values(roomDetails)
                .returning();

            if (facilities.length > 0) {

                // Fetch matching facilities
                const matchingFacilities = await tx
                    .select({
                        id: facilitiesTable.id,
                        name: facilitiesTable.name,
                    })
                    .from(facilitiesTable)
                    .where(inArray(facilitiesTable.name, facilities));

                // Check whether every requested facility exists
                if (matchingFacilities.length !== new Set(facilities).size) {
                    throw new NotFoundException(
                        'One or more facilities do not exist'
                    );
                }

                // Insert room-facility mappings
                await tx.insert(roomFacilitiesTable).values(
                    matchingFacilities.map((facility) => ({
                        room_id: newRoom.id,
                        facility_id: facility.id,
                    }))
                );
            }

            return {
                ...newRoom,
                facilities,
            };
        });

        return {
            roomData,
            message: 'Room added successfully',
        };
    }


    async updateRoom(updateRoomDto: CreateRoomDto){
        const {id, ...updateData} = updateRoomDto;

        if(id === undefined){
            throw new UnauthorizedException("Room ID is required for updating");
        }

        const roomData = await this.database.db.update(roomsTable).set(updateData).where(eq(roomsTable.id, id)).returning();

        if(roomData.length === 0){
            throw new NotFoundException("Room not found or no changes made");
        }


        return {roomData: roomData, message: "Room updated successfully"};
    }

    async deactivateRoom(roomId: number){
        if(roomId === undefined){
            throw new UnauthorizedException("Room ID is required for deactivation");
        }
        
        const roomData = await this.database.db.update(roomsTable).set({is_active: sql `NOT ${roomsTable.is_active}`}).where(eq(roomsTable.id, roomId)).returning();

        if(roomData.length === 0){
            throw new NotFoundException("Room not found");
        }

        return {roomData: roomData, message: "Room deactivated successfully"};
    }

    async getAllBookings(){

        const bookingData = await this.database.db
        .select({
            bookingId: bookingsTable.id,
            bookingDate: bookingsTable.booking_date,
            startTime: bookingsTable.start_time,
            endTime: bookingsTable.end_time,
            status: bookingsTable.status,
            purpose: bookingsTable.purpose,
            userName: usersTable.name,
            roomName: roomsTable.name,
        })
        .from(bookingsTable)
        .innerJoin(usersTable, eq(bookingsTable.user_id, usersTable.id))
        .innerJoin(roomsTable, eq(bookingsTable.room_id, roomsTable.id));

        return {bookingData: bookingData, message: "Bookings retrieved successfully"};
    }

    async cancelBooking(bookingId: number){

        const bookingData = await this.database.db.update(bookingsTable).set({status: 'cancelled'}).where(eq(bookingsTable.id, bookingId)).returning();

        if(!bookingData){
            throw new NotFoundException("Booking not found or already cancelled");
        }

        return {bookingData: bookingData, message: "Booking cancelled successfully"};
    }

    async deleteBooking(bookingId: number){

        const bookingData = await this.database.db.delete(bookingsTable).where(eq(bookingsTable.id, bookingId)).returning();

        if(!bookingData){
            throw new NotFoundException("Booking not found or already deleted");
        }

        return {bookingData: bookingData, message: "Booking deleted successfully"};
    }
}
