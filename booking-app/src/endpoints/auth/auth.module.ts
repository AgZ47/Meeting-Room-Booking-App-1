import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { DatabaseService } from '../../database/database.service.js';
import { JwtModule } from '@nestjs/jwt'; 

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is missing. Check your .env file.');
}

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '1h',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, DatabaseService]
})
export class AuthModule {}
