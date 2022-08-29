import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';
import { CreateUserDto } from 'src/user/user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
	  private userService: UserService,
	  private jwtService: JwtService,
  ) {}

	async login(user: CreateUserDto): Promise<User> {
		try {
			await this.userService.findByEmail(user.email);
		} catch(error) {
			await this.userService.create(user);
		} finally {
			return await this.userService.findByEmail(user.email);
		}
	}

	async JwtVerify(token: string) {
		try {
			const verif = this.jwtService.verify(token);
			const user = this.userService.findById(verif.uuid);
			return user;
		} catch(e) {
			throw new UnauthorizedException('Jwt auth failed');
		}
	}
}
