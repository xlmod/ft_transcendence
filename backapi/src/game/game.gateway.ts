import { AuthService } from 'src/auth/auth.service';
import { GameService } from './game.service';
import { UnauthorizedException, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { Logger } from '@nestjs/common';

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
} from '@nestjs/websockets';

import { Socket, Server } from 'socket.io';
import {Vec} from './gameTypes/Vec';
import {User} from '@/user/user.entity';

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
		private gameService: GameService,
	) {}
	
	@WebSocketServer() server: Server;
	private logger: Logger = new Logger('GameGateway');
	private rooms: Map<string, Room> = new Map();
	private joined: Set<string> = new Set();

	afterInit(server: Server) {
		server.use(async (socket, next) => {
			const cookie = socket.handshake.headers.cookie;
			if (!cookie)
				return next(new UnauthorizedException('Gateway auth failed'));
			try {
				await this.authService.JwtVerify(cookie.split('=')[1]);
			} catch(e) {
				return next(new UnauthorizedException('Gateway User unknown or failed'));
			}
			next();
		});
	}

	async handleConnection(client: Socket) {
		this.logger.log(`Client connected: ${client.id}`);
		this.gameService.AddUserWithSocket(client.id, client.handshake.headers.cookie);
	}

	async handleDisconnect(client: Socket) {
		this.playerQuit(client.id)
		this.logger.log(`Client disconnected: ${client.id}`);
	}

	@SubscribeMessage("join_room")
	handleJoinRoom(@ConnectedSocket() client: Socket) {
		let user = this.gameService.GetUserBySocket(client.id);
		if (this.joined.has(user.id)) {
			return ;
		} else
			this.joined.add(user.id);
		let room: Room | null = null;;
		for (const [_, r] of this.rooms.entries()) {
			if (!r.full) {
				room = r;
				break ;
			}
		}
		if (room != null) {
			room.player_right = client.id;
			room.user_right = user.pseudo;
			room.full = true;
			client.join(room.id);
			client.emit("room_player_joined", "right");
			this.server.to(room.id).emit("room_setting", room);
			this.startGame(room);
		} else {
			room = new Room();
			room.id = client.id;
			room.player_left = client.id;
			room.user_left = user.pseudo;
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
		let room: Room | null = this.getRoomFromClientId(client.id);
		if (room == null)
			return ;
		if (!room.full)
			return ;
		if (!((side === "left" && room.player_left === client.id) || (side === "right" && room.player_right === client.id)))
			return ;

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

	@SubscribeMessage("quit")
	handleQuit(
		@ConnectedSocket() client: Socket,
	) {
		this.playerQuit(client.id);
	}


	startGame(room: Room) {
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
				this.server.to(room.id).emit("update_score", room.score_left, room.score_right);
				if (r.score_right == 10)
					this.setWinner(r, "right");
				else if (r.score_left == 10)
					this.setWinner(r, "left");
				else
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

	playerQuit(client_id: string) {
		let room: Room | null = this.getRoomFromClientId(client_id)
		if (room != null) {
			if (room.full) {
				if (room.player_left === client_id)
					this.setWinner(room, "right");
				else
					this.setWinner(room, "left");
				clearInterval(room.interval);
				clearInterval(room.update);
				this.server.to(room.id).emit("reset_game");
				let user_left = this.gameService.GetUserBySocket(room.player_left);
				let user_right = this.gameService.GetUserBySocket(room.player_right);
				this.joined.delete(user_left.id);
				this.joined.delete(user_right.id);
				this.rooms.delete(room.id);
			} else {
				let user = this.gameService.GetUserBySocket(client_id);
				this.joined.delete(user.id);
				this.rooms.delete(room.id);
			}
		}
	}

	setWinner(room: Room, side: string) {
		this.server.to(room.id).emit("echo", `${side} WINNER`);
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
	user_left: string = "waiting...";
	user_right: string = "waiting...";
	observer: Set<string> = new Set();
}
