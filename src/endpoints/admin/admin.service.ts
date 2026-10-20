import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import type { CreateRoomDto } from './dto/create-room.dto.js';
import { roomsTable, bookingsTable } from '../../db/index.js';
import { JwtService } from '@nestjs/jwt';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class AdminService {
    constructor(private readonly database: DatabaseService, private readonly jwtService: JwtService){}

    private async verifyAdmin(authHeader: string){
        const [scheme, token] = authHeader?.split(' ') ?? [];
        
        if(!token || scheme !== 'Bearer'){
            throw new UnauthorizedException("Invalid authorization header");
        }

        let payload: {role? : string};

        try{
            payload = await this.jwtService.verifyAsync<{role?: string}>(token);
        }catch(error){
            throw new UnauthorizedException("Invalid or expired token");
        }

        if(payload.role !== 'admin'){
            throw new ForbiddenException("Unauthorized: Only admin can perform this action");
        }
    }

    async addRoom(createRoomDto: CreateRoomDto, authHeader: string){
        
        await this.verifyAdmin(authHeader);

        const roomData = await this.database.db.insert(roomsTable).values(createRoomDto).returning();

        return {roomData: roomData, message: "Room added successfully"};
    }

    async updateRoom(updateRoomDto: CreateRoomDto, authHeader: string){
        
        await this.verifyAdmin(authHeader);

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

    async deactivateRoom(roomId: number, authHeader: string){

        await this.verifyAdmin(authHeader);

        if(roomId === undefined){
            throw new UnauthorizedException("Room ID is required for deactivation");
        }
        
        const roomData = await this.database.db.update(roomsTable).set({is_active: false}).where(eq(roomsTable.id, roomId)).returning();

        if(roomData.length === 0){
            throw new NotFoundException("Room not found");
        }

        return {roomData: roomData, message: "Room deactivated successfully"};
    }

    async getAllBookings(authHeader: string){
        await this.verifyAdmin(authHeader);

        const bookingData = await this.database.db.select().from(bookingsTable);

        return {bookingData: bookingData, message: "Bookings retrieved successfully"};
    }

    async cancelBooking(bookingId: number, authHeader: string){
        await this.verifyAdmin(authHeader);

        const bookingData = await this.database.db.update(bookingsTable).set({status: 'cancelled'}).where(and(eq(bookingsTable.id, bookingId), eq(bookingsTable.status, 'confirmed'))).returning();

        if(!bookingData){
            throw new NotFoundException("Booking not found or already cancelled");
        }

        return {bookingData: bookingData, message: "Booking cancelled successfully"};
    }
}
