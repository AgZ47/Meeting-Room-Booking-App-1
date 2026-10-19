import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';

@Injectable()
export class BookingsService {
    constructor(private readonly database: DatabaseService){}

    async bookRoomSlot(){

    }

    async getAllMyBookings(){

    }

    async cancelRoomBooking(){
        
    }
}
