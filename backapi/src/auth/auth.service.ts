import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';
import { CreateUserDto } from 'src/user/user.dto';

@Injectable()
export class AuthService {
  constructor(
	  private userService: UserService,
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
}
