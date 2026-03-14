import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { AdminModule } from './admin/admin.module';
import { User } from './entities/user.entity';
import { Event } from './entities/event.entity';
import { OTPLog } from './entities/otp-log.entity';
import { LoginLog } from './entities/login-log.entity';
import { Inquiry } from './entities/inquiry.entity';

@Module({
  imports: [
    /* ---------------- ENV ---------------- */
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    /* ---------------- JWT ---------------- */

    JwtModule.register({
      secret: process.env.JWT_SECRET || 'Abhishek7521AS585shbkjnvbgjnv',
      signOptions: {
        expiresIn: '1d',
      },
      global: true,
    }),

    /* ---------------- DATABASE ---------------- */
    TypeOrmModule.forRoot({
      type: 'mysql',

      // host: 'localhost',
      // port: 3306,
      // username: 'root',
      // password: '',
      // database: 'mini_event_tracker',

      host: 'ballast.proxy.rlwy.net',
      port: 24997,
      username: 'root',
      password: 'LVbbOZhdAsgmePdbwtOZYEcAblenUQjw',
      database: 'railway',

      entities: [
        User,
        Event,
        OTPLog,
        LoginLog,
        Inquiry
      ],

      synchronize: false,
      autoLoadEntities: true,

      ssl: {
        rejectUnauthorized: false,
      },

    }),

    /* ---------------- MAILER ---------------- */
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'as78397423@gmail.com',
          pass: 'nfweykklxyckmpef', // Gmail ke liye App Password use karein
        },
        tls: {
          rejectUnauthorized: false
        }
      },

      defaults: {
        from: `"Mini Event Tracker" <as78397423@gmail.com>`,
      }
    }),

    /* ---------------- MODULES ---------------- */
    AuthModule,
    UsersModule,
    EventsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule { }