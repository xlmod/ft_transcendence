import { User } from "@/user/user.entity";
import { UserService } from "@/user/user.service";
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { bantime, ChannelState } from "../models/status.enums";
import { ChannelUpateDto, CreateChannelDto } from "./channels.dto";
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
		if (!user)
			return [];
		const id = user.id;
		const chats = await this.channelRepository
				.createQueryBuilder('channels')
				.leftJoinAndSelect('channels.members', 'users')
				.where('users.id = :id', {id})
				.getMany();
		return chats.sort((a, b) => {return b.UpdatedAt.getTime() - a.UpdatedAt.getTime()});
	}

	async findUserListByChannel(chat: Channel) {
		if (!chat)
			return null;
		const id = chat.id;
		return (await this.channelRepository
				.createQueryBuilder('channels')
				.leftJoinAndSelect('channels.members', 'users')
				.where('channels.id = :id', {id})
				.getMany()
			).find(wllh => wllh.id === chat.id);
	}

	async update(owner: User, chat: Channel, toup: Partial<ChannelUpateDto>) {
		if (!owner || !chat)
			throw new NotFoundException('User or Channel not found');
		if (owner.id !== chat.owner.id)
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
		await this.channelRepository.update(chat.id, chat);
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
			members: new Array(),
		});
		chat.members.push(user);
		return await this.channelRepository.save(chat);
	}

	async createDMsg(user: User, to: User): Promise<Channel> {
		if (user.blocks?.filter(id => id === to.id).length)
			throw new UnauthorizedException('You have bloked this user');
		if (to.blocks?.filter(id => id === to.id).length)
			throw new UnauthorizedException('This User has blocked you');
		const ucheck = await this.findChannelsByUser(user);
		const tocheck = await this.findChannelsByUser(to);
		for (const channel of ucheck)
			for (const channel2 of tocheck)
				if (channel.id === channel2.id && channel.state === ChannelState.dm && channel2.state === ChannelState.dm)
					return channel;
		return await this.channelRepository.save(this.channelRepository.create({
			state: ChannelState.dm,
			messages: new Array(),
			members: [user, to],
		}));
	}

	async joinChannel(toadd: User, chat: Channel, password?: string): Promise<Channel> {
		if (!toadd || !chat)
			throw new NotFoundException('User or Channel not found');
		const channel = (await this.findUserListByChannel(chat));
		const there = channel.members.find(curr => curr.id === toadd.id);
		if (there && channel.state === ChannelState.dm)
			return channel;
		if (channel.state === ChannelState.protected || channel.state === ChannelState.procated) {
			const isMatch: boolean = await bcrypt.compare(password, channel.password);
			if (!isMatch)
				throw new UnauthorizedException('Wrong password');
		}
		if (there) {
			const isBan: string = channel.ban.find(uid => {return (uid === toadd.id);});
			if (isBan)
				throw new UnauthorizedException(`You are banned`);
			return channel;
		}
		channel.members.push(toadd);
		return await this.channelRepository.save(channel);
	}

	async leaveChannel(toleave: User, chat: Channel) {
		if (!toleave || !chat)
			throw new NotFoundException('User or Channel not found');
		const channel = (await this.findUserListByChannel(chat));
		channel.members = channel.members.filter(user => toleave.id !== user.id);
		if (!channel.members.length) {
			await this.delete(chat.owner, channel);
			return null;
		}
		if (toleave.id === chat.owner.id) {
			for (const user of channel.members) {
				const isBan: boolean = (channel.ban && !channel.ban.find(banned => banned === user.id));
				if (isBan) {
					channel.owner = user;
				}
				if (channel.admin.length && (!isBan || !channel.ban)) {
					channel.owner = user;
					break ;
				}
			}
			if (chat.owner.id === toleave.id) {
				channel.owner = channel.members[0];
				channel.mute = channel.mute.filter(id => id !== channel.members[0].id);
				channel.ban = channel.ban.filter(banned => banned !== channel.members[0].id);
			}
		}
		if (channel.admin.length)
			channel.admin = channel.admin.filter(id => id !== toleave.id);
		return await this.channelRepository.save(channel);
	}

	async getMembersChannel(chat: Channel) {
		const channel = (await this.findUserListByChannel(chat));
		return channel.members;
	}

	async getAdminList(chat: Channel) {
		let ret = new Array();
		if (chat.admin.length)
			for (const id of chat.admin)
				ret.push(await this.userService.findById(id));
		return ret;
	}

	async getMuteList(chat: Channel) {
		let ret = new Array();
		if (chat.mute.length)
			for (const id of chat.mute)
				ret.push(await this.userService.findById(id));
		return ret;
	}

	async getBanList(chat: Channel) {
		let ret = new Array();
		if (chat.ban.length)
			for (const ban of chat.ban)
				ret.push(await this.userService.findById(ban));
		return ret;
	}

	async manageAdmin(from: User, toadmin: User, chat: Channel) {
		if (!from || !toadmin || !chat)
			throw new NotFoundException('User or Channel not found');
		const channel = (await this.findUserListByChannel(chat));
		if (!channel.members.find(user =>  user.id === toadmin.id))
			throw new NotFoundException('This user is not there');
		const isAdmin = channel.admin.find(id => id === toadmin.id);
		if (chat.owner.id === toadmin.id)
			throw new BadRequestException('Channel Owner cannot become Admin');
		if (from.id !== chat.owner.id && isAdmin !== from.id)
			throw new UnauthorizedException('Only Owner or Admin can assign to admin role');
		if (isAdmin) {
			channel.admin = channel.admin.filter(id => id !== toadmin.id);
			return await this.channelRepository.save(channel);
		}
		channel.admin.push(toadmin.id);
		return await this.channelRepository.save(channel);
		
	}

	async sendMsg(user: User, chat: Channel, msg: string) {
		if (chat.state === ChannelState.dm)
		{
			const channelMembers = await this.findUserListByChannel(chat);
			const otherUser = channelMembers.members.find(member => member.id !== user.id);
			if (otherUser.blocks.find(blockedId => blockedId === user.id) !== undefined)
				return null;
			if (user.blocks.find(blockedId => blockedId === otherUser.id) !== undefined)
				return null;
		}
		if (!chat.mute.length || chat.mute.find(id => id !== user.id)) {
			await this.messageService.createMsgDb({message: msg, user: user, channel: chat} as CreateMsgDto);
			return {channel: chat, msg: msg, user: user.pseudo};
		}
		return null;
	}

	async getMsg(chat: Channel) {
		try {
			return await this.messageService.getAllMsgByChannel(chat);
		} catch(e) { throw e; }
	}

	async muteUser(from: User, tomute: User, chat: Channel) {
		if (!from || !tomute || !chat)
			throw new NotFoundException('User or Channel not found');
		const channel = (await this.findUserListByChannel(chat));
		if (!channel.members.find(user =>  user.id === tomute.id))
			throw new NotFoundException('This user is not there');
		if (chat.owner.id === tomute.id)
			throw new UnauthorizedException('You cannot mute the owner from his channel');
		if (from.id !== chat.owner.id && !channel.admin.find(id => id === from.id))
			throw new UnauthorizedException('Only Owner or Admin can mute');
		if (channel.mute.find(id => id === tomute.id)) {
			channel.mute = channel.mute.filter(id => id !== tomute.id);
			return await this.channelRepository.save(channel);
		}
		channel.mute.push(tomute.id);
		return await this.channelRepository.save(channel);
	}

	async banUser(from: User, toban: User, chat: Channel) {
		if (!from || !toban || !chat)
			throw new NotFoundException('User or Channel not found');
		const channel = (await this.findUserListByChannel(chat));
		if (!channel.members.find(user =>  user.id === toban.id))
			throw new NotFoundException('This user is not there');
		if (chat.owner.id === toban.id)
			throw new UnauthorizedException('You cannot ban the owner from his channel');
		if (from.id !== chat.owner.id && !channel.admin.find(id => id === from.id))
			throw new UnauthorizedException('Only Owner or Admin can ban');
		if (channel.ban.find(ban => ban === toban.id)) {
			channel.ban = channel.ban.filter(user => user !== toban.id);
			return await this.channelRepository.save(channel);
		}
		const until = 10000;
		channel.ban.push(toban.id)
		setTimeout(async () => {
			channel.ban = channel.ban.filter(user => user !== toban.id);
			await this.channelRepository.save(channel);
		}, until);
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

	async deleteDMsg(channel: Channel): Promise<void> {
		if (!channel)
			throw new NotFoundException('DM not found');
		await this.channelRepository.delete(channel.id);
	}
}
