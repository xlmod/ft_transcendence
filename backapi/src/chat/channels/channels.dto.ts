import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { bantime, ChannelState } from "../models/status.enums";
import { User } from '@/user/user.entity'
import { MsgDto } from '@/chat/messages/messages.dto'
import { Channel } from "./channels.entity";
import { PartialType, PickType } from '@nestjs/mapped-types';

export class CreateChannelDto {
	@IsString()
	@IsNotEmpty()
	name: string

	@IsEnum(ChannelState)
	state: ChannelState

	password?: string
}

export class ChannelDto {
	id: number
	name?: string
	admin: string[]
	mute: string[]
	ban: string[]
	state: ChannelState
	password?: string
	owner?: User
	members: User[]
	messages?: MsgDto[]

	constructor(chat: Channel) {
		if (chat.state === ChannelState.dm) {
			this.id = chat.id;
			// this.name = null;
			this.state = chat.state;
			this.members = chat.members;
			this.messages = chat.messages?.map(msg => new MsgDto(msg));
		} else {
			this.id = chat.id;
			this.name = chat.name;
			this.admin = chat.admin;
			this.mute = chat.mute;
			this.ban = chat.ban;
			this.state = chat.state;
			this.password = chat.password;
			this.owner = chat.owner;
			this.members = chat.members;
			this.messages = chat.messages?.map(msg => new MsgDto(msg));
		} 
	}
}

export class ChannelUpateDto extends PartialType(
	PickType(ChannelDto, ['name', 'state', 'password'] as const),
) {}
