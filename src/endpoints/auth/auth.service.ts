import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private readonly database: DatabaseService){}
}
