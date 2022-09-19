import { User } from "@/user/user.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "../channels/channels.entity";

@Entity('message')
export class Message extends BaseEntity {
	@PrimaryGeneratedColumn()
	readonly id: number

	@Column({ nullable: false })
	message: string

	@ManyToOne(() => User, user => user.id, { eager: true, onDelete: 'CASCADE' })
	user: User

	@ManyToOne(() => Channel, channel => channel.id, { eager: true, onDelete: 'CASCADE' })
	channel: Channel

	@CreateDateColumn({ type: 'timestamptz', nullable: false })
	CreatedAt: Date
}