import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { bantime, ChannelState } from "../models/status.enums";
import { User } from '@/user/user.entity'
import { MsgDto } from '@/chat/messages/messages.dto'
import { Channel } from "./channels.entity";

export class CreateChannelDto {
	@IsString()
	@IsNotEmpty()
	name: string

	@IsEnum(ChannelState)
	state: ChannelState

	password?: string
}

export class ChannelDto {
	name?: string
	admin: string[]
	mute: string[]
	ban: bantime[]
	state: ChannelState
	password?: string
	owner?: User
	users: User[]
	messages: MsgDto[]

	constructor(chat: Channel) {
		if (chat.state === ChannelState.dm) {
			// this.name = null;
			this.state = chat.state;
			this.users = chat.users;
			this.messages = chat.messages.map(msg => new MsgDto(msg));
		} else {
			this.name = chat.name;
			this.admin = chat.admin;
			this.mute = chat.mute;
			this.ban = chat.ban;
			this.state = chat.state;
			this.password = chat.password;
			this.owner = chat.owner;
			this.users = chat.users;
			this.messages = chat.messages.map(msg => new MsgDto(msg));
		} 
	}
}
