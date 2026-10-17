import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';

@Injectable()
export class AdminService {
    constructor(private readonly database: DatabaseService){}
}
