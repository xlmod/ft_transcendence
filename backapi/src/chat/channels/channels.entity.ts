import { User } from "@/user/user.entity";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Message } from "../messages/messages.entity";
import { bantime, ChannelState } from "../models/status.enums";

@Entity('channels')
export class Channel {
	@PrimaryGeneratedColumn()
	readonly id: number

	@Column({ nullable: true, unique: true, default: null })
	name: string

	@Column('uuid', { array: true, default: [] })
	admin: string[]

	@Column('uuid', { array: true, default: [] })
	mute: string[]

	@Column('json', { array: true, default: [] })
	ban: bantime[]

	@Column({ nullable: false, default: ChannelState.public })
	state: ChannelState

	@Column({ default: null })
	password: string

	@ManyToOne(() => User, (owner: User) => owner.id, { eager: true, onDelete: 'CASCADE' })
	owner?: User

	@ManyToMany(() => User)
	@JoinTable()
	members: User[]

	@OneToMany(() => Message, message => message.channel)
	messages: Message[]

	@CreateDateColumn({ type: 'timestamptz', nullable: false })
	CreatedAt: Date

	@UpdateDateColumn({ type: 'timestamptz', nullable: false })
	UpdatedAt: Date
}