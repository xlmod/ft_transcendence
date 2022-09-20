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
import { UserDto } from "@/user/user.dto";

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

	async findById(id: number) {
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

	async findChannelsByUser(user: User): Promise<Channel[]> {
		const id = user.id;
		const chats = await this.channelRepository
				.createQueryBuilder('channels')
				.leftJoinAndSelect('channels.members', 'users')
				.where('users.id = :id', {id})
				.getMany();
		return chats.sort((a, b) => {return b.UpdatedAt.getTime() - a.UpdatedAt.getTime()});
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
		const channel = (await this.findChannelsByUser(chat.owner)).find(wllh => wllh.id === chat.id);
		const there = channel.members.find(curr => curr === toadd);
		if (there && channel.state === ChannelState.dm)
			return channel;
		if (channel.state === ChannelState.protected || channel.state === ChannelState.procated) {
			const isMatch: boolean = await bcrypt.compare(password, channel.password);
			if (!isMatch)
				throw new UnauthorizedException('Wrong password');
		}
		if (there) {
			const isBan: bantime = channel.ban.find(uid => {return (uid.uuid === toadd.id && uid.until.getTime() > Date.now())});
			if (isBan)
				throw new UnauthorizedException(`You were ban until ${isBan.until}`);
			return channel;
		}
		channel.members.push(toadd);
		return await this.channelRepository.save(channel);
	}

	async leaveChannel(toleave: User, chat: Channel) {
		if (!toleave || !chat)
			throw new NotFoundException('User or Channel not found');
		const channel = (await this.findChannelsByUser(chat.owner)).find(wllh => wllh.id === chat.id);
		channel.members = channel.members.filter(user => toleave.id !== user.id);
		if (!channel.members) {
			await this.delete(channel.owner, channel);
			return null;
		}
		if (toleave === channel.owner) {
			for (const user of channel.members) {
				const isBan: boolean = (channel.ban && !channel.ban.find(banned => banned.uuid === user.id));
				if (isBan) {
					channel.owner = user;
				}
				if (channel.admin && (!isBan || !channel.ban)) {
					channel.owner = user;
					break ;
				}
			}
			if (channel.owner === toleave) {
				channel.owner = channel.members[0];
				channel.mute = channel.mute.filter(id => id !== channel.members[0].id);
				channel.ban = channel.ban.filter(banned => banned.uuid !== channel.members[0].id);
			}
		}
		if (channel.admin)
			channel.admin = channel.admin.filter(id => id !== toleave.id);
		return await this.channelRepository.save(channel);
	}

	async getUserList(chat: Channel) {
		const channel = (await this.findChannelsByUser(chat.owner)).find(wllh => wllh.id === chat.id);
		return channel.members.map(user => new UserDto(user));
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
		const channel = (await this.findChannelsByUser(chat.owner)).find(wllh => wllh.id === chat.id);
		if (!channel.members.find(user =>  user === toadmin))
			throw new NotFoundException('This user is not there');
		const isAdmin = channel.admin.find(id => id === toadmin.id);
		if (isAdmin)
			throw new BadRequestException('Already Admin');
		if (channel.owner === toadmin)
			throw new BadRequestException('Channel Owner cannot become Admin');
		if (from !== channel.owner || isAdmin !== from.id)
			throw new UnauthorizedException('Only Owner or Admin can assign to admin role');
		channel.admin.push(toadmin.id);
		return await this.channelRepository.save(channel);
		
	}

	async unsetAdmin(from: User, unset: User, chat: Channel) {
		if (!from || !unset || !chat)
			throw new NotFoundException('User or Channel not found');
		const channel = (await this.findChannelsByUser(chat.owner)).find(wllh => wllh.id === chat.id);
		if (!channel.members.find(user =>  user === unset))
			throw new NotFoundException('This user is not there');
		const isAdmin = channel.admin.find(id => id === unset.id);
		if (!isAdmin)
			throw new BadRequestException('User not Admin');
		if (channel.owner === unset)
			throw new BadRequestException('Channel Owner cannot become Admin');
		if (from !== channel.owner || isAdmin !== from.id)
			throw new UnauthorizedException('Only Owner or Admin can remove admin role');
		channel.admin = channel.admin.filter(id => id !== unset.id);
		return await this.channelRepository.save(channel);
	}

	async sendMsg(user: User, chat: Channel, msg: CreateMsgDto) {
		
	}

	async muteUser(from: User, tomute: User, chat: Channel) {
		if (!from || !tomute || !chat)
			throw new NotFoundException('User or Channel not found');
		const channel = (await this.findChannelsByUser(chat.owner)).find(wllh => wllh.id === chat.id);
		if (!channel.members.find(user =>  user === tomute))
			throw new NotFoundException('This user is not there');
		if (channel.owner === tomute)
			throw new UnauthorizedException('You cannot mute the owner from his channel');
		if (from !== channel.owner || !channel.admin.find(id => id === from.id))
			throw new UnauthorizedException('Only Owner or Admin can mute');
		if (channel.mute.find(id => id === tomute.id))
			throw new UnauthorizedException('Already muted');
		channel.mute.push(tomute.id);
		return await this.channelRepository.save(channel);
	}

	async unmuteUser(from: User, tofree: User, chat: Channel) {
		if (!from || !tofree || !chat)
			throw new NotFoundException('User or Channel not found');
		const channel = (await this.findChannelsByUser(chat.owner)).find(wllh => wllh.id === chat.id);
		if (!channel.members.find(user =>  user === tofree))
			throw new NotFoundException('This user is not there');
		if (!channel.mute.find(id =>  id === tofree.id))
			throw new NotFoundException('This user was not muted');
		if (channel.owner === tofree)
			throw new UnauthorizedException('Impossible action');
		if (from !== channel.owner || !channel.admin.find(id => id === from.id))
			throw new UnauthorizedException('Only Owner or Admin can');
		channel.mute = channel.mute.filter(id => id !== tofree.id);
		return await this.channelRepository.save(channel);
	}

	async banUser(from: User, toban: User, chat: Channel, until: Date) {
		if (!from || !toban || !chat)
			throw new NotFoundException('User or Channel not found');
		const channel = (await this.findChannelsByUser(chat.owner)).find(wllh => wllh.id === chat.id);
		if (!channel.members.find(user =>  user === toban))
			throw new NotFoundException('This user is not there');
		if (channel.owner === toban)
			throw new UnauthorizedException('You cannot ban the owner from his channel');
		if (from !== channel.owner || !channel.admin.find(id => id === from.id))
			throw new UnauthorizedException('Only Owner or Admin can ban');
		if (channel.ban.find(ban => ban.uuid === toban.id))
			throw new UnauthorizedException('Already banned');
		const since = new Date;
		channel.ban.push({uuid: toban.id, since: since, until: until } as bantime);
		setTimeout(async () => {
			channel.ban = channel.ban.filter(user => user.uuid !== toban.id);
			await this.channelRepository.save(channel);
		}, (until.getTime() - since.getTime()));
		return await this.channelRepository.save(channel);
	}

	async unbanUser(from: User, unban: User, chat: Channel) {
		if (!from || !unban || !chat)
			throw new NotFoundException('User or Channel not found');
		const channel = (await this.findChannelsByUser(chat.owner)).find(wllh => wllh.id === chat.id);
		if (!channel.members.find(user =>  user === unban))
			throw new NotFoundException('This user is not there');
		if (channel.owner === unban)
			throw new UnauthorizedException('Impossible action');
		if (from !== channel.owner || !channel.admin.find(id => id === from.id))
			throw new UnauthorizedException('Only Owner or Admin can');
		if (!channel.ban.find(user =>  user.uuid === unban.id))
			throw new NotFoundException('This user was not ban');
		channel.ban = channel.ban.filter(user => user.uuid !== unban.id);
		return await this.channelRepository.save(channel);
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
