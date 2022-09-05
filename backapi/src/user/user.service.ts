import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DeleteResult } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { LeaderUserDto } from './models/leaderboard.dto';

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
		return await this.userRepository.findOne({ id });
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

	async create(data: CreateUserDto): Promise<void> {
		const user = this.userRepository.create(data);
		user.friends = new Array();
		// user.blocks = new Array();
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

	// Leaderboard
	async ConfigLeaderboard(id: string): Promise<LeaderUserDto[]> {
		const friends = (await this.getfriends(id)).friends.map(curr => { if (id !== curr.id) return curr.id;});
		const leaderboard: LeaderUserDto[] = (await this.userRepository.find({}))
											.filter(user => { if (user.win || !user.lose) return user })
											.sort((a, b) => { return b.elo - a.elo })
											.map(users => {
												let isfriend: boolean = false;
												for(const fid of friends) { if (users.id === fid) isfriend = true; }
												return new LeaderUserDto(users, isfriend)
											});
		return leaderboard;
	}


	//	Relationship
	public async getfriends(uid: string) {
		const friends = this.userRepository.findOne({
			where: {id: uid},
			relations: ["friends"],
		})
		return friends;
	}

	/**
	 * To follow someone:
	 * @version {id_and_pseudo}
	 * @param {string to User} mid  : id of current User
	 * @param {string to User} fid id of User to follow
	 * @returns { User } of friends from current user
	 */
	public async addfriend(mid: string, fid: string): Promise<User> {
		if (mid === fid)
			throw new BadRequestException('Cannot add yourself as friend');
		try {
			const user = await this.getfriends(mid);
			const toadd = await this.findById(fid);
			if (!user || !toadd)
				throw new NotFoundException('User not found');
			if (user.friends.filter(us => us.id === toadd.id).length)
				throw new UnauthorizedException('Already friend with this User');
			if (user.blocks)
				if (user.blocks.filter(id => id === toadd.id).length)
					throw new UnauthorizedException('User blocked, cannot be added as a friend');
			if (!user.friends)
				user.friends = new Array();
			user.friends.push(toadd);
			return await this.userRepository.save(user);
		} catch(e) {
			throw e;
		}
	}

	/**
	 * To unfollow someone
	 * @version {id_and_pseudo}
	 * @param {string [to][User]} mid 
	 * @param {string [to][User]} fid 
	 * @returns {User}
	 */
	public async delfriend(mid: string, fid: string): Promise<User> {
		if (mid === fid)
			throw new BadRequestException('Cannot remove your best friend :)');
		try {
			const user = await this.getfriends(mid);
			const todel = await this.findById(fid);
			if (!user || !todel)
				throw new NotFoundException('User not found');
			if (user.friends) {
				if (!user.friends.filter(us => us.id === todel.id).length)
					throw new UnauthorizedException('User not in your friends list');
				user.friends = user.friends.filter(user => user.id !== fid);
				return (await this.userRepository.save(user));
			}
		} catch(e) {
			throw e;
		}
	}

	public async addpseudo(mid: string, pseudo: string): Promise<User> {
		try {
			const user = await this.getfriends(mid);
			const toadd = await this.findByPseudo(pseudo);
			if (user.pseudo === pseudo)
				throw new BadRequestException('Cannot add yourself as friend');
			if (!user || !toadd)
				throw new NotFoundException('User not found');
			if (user.friends.filter(us => us.id === toadd.id).length)
				throw new UnauthorizedException('Already friend with this User');
			if (user.blocks)
				if (user.blocks.filter(id => id === toadd.id).length)
					throw new UnauthorizedException('User blocked, cannot be added as a friend');
			if (!user.friends)
				user.friends = new Array();
			user.friends.push(toadd);
			return await this.userRepository.save(user);
		} catch(e) {
			throw e;
		}
	}

	public async delpseudo(mid: string, pseudo: string): Promise<User> {
		try {
			const user = await this.getfriends(mid);
			const todel = await this.findByPseudo(pseudo);
			if (user.pseudo === pseudo)
				throw new BadRequestException('Cannot remove your best friend :)');
			if (!user || !todel)
				throw new NotFoundException('User not found');
			if (user.friends) {
				if (!user.friends.filter(us => us.id === todel.id).length)
					throw new UnauthorizedException('User not in your friends list');
				user.friends = user.friends.filter(user => user.pseudo !== pseudo);
				return (await this.userRepository.save(user));
			}
		} catch(e) {
			throw e;
		}
	}

	public async getublock(mid: string) {
		// return (await this.findById(mid)).blocks;
		let ret = new Array();
		const ids = (await this.findById(mid)).blocks;
		for(const id of ids)
			ret.push(await this.findById(id));
		return ret;
	}

	/**
	 * Add to block list id
	 * @param mid 
	 * @param bid 
	 * @remove friend if exists for by:{pseudo, id}
	 * @returns 
	 */
	public async addblockid(mid: string, bid: string) {
		if (mid === bid)
			throw new BadRequestException('Cannot blocked yourself');
		try {
			const user = await this.getfriends(mid);
			const toblock = await this.findById(bid);
			if (!user || !toblock)
				throw new NotFoundException('User not found');
			if (user.friends) {
				if (user.friends.filter(us => us.id === bid).length)
					user.friends = user.friends.filter(user => user.id !== bid);
			}
			if (!user.blocks)
				user.blocks = new Array();
			if (user.blocks.filter(bl => bl === bid).length)
				throw new UnauthorizedException('User already blocked');
			user.blocks.push(toblock.id);
			return (await this.userRepository.save(user));
		} catch(e) {
			throw e;
		}
	}

	public async addblock(mid: string, pseudo: string) {
		try {
			const user = await this.getfriends(mid);
			const toblock = await this.findByPseudo(pseudo);
			if (mid === toblock.id)
				throw new BadRequestException('Cannot blocked yourself');
			if (!user || !toblock)
				throw new NotFoundException('User not found');
			if (user.friends) {
				if (user.friends.filter(us => us.id === toblock.id).length)
					user.friends = user.friends.filter(user => user.id !== toblock.id);
			}
			if (!user.blocks)
				user.blocks = new Array();
			if (user.blocks.filter(bl => bl === toblock.id).length)
				throw new UnauthorizedException('User already blocked');
			user.blocks.push(toblock.id);
			return (await this.userRepository.save(user));
		} catch(e) {
			throw e;
		}
	}

	/**
	 * Remove to block list id
	 * @param mid 
	 * @param bid 
	 * @returns 
	 */
	public async deblockid(mid: string, bid: string) {
		if (mid === bid)
			throw new BadRequestException('Cannot unblocked yourself');
		try {
			const user = await this.getfriends(mid);
			const tounlock = await this.findById(bid);
			if (!user || !tounlock)
				throw new NotFoundException('User not found');
			if (user.blocks) {
				if (!user.blocks.filter(uid => uid === bid).length)
					throw new UnauthorizedException('User not blocked');
				user.blocks = user.blocks.filter(uid => uid !== bid);
				return (await this.userRepository.save(user));
			}
		} catch(e) {
			throw e;
		}
	}

	public async deblock(mid: string, pseudo: string) {
		try {
			const user = await this.getfriends(mid);
			const tounlock = await this.findByPseudo(pseudo);
			if (mid === tounlock.id)
				throw new BadRequestException('Cannot blocked yourself');
			if (!user || !tounlock)
				throw new NotFoundException('User not found');
			if (user.blocks) {
				if (!user.blocks.filter(uid => uid === tounlock.id).length)
					throw new UnauthorizedException('User not blocked');
				user.blocks = user.blocks.filter(uid => uid !== tounlock.id);
				return (await this.userRepository.save(user));
			}
		} catch(e) {
			throw e;
		}
	}
}
