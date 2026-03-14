import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { LoginLog } from '../entities/login-log.entity';
import { FilterUsersDto } from './dto/filter-users.dto';
import { FilterActivityDto } from './dto/filter-activity.dto';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,

        @InjectRepository(LoginLog)
        private loginLogRepo: Repository<LoginLog>
    ) { }

    async create(data: any) {
        const hash = await bcrypt.hash(data.password, 10)
        return this.userRepo.save({
            name: data.name,
            email: data.email,
            password: hash
        })
    }

    async findAll(filter: FilterUsersDto) {
        const { page = 1, limit = 10, search, role } = filter;
        const query = this.userRepo.createQueryBuilder('user')
            .where('user.deletedAt IS NULL');

        if (search) {
            query.andWhere('(user.name LIKE :search OR user.email LIKE :search)', { search: `%${search}%` });
        }

        if (role) {
            query.andWhere('user.role = :role', { role });
        }

        query.orderBy('user.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        const [data, total] = await query.getManyAndCount();
        return { data, total, page, limit };
    }

    async findOne(id: number) {
        const user = await this.userRepo
            .createQueryBuilder('user')
            .where('user.id = :id', { id })
            .andWhere('user.deletedAt IS NULL')
            .getOne()

        if (!user)
            throw new NotFoundException('User not found')

        return user
    }

    async update(id: number, data: any) {
        const user = await this.findOne(id)
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10)
        }
        await this.userRepo.update(id, data)
        return this.findOne(id)
    }

    async enableTwoFactor(id: number) {
        await this.userRepo.update(id, {
            isTwoFactorEnabled: true
        })
        return { message: '2FA enabled' }
    }

    async disableTwoFactor(id: number) {
        await this.userRepo.update(id, {
            isTwoFactorEnabled: false
        })
        return { message: '2FA disabled' }
    }

    async delete(id: number) {
        await this.userRepo.softDelete(id)
        return { message: 'User deleted' }
    }

    async findProfile(userId: number) {
        const user = await this.userRepo
            .createQueryBuilder('user')
            .where('user.id = :id', { id: userId })
            .andWhere('user.deletedAt IS NULL')
            .getOne()

        if (!user)
            throw new NotFoundException('User not found')

        return user
    }

    async getLoginLogs(email: string, filter: FilterActivityDto) {
        const { page = 1, limit = 10, search, status } = filter;
        const query = this.loginLogRepo.createQueryBuilder('log')
            .where('log.email = :email', { email });

        if (search) {
            query.andWhere('log.ip LIKE :search', { search: `%${search}%` });
        }

        if (status) {
            query.andWhere('log.status = :status', { status });
        }

        query.orderBy('log.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        const [data, total] = await query.getManyAndCount();
        return { data, total, page, limit };
    }

}