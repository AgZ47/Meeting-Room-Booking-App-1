import { Module } from '@nestjs/common';
import { AdminService } from './admin.service.js';
import { DatabaseService } from '../../database/database.service.js';
import { AdminController } from './admin.controller.js';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '15m',
      },
    }),
  ],
  controllers:[AdminController],
  providers: [AdminService, DatabaseService]
})
export class AdminModule {}
