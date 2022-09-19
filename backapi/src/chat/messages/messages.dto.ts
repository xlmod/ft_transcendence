import { User } from "@/user/user.entity";
import { IsNotEmpty, IsString } from "class-validator";
import { Channel } from "../channels/channels.entity";
import { Message } from "./messages.entity";


export class CreateMsgDto {
	@IsString()
	@IsNotEmpty()
	message: string;

	user: User;
	channel: Channel;
}

export class MsgDto {
	message: string;
	user: User;
	channel: Channel;
	date: Date;

	constructor(msg: Message) {
		this.message = msg.message;
		this.user = msg.user;
		this.channel = msg.channel;
		this.date = msg.CreatedAt;
	}
}