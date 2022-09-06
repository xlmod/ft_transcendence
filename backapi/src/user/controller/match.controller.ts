import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { Controller, Get, Param, ParseUUIDPipe, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { MatchDto } from '../../match/models/match.dto';
import { UserService } from '../user.service';

@Controller('match')
@UseGuards(JwtAuthGuard)
export class MatchController {
	constructor(
		private userService: UserService,
	) {}

	@Get('/history/')
	async getMyHistory(@Res({ passthrough: true }) res: Response): Promise<MatchDto[]> {
		return await this.userService.getHistoryMatch(res.locals.uuid);
	}

	@Get('/history/:id')
	async getUserHistory(@Param('id', new ParseUUIDPipe()) id: string, @Res({ passthrough: true }) res: Response): Promise<MatchDto[]> {
		return await this.userService.getHistoryMatch(id);
	}
}
