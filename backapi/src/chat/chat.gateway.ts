import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer } from '@nestjs/websockets';
import { AllExceptionsFilter } from '@/game/game.filter';
import { Logger, UnauthorizedException, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { AuthService } from '@/auth/auth.service';
import { UserService } from '@/user/user.service';
import { User } from '@/user/user.entity';
import { ChannelService } from './channels/channels.service';

UsePipes(new ValidationPipe())
@UseFilters(AllExceptionsFilter)
@WebSocketGateway({
	cors: {
		origin: [`http://${process.env.HOST}:${process.env.FRONT_PORT}`,
				 `http://${process.env.HOST}:${process.env.PORT}`],
		credentiials: true
	},
	namespace: '/chat',
})

export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private readonly authService: AuthService,
		private channelService: ChannelService,
		private userService: UserService,
	) {}

	@WebSocketServer() server: Server;
	private logger: Logger = new Logger('GameGateway');
	private users = new Map<string, User>();

	afterInit(server: Server) {
		server.use(async (socket, next) => {
			const cookie = socket.handshake.headers.cookie;
			if (!cookie)
				return next(new UnauthorizedException('ChatGateway auth failed'));
			try {
				this.users.set(socket.id, await this.authService.JwtVerify(cookie.split('=')[1]));
			} catch(e) {
				return next(new UnauthorizedException('ChatGateway User unknow or failed'));
			}
			next();
		});
	}

	async handleConnection(client: Socket, ...args: any[]) {
		this.logger.log(`Client connected: ${client.id}`, client.handshake.headers.cookie['access_token']);
	}

	async handleDisconnect(client: Socket) {
		this.logger.log(`Client connected: ${client.id}`, client.handshake.headers.cookie['access_token']);
	}

	// @SubscribeMessage('create-dm')
	// handleDM(@MessageBody() content: string, @ConnectedSocket() socket: Socket) {
	// }

	// @SubscribeMessage('create-room')
	// handleCreateRoom(client: Socket) {
	// }
	
	// @SubscribeMessage('join-room')
	// joinRoom(client: Socket) {
	// }
	// @SubscribeMessage('leave-room')
	// leaveRoom(client: Socket) {
	// }
	
	// @SubscribeMessage('send-message')
	// handleMessage(client: Socket, payload: any): string {
	// 	return 'Hello world!';
	// }
}
