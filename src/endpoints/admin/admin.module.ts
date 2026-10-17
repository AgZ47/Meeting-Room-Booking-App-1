import { Module } from '@nestjs/common';
import { AdminService } from './admin.service.js';
import { DatabaseService } from '../../database/database.service.js';
import { AdminController } from './admin.controller.js';

@Module({
  controllers:[AdminController],
  providers: [AdminService, DatabaseService]
})
export class AdminModule {}
