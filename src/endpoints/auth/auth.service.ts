import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import { usersTable } from '../../db/index.js';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';

export type userRegisterBody = {
    name: string;
    email: string;
    password: string;
    role: "admin" | "user";
}

export type userLoginBody = {
    email: string;
    password_hash: string;
}

@Injectable()
export class AuthService {
    constructor(
        private readonly database: DatabaseService, 
        private readonly jwtService: JwtService
    ){}

    async registerUser(body: userRegisterBody){
        try{
            console.log("Registering user...");

            body.password = await bcrypt.hash(body.password, 10);

            const userData = await this.database.db.insert(usersTable).values({name: body.name, email: body.email, password_hash: body.password, role: body.role}).returning();

            const token = await this.jwtService.signAsync({id: userData[0].id, name: userData[0].name, role: userData[0].role});

            return {usertoken: token, message: "User registered successfully"};
        }catch(error){
            
            throw new UnauthorizedException("Failed to register user");

        }
    }

    async loginUser(body: userLoginBody){
        try{
            console.log("Logging in user...");

            const userData = await this.database.db.select().from(usersTable).where(eq(usersTable.email, body.email));

            if(!userData[0]){
                throw new UnauthorizedException("User not found");
            }

            const isMatch = await bcrypt.compare(body.password_hash, userData[0].password_hash);

            if(!isMatch){
                throw new UnauthorizedException("Invalid credentials");
            }

            const token = await this.jwtService.signAsync({id: userData[0].id, name: userData[0].name, role: userData[0].role});


            return {data: token, message: "User logged in successfully"};
        }catch(error){

            throw new UnauthorizedException("Failed to login user");

        }
    }
}
