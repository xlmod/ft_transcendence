import {
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
import { emit } from 'process';
import { UserDto } from '@/user/user.dto';
import { User } from '@/user/user.entity';

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
		private readonly authService: AuthService
	) {}

	@WebSocketServer() server: Server;
	private logger: Logger = new Logger('ChatGateway');
	private users = new Map<User, Socket>();


	afterInit(server: Server) {
		server.use(async (socket, next) => {
			const cookie = socket.handshake.headers.cookie;
			if (!cookie)
				return next(new UnauthorizedException('ChatGateway auth failed'));
			try {
				await this.authService.JwtVerify(cookie.split('=')[1]);
			} catch(e) {
				return next(new UnauthorizedException('ChatGateway User unknow or failed'));
			}
			next();
		});
	}

	async handleConnection(client: Socket, ...args: any[]) {
		this.logger.log(`Client connected: ${client.id}`, client.handshake.headers.cookie['access_token']);
		this.users.set(await this.authService.JwtVerify(client.handshake.headers.cookie.split('=')[1]), client);

	}

	async handleDisconnect(client: Socket) {
		this.logger.log(`Client connected: ${client.id}`, client.handshake.headers.cookie['access_token']);
	}

	@SubscribeMessage('create-dm')
	createDm(client: Socket, userToDm: User) {
		this.users.get(userToDm).emit("dmToMe");
		console.log("yap, " , userToDm);
	}
}
