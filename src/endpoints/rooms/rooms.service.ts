import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import { JwtService } from '@nestjs/jwt';
import { roomsTable } from '../../db/index.js';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class RoomsService {
    constructor(private readonly database: DatabaseService, private readonly jwtService: JwtService){}

    async verifyUser(authHeader: string){
        const [scheme, token] = authHeader?.split(' ') ?? [];

        if(!token || scheme !== 'Bearer'){
            throw new UnauthorizedException("Invalid authorization header");
        }

        let payload: {id?: number, role? : string};
        
        try{
            payload = await this.jwtService.verifyAsync<{id?: number,role?: string}>(token);
        }catch(error){
            throw new UnauthorizedException("Invalid or expired token");
        }

        if(payload.role === 'admin' || payload.role === 'user'){
            return payload.id;   
        }else{
            throw new ForbiddenException("Unauthorized: Only authorized admin and users can perform this action");
        }
    }

    async getAllRooms(authHeader: string){
        await this.verifyUser(authHeader);

        const roomData = await this.database.db.select().from(roomsTable).where(eq(roomsTable.is_active, true));

        return {roomData: roomData, message: "Rooms retrieved successfully"};
    }

    async getRoomByFilter(authHeader: string, roomId: string, status: string){
        await this.verifyUser(authHeader);

        const id = Number(roomId);
        if(!Number.isInteger(id) || id <= 0){
            throw new BadRequestException("Invalid room ID");
        }

        if(status !== 'active' && status !== 'inactive'){
            throw new BadRequestException("Invalid status must be either 'active' or 'inactive'");
        }

        const roomData = await this.database.db.select().from(roomsTable).where(and(eq(roomsTable.is_active, status === 'active' ? true : false), eq(roomsTable.id, parseInt(roomId))));

        if(!roomData){
            throw new NotFoundException("No rooms found for the given filter");
        }

        return {roomData: roomData, message: "Rooms retrieved successfully"};
    }
}
