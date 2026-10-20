import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import { JwtService } from '@nestjs/jwt';
import { roomsTable } from '../../db/index.js';
import { eq } from 'drizzle-orm';

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

    async getAllRooms(authHeader: string){
        await this.verifyUser(authHeader);

        let roomData;

        try{
            roomData = await this.database.db.select().from(roomsTable).where(eq(roomsTable.is_active, true));
        }catch(error){
            throw new UnauthorizedException("Failed to retrieve rooms");
        }

        return {roomData: roomData, message: "Rooms retrieved successfully"};
    }

    async getRoomByFilter(authHeader: string){
        await this.verifyUser(authHeader);
    }
}
