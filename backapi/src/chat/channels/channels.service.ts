import { User } from "@/user/user.entity";
import { UserService } from "@/user/user.service";
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { bantime, ChannelState } from "../models/status.enums";
import { ChannelDto, ChannelUpateDto, CreateChannelDto } from "./channels.dto";
import { Channel } from "./channels.entity";
import * as bcrypt from 'bcrypt';
import { MessageService } from "../messages/messages.service";
import { CreateMsgDto } from "../messages/messages.dto";

@Injectable()
export class ChannelService {
	constructor(
		@InjectRepository(Channel) private channelRepository: Repository<Channel>,
		private messageService: MessageService,
		private userService: UserService,
	) {}

	async getAllChannels() {
		const channels = (await this.channelRepository.find({})).filter(chat => (chat.state !== ChannelState.dm));
		if (!channels)
			throw new NotFoundException('No Channel in db');
		return channels;
	}

	async findById(id: string) {
		return await this.channelRepository.findOne({
			where: {id: id},
		});
	}

	async findByChatName(name: string) {
		return await this.channelRepository.findOne({
			where: {name: name},
		});
	}

	async findByOwner(user: User) {
		return await this.channelRepository.find({
			where: {owner: user},
		});
	}

	async findChannelsByUser(user: User): Promise<ChannelDto[]> {
		const id = user.id;
		const chats = await this.channelRepository
				.createQueryBuilder('channels')
				.leftJoinAndSelect('channels.members', 'users')
				.where('users.id = :id', {id})
				.getMany();
		return chats.sort((a, b) => {return b.UpdatedAt.getTime() - a.UpdatedAt.getTime()}).map(channel => new ChannelDto(channel));
	}

	// async findChatInfoByUser(user: User): Promise<Channel[]> {
	// 	const chats = await this.channelRepository.find({
	// 		relations: ['members'],
	// 		where: { members: user },
	// 	}).catch(() => {return new Array()});
	// 	return chats.sort((a, b) => {return b.UpdatedAt.getTime() - a.UpdatedAt.getTime()});
	// }

	async update(owner: User, chat: Channel, toup: Partial<ChannelUpateDto>) {
		if (!owner || !chat)
			throw new NotFoundException('User or Channel not found');
		if (owner !== chat.owner)
			throw new UnauthorizedException('Only Owner can update this channel');
		if (toup.name) {
			const channel = await this.findByChatName(toup.name);
			if (channel && channel.name !== toup.name)
				throw new BadRequestException('Channel Names already use');
			chat.name = toup.name;
		}
		if (((chat.state === ChannelState.procated || chat.state === ChannelState.protected) ||
		(toup.state && (toup.state === ChannelState.procated || toup.state === ChannelState.protected)))
		&& toup.password) {
			if (toup.password === '' || toup.password === null || toup.password === undefined)
				throw new BadRequestException('Password cannot empty');
			chat.password = toup.password;
		}
		// chat.UpdatedAt = new Date();
		return await this.channelRepository.update(chat.id, chat);
	}

	async create(user: User, channel: CreateChannelDto): Promise<Channel> {
		if (channel.state === ChannelState.protected || channel.state === ChannelState.procated)
			if (channel.password)
				channel.password = await bcrypt.hash(channel.password, 10);
			else
				throw new BadRequestException('Password required for this configuration');
		const chat: Channel = this.channelRepository.create({
			...channel,
			owner: user,
			messages: new Array(),
			members: [user],
		});
		return await this.channelRepository.save(chat);
	}

	async createDMsg(user: User, to: User): Promise<Channel> {
		if (user.blocks.filter(id => id === to.id).length)
			throw new UnauthorizedException('You have bloked this user');
		if (to.blocks.filter(id => id === to.id).length)
			throw new UnauthorizedException('This User has blocked you');
		return await this.channelRepository.save(this.channelRepository.create({
			state: ChannelState.dm,
			messages: new Array(),
			members: [user, to],
		}));
	}

