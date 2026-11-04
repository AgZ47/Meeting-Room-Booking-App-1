import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database/database.module.js';
import { AdminModule } from './endpoints/admin/admin.module.js';
import { RoomsModule } from './endpoints/rooms/rooms.module.js';
import { BookingsModule } from './endpoints/bookings/bookings.module.js';
import { AuthModule } from './endpoints/auth/auth.module.js';

@Module({
  imports: [DatabaseModule, AdminModule, RoomsModule, BookingsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
