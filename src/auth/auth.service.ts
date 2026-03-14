import {
    Injectable,
    UnauthorizedException,
    BadRequestException
} from '@nestjs/common'

import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { MailerService } from '@nestjs-modules/mailer'

import { User } from '../entities/user.entity'
import { OTPLog } from '../entities/otp-log.entity'
import { LoginLog } from '../entities/login-log.entity'

@Injectable()
export class AuthService {

    constructor(

        @InjectRepository(User)
        private userRepo: Repository<User>,

        @InjectRepository(OTPLog)
        private otpRepo: Repository<OTPLog>,

        @InjectRepository(LoginLog)
        private loginLogRepo: Repository<LoginLog>,

        private jwtService: JwtService,
        private mailerService: MailerService

    ) { }

    /* ---------------- REGISTER ---------------- */

    async register(data: any) {

        const exist = await this.userRepo.findOne({
            where: { email: data.email }
        })

        // Simple check to prevent duplicate accounts
        if (exist)
            throw new BadRequestException('Email already exists')

        const hash = await bcrypt.hash(data.password, 10)

        const user = await this.userRepo.save({
            name: data.name,
            email: data.email,
            password: hash
        })

        return {
            message: 'User registered successfully',
            user
        }

    }

    /* ---------------- LOGIN -> SEND OTP ---------------- */

    async login(data: any, req: any) {

        const user = await this.userRepo.findOne({
            where: { email: data.email }
        })

        if (!user)
            throw new UnauthorizedException('User not found')

        const match = await bcrypt.compare(
            data.password,
            user.password
        )

        if (!match)
            throw new UnauthorizedException('Invalid password')

        // If Two-Factor is enabled, we don't login yet. Instead, we send a code.
        if (user.isTwoFactorEnabled) {
            const otp = Math.floor(
                100000 + Math.random() * 900000
            ).toString()

            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + 5);

            await this.otpRepo.save({
                email: user.email,
                otp,
                isVerified: false,
                type: 'login',
                expiresAt
            })

            /* SEND EMAIL */
            await this.mailerService.sendMail({
                to: user.email,
                subject: 'Your One-Time Password (OTP) - Eventify',
                html: `
      <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f6f8;padding:30px">
        <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:8px;padding:30px;border:1px solid #eee">
          <h2 style="color:#6366f1;margin-bottom:10px">Eventify</h2>
          <p style="font-size:16px;color:#555">Hello,</p>
          <p style="font-size:16px;color:#555">Your One-Time Password (OTP) to complete your login is:</p>
          <div style="font-size:32px;letter-spacing:6px;font-weight:bold;text-align:center;padding:20px;margin:25px 0;background:#f8fafc;border:2px dashed #e2e8f0;border-radius:12px;color:#6366f1">
            ${otp}
          </div>
          <p style="font-size:14px;color:#777">This OTP is valid for <b>5 minutes</b>. Please do not share this code with anyone for security reasons.</p>
          <p style="font-size:14px;color:#777">If you did not attempt to log in, please ignore this email.</p>
          <hr style="margin:30px 0;border:none;border-top:1px solid #eee"/>
          <p style="font-size:12px;color:#999;text-align:center">© ${new Date().getFullYear()} Eventify<br/>This is an automated message.</p>
        </div>
      </div>
      `
            })

            await this.loginLogRepo.save({
                email: user.email,
                ip: req.ip,
                status: 'OTP_SENT'
            })

            return {
                message: 'OTP sent to email'
            }
        }

        // Return token immediately if 2FA is disabled
        const token = this.jwtService.sign({
            id: user?.id,
            email: user?.email,
            role: user?.role
        })

        await this.loginLogRepo.save({
            email: user.email,
            ip: req.ip,
            status: 'SUCCESS'
        })

