import { Body, Controller, Post, Put, Delete, Get, Headers } from '@nestjs/common';
import type { CreateUserDto } from './dto/create-user.dto.js';
import type { CreateRoomDto } from './dto/create-room.dto.js';
import { AdminService } from './admin.service.js';

@Controller('admin')
export class AdminController {
    constructor(private adminService:AdminService){}

    @Get('bookings')
    async getBookings(@Body() createUserDto: CreateUserDto){
        // const result = await this.database.db.insert(usersTable).values(createUserDto)
        // return{data: createUserDto, message: "successfully updated db"}
        
        return{message: "fetched all bookings"}
    }

    @Put('bookings')
    updateBooking(){
        return{message: "Successfully updated booking"}
    }

    @Delete('bookings')
    deleteBooking(){
        return{message: "Successfully deleted booking"}
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
    deleteRoom(@Body() deleteRoomDto: CreateRoomDto, @Headers('Authorization') authHeader: string){
        return this.adminService.deleteRoom(deleteRoomDto, authHeader);
    }
}
