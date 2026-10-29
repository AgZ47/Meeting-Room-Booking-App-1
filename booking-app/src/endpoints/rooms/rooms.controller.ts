import { Controller, Get, Headers, Param, ParseIntPipe, UseGuards} from '@nestjs/common';
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

    @Get(':status')
    getRoomByFilter(@Param('status') status: string){
        return this.roomsService.getRoomByFilter(status);
    }
}
