import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import type { CreateBookingDto } from './dto/create-booking.dto.js';
import { JwtService } from '@nestjs/jwt';
import { bookingsTable } from '../../db/index.js';
import {eq} from 'drizzle-orm';

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

        if(payload.role === 'admin' || payload.role === 'user'){
            return payload.id;   
        }else{
            throw new ForbiddenException("Unauthorized: Only authorized admin and users can perform this action");
        }
    }

    async bookRoomSlot(createBookingDto: CreateBookingDto, authHeader: string){
        console.log("Booking room...");

        await this.verifyUser(authHeader);

        if(createBookingDto.start_time >= createBookingDto.end_time){
            throw new BadRequestException("Invalid time range: start_time must be before end_time");
        }

        try{

            const bookingData = await this.database.db.insert(bookingsTable).values(createBookingDto).returning();
            
            return{data: bookingData, message: "Successfully booked room slot"};

        }catch(error){
            throw new ConflictException('This room is already booked for the requested time');
        }
    }

    async getAllMyBookings(authHeader: string){

        const id = await this.verifyUser(authHeader);

        if(!id){
            throw new UnauthorizedException("Invalid token");
        }

        const bookingsData = await this.database.db.select().from(bookingsTable).where(eq(bookingsTable.user_id, id));

        return { data: bookingsData, message:" Successfully fetched all bookings of the user" };
    }

    async cancelRoomBooking(){
        
    }
}
