import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { AuthService } from '@/auth/auth.service';
import {User} from '@/user/user.entity';
import {Channel} from './channels/channels.entity';
import {CreateChannelDto} from './channels/channels.dto';
import {ChannelState} from './models/status.enums';
import {ChannelService} from './channels/channels.service';
import {MessageService} from './messages/messages.service';
import {CreateMsgDto} from './messages/messages.dto';
import {UserService} from '@/user/user.service';
import {ChatGateway} from './chat.gateway';

@Injectable()
export class ChatService {
	constructor(
		private authService: AuthService,
		private channelService: ChannelService,
		private messageService: MessageService,
		private userService: UserService,

	) {}

	private users: Map<string, Set<string>> = new Map();

	addSocketId(
		client_id: string,
		user_id: string,
	) {
		if (this.users.has(user_id)) {
			this.users.get(user_id).add(client_id);
		} else {
			this.users.set(user_id, new Set<string>().add(client_id));
		}
	}

	removeSocketId(
		client_id: string,
	) {
		for (const [, socket_ids] of this.users) {
			if (socket_ids.has(client_id)) {
				socket_ids.delete(client_id);
			}
		}
	}

	getSocketIds(
		user_id: string,
	): Set<string> {
		if (this.users.has(user_id))
			return this.users.get(user_id);
		return new Set<string>();
	}

	getUid(
		client_id: string,
	): string {
		for (const [uid, socket_ids] of this.users) {
			if (socket_ids.has(client_id)) {
				return uid;
			}
		}
	}

	async socketJoinChannels(
		client: Socket,
	) {
		const user = await this.getUserBySocket(client);
		if (!user)
			return ;
		const channels = await this.channelService.findChannelsObjByUser(user).catch(() => undefined);
		if (!channels)
			return ;
		channels.forEach((elem: Channel) => {
			client.join(`${elem.id}`);
		});
	}

	async socketLeaveChannels(
		client: Socket,
	) {
		const user = await this.getUserBySocket(client);
		if (!user)
			return ;
		const channels = await this.channelService.findChannelsObjByUser(user).catch(() => undefined);
		if (!channels)
			return ;
		channels.forEach((elem: Channel) => {
			client.leave(`${elem.id}`);
		});
	}

	async getUserBySocket(
		client: Socket
	): Promise<User> {
		const token = this.authService.getAccessToken(client.handshake?.headers?.cookie);
		return await this.authService.JwtVerify(token).catch(() => undefined);
	}

	async getUserByUID(
		uid: string,
	): Promise<User> {
		return await this.userService.findById(uid).catch(() => undefined);
	}

	async createChannel(
		client: Socket,
		name: string,
		is_public: boolean,
		password: string,
	): Promise<Channel> {
		const user: User = await this.getUserBySocket(client);
		let state: ChannelState;
		let passwd: string;
		if (password === "") {
			if (is_public)
				state = ChannelState.public;
			else
				state = ChannelState.private;
		} else {
			passwd = password;
			if (is_public)
				state = ChannelState.protected;
			else
				state = ChannelState.procated;
		}
		const tmpchannel: CreateChannelDto = {name: name, state: state, password: passwd};
		return await this.channelService.create(user, tmpchannel).catch(() => undefined);
	}

	async banUser(
		channel: Channel,
		user: User,
		target: User,
	): Promise<Channel> {
		if (!user || !channel || !target)
			return undefined;
		let until = new Date()
		until.setDate(until.getDate() + 1);
		return await this.channelService.banUser(user, target, channel, until).catch(() => undefined);
	}

	async unbanUser(
		channel: Channel,
		user: User,
		target: User,
	): Promise<Channel> {
		if (!user || !channel || !target)
			return undefined;
		return await this.channelService.unbanUser(user, target, channel).catch(() => undefined);
	}

	async setAdmin(
		channel: Channel,
		user: User,
		target: User,
	): Promise<Channel> {
		if (!user || !channel || !target)
			return undefined;
		return await this.channelService.setAdmin(user, target, channel).catch(() => undefined);
	}

	async unsetAdmin(
		channel: Channel,
		user: User,
		target: User,
	): Promise<Channel> {
		if (!user || !channel || !target)
			return undefined;
		return await this.channelService.unsetAdmin(user, target, channel).catch(() => undefined);
	}

	async muteUser(
		channel: Channel,
		user: User,
		target: User,
	): Promise<Channel> {
		if (!user || !channel || !target)
			return undefined;
		return await this.channelService.muteUser(user, target, channel).catch(() => undefined);
	}

	async unmuteUser(
		channel: Channel,
		user: User,
		target: User,
	): Promise<Channel> {
		if (!user || !channel || !target)
			return undefined;
		return await this.channelService.unmuteUser(user, target, channel).catch(() => undefined);
	}


	async joinChannel(
		client: Socket,
		name: string,
		password: string,
	): Promise<Channel> {
		const user: User = await this.getUserBySocket(client);
		const channel: Channel = await this.channelService.findByChatName(name);
		if (password === "")
			return await this.channelService.joinChannel(user, channel).catch(() => undefined);
		else
			return await this.channelService.joinChannel(user, channel, password).catch(() => undefined);
	}

	async leaveChannel(
		client: Socket,
		name: string,
	): Promise<Channel> {
		const user: User = await this.getUserBySocket(client);
		const channel: Channel = await this.channelService.findByChatName(name);
		return await this.channelService.leaveChannel(user, channel).catch(() => undefined);
	}

	async sendMsg(
		client: Socket,
		name: string,
		msg: string,
	): Promise<{channel: Channel, msg:string, user:string}> {
		const user: User = await this.getUserBySocket(client);
		const channel: Channel = await this.channelService.findByChatName(name);
		if (channel == undefined)
			return undefined;
		const tmpmsg: CreateMsgDto = {user: user, channel: channel, message: msg};
		if (this.messageService.createMsgDb(tmpmsg).catch(() => undefined) == undefined)
			return undefined;
		return {channel: channel, msg: msg, user:user.pseudo};
	}
}
