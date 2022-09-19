import { User } from "@/user/user.entity";
import { UserService } from "@/user/user.service";
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { bantime, ChannelState } from "../models/status.enums";
import { ChannelDto, CreateChannelDto } from "./channels.dto";
import { Channel } from "./channels.entity";
import * as bcrypt from 'bcrypt';
import { MessageService } from "../messages/messages.service";

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
		const chats = await this.channelRepository.find({
			relations: ['users'],
			where: { users: user },
		}).catch(() => {return new Array()});
		return chats.sort((a, b) => {return b.UpdatedAt.getTime() - a.UpdatedAt.getTime()}).map(channel => new ChannelDto(channel));
	}

	async create(user: User, channel: CreateChannelDto) {
		if (channel.state === ChannelState.protected || channel.state === ChannelState.procated)
			if (channel.password)
				channel.password = await bcrypt.hash(channel.password, 10);
			else
				throw new BadRequestException('Password required for this configuration');
		const chat: Channel = this.channelRepository.create({
			...channel,
			owner: user,
			messages: new Array(),
			users: [user],
		});
		return await this.channelRepository.save(chat);
	}

	async createDMsg(user: User, to: User) {
		if (user.blocks.filter(id => id === to.id).length)
			throw new UnauthorizedException('You have bloked this user');
		if (to.blocks.filter(id => id === to.id).length)
			throw new UnauthorizedException('This User has blocked you');
		return await this.channelRepository.save(this.channelRepository.create({
			state: ChannelState.dm,
			messages: new Array(),
			users: [user, to],
		}));
	}

	async joinChannel(toadd: User, chat: Channel, password?: string) {
		if (!toadd || !chat)
			throw new NotFoundException('User or Channel not found');
		const there = chat.users.find(curr => curr === toadd);
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
		chat.users.push(toadd);
		return await this.channelRepository.save(chat);
	}

	// async sendMsg()) {}

	async muteUser(from: User, tomute: User, chat: Channel) {
		if (!from || !tomute || !chat)
			throw new NotFoundException('User or Channel not found');
		if (!chat.users.find(user =>  user === tomute))
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
		if (!chat.users.find(user =>  user === tofree))
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
		if (!chat.users.find(user =>  user === toban))
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
		if (!chat.users.find(user =>  user === unban))
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
			throw new UnauthorizedException('');
		if (owner.filter(channel => channel.id === chat.id).length)
			this.channelRepository.delete(chat.id);
		return this.findChannelsByUser(user);
	}

	// async deleteDMsg(user: User) {
	// 	const dm = (await this.findChannelsByUser(user))
	// 		.filter(chat => chat.state !== ChannelState.dm);
	// 	await this.channelRepository.save(dm);
	// }
}
