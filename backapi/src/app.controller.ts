import { ConflictException, Controller, Get, ImATeapotException, Param, Req, Res } from '@nestjs/common';
import { existsSync } from 'fs';
import { AppService } from './app.service';
import { UserService } from './user/user.service';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService, private readonly userService: UserService) {}

	@Get()
	getHello(): string {
		return this.appService.getHello();
	}

	@Get('coffee')
	async getTipoat(@Res() res) {
		const user = await this.userService.findById(res.locals.uuid);
		throw new ImATeapotException(`Cup of Tea ${user.pseudo} ?`);
	}

	@Get('/profile/:filename')
	SendAvatarFile(@Param('filename') filename: string, @Res() res) {
		if (existsSync(process.env.STORAGE)) {
			return res.sendFile(filename, { root: process.env.STORAGE });
		}
		throw new ConflictException('Storage not found');
	}
}
