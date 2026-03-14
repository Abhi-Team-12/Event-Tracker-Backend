import {
  Injectable,
  NotFoundException
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Event } from '../entities/event.entity';

import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FilterEventsDto } from './dto/filter-events.dto';

import { MailerService } from '@nestjs-modules/mailer';

import * as crypto from 'crypto';

@Injectable()
export class EventsService {

  constructor(
    @InjectRepository(Event)
    private eventRepo: Repository<Event>,

    private mailerService: MailerService
  ) {}

  /* ---------------- EMAIL TEMPLATE ---------------- */

  private eventEmailTemplate(
    title: string,
    event: Event,
    message: string
  ) {

    return `
    <div style="font-family:Arial;background:#f4f6f8;padding:30px">

      <div style="max-width:600px;margin:auto;background:#fff;padding:25px;border-radius:8px">

        <h2 style="color:#2c3e50">Mini Event Tracker</h2>

        <p>${message}</p>

        <table style="width:100%;margin-top:15px">

          <tr>
            <td><b>Title:</b></td>
            <td>${event.title}</td>
          </tr>

          <tr>
            <td><b>Date:</b></td>
            <td>${event.eventDate}</td>
          </tr>

          <tr>
            <td><b>Location:</b></td>
            <td>${event.location}</td>
          </tr>

          <tr>
            <td><b>Description:</b></td>
            <td>${event.description}</td>
          </tr>

        </table>

        <p style="margin-top:20px;font-size:13px;color:#777">
          Manage this event from your dashboard.
        </p>

      </div>

    </div>
    `;
  }

  /* ---------------- CREATE EVENT ---------------- */
  // Saves the event and triggers a confirmation email to the user
  async create(data: CreateEventDto, user: any) {

    const shareToken = crypto.randomBytes(16).toString('hex');

    const event = this.eventRepo.create({
      ...data,
      userId: user.userId,
      shareToken
    });

    const savedEvent = await this.eventRepo.save(event);

    await this.mailerService.sendMail({
      to: user.email,
      subject: `Event Created: ${savedEvent.title}`,
      html: this.eventEmailTemplate(
        savedEvent.title,
        savedEvent,
        'Your event has been successfully created.'
      )
    });

    return savedEvent;

  }

  /* ---------------- GET EVENTS ---------------- */

  async findAll(filter: FilterEventsDto, user: any) {

    const { page = 1, limit = 10, search } = filter;

    const query = this.eventRepo
      .createQueryBuilder('event')
      .where('event.userId = :userId', { userId: user.userId })
      .andWhere('event.deletedAt IS NULL');

    if (search) {

      query.andWhere(
        `(event.title LIKE :search OR event.location LIKE :search OR event.description LIKE :search)`,
        { search: `%${search}%` }
      );

    }

    if (filter.status === 'upcoming') {
        query.andWhere('event.eventDate > NOW()');
    } else if (filter.status === 'past') {
        query.andWhere('event.eventDate < NOW()');
    }

    query
      .orderBy('event.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit
    };

  }

  /* ---------------- UPCOMING EVENTS ---------------- */

  async upcomingEvents(user: any) {

    return this.eventRepo
      .createQueryBuilder('event')
      .where('event.userId = :userId', { userId: user.userId })
      .andWhere('event.eventDate > NOW()')
      .andWhere('event.deletedAt IS NULL')
      .orderBy('event.eventDate', 'ASC')
      .getMany();

  }

  /* ---------------- PAST EVENTS ---------------- */

  async pastEvents(user: any) {

    return this.eventRepo
      .createQueryBuilder('event')
      .where('event.userId = :userId', { userId: user.userId })
      .andWhere('event.eventDate < NOW()')
      .andWhere('event.deletedAt IS NULL')
      .orderBy('event.eventDate', 'DESC')
      .getMany();

  }

  /* ---------------- FIND ONE EVENT ---------------- */

  async findOne(id: number, user: any) {

    const event = await this.eventRepo
      .createQueryBuilder('event')
      .where('event.id = :id', { id })
      .andWhere('event.userId = :userId', { userId: user.userId })
      .andWhere('event.deletedAt IS NULL')
      .getOne();

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    /* Auto-fix missing shareToken if needed (just a safety net) */
    if (!event.shareToken) {
        event.shareToken = crypto.randomBytes(16).toString('hex');
        await this.eventRepo.save(event);
    }

    return event;

  }

  /* ---------------- FIND ONE PUBLIC ---------------- */

  async findOnePublic(id: number) {
    const event = await this.eventRepo
      .createQueryBuilder('event')
      .where('event.id = :id', { id })
      .andWhere('event.deletedAt IS NULL')
      .getOne();

    if (!event) {
      throw new NotFoundException('Event not found');
    }
    
    return event;
  }

  /* ---------------- UPDATE EVENT ---------------- */

  async update(id: number, data: UpdateEventDto, user: any) {

    const event = await this.findOne(id, user);

    await this.eventRepo.update(event.id, data);

    const updatedEvent = await this.findOne(event.id, user);

    await this.mailerService.sendMail({
      to: user.email,
      subject: `Event Updated: ${updatedEvent.title}`,
      html: this.eventEmailTemplate(
        updatedEvent.title,
        updatedEvent,
        'Your event has been updated successfully.'
      )
    });

    return updatedEvent;

  }

  /* ---------------- DELETE EVENT ---------------- */

  async delete(id: number, user: any) {

    const event = await this.findOne(id, user);

    await this.eventRepo.softDelete(event.id);

    return {
      message: 'Event deleted successfully'
    };

  }

  /* ---------------- RESTORE EVENT ---------------- */

  async restore(id: number) {

    await this.eventRepo.restore(id);

    return {
      message: 'Event restored successfully'
    };

  }

  /* ---------------- PUBLIC SHARE EVENT ---------------- */

  async shareEvent(token: string) {

    const event = await this.eventRepo
      .createQueryBuilder('event')
      .where('event.shareToken = :token', { token })
      .andWhere('event.deletedAt IS NULL')
      .getOne();

    if (!event) {
      throw new NotFoundException('Shared event not found');
    }

    return event;

  }

}