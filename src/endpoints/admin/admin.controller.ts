import { Body, Controller, Post, Put, Delete, Get } from '@nestjs/common';
import type { CreateUserDto } from './dto/create-user.dto.js';
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
    updateRoom(){
        return{message: "Successfully updated room"}
    }

    @Post('rooms')
    addRoom() {
        return{message: "Successfully added room"}
    }

    @Delete('rooms')
    deleteRoom(){
        return{message: "Successfully deleted room"}
    }
}
