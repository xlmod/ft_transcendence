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
import { User } from '@/user/user.entity';
import {ChatService} from './chat.service';
import {Channel} from './channels/channels.entity';
import {UserService} from '@/user/user.service';

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
		private chatService: ChatService,
		private userService: UserService,
	) {}

	@WebSocketServer() server: Server;
	private logger: Logger = new Logger('GameGateway');
	private users = new Map<string, User>();

	afterInit(server: Server) {
		server.use(async (socket, next) => {
			const cookie = socket.handshake.headers.cookie['access_token'];
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

	async handleConnection(client: Socket) {
		this.logger.log(`Client connected: ${client.id}`);
	}

	async handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
	}

	@SubscribeMessage('create-dm')
	async handleCreateDM(
		@ConnectedSocket() client: Socket,
		@MessageBody("name") name: string,
	) {
		const touser: User = await this.userService.findByPseudo(name);
		if (touser == undefined)
			return ;
		const channel: Channel = await this.chatService.createDM(client, touser);
		client.join(`${channel.id}`);
	}

	@SubscribeMessage("create-room")
	async handleCreateRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody("name") name: string,
		@MessageBody("public") is_public: boolean,
		@MessageBody("password") password: string,
	) {
		if (name === "")
			return ;
		const channel: Channel = await this.chatService.createChannel(client, name, is_public, password);
		client.join(`${channel.id}`);
	}
	
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
