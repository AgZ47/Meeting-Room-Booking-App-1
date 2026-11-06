import { Controller, Get, Headers, Param, ParseIntPipe, Query, UseGuards} from '@nestjs/common';
import { RoomsService } from './rooms.service.js';
import { RbacAuthGuard } from '../../common/guards/rbacauth/rbacauth.guard.js';
import { Roles } from '../../common/roles.decorator.js';

@Controller('rooms')
@UseGuards(RbacAuthGuard)
@Roles('user','admin')
export class RoomsController {
    constructor(private roomsService:RoomsService){}

    @Get()
    getAllRooms(){
        return this.roomsService.getAllRooms();
    }

    @Get('/availability')
    getRoomsByAvailability(@Query('date') date: string, @Query('start_time') start_time: string, @Query('end_time') end_time: string){
        return this.roomsService.getRoomsByAvailability({date: date, start_time: start_time, end_time: end_time})
    }
    
    @Get(':status')
    getRoomByFilter(@Param('status') status: string){
        return this.roomsService.getRoomByFilter(status);
    }

}
