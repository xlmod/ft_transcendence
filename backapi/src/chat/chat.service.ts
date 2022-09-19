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

@Injectable()
export class ChatService {
	constructor(
		private authService: AuthService,
		private channelService: ChannelService,
		private messageService: MessageService,
	) {}

	async getUserBySocket(
		client: Socket
	): Promise<User> {
		const token: string = client.handshake.headers.cookie.split('=')[1];
		return await this.authService.JwtVerify(token);
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

	// updateChannel() {
	// }

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
	): Promise<Channel> {
		const user: User = await this.getUserBySocket(client);
		const channel: Channel = await this.channelService.findByChatName(name);
		if (channel == undefined)
			return undefined;
		let tmpmsg: CreateMsgDto;
		tmpmsg.user = user;
		tmpmsg.channel = channel;
		tmpmsg.message = msg;
		if (this.messageService.createMsgDb(tmpmsg).catch(() => undefined) == undefined)
			return undefined;
		return channel;
	}

}
