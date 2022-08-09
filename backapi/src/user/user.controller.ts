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
	BadRequestException,
	Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

export const MFileOptions = {
	// limits: {
	// 	fieldSize: Math.pow(1024, 2) // 1MB
	// },
	fileFilter: (req, file, cb) => {
		if (file.mimetype.match(/\/(jpeg|jpg|png|gif)$/)) {
			cb(null, true);
		} else {
			cb(new BadRequestException(`File type not supported ${extname(file.originalname)}`), false);
		}
	},
	storage: diskStorage({
		destination: (req, file, cb) => {
			const updest = './avatars';
			if (!existsSync(updest)) {
				mkdirSync(updest);
			}
			cb(null, updest)
		},
		filename: (req, file, cb) => {
			const filename = req.res.locals.uuid;
			// const filename = ''; // for locals testing
			const extension = extname(file.originalname);
			cb(null, `${filename}${extension}`);
		}
	}),
}

@Controller('user')
// @UseGuards(JwtAuthGuard)
export class UserController {
	constructor(private userService: UserService) {}

	@Get()
	async AllUsers(): Promise<User[]> {
		return await this.userService.GetUsers();
	}

	@Get(':id')
	async findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<User> {
		return await this.userService.findById(id);
	}

	@Post()
	create(@Body() createUserDto: CreateUserDto) {
		// console.log(createUserDto);
		return this.userService.create(createUserDto);
	}

	@Post('upload/avatar')
	// @UseGuards(JwtAuthGuard)
	@UseInterceptors(FileInterceptor('file', MFileOptions))
	async UploadAvatar(@Req() req, @UploadedFile() file: Express.Multer.File) {
		try {
			const user = await this.userService.findById(req.res.locals.uid);
			console.log(user);
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

	@Delete()
	delete(@Res({ passthrough: true }) res) {
		return this.userService.delete(res.locals.uuid);
	}
}
