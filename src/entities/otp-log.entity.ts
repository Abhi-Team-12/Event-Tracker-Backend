import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn
} from 'typeorm';

@Entity('otp_logs')
export class OTPLog {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  otp: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: 'login' })
  type: string; // 'login' or 'forgot_password'

  @Column({ nullable: true })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

}