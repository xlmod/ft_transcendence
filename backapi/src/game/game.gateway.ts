import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { GameService } from './game.service';
import { UnauthorizedException, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@UsePipes(new ValidationPipe())
// @UseFilters(AllExceptionsFilter)
@WebSocketGateway({
	cors: {
		origin: '*',
		credentials: true
	},
	// namespace: '/game',
})

export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		// private readonly authService: AuthService,
		// private readonly userService: UserService,
		// private readonly gameService: GameService,
		// private jwtService: JwtService,
	) {}
	
	@WebSocketServer() server: Server;
	private logger: Logger = new Logger('GameGateway');

	afterInit(server: Server) {
		// console.log('init Gateway : ', server);
		
		server.use((socket, next) => {
			const cookie = socket.handshake.headers.cookie;
			console.log(cookie['access_token']);
			if (!cookie)
				return next(new UnauthorizedException('Gateway auth failed'));
			// const token = this.jwtService.verify(cookie);

			// console.log('socket: ', socket);
			next();
		});
	}

	async handleConnection(client: Socket) {
		// console.log(client);
		// client.on('room',);
		console.log(client.handshake.headers.cookie);
		this.logger.log(`Client connected: ${client.id}`);
		// all client
		client.broadcast.emit('echo', client.id);
		// all client except me
		client.emit('echo', 'testg');
		client.on('score', (score) => {
			client.broadcast.emit('score', score)
		});

	}

	async handleDisconnect(client: Socket) {
		// console.log(client);
		this.logger.log(`Client disconnected: ${client.id}`);
	}
}
