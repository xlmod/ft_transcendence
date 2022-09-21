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

	async getUserBySocket(client: Socket): Promise<User> {
		const token = await this.authService.getAccessToken(client.handshake.headers?.cookie);
		return await this.authService.JwtVerify(token).catch(() => null);
	}
}
