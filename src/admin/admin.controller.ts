import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards
} from '@nestjs/common';

import { AdminService } from './admin.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('admin')
export class AdminController {

  constructor(private adminService: AdminService) { }

  @Post('impersonate/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  impersonate(@Param('id') id: number) {
    return this.adminService.impersonate(id);
  }

  @Post('inquiry') // Public endpoint for contact form
  submitInquiry(@Body() data: CreateInquiryDto) {
    return this.adminService.createInquiry(data);
  }

  @Get('inquiries') // Admin only
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getInquiries() {
    return this.adminService.findAllInquiries();
  }

}