	async joinChannel(toadd: User, chat: Channel, password?: string): Promise<Channel> {
		if (!toadd || !chat)
			throw new NotFoundException('User or Channel not found');
		const there = chat.members.find(curr => curr === toadd);
		if (there && chat.state === ChannelState.dm)
			return chat;
		if (chat.state === ChannelState.protected || chat.state === ChannelState.procated) {
			const isMatch: boolean = await bcrypt.compare(password, chat.password);
			if (!isMatch)
				throw new UnauthorizedException('Wrong password');
		}
		if (there) {
			const isBan: bantime = chat.ban.find(uid => {return (uid.uuid === toadd.id && uid.until.getTime() > Date.now())});
			if (isBan)
				throw new UnauthorizedException(`You were ban until ${isBan.until}`);
			return chat;
		}
		chat.members.push(toadd);
		return await this.channelRepository.save(chat);
	}

	async leaveChannel(toleave: User, chat: Channel) {
		if (!toleave || !chat)
			throw new NotFoundException('User or Channel not found');
		chat.members = chat.members.filter(user => toleave.id !== user.id);
		if (!chat.members) {
			await this.delete(chat.owner, chat);
			return null;
		}
		if (toleave === chat.owner) {
			for (const user of chat.members) {
				const isBan: boolean = (chat.ban && !chat.ban.find(banned => banned.uuid === user.id));
				if (isBan) {
					chat.owner = user;
				}
				if (chat.admin && (!isBan || !chat.ban)) {
					chat.owner = user;
					break ;
				}
			}
			if (chat.owner === toleave) {
				chat.owner = chat.members[0];
				chat.mute = chat.mute.filter(id => id !== chat.members[0].id);
				chat.ban = chat.ban.filter(banned => banned.uuid !== chat.members[0].id);
			}
		}
		if (chat.admin)
			chat.admin = chat.admin.filter(id => id !== toleave.id);
		return await this.channelRepository.save(chat);
	}

	async getAdminList(chat: Channel) {
		let ret = new Array();
		if (chat.admin)
			for (const id of chat.admin)
				ret.push(await this.userService.findById(id));
		return ret;
	}

	async getMuteList(chat: Channel) {
		let ret = new Array();
		if (chat.mute)
			for (const id of chat.mute)
				ret.push(await this.userService.findById(id));
		return ret;
	}

	async getBanList(chat: Channel) {
		let ret = new Array();
		if (chat.ban)
			for (const ban of chat.ban)
				ret.push(await this.userService.findById(ban.uuid));
		return ret;
	}

	async setAdmin(from: User, toadmin: User, chat: Channel) {
		if (!from || !toadmin || !chat)
			throw new NotFoundException('User or Channel not found');
		if (!chat.members.find(user =>  user === toadmin))
			throw new NotFoundException('This user is not there');
		const isAdmin = chat.admin.find(id => id === toadmin.id);
		if (isAdmin)
			throw new BadRequestException('Already Admin');
		if (chat.owner === toadmin)
			throw new BadRequestException('Channel Owner cannot become Admin');
		if (from !== chat.owner || isAdmin !== from.id)
			throw new UnauthorizedException('Only Owner or Admin can assign to admin role');
		chat.admin.push(toadmin.id);
		return await this.channelRepository.save(chat);
		
	}

	async unsetAdmin(from: User, unset: User, chat: Channel) {
		if (!from || !unset || !chat)
			throw new NotFoundException('User or Channel not found');
		if (!chat.members.find(user =>  user === unset))
			throw new NotFoundException('This user is not there');
		const isAdmin = chat.admin.find(id => id === unset.id);
		if (!isAdmin)
			throw new BadRequestException('User not Admin');
		if (chat.owner === unset)
			throw new BadRequestException('Channel Owner cannot become Admin');
		if (from !== chat.owner || isAdmin !== from.id)
			throw new UnauthorizedException('Only Owner or Admin can remove admin role');
		chat.admin = chat.admin.filter(id => id !== unset.id);
		return await this.channelRepository.save(chat);
	}

	// async sendMsg(user: User, chat: Channel, msg: CreateMsgDto) {
		/*
			... I'll do 
		*/
	// }

