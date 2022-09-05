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
	Req,
	UploadedFile,
	NotFoundException,
	Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, UserDto } from './user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MFileOptions } from 'src/tools/download.tools';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
	constructor(private userService: UserService) {}

	@Get()
	async AllUsers(): Promise<UserDto[]> {
		return (await this.userService.GetUsers()).map(user => { return new UserDto(user); });
	}

	// Leaderboard
	@Get('/leaderboard')
	async leaderboarder(@Res({passthrough: true}) res) {
		return await this.userService.ConfigLeaderboard(res.locals.uuid);
	}

	@Get('/me')
	async GetCurrenlyUser(@Res({ passthrough: true }) res) {
		return {uid: res.locals.uuid};
		// return new UserDto(await this.userService.findById(res.locals.uuid));
	}

	@Get(':id')
	async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
		return new UserDto(await this.userService.findById(id));
	}

	@Post()
	create(@Body() createUserDto: CreateUserDto) {
		return this.userService.create(createUserDto);
	}

	/*
		Need some test, doesn't work
	*/
	@Post('upload/avatar')
	@UseInterceptors(FileInterceptor('file', MFileOptions))
	async UploadAvatar(@Req() req, @UploadedFile() file: Express.Multer.File) {
		try {
			const user = await this.userService.findById(req.res.locals.uuid);
			// console.log(file);
			await this.userService.update(user.id, { avatar: file.filename });
			return user;
		} catch(error) {
			throw new NotFoundException('User not found');
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
