import { Module } from '@nestjs/common';

import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../entities/user.entity';
import { Inquiry } from '../entities/inquiry.entity';

@Module({

imports:[
TypeOrmModule.forFeature([User, Inquiry])
],

controllers:[AdminController],

providers:[AdminService]

})
export class AdminModule {}