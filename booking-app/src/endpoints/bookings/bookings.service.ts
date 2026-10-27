import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import type { CreateBookingDto } from './dto/create-booking.dto.js';
import { JwtService } from '@nestjs/jwt';
import { bookingsTable } from '../../db/index.js';
import {and, eq, DrizzleQueryError} from 'drizzle-orm';

@Injectable()
export class BookingsService {
    constructor(private readonly database: DatabaseService, private readonly jwtService: JwtService){}

    async verifyUser(authHeader: string){
        const [scheme, token] = authHeader?.split(' ') ?? [];

        if(!token || scheme !== 'Bearer'){
            throw new UnauthorizedException("Invalid authorization header");
        }

        let payload: {id?: number, role? : string};
        
        try{
            payload = await this.jwtService.verifyAsync<{role?: string}>(token);
        }catch(error){
            throw new UnauthorizedException("Invalid or expired token");
        }

        if((payload.role === 'admin' || payload.role === 'user') && typeof payload.id === 'number'){
            return payload.id;   
        }else{
            throw new ForbiddenException("Unauthorized: Only authorized admin and users can perform this action");
        }
    }

    async bookRoomSlot(createBookingDto: CreateBookingDto, authHeader: string){
        console.log("Booking room...");

        const id = await this.verifyUser(authHeader);

        const storeVal = {...createBookingDto, user_id: id}

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

    async getAllUserBookings(authHeader: string){

        const id = await this.verifyUser(authHeader);

        if(!id){
            throw new UnauthorizedException("Invalid token");
        }
        
        const bookingsData = await this.database.db.select().from(bookingsTable).where(eq(bookingsTable.user_id, id));

        return { data: bookingsData, message:" Successfully fetched all bookings of the user" };
    }

    async cancelRoomBooking(authHeader: string, bookingId: number){
        const userId = await this.verifyUser(authHeader);

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
