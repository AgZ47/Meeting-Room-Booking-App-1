import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import type { CreateRoomDto } from './dto/create-room.dto.js';
import { roomsTable, bookingsTable, usersTable, facilitiesTable, roomsToFacilitiesTable } from '../../db/index.js';
import { eq, sql, inArray } from 'drizzle-orm';

@Injectable()
export class AdminService {
    constructor(private readonly database: DatabaseService){}

    async addRoom(body: {name: string, capacity: number, floor: number, is_active: boolean, facilities: number[]}){
        return await this.database.db.transaction(async (tx) => {
            // 1. Validate that the supplied facilities exist
            const facilities = body.facilities.length
            ? await tx
                .select({ id: facilitiesTable.id })
                .from(facilitiesTable)
                .where(inArray(facilitiesTable.id, body.facilities))
            : [];

            if (facilities.length !== new Set(body.facilities).size) {
            throw new BadRequestException('One or more facilities do not exist');
            }

            // 2. Insert the room
            const [newRoom] = await tx
            .insert(roomsTable)
            .values({
                name: body.name,
                capacity: body.capacity,
                floor: body.floor,
            })
            .returning();

            // 3. Insert room-facility mappings
            if (body.facilities.length > 0) {
            await tx.insert(roomsToFacilitiesTable).values(
                body.facilities.map((facilityId) => ({
                roomId: newRoom.id,
                facilityId,
                })),
            );
            }

            return newRoom;
        });
    }

    async updateRoom(updateRoomDto: {id: number,name: string, capacity: number, floor: number, is_active: boolean, facilities: number[]}) {
        const { id, facilities, ...updateData } = updateRoomDto;

        if (id === undefined) {
            throw new BadRequestException('Room ID is required for updating');
        }

        return await this.database.db.transaction(async (tx) => {
            // 1. Check whether the room exists
            const [existingRoom] = await tx
            .select()
            .from(roomsTable)
            .where(eq(roomsTable.id, id));

            if (!existingRoom) {
            throw new NotFoundException('Room not found');
            }

            // 2. Validate facilities
            if (facilities !== undefined) {
            const existingFacilities = facilities.length
                ? await tx
                    .select({ id: facilitiesTable.id })
                    .from(facilitiesTable)
                    .where(inArray(facilitiesTable.id, facilities))
                : [];

            if (existingFacilities.length !== new Set(facilities).size) {
                throw new BadRequestException(
                'One or more facilities do not exist',
                );
            }
            }

            // 3. Update room information
            const [roomData] = await tx
            .update(roomsTable)
            .set(updateData)
            .where(eq(roomsTable.id, id))
            .returning();

            // 4. Replace facility mappings only if facilities were supplied
            if (facilities !== undefined) {
            await tx
                .delete(roomsToFacilitiesTable)
                .where(eq(roomsToFacilitiesTable.roomId, id));

            if (facilities.length > 0) {
                await tx.insert(roomsToFacilitiesTable).values(
                facilities.map((facilityId) => ({
                    roomId: id,
                    facilityId,
                })),
                );
            }
            }

            return {
            roomData,
            message: 'Room updated successfully',
            };
        });
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

    async addFacility(facilityData: {name:string}){
        const facility = await this.database.db.insert(facilitiesTable).values(facilityData).returning();

        return {facilityData: facility, message: "Facility added successfully"};
    }

    async getAllFacilities() {
        const facilities = await this.database.db.select().from(facilitiesTable);
        return {facilitiesData: facilities, message: "Facilities retrieved successfully"};
    }

    async deleteFacility(facilityId: number){
        const facilityData = await this.database.db.delete(facilitiesTable).where(eq(facilitiesTable.id, facilityId)).returning();

        if(!facilityData){
            throw new NotFoundException("Facility not found or already deleted");
        }

        return {facilityData: facilityData, message: "Facility deleted successfully"};
    }
}
