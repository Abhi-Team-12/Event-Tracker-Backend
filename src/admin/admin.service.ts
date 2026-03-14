import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { Inquiry } from '../entities/inquiry.entity';
import { CreateInquiryDto } from './dto/create-inquiry.dto';

@Injectable()
export class AdminService {

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Inquiry)
    private inquiryRepo: Repository<Inquiry>,

    private jwtService: JwtService
  ) { }

  async impersonate(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return { token };
  }

  async createInquiry(data: CreateInquiryDto) {
    return this.inquiryRepo.save(data);
  }

  async findAllInquiries() {
    return this.inquiryRepo.find({ order: { createdAt: 'DESC' } });
  }

}