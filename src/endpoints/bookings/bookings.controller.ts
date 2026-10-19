import { Controller, Post, Get, Delete, Body, Headers } from '@nestjs/common';
import { BookingsService } from './bookings.service.js';
import type { CreateBookingDto } from './dto/create-booking.dto.js';

@Controller('bookings')
export class BookingsController {
    constructor(private bookingsService:BookingsService){}

    @Post()
    bookRoomSlot(@Body() createBookingDto: CreateBookingDto, @Headers('Authorization') authHeader: string){
        return this.bookingsService.bookRoomSlot(createBookingDto, authHeader);
    }

    @Get('me')
    getAllMyBookings(@Headers('Authorization') authHeader: string){
        return this.bookingsService.getAllMyBookings(authHeader);
    }

    @Delete(':id/cancel')
    cancelRoomBooking(){
        return this.bookingsService.cancelRoomBooking();
    }
}
