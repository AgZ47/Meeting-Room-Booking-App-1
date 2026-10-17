import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { DatabaseService } from '../../database/database.service.js';

@Module({
  controllers: [AuthController],
  providers: [AuthService, DatabaseService]
})
export class AuthModule {}
