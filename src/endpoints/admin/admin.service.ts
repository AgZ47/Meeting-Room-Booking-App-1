import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import type { CreateRoomDto } from './dto/create-room.dto.js';
import { roomsTable } from '../../db/index.js';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';

@Injectable()
export class AdminService {
    constructor(private readonly database: DatabaseService, private readonly jwtService: JwtService){}

    async addRoom(createRoomDto: CreateRoomDto, authHeader: string){
        try{
            console.log("Adding room...");

            const result = await this.jwtService.verifyAsync(authHeader);

            if(result.role !== 'admin'){
                throw new UnauthorizedException("Unauthorized: Only admin can add rooms");
            }

            const roomData = await this.database.db.insert(roomsTable).values(createRoomDto).returning();

            return {roomData: roomData, message: "Room added successfully"};
        }catch(error){
            throw new UnauthorizedException("Failed to add room");
        }
    }

    async updateRoom(updateRoomDto: CreateRoomDto, authHeader: string){
        try{
            console.log("Updating room...");

            const result = await this.jwtService.verifyAsync(authHeader);

            if(result.role !== 'admin'){
                throw new UnauthorizedException("Unauthorized: Only admin can update rooms");
            }

            const {id, ...updateData} = updateRoomDto;

            if(id === undefined){
                throw new UnauthorizedException("Room ID is required for updating");
            }

            const roomData = await this.database.db.update(roomsTable).set(updateData).where(eq(roomsTable.id, id)).returning();

            if(roomData.length === 0){
                throw new UnauthorizedException("Room not found or no changes made");
            }

            return {roomData: roomData, message: "Room updated successfully"};
        }catch(error){
            throw new UnauthorizedException(error || "Failed to update room");
        }
    }

    async deleteRoom(deleteRoomDto: CreateRoomDto, authHeader: string){
        try{
            console.log("Deleting room...");

            const result = await this.jwtService.verifyAsync(authHeader);
            
            if(result.role !== 'admin'){
                throw new UnauthorizedException("Unauthorized: Only admin can delete rooms");
            }

            if(deleteRoomDto.id === undefined){
                throw new UnauthorizedException("Room ID is required for deletion");
            }

            const dbresponse = await this.database.db.delete(roomsTable).where(eq(roomsTable.id, deleteRoomDto.id)).returning();
        }catch(error){
            throw new UnauthorizedException("Failed to delete room");
        }
    }
}
