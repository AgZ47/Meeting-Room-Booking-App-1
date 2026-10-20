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

        try{

            const roomData = await this.database.db.insert(roomsTable).values(createRoomDto).returning();

            return {roomData: roomData, message: "Room added successfully"};

        }catch(error){

            throw new UnauthorizedException("Failed to add room");

        }
    }

    async updateRoom(updateRoomDto: CreateRoomDto, authHeader: string){
        
        await this.verifyAdmin(authHeader);

        const {id, ...updateData} = updateRoomDto;

        if(id === undefined){
            throw new UnauthorizedException("Room ID is required for updating");
        }

        let roomData;

        try{

            roomData = await this.database.db.update(roomsTable).set(updateData).where(eq(roomsTable.id, id)).returning();

        }catch(error){

            throw new UnauthorizedException(error || "Failed to update room");

        }

        if(roomData.length === 0){
            throw new NotFoundException("Room not found or no changes made");
        }


        return {roomData: roomData, message: "Room updated successfully"};
    }

    async deactivateRoom(deleteRoomDto: CreateRoomDto, authHeader: string){

        await this.verifyAdmin(authHeader);

        if(deleteRoomDto.id === undefined){
            throw new UnauthorizedException("Room ID is required for deactivation");
        }

        let roomData;

        try{

            roomData = await this.database.db.update(roomsTable).set({is_active: false}).where(eq(roomsTable.id, deleteRoomDto.id)).returning();

        }catch(error){

            throw new UnauthorizedException("Failed to deactivate room");

        }

        if(roomData.length === 0){
            throw new NotFoundException("Room not found");
        }

        return {roomData: roomData, message: "Room deactivated successfully"};
    }

    async getAllBookings(authHeader: string){
        await this.verifyAdmin(authHeader);

        let bookingData;

        try{
            bookingData = await this.database.db.select().from(bookingsTable);
        }catch(error){
            throw new InternalServerErrorException("Failed to retrieve bookings");
        }

        return {bookingData: bookingData, message: "Bookings retrieved successfully"};
    }

    async cancelBooking(bookingId: number, authHeader: string){
        await this.verifyAdmin(authHeader);

        let bookingData;
        
        try{
            bookingData = await this.database.db.update(bookingsTable).set({status: 'cancelled'}).where(and(eq(bookingsTable.id, bookingId), eq(bookingsTable.status, 'confirmed'))).returning();
        }catch(error){
            throw new InternalServerErrorException("Failed to cancel booking");
        }

        if(!bookingData){
            throw new NotFoundException("Booking not found or already cancelled");
        }

        return {bookingData: bookingData, message: "Booking cancelled successfully"};
    }
}
