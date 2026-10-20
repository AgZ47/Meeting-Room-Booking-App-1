import { Controller, Get, Headers } from '@nestjs/common';
import { RoomsService } from './rooms.service.js';

@Controller('rooms')
export class RoomsController {
    constructor(private roomsService:RoomsService){}

    @Get()
    getAllRooms(@Headers('Authorization') authHeader: string){
        return this.roomsService.getAllRooms(authHeader);
    }

    @Get(':id/availability')
    getRoomByFilter(@Headers('Authorization') authHeader: string){
        return this.roomsService.getRoomByFilter(authHeader);
    }
}
