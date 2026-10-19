import { Controller, Post, Get, Body } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import type { userRegisterBody, userLoginBody } from './auth.service.js';


@Controller('auth')
export class AuthController {
    constructor(private authService:AuthService){}
    
    @Post('register')
    userRegister(@Body() body: userRegisterBody) {
        return this.authService.registerUser(body);
    }

    @Get('login')
    userLogin(@Body() body: userLoginBody) {
        return this.authService.loginUser(body);
    }
}
