import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { AuthService } from '@/auth/auth.service';
import { User } from '@/user/user.entity';
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
}
