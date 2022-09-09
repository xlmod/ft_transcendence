import { ConflictException, Controller, Get, ImATeapotException, NotFoundException, Param, ParseUUIDPipe, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { existsSync } from 'fs';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { UserService } from './user/user.service';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService, private readonly userService: UserService) {}

	@Get()
	getHello(): string {
		return this.appService.getHello();
	}

	@Get('coffee')
	async getTipoat(@Res() res: Response) {
		const user = await this.userService.findById(res.locals.uuid);
		throw new ImATeapotException(`Cup of Tea ${user.pseudo} ?`);
	}

	@Get('/filename/:id')
	@UseGuards(JwtAuthGuard)
	async SendAvatarFileId(@Param('filename', new ParseUUIDPipe()) filename: string, @Res() res: Response) {
		const user = await this.userService.findById(filename);
		if (!user)
			throw new NotFoundException('User not found');
		if (existsSync(process.env.STORAGE + user.avatar)) {
			return res.sendFile(user.avatar, { root: process.env.STORAGE });
		}
		throw new ConflictException('Storage not found');
	}
}
