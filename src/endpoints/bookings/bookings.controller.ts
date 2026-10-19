import { Controller, Post, Get, Delete } from '@nestjs/common';
import { BookingsService } from './bookings.service.js';

@Controller('bookings')
export class BookingsController {
    constructor(private bookingsService:BookingsService){}

    @Post()
    bookRoomSlot(){
        return this.bookingsService.bookRoomSlot();
    }

    @Get('me')
    getAllMyBookings(){
        return this.bookingsService.getAllMyBookings();
    }

    @Delete(':id/cancel')
    cancelRoomBooking(){
        return this.bookingsService.cancelRoomBooking();
    }
}
