import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { AuthService } from '@/auth/auth.service';
import {User} from '@/user/user.entity';
import {Channel} from './channels/channels.entity';
import {CreateChannelDto} from './channels/channels.dto';
import {ChannelState} from './models/status.enums';
import {ChannelService} from './channels/channels.service';

@Injectable()
export class ChatService {
	constructor(
		private authService: AuthService,
		private channelService: ChannelService,
	) {}

	async getUserBySocket(
		client: Socket
	): Promise<User> {
		const token: string = client.handshake.headers.cookie['access_token'].split('=')[1];
		return await this.authService.JwtVerify(token);
	}

	async createDM(
		client: Socket,
		touser: User,
	): Promise<Channel> {
		const user: User = await this.getUserBySocket(client);
		let tmpchannel: CreateChannelDto;
		tmpchannel.name = touser.pseudo;
		tmpchannel.state = ChannelState.dm;
		return await this.channelService.create(user, tmpchannel);
	}

	async createChannel(
		client: Socket,
		name: string,
		is_public: boolean,
		password: string,
	): Promise<Channel> {
		const user: User = await this.getUserBySocket(client);
		let tmpchannel: CreateChannelDto;
		tmpchannel.name = name;
		if (password === "") {
			if (is_public)
				tmpchannel.state = ChannelState.public;
			else
				tmpchannel.state = ChannelState.private;
		} else {
			tmpchannel.password = password;
			if (is_public)
				tmpchannel.state = ChannelState.protected;
			else
				tmpchannel.state = ChannelState.procated;
		}
		return await this.channelService.create(user, tmpchannel);
	}

	// updateChannel() {
	// }
}
