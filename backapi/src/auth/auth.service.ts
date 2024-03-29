import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';
import { CreateUserDto } from 'src/user/user.dto';
import { JwtService } from '@nestjs/jwt';
import { download } from '@/tools/download.tools';

@Injectable()
export class AuthService {
  constructor(
	  private userService: UserService,
	  private jwtService: JwtService,
  ) {}

	async loginGuest(user: CreateUserDto): Promise<User> {
		try {
			await this.userService.findByEmail(user.email);
		} catch(error) {
			await this.userService.create(user);
		} finally {
			return await this.userService.findByEmail(user.email);
		}
	}

	async login(user: CreateUserDto): Promise<User> {
		try {
			await this.userService.findByEmail(user.email);
		} catch(error) {
			const users = await this.userService.GetUsers();
			if (users.find(curr => curr.pseudo === user.pseudo))
				user.pseudo = await this.userService.randomRandom();
			await this.userService.create(user);
			const { id, avatar } = await this.userService.findByEmail(user.email);
			download(avatar, id);
			await this.userService.updateavatar(id, (id + avatar.substring(avatar.lastIndexOf('.'))));
		} finally {
			return await this.userService.findByEmail(user.email);
		}
	}

	async JwtVerify(token: string) {
		try {
			const verif = this.jwtService.verify(token);
			const user = await this.userService.findById(verif.uuid);
			return user;
		} catch(e) {
			throw new UnauthorizedException('Jwt auth failed');
		}
	}

	getAccessToken(cookiestring: string): string {
		const cookies = cookiestring?.split(';')?.map((cookie) => cookie.trimStart().split('='));
		if (!cookies)
			return undefined;
		const token = cookies.filter(cookie => {
			if (cookie[0] === 'access_token')
				return true;
			return false;
		});
		if (!token)
			return undefined;
		return token[0][1];
	}
}
