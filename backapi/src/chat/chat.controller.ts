import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { User } from '@/user/user.entity';
import { UserService } from '@/user/user.service';
import { Controller, Get, NotFoundException, Res, UseGuards } from '@nestjs/common';
import {Channel} from 'diagnostics_channel';
import { Response } from 'express';
import { ChannelService } from './channels/channels.service';
import {ChannelState} from './models/status.enums';

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
		let channels =  (await this.channelService.findChannelsByUser(user));
		let i=0;
		for (const chat of channels) {
			let tmp = (await this.channelService.findUserListByChannel(chat));
			let tmpOwnerChannel = this.channelService.findById(chat.id);
			if (chat.state === ChannelState.dm)
				channels[i] =  tmp;
			channels[i].owner = (await tmpOwnerChannel).owner;
			++i;
		}
		if (!user || !channels)
			throw new NotFoundException('User or Channel not found in db');
		return channels;
	}

	@Get('names')
	async getNames() {
		return (await this.channelService.getAllChannels()).filter(channel => {
			if (channel.state === ChannelState.public || channel.state === ChannelState.protected)
				return true;
			return false;
		}).map(channel => {return {name: channel.name, state: channel.state}});
	}
}
