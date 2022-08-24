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
	private id_ready: string = "";

	afterInit(server: Server) {
		// console.log('init Gateway : ', server);
		
		server.use((socket, next) => {
			// const token = this.jwtService.verify(cookie);

			// console.log('socket: ', socket);
			next();
		});
	}

	async handleConnection(client: Socket) {
		// console.log(client);
		// client.on('room',);
		this.logger.log(`Client connected: ${client.id}`);
		// all client
		client.broadcast.emit('echo', client.id);
		// all client except me
		client.emit('echo', 'testg');

		client.on('ready', () => {
			if (this.id_ready === "") {
				this.id_ready = client.id;
				client.join(client.id);
				console.log(`${this.id_ready} ready!`);
			} else {
				client.join(this.id_ready);
				console.log(`${client.id} join ${this.id_ready}!`);
				this.server.to(this.id_ready).emit('start');
				this.id_ready = "";
			}
			for (const v of client.rooms.entries()) {
				console.log(`value: ${v}`);
			}
		});

	}

	async handleDisconnect(client: Socket) {
		// console.log(client);
		this.logger.log(`Client disconnected: ${client.id}`);
	}
}
