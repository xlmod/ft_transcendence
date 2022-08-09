import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, CreateDateColumn, UpdateDateColumn } from "typeorm";
import * as crypto from "crypto";

@Entity('users')
export class User {
	@PrimaryGeneratedColumn('uuid')
	readonly id: string

	@Column({ nullable: false, })
	firstName: string

	@Column({ nullable: false,  })
	lastName: string

	@Column({ nullable: false, unique: true })
	email: string

	@Column({ nullable: true, default: null, unique: true })
	pseudo?: string

	@Column({ nullable: true, default: null})
	avatar?: string

	// @Column({ nullable: false, })		// Maybe change  hash to password
	// password: string
	// @BeforeInsert()
	// hashPassword() {
	// 	this.password = crypto.createHmac('sha256', this.password).digest('hex');
	// }

	@Column({nullable: false, default: 0 })
	win: number

	@Column({ nullable: false, default: 0 })
	lose: number

	@Column({ default: false })
	Ban: boolean

	@Column({ default: false })
	Admin: boolean

	@Column({ default: false })
	public TwoFactorAuthToggle: boolean

	@Column({ nullable: true, default: null })
	public TwoFactorAuth?: string

	@CreateDateColumn({ type: 'timestamptz', nullable: false })
	readonly CreatedAt: Date

	@UpdateDateColumn({ type: 'timestamptz', nullable: false })
	UpdatedAt: Date
}