        return {
            message: 'Login successful',
            access_token: token,
            user
        }

    }

    /* ---------------- VERIFY OTP ---------------- */

    async verifyOTP(data: any, req: any) {

        const record = await this.otpRepo.findOne({
            where: {
                email: data.email,
                otp: data.otp,
                isVerified: false,
                type: data.type || 'login'
            },
            order: { createdAt: 'DESC' }
        })

        if (!record) {
            await this.loginLogRepo.save({
                email: data.email,
                ip: req.ip,
                status: 'FAILED_OTP'
            })
            throw new UnauthorizedException('Invalid OTP')
        }

        // Check Expiry
        if (record.expiresAt && new Date() > record.expiresAt) {
            record.otp = null; // Nullify expired OTP
            record.isVerified = true; // Mark as processed
            await this.otpRepo.save(record);
            throw new UnauthorizedException('OTP has expired')
        }

        record.isVerified = true
        record.otp = null; // Nullify used OTP
        await this.otpRepo.save(record)

        const user = await this.userRepo.findOne({
            where: { email: data.email }
        })

        const token = this.jwtService.sign({
            id: user?.id,
            email: user?.email,
            role: user?.role
        })

        await this.loginLogRepo.save({
            email: user.email,
            ip: req.ip,
            status: 'SUCCESS'
        })

        return {
            message: 'Login successful',
            access_token: token,
            user
        }

    }

    /* ---------------- RESEND OTP ---------------- */

    async resendOTP(email: string, type: string = 'login') {

        const user = await this.userRepo.findOne({
            where: { email }
        })

        if (!user)
            throw new UnauthorizedException('User not found')

        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString()

        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 5);

        await this.otpRepo.save({
            email,
            otp,
            isVerified: false,
            type,
            expiresAt
        })

        await this.mailerService.sendMail({
            to: email,
            subject: 'New OTP Requested - Mini Event Tracker',
            html: `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f6f8;padding:30px">

    <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:8px;padding:30px;border:1px solid #eee">

      <h2 style="color:#2c3e50;margin-bottom:10px">
        Mini Event Tracker
      </h2>

      <p style="font-size:16px;color:#555">
        Hello,
      </p>

      <p style="font-size:16px;color:#555">
        A new One-Time Password (OTP) has been generated for your login request.
      </p>

      <div style="
        font-size:32px;
        letter-spacing:6px;
        font-weight:bold;
        text-align:center;
        padding:20px;
        margin:25px 0;
        background:#f1f3f5;
        border-radius:6px;
        color:#2c3e50
      ">
        ${otp}
      </div>

      <p style="font-size:14px;color:#777">
        This OTP is valid for <b>5 minutes</b>. For your security, do not share this code with anyone.
      </p>

      <p style="font-size:14px;color:#777">
        If you did not request a new OTP, please ignore this email or contact our support team immediately.
      </p>

      <hr style="margin:30px 0;border:none;border-top:1px solid #eee"/>

      <p style="font-size:12px;color:#999;text-align:center">
        © ${new Date().getFullYear()} Mini Event Tracker
        <br/>
        This is an automated email. Please do not reply.
      </p>

    </div>

  </div>
  `
        });

        return {
            message: 'OTP resent successfully'
        };
    }

    async forgotPassword(email: string) {
        const user = await this.userRepo.findOne({ where: { email } });
        if (!user) throw new BadRequestException('User with this email does not exist');

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 5);

        await this.otpRepo.save({
            email,
            otp,
            type: 'forgot_password',
            expiresAt,
            isVerified: false
        });

        await this.mailerService.sendMail({
            to: email,
            subject: 'Reset Your Password - Eventify',
            html: `
            <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f6f8;padding:30px">
                <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:8px;padding:30px;border:1px solid #eee">
                    <h2 style="color:#d946ef;margin-bottom:10px">Eventify</h2>
                    <p style="font-size:16px;color:#555">Hello,</p>
                    <p style="font-size:16px;color:#555">We received a request to reset your password. Use the following OTP to proceed:</p>
                    <div style="font-size:32px;letter-spacing:6px;font-weight:bold;text-align:center;padding:20px;margin:25px 0;background:#fdf4ff;border:2px dashed #f5d0fe;border-radius:12px;color:#d946ef">
                        ${otp}
                    </div>
                    <p style="font-size:14px;color:#777">This code is valid for <b>5 minutes</b>.</p>
                    <p style="font-size:14px;color:#777">If you didn't request this, you can safely ignore this email.</p>
                    <hr style="margin:30px 0;border:none;border-top:1px solid #eee"/>
                    <p style="font-size:12px;color:#999;text-align:center">© ${new Date().getFullYear()} Eventify</p>
                </div>
            </div>
            `
        });

        return { message: 'Password reset OTP sent to email' };
    }

    async resetPassword(data: any) {
        const record = await this.otpRepo.findOne({
            where: {
                email: data.email,
                otp: data.otp,
                isVerified: false,
                type: 'forgot_password'
            },
            order: { createdAt: 'DESC' }
        });

        if (!record) throw new BadRequestException('Invalid or used OTP');

        if (record.expiresAt && new Date() > record.expiresAt) {
            record.otp = null;
            record.isVerified = true;
            await this.otpRepo.save(record);
            throw new BadRequestException('OTP has expired');
        }

        const user = await this.userRepo.findOne({ where: { email: data.email } });
        if (!user) throw new BadRequestException('User not found');

        user.password = await bcrypt.hash(data.newPassword, 10);
        await this.userRepo.save(user);

        record.isVerified = true;
        record.otp = null;
        await this.otpRepo.save(record);

        return { message: 'Password reset successful. Please login with your new password.' };
    }
}