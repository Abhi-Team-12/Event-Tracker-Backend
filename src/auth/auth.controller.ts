import {
  Controller,
  Post,
  Body,
  Req
} from '@nestjs/common'

import { AuthService } from './auth.service'

import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { VerifyOtpDto } from './dto/verify-otp.dto'
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-reset.dto'

@Controller('auth')
export class AuthController {

  constructor(
    private authService: AuthService
  ) { }

  /* REGISTER */

  @Post('register')
  register(@Body() dto: RegisterDto) {

    return this.authService.register(dto)

  }

  /* LOGIN */

  @Post('login')
  login(
    @Body() dto: LoginDto,
    @Req() req
  ) {

    return this.authService.login(dto, req)

  }

  /* VERIFY OTP */

  @Post('verify-otp')
  verifyOTP(
    @Body() dto: VerifyOtpDto,
    @Req() req
  ) {

    return this.authService.verifyOTP(dto, req)

  }

  /* RESEND OTP */
  @Post('resend-otp')
  resendOTP(@Body('email') email: string, @Body('type') type: string) {
    return this.authService.resendOTP(email, type)
  }

  /* FORGOT PASSWORD */
  @Post('forgot-password')
  forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  /* RESET PASSWORD */
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

}