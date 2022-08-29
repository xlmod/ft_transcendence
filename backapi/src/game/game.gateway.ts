import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { GameService } from './game.service';
import { UnauthorizedException, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import TokenPayload from '@/auth/jwt.strategy';

import { Board } from 'src/game/gameTypes/Board'

import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	WsResponse,
} from '@nestjs/websockets';

import { Socket, Server } from 'socket.io';
import {Vec} from './gameTypes/Vec';
import {time} from 'console';

@UsePipes(new ValidationPipe())
// @UseFilters(AllExceptionsFilter)
@WebSocketGateway({
	cors: {
		origin: '*',
		credentials: true
	},
	namespace: '/game',
})

export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private readonly authService: AuthService,
		// // private readonly gameService: GameService,
	) {}
	
	@WebSocketServer() server: Server;
	private logger: Logger = new Logger('GameGateway');
	private rooms: Map<string, Room> = new Map();
	private joined: Map<string, Socket> = new Map();

	afterInit(server: Server) {
		// console.log('init Gateway : ', server);
		server.use(async (socket, next) => {
			const cookie = socket.handshake.headers.cookie;
			// console.log(cookie);
			if (!cookie)
				return next(new UnauthorizedException('Gateway auth failed'));
			try {
			// 	const token = this.jwtService.decode(cookie.split('=')[1]) as TokenPayload;
			// //	console.log(token);
			// 	const user = await this.userService.findById(token.uuid);
				const user = await this.authService.JwtVerify(cookie.split('=')[1]);
				console.log('user : ', user.pseudo);
				// if (user.Ban === true)
				// 	return next(new UnauthorizedException('Gateway User Banned'));
			} catch(e) {
				return next(new UnauthorizedException('Gateway User unknown or failed'));
			}
			next();
		});
	}

	async handleConnection(client: Socket) {
		this.logger.log(`Client connected: ${client.id}`);
	}

	async handleDisconnect(client: Socket) {
		let room: Room | null = this.getRoomFromClientId(client.id)
		if (room != null) {
			// TODO: remove the client from room.
		}
		this.logger.log(`Client disconnected: ${client.id}`);
	}

	@SubscribeMessage("join_room")
	handleJoinRoom(@ConnectedSocket() client: Socket) {
		if (this.joined.has(client.id)) {
			return ;
		} else
			this.joined.set(client.id, client);
		let room: Room | null = null;;
		for (const [_, r] of this.rooms.entries()) {
			if (!r.full) {
				room = r;
				break ;
			}
		}
		if (room != null) {
			room.player_right = client.id;
			room.full = true;
			client.join(room.id);
			client.emit("room_player_joined", "right");
			this.server.to(room.id).emit("room_setting", room);
			this.startGame(room);
		} else {
			room = new Room();
			room.id = client.id;
			room.player_left = client.id;
			room.board.reset();
			this.rooms.set(room.id, room);
			client.join(room.id);
			client.emit("room_player_joined", "left");
			this.server.to(room.id).emit("room_setting", room);
		}
	}

	@SubscribeMessage("update_paddle")
	handlePaddlePos(
		@ConnectedSocket() client: Socket,
		@MessageBody("paddle_pos") paddle_pos: Vec,
		@MessageBody("paddle_dir") paddle_dir: Vec,
		@MessageBody("side") side: string,
	) {
		console.log("IN PADDLE");
		let room: Room | null = this.getRoomFromClientId(client.id);
		console.log(room);
		if (room == null)
			return ;
		console.log(room);
		if (!room.full)
			return ;
		console.log(room.full);
		if (!((side === "left" && room.player_left === client.id) || (side === "right" && room.player_right === client.id)))
			return ;
			console.log(side);
			console.log(paddle_pos);
			console.log(paddle_dir);

		const dx = paddle_dir.x;
		const dy = paddle_dir.y;
		const px = paddle_pos.x;
		const py = paddle_pos.y;
		if (side === "left") {
			room.board.set_left_dir(dx, dy)
			room.board.set_left_pos(px, py)
		} else {
			room.board.set_right_dir(dx, dy)
			room.board.set_right_pos(px, py)
		}
		this.server.to(room.id).emit("update_paddle", side, paddle_pos, paddle_dir);
	}

	startGame(room: Room) {
		this.server.to(room.id).emit("update_score", room.score_left, room.score_right);
		this.server.to(room.id).emit("start_render");
		room.board.reset();
		room.board.set_ball_dir(-1, 0);
		this.server.to(room.id).emit("ball_dir", room.board.get_ball_dir());
		room.interval = setInterval((r) => {
			let ret = r.board.tick();
			if (ret) {
				let score = r.board.get_winner();
				if (score == 1)
					r.score_left += 1;
				else
					r.score_right += 1;
				clearInterval(r.interval);
				clearInterval(r.update);
				this.server.to(r.id).emit("reset_game");
				this.startGame(r);
			}
		}, 16, room);
		room.update = setInterval((r) => {
			this.server.to(r.id).emit("update_ball", r.board.get_ball_pos(), r.board.get_ball_dir());
		}, 1000, room);
		this.server.to(room.id).emit("start_game");
	}

	getRoomFromClientId(client_id: string): Room | null {
		let room: Room | null = null;
		for (const [_, r]of this.rooms.entries()) {
			if (r.player_left === client_id || r.player_right === client_id) {
				room = r;
				break ;
			}
		}
		return room; 
	}

}

class Room {
	id: string = "";
	full: boolean = false;
	interval: any = null;
	update: any = null;
	board: Board = new Board();
	score_left: number = 0;
	score_right: number = 0;
	player_left: string = "";
	player_right: string = "";
	observer: Set<string> = new Set();
}
