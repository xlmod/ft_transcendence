import { IsBoolean, IsEmail, IsUUID, IsNotEmpty, IsString, IsNumber, IsDate } from 'class-validator';
import { PartialType, OmitType } from '@nestjs/mapped-types';
import { User } from './user.entity';

export class CreateUserDto {
	@IsString()
	firstName: string;

	@IsString()
	lastName: string;

	@IsEmail()
	email: string;

	@IsString()
	pseudo: string

	@IsString()
	avatar?: string
}

export class UserDto {
	@IsUUID()
	id: string;

	@IsString()
	firstName: string;

	@IsString()
	lastName: string;

	@IsEmail()
	email: string;

	@IsString()
	pseudo: string;

	@IsString()
	avatar?: string;

	@IsNumber()
	elo: Number

	@IsNumber()
	win: number;

	@IsNumber()
	lose: number;

	@IsBoolean()
	TwoFactorAuthToggle: boolean;

	@IsString()
	TwoFactorAuth?: string;

	@IsDate()
	CreatedAt: Date

	@IsDate()
	UpdatedAt: Date

	constructor(user: User) {
		this.id = user.id,
		this.pseudo = user.pseudo,
		this.avatar = user.avatar,
		this.TwoFactorAuthToggle = user.TwoFactorAuthToggle
	}
}

export class UpdateUserDto extends PartialType(
	OmitType(UserDto, ['id' as const]), 
) {}
