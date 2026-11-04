import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import type { userRegisterBody, userLoginBody } from './auth.service.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { registerUserSchema } from './dto/user-register.dto.js';
import { loginUserSchema } from './dto/user-login.dto.js';


@Controller('auth')
export class AuthController {
    constructor(private authService:AuthService){}
    
    @Post('register')
    userRegister(@Body(new ZodValidationPipe(registerUserSchema)) body: userRegisterBody) {
        return this.authService.registerUser(body);
    }

    @Post('login')
    userLogin(@Body(new ZodValidationPipe(loginUserSchema)) body: userLoginBody) {
        return this.authService.loginUser(body);
    }
}
