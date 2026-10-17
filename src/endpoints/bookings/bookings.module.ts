import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller.js';
import { BookingsService } from './bookings.service.js';
import { DatabaseService } from '../../database/database.service.js';

@Module({
  controllers: [BookingsController],
  providers: [BookingsService, DatabaseService]
})
export class BookingsModule {}
