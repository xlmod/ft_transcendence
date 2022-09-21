import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { AuthService } from '@/auth/auth.service';
import { User } from '@/user/user.entity';
import { Channel } from './channels/channels.entity';
import { ChannelService } from './channels/channels.service';

@Injectable()
export class ChatService {
	constructor(
		private authService: AuthService,
		private channelService: ChannelService,
	) {}

	async getAccessToken(cookie: string) {
		return cookie?.split(';').filter(cookie => {
			if (cookie.split('=')[0] === 'access_token')
				return cookie;
		})[0].split('=')[1];
	}

	async getUserBySocket(client: Socket): Promise<User> {
		const token = await this.getAccessToken(client.handshake.headers?.cookie);
		return await this.authService.JwtVerify(token).catch(() => null);
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
}
