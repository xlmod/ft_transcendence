import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DeleteResult } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './user.dto';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User) private userRepository: Repository<User>,
	) {}

	async GetUsers(): Promise<User[]> {
		const users: User[] =  await this.userRepository.find({});
		if (!users) {
			throw new NotFoundException('No users found');
		}
		return users;
	}

	async findById(id: string): Promise<User> {
		return await this.userRepository.findOneOrFail({ id });
	}
	async findByEmail(email: string): Promise<User> {
		return await this.userRepository.findOneOrFail({ 
			where: {
				email: email,
			},
		});
	}
	async findByPseudo(pseudo: string): Promise<User> {
		return await this.userRepository.findOne({
			where: {
				pseudo: pseudo,
			},
		});
	}

	//	Create a new user
	async create(data: CreateUserDto): Promise<void> {
		// console.log(data);
		const user = this.userRepository.create(data);
        await this.userRepository.save(data);
	}

	async update(id: string, data: Partial<UpdateUserDto>): Promise<void> {
		let user: User;
		try {
			user = await this.findById(id); }
		catch (error) {
			throw new NotFoundException('User not found')
		}
		if (data.pseudo) {
			const user = await this.findByPseudo(data.pseudo);
			if (user || (user && user.pseudo !== data.pseudo)) {
				throw new ConflictException('Pseudo already exists');
			}
		}
		for (const key in data) {
			if (data[key] !== undefined && key !== 'CreatedAt' && key !== 'UpdatedAt'
										&& key !== 'Ban' && key !== 'Admin') {
				user[key] = data[key];
			}
		}
		user.UpdatedAt = new Date();
		// console.log(user.UpdatedAt.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }));
		await this.userRepository.update(id, user);
	}

	async delete(id: string): Promise<DeleteResult> {
		return await this.userRepository.delete({ id });
	  }

	// TFA
	async setTwoFatorAuthenticationSecret(secret: string, userid: string) {
		return this.userRepository.update(userid, { TwoFactorAuth: secret });
	}
	async turnTwoFactorAuthentication(userId: string, toset: boolean) {
		return this.userRepository.update(userId, { TwoFactorAuthToggle: toset });
	}
}
