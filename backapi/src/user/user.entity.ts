import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany, BaseEntity } from "typeorm";
import { Channel } from "@/chat/channels/channels.entity";

@Entity('users')
export class User extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	readonly id: string

	@Column({ nullable: false })
	firstName: string

	@Column({ nullable: false })
	lastName: string

	@Column({ nullable: false, unique: true })
	email: string

	@Column({ nullable: true, unique: true })
	pseudo: string

	@Column({ nullable: true, default: null })
	avatar: string

	@Column({ nullable: false, default: 1600 })
	elo: number

	@Column({ nullable: false, default: 0 })
	win: number

	@Column({ nullable: false, default: 0 })
	lose: number

	@Column({ default: false })
	public TwoFactorAuthToggle: boolean

	@Column({ nullable: true, default: null })
	public TwoFactorAuth?: string

	@Column('uuid', { array: true, nullable: true, default: null})
	blocks: string[]

	@ManyToMany(() => User, friend => friend.friends, { onUpdate: "NO ACTION", onDelete: "CASCADE" })
	@JoinTable()
	friends: User[]

	@OneToMany(() => Channel, channel => channel.owner)
	channels: Channel[]

	@CreateDateColumn({ type: 'timestamptz', nullable: false })
	readonly CreatedAt: Date

	@UpdateDateColumn({ type: 'timestamptz', nullable: false })
	UpdatedAt: Date
}
