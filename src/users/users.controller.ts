import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    UseGuards,
    Req,
    ParseIntPipe,
    Query
} from '@nestjs/common';

import { UsersService } from './users.service';
import { FilterUsersDto } from './dto/filter-users.dto';
import { FilterActivityDto } from './dto/filter-activity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../common/enums/role.enum';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Post()
    create(@Body() body) {
        return this.usersService.create(body)
    }

    /* ---------------- USER SELF PROFILE ---------------- */
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard)
    @Get('profile/me')
    getProfile(@Req() req) {
        return this.usersService.findProfile(req.user.userId)
    }

    /* ---------------- UPDATE PROFILE ---------------- */
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard)
    @Patch('profile/update')
    updateProfile(@Req() req, @Body() body: any) {
        delete body.email; // User cannot change email from profile update
        return this.usersService.update(req.user.userId, body)
    }

    /* ---------------- 2FA ---------------- */
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard)
    @Patch('enable-2fa')
    enableTwoFactor(@Req() req) {
        return this.usersService.enableTwoFactor(req.user.userId)
    }

    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard)
    @Patch('disable-2fa')
    disableTwoFactor(@Req() req) {
        return this.usersService.disableTwoFactor(req.user.userId)
    }

    /* ---------------- LOGIN ACTIVITY ---------------- */
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard)
    @Get('activity/login')
    async getActivity(@Req() req, @Query() filter: FilterActivityDto) {
        const user = await this.usersService.findProfile(req.user.userId);
        return this.usersService.getLoginLogs(user.email, filter);
    }

    /* ---------------- ADMIN ONLY ---------------- */
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Get()
    findAll(@Query() filter: FilterUsersDto) {
        return this.usersService.findAll(filter)
    }

    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.findOne(id)
    }

    /* ---------------- ADMIN UPDATE USER ---------------- */
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() body) {
        return this.usersService.update(id, body)
    }

    /* ---------------- DELETE ---------------- */
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Delete(':id')
    delete(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.delete(id)
    }

}