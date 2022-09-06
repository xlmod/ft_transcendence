import { UnauthorizedException, UsePipes, ValidationPipe } from '@nestjs/common';
import { Logger } from '@nestjs/common';

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

import { Board } from './gameTypes/Board'
import {Vec} from './gameTypes/Vec';

import {UserService} from '@/user/user.service';
import {AuthService} from '@/auth/auth.service';
import {GameService} from './game.service';

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
		private userService: UserService,
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
		this.gameService.addUserWithSocketId(client);
	}

	async handleDisconnect(client: Socket) {
		this.playerQuit(client.id)
		this.logger.log(`Client disconnected: ${client.id}`);
	}

	@SubscribeMessage("join_room")
	async handleJoinRoom(@ConnectedSocket() client: Socket) {
		let user = await this.gameService.getUserBySocketId(client.id);
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
			this.server.to(room.id).emit("room_setting", new SerialRoom(room));
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
			this.server.to(room.id).emit("room_setting", new SerialRoom(room));
		}
	}

	@SubscribeMessage("update_paddle")
	handlePaddlePos(
		@ConnectedSocket() client: Socket,
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
		if (side === "left") {
			room.board.set_left_dir(dx, dy)
			this.server.to(room.id).emit("update_paddle", side, room.board.get_left_pos() , paddle_dir);
		} else if (side === "right") {
			room.board.set_right_dir(dx, dy)
			this.server.to(room.id).emit("update_paddle", side, room.board.get_right_pos() , paddle_dir);
		}
	}

	@SubscribeMessage("quit")
	handleQuit(
		@ConnectedSocket() client: Socket,
	) {
		this.playerQuit(client.id);
	}

	@SubscribeMessage("observe_room")
	async handleObserveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: string) {
		console.log(data);
		const user = await this.gameService.getUserBySocketId(client.id);
		if (this.joined.has(user.id))
			return ;

		let room = this.getRoomFromUserName(data);
		if (room == null)
			return ;

		this.joined.add(user.id);
		room.observer.add(client.id);
		client.join(room.id);
		client.emit("room_observer_joined");
		this.server.to(room.id).emit("room_setting", new SerialRoom(room));
		if (room.full) {
			client.emit("start_game");
			client.emit("update_ball", room.board.get_ball_pos(), room.board.get_ball_dir());
		}
	}

	@SubscribeMessage("observe_quit")
	async handleObserveQuit(
		@ConnectedSocket() client: Socket,
	) {
		let room: Room | null = this.getRoomFromClientId(client.id);
		if (room == null)
			return ;
		if (room.observer.has(client.id)) {
			client.leave(room.id);
			room.observer.delete(client.id);
			client.emit("reset_game");
			client.emit("end_game");
			let user = await this.gameService.getUserBySocketId(client.id);
			this.joined.delete(user.id);
		}
	}



	startGame(room: Room) {
		room.board.reset();
		room.board.set_ball_dir(-1, 0);
		this.server.to(room.id).emit("update_ball", room.board.get_ball_pos(), room.board.get_ball_dir());
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
			this.server.to(r.id).emit("update_hard_paddle", "left", room.board.get_left_pos(), room.board.get_left_dir());
			this.server.to(r.id).emit("update_hard_paddle", "right", room.board.get_right_pos(), room.board.get_right_dir());
		}, 1000, room);
		this.server.to(room.id).emit("start_game");
	}

	getRoomFromClientId(client_id: string): Room | null {
		let room: Room | null = null;
		for (const [_, r]of this.rooms.entries()) {
			if (r.player_left === client_id || r.player_right === client_id) {
				room = r;
				break ;
			} else if (r.observer.has(client_id)) {
				room = r;
				break ;
			}
		}
		return room; 
	}

	getRoomFromUserName(uname: string): Room | null {
		let room: Room | null = null;
		for (const [_, r]of this.rooms.entries()) {
			if (r.user_left === uname || r.user_right === uname) {
				room = r;
				break ;
			}
		}
		return room; 
	}

	async playerQuit(client_id: string) {
		let room: Room | null = this.getRoomFromClientId(client_id)
		if (room != null) {
			if (room.full) {
				clearInterval(room.interval);
				clearInterval(room.update);
				if (room.player_left === client_id)
					this.setWinner(room, "right");
				else
					this.setWinner(room, "left");
			} else {
				this.server.to(room.id).emit("reset_game");
				this.server.to(room.id).emit("end_game", "");
				this.gameService.getSocketBySocketId(client_id).leave(room.id);
				let user = await this.gameService.getUserBySocketId(client_id);
				this.joined.delete(user.id);
				for (const [id, _] of room.observer.entries()) {
					this.gameService.getSocketBySocketId(id).leave(room.id);
					let user = await this.gameService.getUserBySocketId(id);
					this.joined.delete(user.id);
				}
				this.rooms.delete(room.id);
			}
		}
	}

	async setWinner(room: Room, side: string) {
		let user_left = await this.gameService.getUserBySocketId(room.player_left);
		let user_right = await this.gameService.getUserBySocketId(room.player_right);
		if (side === "left") {
			const [rl, rr] = this.gameService.calcElo(user_left.elo , user_right.elo)
			await this.userService.update(user_left.id, {win: user_left.win + 1, elo: rl});
			await this.userService.update(user_right.id, {lose: user_right.lose + 1, elo: rr});
		} else if (side === "right") {
			const [rr, rl] = this.gameService.calcElo(user_right.elo , user_left.elo)
			await this.userService.update(user_right.id, {win: user_right.win + 1, elo: rr});
			await this.userService.update(user_left.id, {lose: user_left.lose + 1, elo: rl});
		} else { return ; }
		this.server.to(room.id).emit("reset_game");
		this.server.to(room.id).emit("end_game", side);
		this.joined.delete(user_left.id);
		this.joined.delete(user_right.id);
		this.gameService.getSocketBySocketId(room.player_left).leave(room.id);
		this.gameService.getSocketBySocketId(room.player_right).leave(room.id);
		for (const [id, _] of room.observer.entries()) {
			this.gameService.getSocketBySocketId(id).leave(room.id);
			let user = await this.gameService.getUserBySocketId(id);
			this.joined.delete(user.id);
		}
		this.rooms.delete(room.id);
	}

	getRandomRoomId(): string {
		let keys = Array.from(this.rooms.keys());
		if (keys.length == 0)
			return "";
		let key = keys[Math.floor(Math.random() * keys.length)];
		return key;
	}

}

class SerialRoom {
	id: string;
	full: boolean;
	board: Board;
	score_left: number;
	score_right: number;
	player_left: string;
	player_right: string;
	user_left: string;
	user_right: string;
	constructor(room:Room){
		this.id = room.id;
		this.full = room.full;
		this.board = room.board;
		this.score_left = room.score_left;
		this.score_right = room.score_right;
		this.player_right = room.player_right;
		this.player_left = room.player_left;
		this.user_left = room.user_left;
		this.user_right = room.user_right;
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
