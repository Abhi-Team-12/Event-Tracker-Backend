import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn
} from 'typeorm';

@Entity('inquiries')
export class Inquiry {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column()
  email: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: 'unread' })
  status: string; // unread, read, replied

  @CreateDateColumn()
  createdAt: Date;

}
