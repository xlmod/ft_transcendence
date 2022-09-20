import {
	Controller,
	Get,
	Post,
	Patch,
	Delete,
	Param,
	Body,
	UseGuards,
	ParseUUIDPipe,
	UseInterceptors,
	UploadedFile,
	NotFoundException,
	Res,
	BadRequestException,
	UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from '../user.service';
import { UpdateUserDto, UserDto } from '../user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MFileOptions } from 'src/tools/download.tools';
import { Response } from 'express';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
	constructor(private userService: UserService) {}

	@Get()
	async AllUsers(): Promise<UserDto[]> {
		return (await this.userService.GetUsers()).map(user => { return new UserDto(user); });
		// return (await this.userService.GetUsers());
	}

	// Leaderboard
	@Get('/leaderboard')
	async leaderboarder(@Res({passthrough: true}) res) {
		return await this.userService.ConfigLeaderboard(res.locals.uuid);
	}

	@Get('/me')
	async GetCurrenlyUser(@Res({ passthrough: true }) res) {
		try {
			return new UserDto(await this.userService.findById(res.locals.uuid));
		} catch { throw new UnauthorizedException('User not set'); }
	}

	// @Get(':id')
	// async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
	// 	return new UserDto(await this.userService.findById(id));
	// }

	@Get(':pseudo')
	async findPseudo(@Param('pseudo') pseudo: string) {
		return new UserDto(await this.userService.findByPseudo(pseudo));
	}

	/**
	 * 
	 * @param {Response} res
	 * @param {Express.Multer.File} file key 'file' -> image file
	 * @returns {void} with avatar uptade otherwise throw exception
	 */
	@Post('upload/avatar')
	@UseInterceptors(FileInterceptor('file', MFileOptions))
	async UploadAvatar(@Res({ passthrough: true }) res: Response, @UploadedFile() file: Express.Multer.File): Promise<void> {
		try {
			await this.userService.updateavatar(res.locals.uuid, file.filename);
		} catch(error) {
			throw new NotFoundException('User not found or cannot update');
		}
	}

	@Patch()
	async update(@Res({ passthrough: true }) res, @Body() updata: Partial<UpdateUserDto>): Promise<void> {
		await this.userService.update(res.locals.uuid, updata);
	}

	// @Patch(':id')
	// async updatespe(@Param('id', new ParseUUIDPipe()) id: string, @Res({ passthrough: true }) res, @Body() updata: Partial<UpdateUserDto>): Promise<void> {
	// 	await this.userService.update(id, updata);
	// }

	@Delete()
	delete(@Res({ passthrough: true }) res) {
		return this.userService.delete(res.locals.uuid);
	}
}
