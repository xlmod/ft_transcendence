import {AuthService} from '@/auth/auth.service';
import {User} from '@/user/user.entity';
import {UserService} from '@/user/user.service';

import { Injectable } from '@nestjs/common';

import { Socket } from 'socket.io';

@Injectable()
export class GameService {
	constructor(
		private readonly authService: AuthService,
		private userService: UserService,
	) {}

	private userMap: Map<string, {uid: string, socket: Socket}> = new Map();

	async addUserWithSocketId(client: Socket) {
		let user = await this.authService.JwtVerify(client.handshake.headers.cookie.split('=')[1]);
		this.userMap.set(client.id, {uid: user.id, socket: client});
	}

	async getUserBySocketId(client_id: string): Promise<User> {
		const user = this.userMap.get(client_id);
		if (user) {
			const uid = user.uid;
			return await this.userService.findById(uid);
		}
		return undefined;
	}

	getSocketBySocketId(client_id: string): Socket {
		return this.userMap.get(client_id).socket;
	}

	async getUidByPseudo(pseudo: string): Promise<string> {
		for (const [_, obj] of this.userMap.entries()) {
			const user = await this.userService.findById(obj.uid);
			if (user.pseudo === pseudo) {
				return obj.uid;
			}
		}
		return undefined;
	}

	async getSocketByPseudo(pseudo: string): Promise<Socket | null> {
		for (const [_, obj] of this.userMap.entries()) {
			const user = await this.userService.findById(obj.uid);
			if (user.pseudo === pseudo) {
				return obj.socket;
			}
		}
		return null;
	}

	getSocketByUid(uid: string): Socket | null {
		for (const [_, obj] of this.userMap.entries()) {
			if (obj.uid === uid) {
				return obj.socket;
			}
		}
		return null;
	}

	removeUserWithSocketId(client_id: string) {
		this.userMap.delete(client_id);
	}


	calcElo(elo_win: number, elo_lose: number): [number, number] {
		let kfactor = 40;
		let ew = 1 / (1 + Math.pow(10, (elo_lose - elo_win) / 400));
		let el = 1 / (1 + Math.pow(10, (elo_win - elo_lose) / 400));
		let rw = elo_win + Math.round(kfactor * (1 - ew));
		let rl = elo_lose + Math.round(kfactor * (0 - el));
		return [rw, rl];
	}
}
