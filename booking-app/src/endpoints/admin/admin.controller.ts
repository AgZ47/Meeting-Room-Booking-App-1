import { Body, Controller, Post, Put, Delete, Get, Headers, Param, Header, ParseIntPipe, UseGuards } from '@nestjs/common';
import { createRoomSchema, updateRoomSchema, type CreateRoomDto } from './dto/create-room.dto.js';
import { AdminService } from './admin.service.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { RbacAuthGuard } from '../../common/guards/rbacauth/rbacauth.guard.js';
import { Roles } from '../../common/roles.decorator.js';

@Controller('admin')
@UseGuards(RbacAuthGuard)
@Roles('admin')
export class AdminController {
    constructor(private adminService:AdminService){}

    @Get('bookings')
    async getAllBookings(){
        return this.adminService.getAllBookings();
    }

    @Put('bookings/:id/cancel')
    cancelBooking(@Param('id', ParseIntPipe) bookingId:number){
        return this.adminService.cancelBooking(bookingId);
    }

    @Delete('bookings/:id/delete')
    deleteBooking(@Param('id', ParseIntPipe) bookingId:number){
        return this.adminService.deleteBooking(bookingId);
    }

    @Put('rooms')
    updateRoom(@Body(new ZodValidationPipe(updateRoomSchema)) updateRoomDto: CreateRoomDto){
        return this.adminService.updateRoom(updateRoomDto);
    }

    @Post('rooms')
    addRoom(@Body(new ZodValidationPipe(createRoomSchema)) createRoomDto: CreateRoomDto){ 
        return this.adminService.addRoom(createRoomDto);
    }

    @Delete('rooms/:id')
    deactivateRoom(@Param('id', ParseIntPipe) roomId: number){
        return this.adminService.deactivateRoom(roomId);
    }
}
