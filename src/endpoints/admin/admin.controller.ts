import { Body, Controller, Post, Put, Delete, Get, Headers, Param, Header } from '@nestjs/common';
import type { CreateRoomDto } from './dto/create-room.dto.js';
import { AdminService } from './admin.service.js';

@Controller('admin')
export class AdminController {
    constructor(private adminService:AdminService){}

    @Get('bookings')
    async getAllBookings(@Headers('Authorization') authHeader: string){
        return this.adminService.getAllBookings(authHeader);
    }

    @Put('bookings/:id/cancel')
    cancelBooking(@Param('id') bookingId:number, @Headers('Authorization') authHeader: string){
        return this.adminService.cancelBooking(bookingId, authHeader);
    }

    @Put('rooms')
    updateRoom(@Body() updateRoomDto: CreateRoomDto, @Headers('Authorization') authHeader: string){
        return this.adminService.updateRoom(updateRoomDto, authHeader);
    }

    @Post('rooms')
    addRoom(@Body() createRoomDto: CreateRoomDto, @Headers('Authorization') authHeader: string){ 
        return this.adminService.addRoom(createRoomDto, authHeader);
    }

    @Delete('rooms')
    deactivateRoom(@Body() deleteRoomDto: CreateRoomDto, @Headers('Authorization') authHeader: string){
        return this.adminService.deactivateRoom(deleteRoomDto, authHeader);
    }
}
