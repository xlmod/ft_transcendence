import { IsBoolean, IsEmail, IsUUID, IsNotEmpty, IsString, IsNumber, IsDate } from 'class-validator';
import { PartialType, OmitType } from '@nestjs/mapped-types';

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
	win: number;

	@IsNumber()
	lose: number;

	@IsBoolean()
	TwoFactorAuthToggle: boolean;

	@IsString()
	TwoFactorAuth?: string;

	@IsBoolean()
	Ban: boolean;

	@IsBoolean()
	Admin: boolean

	@IsDate()
	CreatedAt: Date

	@IsDate()
	UpdatedAt: Date
}

export class UpdateUserDto extends PartialType(
	OmitType(UserDto, ['id', 'Ban', 'Admin' as const]), 
) {}
