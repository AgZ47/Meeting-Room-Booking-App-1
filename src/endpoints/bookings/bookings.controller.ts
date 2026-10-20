import { Controller, Post, Get, Body, Headers, Put, Param } from '@nestjs/common';
import { BookingsService } from './bookings.service.js';
import type { CreateBookingDto } from './dto/create-booking.dto.js';

@Controller('bookings')
export class BookingsController {
    constructor(private bookingsService:BookingsService){}

    @Put(':id/cancel')
    cancelRoomBooking(@Param('id') bookingId: number, @Headers('Authorization') authHeader: string){
        return this.bookingsService.cancelRoomBooking(authHeader, bookingId);
    }

    @Post()
    bookRoomSlot(@Body() createBookingDto: CreateBookingDto, @Headers('Authorization') authHeader: string){
        return this.bookingsService.bookRoomSlot(createBookingDto, authHeader);
    }

    @Get('me')
    getAllMyBookings(@Headers('Authorization') authHeader: string){
        return this.bookingsService.getAllMyBookings(authHeader);
    }
}
