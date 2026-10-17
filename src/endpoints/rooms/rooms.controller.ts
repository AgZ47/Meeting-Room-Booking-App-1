import { Controller, Get } from '@nestjs/common';
import { RoomsService } from './rooms.service.js';

@Controller('rooms')
export class RoomsController {
    constructor(private roomsService:RoomsService){}

    @Get()
    getAllRooms(){
        return{message: "Fetched all active rooms"}
    }

    @Get(':id/availability')
    getRoomByFilter(){
        return{message: "Fetched filtered rooms"}
    }
}
