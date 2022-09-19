import { UserService } from '@/user/user.service';
import { Injectable } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { Socket } from 'socket.io';
import { AuthService } from '@/auth/auth.service';

@Injectable()
export class ChatService {
	constructor(
		private chatGateway: ChatGateway,
		private userService: UserService,
		private authService: AuthService,
	) {}

	async getUserBySocket(client: Socket) {
		return await this.authService.JwtVerify(client.handshake.headers.cookie.split('=')[1]);
	}


	// createDM() {
	// }

	// createChannel() {
	// }

	// updateChannel() {
	// }
}
