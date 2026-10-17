import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller.js';
import { RoomsService } from './rooms.service.js';
import { DatabaseService } from '../../database/database.service.js';

@Module({
  controllers: [RoomsController],
  providers: [RoomsService, DatabaseService]
})
export class RoomsModule {}
