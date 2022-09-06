import { User } from "@/user/user.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('match')
export class Match extends BaseEntity {
	@PrimaryGeneratedColumn()
	readonly id: string

	@ManyToOne(() => User, (user: User) => user.id, { eager: true, onDelete: 'CASCADE' })
	luser: User

	@Column({})
	lscore: number

	@ManyToOne(() => User, (user: User) => user.id, { eager: true, onDelete: 'CASCADE' })
	ruser: User
	
	@Column({})
	rscore: number

	@Column({})
	leftwin: boolean

	@CreateDateColumn({ type: 'timestamptz', nullable: false })
	readonly CreatedAt: Date
}