import { Controller, Post, Get, Delete } from '@nestjs/common';
import { BookingsService } from './bookings.service.js';

@Controller('bookings')
export class BookingsController {
    constructor(private bookingsService:BookingsService){}

    @Post()
    bookRoomSlot(){
        return{message: "Successfully booked room slot"}
    }

    @Get('me')
    getAllMyBookings(){
        return{message: "Successfully fetched all bookings of the user"}
    }

    @Delete(':id/cancel')
    cancelRoomBooking(){
        return{message: "Successfully cancelled user room booking"}
    }
}
