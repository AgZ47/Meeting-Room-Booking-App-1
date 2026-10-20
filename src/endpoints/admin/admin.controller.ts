import { Body, Controller, Post, Put, Delete, Get, Headers, Param, Header, ParseIntPipe } from '@nestjs/common';
import { createRoomSchema, updateRoomSchema, type CreateRoomDto } from './dto/create-room.dto.js';
import { AdminService } from './admin.service.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';

@Controller('admin')
export class AdminController {
    constructor(private adminService:AdminService){}

    @Get('bookings')
    async getAllBookings(@Headers('Authorization') authHeader: string){
        return this.adminService.getAllBookings(authHeader);
    }

    @Put('bookings/:id/cancel')
    cancelBooking(@Param('id', ParseIntPipe) bookingId:number, @Headers('Authorization') authHeader: string){
        return this.adminService.cancelBooking(bookingId, authHeader);
    }

    @Put('rooms')
    updateRoom(@Body(new ZodValidationPipe(updateRoomSchema)) updateRoomDto: CreateRoomDto, @Headers('Authorization') authHeader: string){
        return this.adminService.updateRoom(updateRoomDto, authHeader);
    }

    @Post('rooms')
    addRoom(@Body(new ZodValidationPipe(createRoomSchema)) createRoomDto: CreateRoomDto, @Headers('Authorization') authHeader: string){ 
        return this.adminService.addRoom(createRoomDto, authHeader);
    }

    @Delete('rooms/:id')
    deactivateRoom(@Param('id', ParseIntPipe) roomId: number, @Headers('Authorization') authHeader: string){
        return this.adminService.deactivateRoom(roomId, authHeader);
    }
}
