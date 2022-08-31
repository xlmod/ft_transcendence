import {AuthService} from '@/auth/auth.service';
import {User} from '@/user/user.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GameService {
	constructor(
		private readonly authService: AuthService,
	) {}

	private userMap: Map<string, User> = new Map();

	async addUserWithSocket(client_id: string, cookie: string) {
		let user = await this.authService.JwtVerify(cookie.split('=')[1]);
		this.userMap.set(client_id, user);
	}

	getUserBySocket(client_id: string): User | null {
		return this.userMap.get(client_id);
	}

	calcElo(elo_win: number, elo_lose: number): [number, number] {
		let kfactor = 20;
		let ew = 1 / (1 + Math.pow(10, (elo_lose - elo_win) / 400));
		let el = 1 / (1 + Math.pow(10, (elo_win - elo_lose) / 400));
		let rw = Math.round(elo_win + kfactor * (1 - ew));
		let rl = Math.round(elo_lose + kfactor * (0 - el));
		console.log(rw);
		console.log(rl);
		return [rw, rl];
	}
}
