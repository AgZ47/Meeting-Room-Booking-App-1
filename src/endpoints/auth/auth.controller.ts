import { Controller, Post, Get } from '@nestjs/common';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
    constructor(private authService:AuthService){}
    
    @Post('register')
    userRegister() {
        return{message: "User register page"}
    }

    @Get('login')
    userLogin() {
        return{message: "User login page"}
    }
}
