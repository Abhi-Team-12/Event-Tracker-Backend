import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  Query,
  UseGuards,
  ParseIntPipe
} from '@nestjs/common';

import { EventsService } from './events.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FilterEventsDto } from './dto/filter-events.dto';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Events')
@Controller('events')
export class EventsController {

  constructor(
    private eventsService: EventsService
  ) {}

  /* ---------------- CREATE EVENT ---------------- */

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() body: CreateEventDto,
    @Req() req
  ) {
    return this.eventsService.create(body, req.user);
  }

  /* ---------------- GET EVENTS ---------------- */

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Query() filter: FilterEventsDto,
    @Req() req
  ) {
    return this.eventsService.findAll(filter, req.user);
  }

  /* ---------------- UPCOMING EVENTS ---------------- */

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get('upcoming')
  upcoming(@Req() req) {
    return this.eventsService.upcomingEvents(req.user);
  }

  /* ---------------- PAST EVENTS ---------------- */

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get('past')
  past(@Req() req) {
    return this.eventsService.pastEvents(req.user);
  }

  /* ---------------- GET SINGLE EVENT (PUBLIC) ---------------- */

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req
  ) {
    // If user is authenticated, we allow them to see it. 
    // If not, we still allow it (public) as per user request.
    return this.eventsService.findOnePublic(id);
  }

  /* ---------------- PUBLIC SHARE EVENT ---------------- */

  @Get('share/:token')
  share(
    @Param('token') token: string
  ) {
    return this.eventsService.shareEvent(token);
  }

  /* ---------------- UPDATE EVENT ---------------- */

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateEventDto,
    @Req() req
  ) {
    return this.eventsService.update(id, body, req.user);
  }

  /* ---------------- DELETE EVENT ---------------- */

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req
  ) {
    return this.eventsService.delete(id, req.user);
  }

  /* ---------------- RESTORE EVENT ---------------- */

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post('restore/:id')
  restore(
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.eventsService.restore(id);
  }

}