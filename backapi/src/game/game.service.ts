import {AuthService} from '@/auth/auth.service';
import {User} from '@/user/user.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GameService {
	constructor(
		private readonly authService: AuthService,
	) {}

	private userMap: Map<string, User> = new Map();

	async AddUserWithSocket(client_id: string, cookie: string) {
		let user = await this.authService.JwtVerify(cookie.split('=')[1]);
		this.userMap.set(client_id, user);
	}

	GetUserBySocket(client_id: string): User | null {
		return this.userMap.get(client_id);
	}
}
