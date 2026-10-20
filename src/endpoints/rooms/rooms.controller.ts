import { Controller, Get, Headers, Param, Query } from '@nestjs/common';
import { RoomsService } from './rooms.service.js';

@Controller('rooms')
export class RoomsController {
    constructor(private roomsService:RoomsService){}

    @Get()
    getAllRooms(@Headers('Authorization') authHeader: string){
        return this.roomsService.getAllRooms(authHeader);
    }

    @Get(':id/:status/availability')
    getRoomByFilter(@Headers('Authorization') authHeader: string, @Param('id') roomId: string, @Param('status') status: string, @Query('date') bookingDate: string){
        return this.roomsService.getRoomByFilter(authHeader, roomId, status, bookingDate);
    }
}
