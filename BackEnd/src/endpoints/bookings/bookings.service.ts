import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import type { CreateBookingDto } from './dto/create-booking.dto.js';
import { bookingsTable, roomsTable, usersTable } from '../../db/index.js';
import {and, eq, DrizzleQueryError} from 'drizzle-orm';

@Injectable()
export class BookingsService {
    constructor(private readonly database: DatabaseService){}

    async bookRoomSlot(createBookingDto: CreateBookingDto, userId: number){
        console.log("Booking room...");

        const storeVal = {...createBookingDto, user_id: userId}

        if(storeVal.start_time >= storeVal.end_time){
            throw new BadRequestException("Invalid time range: start_time must be before end_time");
        }

        try{
            const bookingData = await this.database.db.insert(bookingsTable).values(storeVal).returning();
            return{data: bookingData, message: "Successfully booked room slot"};
        }catch(error){
            if ( error instanceof DrizzleQueryError && error.cause && 'code' in error.cause && error.cause.code === '23P01') {
                throw new ConflictException('This room is already booked for the requested time slot');
            }
        }
    }

    async getAllUserBookings(userId: number){
        if(!userId){
            throw new UnauthorizedException("Invalid token");
        }
        
        const bookingsData = await this.database.db
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
        .from(bookingsTable).where(eq(bookingsTable.user_id, userId))
        .innerJoin(usersTable, eq(bookingsTable.user_id, usersTable.id))
        .innerJoin(roomsTable, eq(bookingsTable.room_id, roomsTable.id));

        return { data: bookingsData, message:" Successfully fetched all bookings of the user" };
    }

    async cancelRoomBooking(userId: number, bookingId: number){

        console.log("Canceling booking...");

        if(bookingId === undefined){
            throw new BadRequestException("Booking ID is required to cancel a booking");
        }

        if(!userId){
            throw new UnauthorizedException("Invalid token or missing user ID in token");
        }

        const bookingsData = await this.database.db.update(bookingsTable).set({ status: "cancelled" }).where(and(eq(bookingsTable.id, bookingId), eq(bookingsTable.user_id,userId))).returning();

        if(bookingsData.length === 0){
            throw new NotFoundException("Booking not found or already canceled");
        }

        return { data: bookingsData, message: "Successfully cancelled room booking" };
    }
}
