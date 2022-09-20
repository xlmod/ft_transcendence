import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { User } from '@/user/user.entity';
import { UserService } from '@/user/user.service';
import { Controller, Get, NotFoundException, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ChannelService } from './channels/channels.service';

@Controller('chat')
// @UseGuards(JwtAuthGuard)
export class ChatController {
	constructor(
		private channelService: ChannelService,
		private userService: UserService
	) {}

	@Get('all')
	async getAllRoom(@Res({ passthrough: true }) res: Response) {
		const user: User = await this.userService.findById(res.locals.uuid);
		const channels = await this.channelService.findChannelsByUser(user);
		if (!user || !channels)
			throw new NotFoundException('User or Channel not found in db');
		return channels;
	}

	@Get('names')
	async getNames() {
		return (await this.channelService.getAllChannels()).map(channel => channel.name);
	}
}
