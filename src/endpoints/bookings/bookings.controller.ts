import { Controller, Post, Get, Body, Headers, Put, Param, ParseIntPipe } from '@nestjs/common';
import { BookingsService } from './bookings.service.js';
import { roomBookingsSchema, type CreateBookingDto } from './dto/create-booking.dto.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';

@Controller('bookings')
export class BookingsController {
    constructor(private bookingsService:BookingsService){}

    @Put(':id/cancel')
    cancelRoomBooking(@Param('id', ParseIntPipe) bookingId: number, @Headers('Authorization') authHeader: string){
        return this.bookingsService.cancelRoomBooking(authHeader, bookingId);
    }

    @Post()
    bookRoomSlot(@Body( new ZodValidationPipe(roomBookingsSchema)) createBookingDto: CreateBookingDto, @Headers('Authorization') authHeader: string){
        return this.bookingsService.bookRoomSlot(createBookingDto, authHeader);
    }

    @Get('me')
    getAllMyBookings(@Headers('Authorization') authHeader: string){
        return this.bookingsService.getAllMyBookings(authHeader);
    }
}
