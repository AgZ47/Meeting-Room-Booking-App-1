import { Controller, Post, Get, Body, Put, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service.js';
import { roomBookingsSchema, type CreateBookingDto } from './dto/create-booking.dto.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { RbacAuthGuard } from '../../common/guards/rbacauth/rbacauth.guard.js';
import { Roles } from '../../common/roles.decorator.js';
import { GetUser } from '../../common/getUser.decorator.js';

@Controller('bookings')
@UseGuards(RbacAuthGuard)
@Roles('user','admin')
export class BookingsController {
    constructor(private bookingsService:BookingsService){}

    @Put(':id/cancel')
    cancelRoomBooking(@Param('id', ParseIntPipe) bookingId: number, @GetUser('id') userId: number){
        return this.bookingsService.cancelRoomBooking(userId, bookingId);
    }

    @Post()
    bookRoomSlot(@Body( new ZodValidationPipe(roomBookingsSchema)) createBookingDto: CreateBookingDto, @GetUser('id') userId: number){
        return this.bookingsService.bookRoomSlot(createBookingDto, userId);
    }

    @Get('me')
    getAllMyBookings(@GetUser('id') userId: number){
        return this.bookingsService.getAllUserBookings(userId);
    }
}
