import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import type { CreateRoomDto } from './dto/create-room.dto.js';
import { roomsTable } from '../../db/index.js';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';

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
        try{
            await this.verifyAdmin(authHeader);

            const roomData = await this.database.db.insert(roomsTable).values(createRoomDto).returning();

            return {roomData: roomData, message: "Room added successfully"};
        }catch(error){
            throw new UnauthorizedException("Failed to add room");
        }
    }

    async updateRoom(updateRoomDto: CreateRoomDto, authHeader: string){
        try{
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
        }catch(error){
            throw new UnauthorizedException(error || "Failed to update room");
        }
    }

    async deleteRoom(deleteRoomDto: CreateRoomDto, authHeader: string){
        try{
            await this.verifyAdmin(authHeader);

            if(deleteRoomDto.id === undefined){
                throw new UnauthorizedException("Room ID is required for deletion");
            }

            const roomData = await this.database.db.delete(roomsTable).where(eq(roomsTable.id, deleteRoomDto.id)).returning();

            if(roomData.length === 0){
                throw new NotFoundException("Room not found or already deleted");
            }

            return {roomData: roomData, message: "Room deleted successfully"};

        }catch(error){

            throw new UnauthorizedException("Failed to delete room");

        }
    }
}
