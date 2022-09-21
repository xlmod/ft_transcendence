import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { AuthService } from '@/auth/auth.service';
import { User } from '@/user/user.entity';

@Injectable()
export class ChatService {
	constructor(
		private authService: AuthService,
	) {}

	async getUserBySocket(client: Socket): Promise<User> {
		const token = this.authService.getAccessToken(client.handshake.headers?.cookie);
		return await this.authService.JwtVerify(token).catch(() => null);
	}
}
