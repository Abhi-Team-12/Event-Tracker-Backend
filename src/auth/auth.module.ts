import { Module } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../entities/user.entity';
import { OTPLog } from '../entities/otp-log.entity';
import { LoginLog } from '../entities/login-log.entity';

import { JwtStrategy } from './strategies/jwt.strategy';

@Module({

imports:[
TypeOrmModule.forFeature([
User,
OTPLog,
LoginLog
]),
],

controllers:[AuthController],

providers:[
AuthService,
JwtStrategy
],

exports:[AuthService]

})
export class AuthModule {}