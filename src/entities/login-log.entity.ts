import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn
} from 'typeorm';

@Entity('login_logs')
export class LoginLog {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  ip: string;

  @Column()
  status: string;

  @CreateDateColumn()
  createdAt: Date;

}