	async muteUser(from: User, tomute: User, chat: Channel) {
		if (!from || !tomute || !chat)
			throw new NotFoundException('User or Channel not found');
		if (!chat.members.find(user =>  user === tomute))
			throw new NotFoundException('This user is not there');
		if (chat.owner === tomute)
			throw new UnauthorizedException('You cannot mute the owner from his channel');
		if (from !== chat.owner || !chat.admin.find(id => id === from.id))
			throw new UnauthorizedException('Only Owner or Admin can mute');
		if (chat.mute.find(id => id === tomute.id))
			throw new UnauthorizedException('Already muted');
		chat.mute.push(tomute.id);
		return await this.channelRepository.save(chat);
	}

	async unmuteUser(from: User, tofree: User, chat: Channel) {
		if (!from || !tofree || !chat)
			throw new NotFoundException('User or Channel not found');
		if (!chat.members.find(user =>  user === tofree))
			throw new NotFoundException('This user is not there');
		if (!chat.mute.find(id =>  id === tofree.id))
			throw new NotFoundException('This user was not muted');
		if (chat.owner === tofree)
			throw new UnauthorizedException('Impossible action');
		if (from !== chat.owner || !chat.admin.find(id => id === from.id))
			throw new UnauthorizedException('Only Owner or Admin can');
		chat.mute = chat.mute.filter(id => id !== tofree.id);
		return await this.channelRepository.save(chat);
	}

	async banUser(from: User, toban: User, chat: Channel, until: Date) {
		if (!from || !toban || !chat)
			throw new NotFoundException('User or Channel not found');
		if (!chat.members.find(user =>  user === toban))
			throw new NotFoundException('This user is not there');
		if (chat.owner === toban)
			throw new UnauthorizedException('You cannot ban the owner from his channel');
		if (from !== chat.owner || !chat.admin.find(id => id === from.id))
			throw new UnauthorizedException('Only Owner or Admin can ban');
		if (chat.ban.find(ban => ban.uuid === toban.id))
			throw new UnauthorizedException('Already banned');
		const since = new Date;
		chat.ban.push({uuid: toban.id, since: since, until: until } as bantime);
		setTimeout(async () => {
			chat.ban = chat.ban.filter(user => user.uuid !== toban.id);
			await this.channelRepository.save(chat);
		}, (until.getTime() - since.getTime()));
		return await this.channelRepository.save(chat);
	}

	async unbanUser(from: User, unban: User, chat: Channel) {
		if (!from || !unban || !chat)
			throw new NotFoundException('User or Channel not found');
		if (!chat.members.find(user =>  user === unban))
			throw new NotFoundException('This user is not there');
		if (chat.owner === unban)
			throw new UnauthorizedException('Impossible action');
		if (from !== chat.owner || !chat.admin.find(id => id === from.id))
			throw new UnauthorizedException('Only Owner or Admin can');
		if (!chat.ban.find(user =>  user.uuid === unban.id))
			throw new NotFoundException('This user was not ban');
		chat.ban = chat.ban.filter(user => user.uuid !== unban.id);
		return await this.channelRepository.save(chat);
	}

	async delete(user: User, chat: Channel) {
		const owner = await this.channelRepository.find({
			where: { owner: user },
		}).catch(() => {return new Array()});
		if (!owner)
			throw new UnauthorizedException('Only owner can delete channel');
		if (owner.filter(channel => channel.id === chat.id).length)
			this.channelRepository.delete(chat.id);
		return this.findChannelsByUser(user);
	}

	async deleteDMsg(user: User, to: User) {
		const dms = (await this.findChannelsByUser(user))
			.filter(chat => chat.state === ChannelState.dm);
		const todel = dms.find(dm => (dm.members.find(u1 => u1 === user) && dm.members.find(u2 => u2 === to)))
		if (!todel)
			throw new NotFoundException('DM not found');
		this.channelRepository.delete(todel.id);
		return this.findChannelsByUser(user);
	// 	const dm = await this.channelRepository.findOne({
	// 		relations: ['users'],
	// 		where: {
	// 			users: user, to,
	// 			state: ChannelState.dm,
	// 		},
	// 	});  // to test later
	}
}
